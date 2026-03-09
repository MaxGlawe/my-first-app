-- ============================================================
-- PROJ-18: Subscription & Billing System
-- Tables: patient_subscriptions, treatment_packages, payment_plans,
--         payment_installments, promo_codes, promo_code_redemptions
-- ============================================================

-- ────────────────────────────────────────────
-- 1. Treatment Packages (freely configurable)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS treatment_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price > 0),
  -- GebüH line items: [{ziffer, analog, beschreibung, einzelpreis}]
  gebuh_items JSONB NOT NULL DEFAULT '[]',
  -- How many sessions / weeks included
  sitzungen INTEGER,
  dauer_wochen INTEGER,
  -- Installment options
  max_installments INTEGER NOT NULL DEFAULT 1,
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE treatment_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to treatment_packages"
  ON treatment_packages FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Therapists can read active packages"
  ON treatment_packages FOR SELECT
  USING (
    is_active = true
    AND EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'heilpraktiker', 'physiotherapeut'))
  );

-- ────────────────────────────────────────────
-- 2. Patient Subscriptions (App access)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patient_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')) DEFAULT 'monthly',
  status TEXT NOT NULL CHECK (status IN ('trial', 'active', 'past_due', 'cancelled', 'expired')) DEFAULT 'trial',
  -- Trial period
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  -- Current billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  -- Pricing (snapshot at creation)
  price_amount NUMERIC(10,2) NOT NULL DEFAULT 14.99,
  gebuh_ziffer TEXT NOT NULL DEFAULT '3.',
  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  -- Promo
  promo_code_id UUID,
  extra_free_months INTEGER NOT NULL DEFAULT 0,
  -- Management
  activated_by UUID REFERENCES auth.users(id),
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One subscription per patient
  CONSTRAINT unique_patient_subscription UNIQUE (patient_id)
);

ALTER TABLE patient_subscriptions ENABLE ROW LEVEL SECURITY;

-- Admins + therapists can manage
CREATE POLICY "Staff can manage subscriptions"
  ON patient_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'heilpraktiker', 'physiotherapeut')
    )
  );

-- Patients can view their own
CREATE POLICY "Patients can view own subscription"
  ON patient_subscriptions FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_patient_subscriptions_patient_id ON patient_subscriptions(patient_id);
CREATE INDEX idx_patient_subscriptions_status ON patient_subscriptions(status);
CREATE INDEX idx_patient_subscriptions_stripe_customer ON patient_subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- ────────────────────────────────────────────
-- 3. Payment Plans (Ratenzahlung)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  package_id UUID REFERENCES treatment_packages(id),
  -- Snapshot at creation
  package_name TEXT NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount > 0),
  num_installments INTEGER NOT NULL CHECK (num_installments >= 1),
  installment_amount NUMERIC(10,2) NOT NULL,
  gebuh_items JSONB NOT NULL DEFAULT '[]',
  -- Status
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled', 'defaulted')) DEFAULT 'active',
  -- Stripe
  stripe_schedule_id TEXT,
  -- Management
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage payment_plans"
  ON payment_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'heilpraktiker', 'physiotherapeut')
    )
  );

CREATE POLICY "Patients can view own payment_plans"
  ON payment_plans FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_payment_plans_patient_id ON payment_plans(patient_id);
CREATE INDEX idx_payment_plans_status ON payment_plans(status);

-- ────────────────────────────────────────────
-- 4. Payment Installments (individual rates)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')) DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage installments"
  ON payment_installments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'heilpraktiker', 'physiotherapeut')
    )
  );

CREATE POLICY "Patients can view own installments"
  ON payment_installments FOR SELECT
  USING (
    plan_id IN (
      SELECT pp.id FROM payment_plans pp
      JOIN patients p ON pp.patient_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE INDEX idx_payment_installments_plan_id ON payment_installments(plan_id);
CREATE INDEX idx_payment_installments_due_date ON payment_installments(due_date) WHERE status = 'pending';

-- ────────────────────────────────────────────
-- 5. Promo Codes
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  description TEXT,
  -- free_months: value = number of free months
  -- percent_off: value = percentage (e.g. 50 = 50%)
  -- amount_off: value = EUR amount off
  type TEXT NOT NULL CHECK (type IN ('free_months', 'percent_off', 'amount_off')),
  value NUMERIC(10,2) NOT NULL CHECK (value > 0),
  max_redemptions INTEGER,
  current_redemptions INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_promo_code UNIQUE (code)
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to promo_codes"
  ON promo_codes FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Staff can read active promo_codes"
  ON promo_codes FOR SELECT
  USING (
    is_active = true
    AND EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'heilpraktiker', 'physiotherapeut'))
  );

-- ────────────────────────────────────────────
-- 6. Promo Code Redemptions
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_promo_per_patient UNIQUE (promo_code_id, patient_id)
);

ALTER TABLE promo_code_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage promo_redemptions"
  ON promo_code_redemptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'heilpraktiker', 'physiotherapeut')
    )
  );

CREATE INDEX idx_promo_redemptions_patient ON promo_code_redemptions(patient_id);
