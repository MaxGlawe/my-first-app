-- PROJ-5: Erweiterte Behandlungsdokumentation
-- Fügt JSONB-Spalte "data" hinzu für SOAP-Notizen, Maßnahmen-Details, Post-ROM usw.

ALTER TABLE treatment_sessions
ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}';
