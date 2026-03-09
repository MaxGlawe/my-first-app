/**
 * Stripe Server-Side Client
 *
 * Uses the secret key — NEVER expose to the browser.
 * Only use in API routes and server actions.
 */

import Stripe from "stripe"

export const SUBSCRIPTION_PRICES = {
  monthly: 14.99,
  yearly: 149.99,
} as const

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY environment variable. " +
        "Set it in .env.local to enable billing features."
    )
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: "2026-02-25.clover",
    typescript: true,
  })

  return stripeInstance
}

// ── Price IDs (configured in Stripe Dashboard) ──────────────
// These should be set as environment variables.
// Create products/prices in Stripe Dashboard, then set these.

export function getSubscriptionPriceId(plan: "monthly" | "yearly"): string {
  if (plan === "yearly") {
    const id = process.env.STRIPE_PRICE_YEARLY
    if (!id) throw new Error("Missing STRIPE_PRICE_YEARLY env var")
    return id
  }
  const id = process.env.STRIPE_PRICE_MONTHLY
  if (!id) throw new Error("Missing STRIPE_PRICE_MONTHLY env var")
  return id
}

// ── Webhook signature verification ──────────────────────────

export function constructWebhookEvent(
  body: string | Buffer,
  signature: string
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error("Missing STRIPE_WEBHOOK_SECRET env var")
  return getStripe().webhooks.constructEvent(body, signature, secret)
}

// ── Helper: Create or retrieve Stripe Customer ──────────────

export async function getOrCreateCustomer(opts: {
  email: string
  name: string
  patientId: string
  existingCustomerId?: string | null
}): Promise<string> {
  const stripe = getStripe()

  if (opts.existingCustomerId) {
    // Verify it still exists and is not deleted
    try {
      const customer = await stripe.customers.retrieve(opts.existingCustomerId)
      if ('deleted' in customer && customer.deleted) {
        // Fall through to create new
      } else {
        return opts.existingCustomerId
      }
    } catch {
      // Customer not found in Stripe, create new one
    }
  }

  const customer = await stripe.customers.create({
    email: opts.email,
    name: opts.name,
    metadata: {
      praxis_os_patient_id: opts.patientId,
    },
  })

  return customer.id
}

// ── Helper: Create subscription with trial ──────────────────

export async function createSubscription(opts: {
  customerId: string
  priceId: string
  trialDays: number
  couponId?: string | null
  metadata?: Record<string, string>
}): Promise<Stripe.Subscription> {
  const stripe = getStripe()

  return stripe.subscriptions.create({
    customer: opts.customerId,
    items: [{ price: opts.priceId }],
    trial_period_days: opts.trialDays,
    ...(opts.couponId ? { discounts: [{ coupon: opts.couponId }] } : {}),
    payment_behavior: "default_incomplete",
    payment_settings: {
      save_default_payment_method: "on_subscription",
    },
    metadata: opts.metadata ?? {},
    expand: ["latest_invoice.payment_intent"],
  })
}

// ── Helper: Create a Stripe coupon from our promo code data ──

export async function createCouponForPromo(promo: {
  type: string
  value: number
  code: string
}): Promise<string> {
  const stripe = getStripe()

  const couponId = `promo_${promo.code.toLowerCase().replace(/[^a-z0-9]/g, "_")}`

  // Try to reuse existing coupon with deterministic ID
  try {
    await stripe.coupons.retrieve(couponId)
    return couponId // Already exists
  } catch {
    // Coupon doesn't exist yet, create new one
  }

  let couponParams: Stripe.CouponCreateParams

  if (promo.type === "free_months") {
    // 100% off for N months
    couponParams = {
      id: couponId,
      name: `Promo: ${promo.code} — ${Math.round(promo.value)} Gratis-Monat${promo.value > 1 ? "e" : ""}`,
      duration: "repeating",
      duration_in_months: Math.round(promo.value),
      percent_off: 100,
    }
  } else if (promo.type === "percent_off") {
    couponParams = {
      id: couponId,
      name: `Promo: ${promo.code} — ${promo.value}% Rabatt`,
      duration: "once",
      percent_off: promo.value,
    }
  } else {
    // amount_off
    couponParams = {
      id: couponId,
      name: `Promo: ${promo.code} — ${promo.value}€ Rabatt`,
      duration: "once",
      amount_off: Math.round(promo.value * 100),
      currency: "eur",
    }
  }

  const coupon = await stripe.coupons.create(couponParams)
  return coupon.id
}

