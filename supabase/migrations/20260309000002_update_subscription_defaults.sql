-- Update subscription defaults: price 14.99 → 16.99, GebüH Ziffer 3. → 4
ALTER TABLE patient_subscriptions
  ALTER COLUMN price_amount SET DEFAULT 16.99,
  ALTER COLUMN gebuh_ziffer SET DEFAULT '4';
