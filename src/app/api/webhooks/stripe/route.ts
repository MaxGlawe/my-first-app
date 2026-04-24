/**
 * Stripe Webhook Handler
 *
 * Receives events from Stripe and updates subscription/payment status.
 * Public endpoint — secured via Stripe webhook signature.
 */

import { NextRequest, NextResponse } from "next/server"
import { constructWebhookEvent } from "@/lib/stripe"
import { createSupabaseServiceClient } from "@/lib/supabase-service"
import { createSubscriptionInvoice } from "@/lib/billing/auto-invoice"
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