// ── Helper: Cancel subscription ─────────────────────────────

export async function cancelSubscription(
  subscriptionId: string,
  atPeriodEnd = true
): Promise<Stripe.Subscription> {
  const stripe = getStripe()

  if (atPeriodEnd) {
    return stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
  }

  return stripe.subscriptions.cancel(subscriptionId)
}

// ── Helper: Create SEPA setup intent ────────────────────────

export async function createSepaSetupIntent(
  customerId: string
): Promise<Stripe.SetupIntent> {
  const stripe = getStripe()

  return stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["sepa_debit"],
  })
}

// ── Helper: Create payment plan (installments) ──────────────

export async function createInstallmentSchedule(opts: {
  customerId: string
  totalAmount: number // in cents
  numInstallments: number
  description: string
  metadata?: Record<string, string>
}): Promise<{ invoices: Stripe.Invoice[] }> {
  const stripe = getStripe()
  const installmentAmount = Math.floor(opts.totalAmount / opts.numInstallments)
  const lastInstallment = opts.totalAmount - installmentAmount * (opts.numInstallments - 1)
  const invoices: Stripe.Invoice[] = []

  for (let i = 0; i < opts.numInstallments; i++) {
    const amount = i === opts.numInstallments - 1 ? lastInstallment : installmentAmount
    const dueDate = new Date()
    dueDate.setMonth(dueDate.getMonth() + i)

    // Create invoice item
    await stripe.invoiceItems.create({
      customer: opts.customerId,
      amount,
      currency: "eur",
      description: `${opts.description} — Rate ${i + 1} von ${opts.numInstallments}`,
      metadata: {
        ...opts.metadata,
        installment_number: String(i + 1),
        total_installments: String(opts.numInstallments),
      },
    })

    // Create and finalize invoice
    const invoice = await stripe.invoices.create({
      customer: opts.customerId,
      collection_method: "charge_automatically",
      due_date: i === 0 ? undefined : Math.floor(dueDate.getTime() / 1000),
      auto_advance: true,
      metadata: {
        ...opts.metadata,
        installment_number: String(i + 1),
      },
    })

    // First invoice: finalize immediately
    if (i === 0) {
      const finalized = await stripe.invoices.finalizeInvoice(invoice.id)
      invoices.push(finalized)
    } else {
      invoices.push(invoice)
    }
  }

  return { invoices }
}

// ── Helper: Create Stripe Customer Portal session ───────────

export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe()

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

// ── Helper: Apply promo code as coupon ──────────────────────

export async function createStripeCoupon(opts: {
  type: "free_months" | "percent_off" | "amount_off"
  value: number
  code: string
}): Promise<Stripe.PromotionCode> {
  const stripe = getStripe()

  let couponParams: Stripe.CouponCreateParams

  if (opts.type === "free_months") {
    couponParams = {
      duration: "repeating",
      duration_in_months: Math.round(opts.value),
      percent_off: 100,
      currency: "eur",
    }
  } else if (opts.type === "percent_off") {
    couponParams = {
      duration: "once",
      percent_off: opts.value,
    }
  } else {
    couponParams = {
      duration: "once",
      amount_off: Math.round(opts.value * 100),
      currency: "eur",
    }
  }

  const coupon = await stripe.coupons.create(couponParams)

  return stripe.promotionCodes.create({
    promotion: { type: "coupon", coupon: coupon.id },
    code: opts.code,
  })
}
