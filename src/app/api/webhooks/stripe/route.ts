/**
 * Stripe Webhook Handler
 *
 * Receives events from Stripe and updates subscription/payment status.
 * Public endpoint — secured via Stripe webhook signature.
 */

import { NextRequest, NextResponse } from "next/server"
import { constructWebhookEvent, getStripe } from "@/lib/stripe"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { createSubscriptionInvoice } from "@/lib/billing/auto-invoice"
import { signDeckToken } from "@/lib/deck-token"
import { renderDeckPurchaseEmail } from "@/lib/deck-emails"
import { sendEmail } from "@/lib/email"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(body, signature)
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createSupabaseServiceClient()

  try {
    switch (event.type) {
      // ── Subscription lifecycle ──────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any
        const patientId = sub.metadata?.praxis_os_patient_id

        if (!patientId) {
          console.warn(`[Stripe Webhook] ${event.type} — no patient_id in metadata for sub ${sub.id}`)
          break
        }

        const status = mapStripeStatus(sub.status as Stripe.Subscription.Status)

        // Stripe API ≥ 2024-09-30 moved current_period_start / current_period_end
        // from the subscription object onto each subscription_item. Read both
        // locations so we work across old and new API versions.
        const item = sub.items?.data?.[0]
        const periodStart = sub.current_period_start ?? item?.current_period_start
        const periodEnd = sub.current_period_end ?? item?.current_period_end

        const updateData: Record<string, unknown> = {
          status,
          stripe_subscription_id: sub.id,
          updated_at: new Date().toISOString(),
        }

        if (typeof periodStart === "number") {
          updateData.current_period_start = new Date(periodStart * 1000).toISOString()
        }
        if (typeof periodEnd === "number") {
          updateData.current_period_end = new Date(periodEnd * 1000).toISOString()
        }
        if (typeof sub.trial_end === "number") {
          updateData.trial_end = new Date(sub.trial_end * 1000).toISOString()
        }

        const { error: updateErr } = await supabase
          .from("patient_subscriptions")
          .update(updateData)
          .eq("patient_id", patientId)

        if (updateErr) {
          console.error(`[Stripe Webhook] ${event.type} — DB update failed for patient ${patientId}:`, updateErr)
        } else {
          console.log(
            `[Stripe Webhook] ${event.type} sub=${sub.id} patient=${patientId} status=${status} ` +
            `period_end=${typeof periodEnd === "number" ? new Date(periodEnd * 1000).toISOString() : "missing"}`
          )
        }

        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        const patientId = sub.metadata?.praxis_os_patient_id

        if (!patientId) break

        await supabase
          .from("patient_subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("patient_id", patientId)

        break
      }

      // ── Invoice payment ─────────────────────────────
      case "invoice.paid": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any
        const installmentNumber = invoice.metadata?.installment_number
        const planId = invoice.metadata?.payment_plan_id
        console.log(
          `[Stripe Webhook] invoice.paid id=${invoice.id} amount=${invoice.amount_paid / 100}€ ` +
          `subscription=${invoice.subscription ?? "—"}`
        )

        // Update payment installment if this is a plan payment
        if (planId && installmentNumber) {
          await supabase
            .from("payment_installments")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_invoice_id: invoice.id,
            })
            .eq("plan_id", planId)
            .eq("installment_number", Number(installmentNumber))

          // Check if all installments are paid
          const { data: remaining } = await supabase
            .from("payment_installments")
            .select("id")
            .eq("plan_id", planId)
            .eq("status", "pending")

          if (remaining && remaining.length === 0) {
            await supabase
              .from("payment_plans")
              .update({ status: "completed", updated_at: new Date().toISOString() })
              .eq("id", planId)
          }
        }

        // ── Auto-generate Heilpraktiker invoice for subscription payments ──
        if (invoice.subscription && invoice.amount_paid > 0) {
          const customerId = typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id

          if (customerId) {
            // Extract period from invoice lines
            const lines = invoice.lines?.data ?? []
            const subLine = lines.find((l: { type: string }) => l.type === "subscription")
            const periodStart = subLine?.period?.start
              ? new Date(subLine.period.start * 1000).toISOString()
              : new Date().toISOString()
            const periodEnd = subLine?.period?.end
              ? new Date(subLine.period.end * 1000).toISOString()
              : new Date().toISOString()

            // Fire-and-forget: don't block webhook response
            createSubscriptionInvoice({
              stripeCustomerId: customerId,
              amountPaid: invoice.amount_paid / 100, // cents → EUR
              periodStart,
              periodEnd,
              stripeInvoiceId: invoice.id,
            }).catch((err) => {
              console.error("[Stripe Webhook] Auto-invoice generation failed:", err)
            })
          }
        }

        break
      }

      case "invoice.payment_failed": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any
        const planId = invoice.metadata?.payment_plan_id
        const installmentNumber = invoice.metadata?.installment_number

        if (planId && installmentNumber) {
          await supabase
            .from("payment_installments")
            .update({ status: "failed" })
            .eq("plan_id", planId)
            .eq("installment_number", Number(installmentNumber))
        }

        // Update subscription to past_due if applicable
        if (invoice.subscription) {
          const subId = typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription.id

          await supabase
            .from("patient_subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", subId)
        }
        break
      }

      // ── Setup intent (SEPA mandate) ─────────────────
      case "setup_intent.succeeded": {
        const setupIntent = event.data.object as Stripe.SetupIntent
        // Payment method is now saved on the customer
        console.log("[Stripe Webhook] SEPA mandate setup succeeded:", setupIntent.id)
        break
      }

      // ── Shop: One-time purchase (Einzel- oder Mehrartikel-Warenkorb) ──
      case "checkout.session.completed": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = event.data.object as any

        // Only handle shop purchases — skip subscription/setup checkouts
        if (session.mode !== "payment") break

        // Mehrartikel: product_ids (comma-separated). Rückwärtskompatibel: product_id (alt).
        const productIds: string[] = session.metadata?.product_ids
          ? String(session.metadata.product_ids)
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : session.metadata?.product_id
            ? [String(session.metadata.product_id)]
            : []

        if (productIds.length === 0) break

        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ??
          process.env.NEXT_PUBLIC_SITE_URL ??
          "https://wwwpraxis-os.com"

        // ── Produkte laden + nach Typ aufteilen ───────────────────────────
        // Decks (produkt_typ='deck') sind accountlose Impuls-Produkte: Kauf →
        // Bestätigungs-Mail mit signiertem Link, KEIN Account, KEINE Entitlements.
        // Alle anderen Produkte (Challenges, Kurse, …) behalten den
        // bestehenden Account- + Entitlement-Flow.
        const { data: purchasedProducts, error: productsErr } = await supabase
          .from("products")
          .select("id, slug, titel, produkt_typ, preis, waehrung")
          .in("id", productIds)

        if (productsErr) {
          console.error(
            `[Stripe Webhook] Failed to load products for session=${session.id}:`,
            productsErr
          )
          // 500 → Stripe wiederholt (idempotent)
          return NextResponse.json({ error: "Product load failed" }, { status: 500 })
        }

        const decks = (purchasedProducts ?? []).filter(
          (p) => p.produkt_typ === "deck"
        )
        // nonDecks = alle gekauften product_ids, die KEIN Deck sind. Auf Basis der
        // product_ids (nicht der geladenen Produkte), damit der Account-/Entitlement-
        // Flow rückwärtskompatibel bleibt, falls ein Produkt nicht in `products`
        // gefunden wurde (z.B. älterer Datensatz) — es wird dann als nonDeck behandelt.
        const deckIds = new Set(decks.map((d) => d.id))
        const nonDeckProductIds = productIds.filter((id) => !deckIds.has(id))

        console.log(
          `[Stripe Webhook] checkout.session.completed session=${session.id} ` +
            `decks=[${decks.map((d) => d.slug).join(",")}] nonDecks=[${nonDeckProductIds.join(",")}]`
        )

        // ── Shop-Analytics: Kauf-Event pro gekauftem Produkt (fire-and-forget) ──
        // Schreibt für JEDES geladene Produkt (Decks UND nonDecks) einen
        // conversion_events-Eintrag. Direkt über den Service-Client (nicht über
        // die API — deren Zod-Schema erwartet eine UUID-session_id; wir nutzen
        // hier bewusst die Stripe-session.id als session_id, da die Spalte TEXT
        // ist). Fehler hier dürfen den Kauf-/Entitlement-Flow NICHT brechen und
        // KEINEN Stripe-Retry erzwingen → bewusst kein 500, nur Logging.
        if ((purchasedProducts ?? []).length > 0) {
          const purchaseRows = (purchasedProducts ?? []).map((p) => ({
            session_id: String(session.id),
            event_type: "shop_purchase",
            path: "/api/webhooks/stripe",
            metadata: {
              product_id: p.id,
              slug: p.slug,
              produkt_typ: p.produkt_typ,
              amount: p.preis,
              currency: p.waehrung,
            },
          }))
          // Fire-and-forget: Supabase-Queries resolven (sie werfen nicht); ein
          // DB-Fehler wird im then-Callback geloggt. Promise.resolve(...) kapselt
          // den PromiseLike sicher, ohne den Webhook zu blockieren.
          Promise.resolve(
            supabase.from("conversion_events").insert(purchaseRows)
          )
            .then(({ error: convErr }) => {
              if (convErr) {
                console.error(
                  `[Stripe Webhook] shop_purchase-Tracking fehlgeschlagen (session=${session.id}):`,
                  convErr
                )
              }
            })
            .catch((err: unknown) =>
              console.error(
                `[Stripe Webhook] shop_purchase-Tracking warf (session=${session.id}):`,
                err
              )
            )
        }

        // ── nonDecks: bestehender Account- + Entitlement-Flow ─────────────
        // Account-Auflösung (guest → /api/buyer-accounts) NUR wenn es nonDeck-
        // Produkte gibt. Bei deck-only-Kauf: KEIN Account, KEINE Entitlements.
        if (nonDeckProductIds.length > 0) {
          let userId: string | undefined = session.metadata?.user_id

          // ── PROJ-21: Gast-Kauf — kein user_id, aber guest_email in den Metadaten ──
          // Account über den internen PROJ-19-Endpunkt auflösen/anlegen (idempotent).
          if (!userId) {
            const guestEmail = session.metadata?.guest_email
            if (!guestEmail) {
              console.warn(
                `[Stripe Webhook] checkout.session.completed session=${session.id} — weder user_id noch guest_email für nonDeck-Produkte, übersprungen`
              )
            } else {
              const secret = process.env.INTERNAL_API_SECRET
              if (!secret) {
                console.error(
                  "[Stripe Webhook] INTERNAL_API_SECRET fehlt — Käufer-Account kann nicht angelegt werden"
                )
                return NextResponse.json({ error: "Config error" }, { status: 500 })
              }

              const firstName = session.metadata?.guest_first_name?.trim() || "Kund:in"
              const lastName = session.metadata?.guest_last_name?.trim() || "—"

              // Masterclass im Warenkorb? → buyer-accounts wählt die Premium-Mail.
              const masterclassProduct = (purchasedProducts ?? []).find(
                (p) => p.produkt_typ === "masterclass"
              )

              try {
                const res = await fetch(`${appUrl}/api/buyer-accounts`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "x-internal-api-secret": secret,
                  },
                  body: JSON.stringify({
                    email: guestEmail,
                    firstName,
                    lastName,
                    ...(masterclassProduct
                      ? {
                          product: {
                            produkt_typ: "masterclass",
                            slug: masterclassProduct.slug,
                            titel: masterclassProduct.titel,
                          },
                        }
                      : {}),
                  }),
                })
                if (!res.ok) {
                  console.error(
                    `[Stripe Webhook] /api/buyer-accounts antwortete ${res.status} für ${guestEmail}`
                  )
                  // 500 → Stripe wiederholt den Webhook; buyer-accounts + Entitlement-Upsert sind idempotent
                  return NextResponse.json(
                    { error: "Buyer account creation failed" },
                    { status: 500 }
                  )
                }
                const json = await res.json()
                userId = json.userId
              } catch (err) {
                console.error("[Stripe Webhook] /api/buyer-accounts Aufruf fehlgeschlagen:", err)
                return NextResponse.json(
                  { error: "Buyer account creation failed" },
                  { status: 500 }
                )
              }

              console.log(
                `[Stripe Webhook] Gast-Kauf → Account aufgelöst: ${guestEmail} → user=${userId}`
              )
            }
          }

          if (userId) {
            // Pro nonDeck-Produkt im Warenkorb die Entitlements vergeben.
            // Bei einem DB-Fehler 500 zurückgeben → Stripe wiederholt den Webhook;
            // alle Upserts sind idempotent (ON CONFLICT DO NOTHING).
            let hadError = false

            for (const productId of nonDeckProductIds) {
              // Load all content entries for this product
              const { data: contents, error: contentsErr } = await supabase
                .from("product_contents")
                .select("content_type, content_id")
                .eq("product_id", productId)

              if (contentsErr) {
                console.error(
                  `[Stripe Webhook] Failed to load product_contents for product ${productId}:`,
                  contentsErr
                )
                hadError = true
                continue
              }

              if (!contents || contents.length === 0) {
                console.warn(`[Stripe Webhook] No product_contents found for product ${productId}`)
                continue
              }

              // Insert one entitlement per content item — idempotent via ON CONFLICT DO NOTHING
              for (const c of contents) {
                const { error: entErr } = await supabase
                  .from("content_entitlements")
                  .upsert(
                    {
                      user_id: userId,
                      content_type: c.content_type,
                      content_id: c.content_id,
                      source: "purchase",
                      valid_from: new Date().toISOString(),
                      valid_until: null, // lifetime
                    },
                    { onConflict: "user_id,content_type,content_id,source", ignoreDuplicates: true }
                  )

                if (entErr) {
                  console.error(
                    `[Stripe Webhook] Failed to insert entitlement for user=${userId} content=${c.content_id}:`,
                    entErr
                  )
                  hadError = true
                } else {
                  console.log(
                    `[Stripe Webhook] Entitlement granted user=${userId} product=${productId} content_type=${c.content_type} content_id=${c.content_id}`
                  )
                }
              }
            }

            // Bei Fehler 500 → Stripe wiederholt (Idempotenz schützt vor Doppel-Grants)
            if (hadError) {
              return NextResponse.json(
                { error: "Entitlement grant partially failed" },
                { status: 500 }
              )
            }
          }
        }

        // ── Decks: accountlose Kaufbestätigungs-Mail mit signierten Links ──
        if (decks.length > 0) {
          // Käufer-E-Mail ermitteln: guest_email ODER (eingeloggt) user_profiles.email.
          let buyerEmail: string | undefined = session.metadata?.guest_email?.trim() || undefined
          let buyerFirstName: string | undefined =
            session.metadata?.guest_first_name?.trim() || undefined

          if (!buyerEmail && session.metadata?.user_id) {
            const { data: profile } = await supabase
              .from("user_profiles")
              .select("email, first_name")
              .eq("id", session.metadata.user_id)
              .maybeSingle()
            buyerEmail = profile?.email ?? undefined
            if (!buyerFirstName) buyerFirstName = profile?.first_name ?? undefined
          }

          if (!buyerEmail) {
            // Ohne E-Mail kein Versand möglich — kein 500 (Decks brauchen keinen
            // Account / keine DB-Mutation; der Kauf ist trotzdem gültig).
            console.warn(
              `[Stripe Webhook] Deck-Kauf ohne ermittelbare Käufer-E-Mail (session=${session.id}) — Mail übersprungen`
            )
          } else {
            const firstName = buyerFirstName || "Kund:in"
            const deckLinks = decks.map((d) => ({
              titel: d.titel,
              url: `${appUrl}/karten/${d.slug}?t=${signDeckToken(d.slug)}`,
            }))

            const { subject, html } = renderDeckPurchaseEmail({
              firstName,
              decks: deckLinks,
            })

            // Fire-and-forget: ein fehlgeschlagener Mailversand darf den Webhook
            // nicht in einen Retry zwingen (sonst Doppel-Grants bei nonDecks).
            sendEmail({ to: buyerEmail, subject, html })
              .then((r) => {
                if (r.success) {
                  console.log(
                    `[Stripe Webhook] Deck-Kaufbestätigung gesendet an ${buyerEmail} (${decks.length} Deck(s))`
                  )
                } else {
                  console.error(
                    `[Stripe Webhook] Deck-Kaufbestätigung NICHT gesendet an ${buyerEmail}: ${r.error}`
                  )
                }
              })
              .catch((err) =>
                console.error("[Stripe Webhook] Deck-Mail-Versand fehlgeschlagen:", err)
              )
          }
        }

        break
      }

      // ── Shop: Rückerstattung — Entitlement entziehen ──────────
      case "charge.refunded": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const charge = event.data.object as any

        // Nur bei vollständiger Rückerstattung
        if (!charge.refunded) break

        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id
        if (!paymentIntentId) break

        // Zugehörige Checkout-Session finden — sie trägt unsere Metadaten
        const stripe = getStripe()
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntentId,
          limit: 1,
        })
        const refundSession = sessions.data[0]
        if (!refundSession || refundSession.mode !== "payment") break

        // Mehrartikel: product_ids (comma-separated). Rückwärtskompatibel: product_id.
        const refundProductIds: string[] = refundSession.metadata?.product_ids
          ? String(refundSession.metadata.product_ids)
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : refundSession.metadata?.product_id
            ? [String(refundSession.metadata.product_id)]
            : []
        if (refundProductIds.length === 0) break

        // User auflösen — eingeloggter Kauf (user_id) oder Gast-Kauf (guest_email)
        let refundUserId: string | undefined = refundSession.metadata?.user_id
        if (!refundUserId && refundSession.metadata?.guest_email) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("id")
            .ilike("email", refundSession.metadata.guest_email)
            .maybeSingle()
          refundUserId = profile?.id
        }
        if (!refundUserId) break

        // Kauf-Entitlements für ALLE zurückerstatteten Produkte entziehen
        for (const refundProductId of refundProductIds) {
          const { data: refundContents } = await supabase
            .from("product_contents")
            .select("content_type, content_id")
            .eq("product_id", refundProductId)

          for (const c of refundContents ?? []) {
            const { error: delErr } = await supabase
              .from("content_entitlements")
              .delete()
              .eq("user_id", refundUserId)
              .eq("content_type", c.content_type)
              .eq("content_id", c.content_id)
              .eq("source", "purchase")

            if (delErr) {
              console.error(
                `[Stripe Webhook] charge.refunded — Entitlement-Entzug fehlgeschlagen user=${refundUserId} content=${c.content_id}:`,
                delErr
              )
            } else {
              console.log(
                `[Stripe Webhook] charge.refunded — Entitlement entzogen user=${refundUserId} product=${refundProductId} content_id=${c.content_id}`
              )
            }
          }
        }

        break
      }
    }
  } catch (err) {
    console.error("[Stripe Webhook] Processing error:", err)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): "trial" | "active" | "past_due" | "cancelled" | "expired" {
  switch (stripeStatus) {
    case "trialing":
      return "trial"
    case "active":
      return "active"
    case "past_due":
      return "past_due"
    case "canceled":
    case "unpaid":
      return "cancelled"
    case "incomplete":
    case "incomplete_expired":
      return "expired"
    default:
      return "active"
  }
}
