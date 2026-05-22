-- PROJ-23: Conversion-Marker — wann ein Lead die Video-Analyse gebucht hat.
-- Wird vom Buchungs-Webhook gesetzt und schaltet im Report die vollen 12
-- Mobility-Karten frei (vorher: 2 frei, Rest „Milchglas").

alter table public.schmerzcheck_leads
  add column if not exists booked_at timestamptz;

comment on column public.schmerzcheck_leads.booked_at is
  'Vom Buchungs-Webhook gesetzt, wenn der Lead die Video-Analyse bucht. Schaltet die vollen 12 Karten im Report frei.';
