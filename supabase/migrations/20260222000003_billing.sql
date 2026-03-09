-- ============================================================
-- Abrechnungssystem (Billing)
-- Migration: gebueh_catalog, invoices, invoice_line_items,
--            praxis_settings + RLS + Indexes + GebüH Seed
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. GebüH-Katalog
-- ================================================================
CREATE TABLE IF NOT EXISTS gebueh_catalog (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ziffer        TEXT NOT NULL UNIQUE,
  bezeichnung   TEXT NOT NULL,
  kategorie     TEXT NOT NULL,
  preis_min     NUMERIC(8,2) NOT NULL,
  preis_max     NUMERIC(8,2) NOT NULL,
  preis_default NUMERIC(8,2),
  hinweis       TEXT,
  aktiv         BOOLEAN NOT NULL DEFAULT true,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE gebueh_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gebueh_select" ON gebueh_catalog;
CREATE POLICY "gebueh_select" ON gebueh_catalog
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "gebueh_admin_insert" ON gebueh_catalog;
CREATE POLICY "gebueh_admin_insert" ON gebueh_catalog
  FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

DROP POLICY IF EXISTS "gebueh_admin_update" ON gebueh_catalog;
CREATE POLICY "gebueh_admin_update" ON gebueh_catalog
  FOR UPDATE
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

DROP POLICY IF EXISTS "gebueh_admin_delete" ON gebueh_catalog;
CREATE POLICY "gebueh_admin_delete" ON gebueh_catalog
  FOR DELETE
  USING (get_my_role() = 'admin');

-- ================================================================
-- 3. Rechnungen (Invoices)
-- ================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  invoice_number  TEXT NOT NULL UNIQUE,

  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  created_by      UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

  invoice_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  treatment_date  DATE NOT NULL,
  due_date        DATE NOT NULL,

  patient_name    TEXT NOT NULL,
  patient_address TEXT,

  praxis_name     TEXT NOT NULL DEFAULT 'Physiotherapie Glawe',
  praxis_address  TEXT NOT NULL,
  praxis_steuernr TEXT,

  subtotal        NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL DEFAULT 0,

  diagnose_text   TEXT,

  status          TEXT NOT NULL DEFAULT 'entwurf'
                    CHECK (status IN ('entwurf', 'offen', 'bezahlt', 'ueberfaellig', 'storniert')),
  paid_at         TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,

  notes           TEXT
);

DROP TRIGGER IF EXISTS trg_invoices_updated_at ON invoices;
CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);

-- RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Admin: alle Rechnungen lesen
DROP POLICY IF EXISTS "invoices_select" ON invoices;
CREATE POLICY "invoices_select" ON invoices
  FOR SELECT
  USING (
    get_my_role() = 'admin'
    OR
    -- Patient sieht nur eigene Rechnungen (nur finalisierte)
    (
      get_my_role() = 'patient'
      AND status != 'entwurf'
      AND EXISTS (
        SELECT 1 FROM patients p
        WHERE p.id = invoices.patient_id
          AND p.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "invoices_insert" ON invoices;
CREATE POLICY "invoices_insert" ON invoices
  FOR INSERT
  WITH CHECK (
    get_my_role() = 'admin'
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "invoices_update" ON invoices;
CREATE POLICY "invoices_update" ON invoices
  FOR UPDATE
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- DSGVO: 10 Jahre Aufbewahrungspflicht
DROP POLICY IF EXISTS "invoices_delete" ON invoices;
CREATE POLICY "invoices_delete" ON invoices
  FOR DELETE
  USING (false);

-- ================================================================
-- 4. Rechnungspositionen (Line Items)
-- ================================================================
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id    UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  gebueh_ziffer TEXT,
  beschreibung  TEXT NOT NULL,
  anzahl        INTEGER NOT NULL DEFAULT 1 CHECK (anzahl >= 1),
  einzelpreis   NUMERIC(8,2) NOT NULL CHECK (einzelpreis >= 0),
  gesamtpreis   NUMERIC(10,2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_line_items_invoice_id ON invoice_line_items(invoice_id);

ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "line_items_select" ON invoice_line_items;
CREATE POLICY "line_items_select" ON invoice_line_items
  FOR SELECT
  USING (
    get_my_role() = 'admin'
    OR
    (
      get_my_role() = 'patient'
      AND EXISTS (
        SELECT 1 FROM invoices i
        JOIN patients p ON p.id = i.patient_id
        WHERE i.id = invoice_line_items.invoice_id
          AND i.status != 'entwurf'
          AND p.user_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "line_items_insert" ON invoice_line_items;
CREATE POLICY "line_items_insert" ON invoice_line_items
  FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

DROP POLICY IF EXISTS "line_items_update" ON invoice_line_items;
CREATE POLICY "line_items_update" ON invoice_line_items
  FOR UPDATE
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

DROP POLICY IF EXISTS "line_items_delete" ON invoice_line_items;
CREATE POLICY "line_items_delete" ON invoice_line_items
  FOR DELETE
  USING (get_my_role() = 'admin');

-- ================================================================
-- 5. Rechnungsnummer-Generator
-- ================================================================
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(invoice_number, '-', 2) AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM invoices
  WHERE invoice_number LIKE current_year || '-%';

  RETURN current_year || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION generate_invoice_number() TO authenticated;

-- ================================================================
-- 6. Seed: Praxis-Stammdaten (Platzhalter — Admin füllt aus)
-- ================================================================
INSERT INTO praxis_settings (
  praxis_name, inhaber_name, strasse, plz, ort,
  telefon, email, website, iban, bic, bank_name
) VALUES (
  'Physiotherapie Glawe',
  'Max Glawe',
  'Musterstraße 1',
  '12345',
  'Musterstadt',
  '+49 123 456789',
  'info@physiotherapie-glawe.de',
  'https://physiotherapie-glawe.de',
  'DE00 0000 0000 0000 0000 00',
  'COBADEFFXXX',
  'Commerzbank'
) ON CONFLICT DO NOTHING;

-- ================================================================
-- 7. Seed: GebüH-Katalog (offizielle Preise GebüH 85/2002)
-- ================================================================
INSERT INTO gebueh_catalog (ziffer, bezeichnung, kategorie, preis_min, preis_max, preis_default, hinweis, sort_order) VALUES
-- ── Allgemeine Leistungen (Ziffern 1–8) ──
('1',     'Eingehende, das gewöhnliche Maß übersteigende Untersuchung',                      'Allgemeine Leistungen', 12.30, 20.50, 16.00, NULL, 100),
('2',     'Vollständiges Krankenexamen mit Repertorisation (klass. Homöopathie, mind. 30 Min.)', 'Allgemeine Leistungen', 15.40, 41.00, 28.00, 'Mind. 30 Minuten Dauer', 101),
('3',     'Kurze Information (auch telefonisch) oder Wiederholungsverordnung',               'Allgemeine Leistungen',  0.00,  4.50,  4.50, 'Als einzige Leistung', 102),
('4',     'Eingehende Beratung (mind. 10 Min.), ggf. einschl. Untersuchung',                 'Allgemeine Leistungen', 16.40, 22.00, 19.00, 'Mind. 10 Minuten', 103),
('5',     'Beratung, ggf. einschl. kurzer Untersuchung',                                     'Allgemeine Leistungen',  8.20, 20.50, 14.00, 'Auch telefonisch', 104),
('6',     'Beratung wie Zi. 5, außerhalb der normalen Sprechstundenzeit',                    'Allgemeine Leistungen', 17.00, 24.50, 20.00, NULL, 105),
('7',     'Beratung wie Zi. 5, bei Nacht (20–7 Uhr)',                                        'Allgemeine Leistungen', 19.50, 28.50, 24.00, 'Nachtzuschlag', 106),
('8',     'Beratung wie Zi. 5, an Sonn- und Feiertagen',                                     'Allgemeine Leistungen', 15.40, 27.00, 21.00, NULL, 107),

-- ── Hausbesuche (Ziffer 9) ──
('9.1',   'Hausbesuch einschl. Beratung, bei Tag',                                           'Hausbesuche',           21.50, 29.50, 25.00, NULL, 110),
('9.2',   'Hausbesuch, dringende Fälle (Eilbesuch, sofort ausgeführt)',                       'Hausbesuche',           24.00, 32.00, 28.00, NULL, 111),
('9.3',   'Hausbesuch, bei Nacht und an Sonn-/Feiertagen',                                   'Hausbesuche',           27.50, 36.50, 32.00, NULL, 112),

-- ── Nebengebühren Hausbesuch (Ziffer 10) ──
('10.1',  'Wegegeld bei Tag (bis 2 km)',                                                     'Nebengebühren',          0.00,  5.50,  5.50, 'Pro angefangene Stunde', 120),
('10.2',  'Wegegeld bei Nacht (bis 2 km)',                                                   'Nebengebühren',          0.00, 10.50, 10.50, 'Pro angefangene Stunde', 121),
('10.5',  'Eigenes Fahrzeug, pro km, bei Tag',                                               'Nebengebühren',          0.00,  1.25,  1.25, 'Pro km', 124),
('10.6',  'Eigenes Fahrzeug, pro km, bei Nacht',                                             'Nebengebühren',          0.00,  2.50,  2.50, 'Pro km', 125),

-- ── Schriftliche Auslassungen (Ziffer 11) ──
('11.1',  'Kurze Krankheitsbescheinigung oder Brief',                                        'Schriftliches',          3.60, 15.50,  8.00, 'Im Interesse des Patienten', 130),
('11.2',  'Ausführlicher Krankheitsbericht oder Gutachten',                                  'Schriftliches',         10.30, 20.50, 15.00, 'DIN A4 engzeilig maschinengeschrieben', 131),
('11.3',  'Individueller schriftlicher Diätplan',                                            'Schriftliches',         10.50, 26.00, 18.00, 'Bei Ernährungs-/Stoffwechselstörungen', 132),

-- ── Chemisch-physikalische Untersuchungen (Ziffer 12) ──
('12.1',  'Harnuntersuchung qualitativ (Teststreifen)',                                      'Laboruntersuchungen',    0.00,  3.10,  3.10, 'Visueller Farbvergleich', 140),
('12.2',  'Harnuntersuchung quantitativ',                                                    'Laboruntersuchungen',    0.00,  4.60,  4.60, NULL, 141),
('12.4',  'Harnuntersuchung, nur Sediment',                                                  'Laboruntersuchungen',    0.00,  4.60,  4.60, NULL, 142),
('12.7',  'Blutstatus',                                                                      'Laboruntersuchungen',    0.00, 18.00, 18.00, 'Nicht neben 12.9, 12.10, 12.11', 145),
('12.8',  'Blutzuckerbestimmung',                                                            'Laboruntersuchungen',    0.00,  8.00,  8.00, NULL, 146),
('12.12', 'Blutkörperchen-Senkungsgeschwindigkeit (BKS) einschl. Blutentnahme',              'Laboruntersuchungen',    0.00,  6.00,  6.00, NULL, 150),
('12.13', 'Einfache mikroskopische/chemische Untersuchung von Körperflüssigkeiten',          'Laboruntersuchungen',    0.00,  9.50,  9.50, 'Auch Dunkelfeld, pro Untersuchung', 151),

-- ── Sonstige Untersuchungen (Ziffer 13) ──
('13.1',  'Untersuchung mit speziellen Apparaturen',                                         'Spezialuntersuchungen', 10.50, 31.00, 20.00, 'z.B. pH im strömenden Blut', 160),

-- ── Spezielle Untersuchungen (Ziffer 14) ──
('14.5',  'Prüfung der Lungenkapazität (Spirometrie)',                                       'Spezialuntersuchungen', 10.50, 20.50, 15.00, NULL, 171),
('14.6',  'Elektrokardiogramm (mind. 9 Ableitungen)',                                        'Spezialuntersuchungen', 26.00, 51.50, 38.00, NULL, 172),
('14.9',  'Spezielle Herz-Kreislauf-Untersuchungen (Schellong)',                             'Spezialuntersuchungen', 10.50, 25.50, 18.00, NULL, 175),
('14.10', 'Ultraschall-Gefäßdoppler-Untersuchung',                                          'Spezialuntersuchungen',  0.00, 11.30, 11.30, 'Periphere Venendruck-/Strömungsmessung', 176),

-- ── Bioenergetische Verfahren (Ziffer 16) ──
('16.1',  'Elektro-Neural-Diagnostik',                                                      'Bioenergetische Verfahren', 10.50, 26.00, 18.00, NULL, 180),
('16.2',  'Segmentdiagnostik, Maximaldiagnostik u.a.',                                      'Bioenergetische Verfahren',  5.20, 20.50, 13.00, NULL, 181),
('16.3',  'Bioelektrische Funktionsdiagnostik',                                             'Bioenergetische Verfahren', 15.50, 41.00, 28.00, NULL, 182),
('16.4',  'Hautwiderstandsmessungen',                                                       'Bioenergetische Verfahren',  5.20, 26.00, 15.00, NULL, 183),

-- ── Neurologische Untersuchungen (Ziffer 17) ──
('17.1',  'Neurologische Untersuchung',                                                     'Neurologische Untersuchungen', 5.20, 26.00, 15.00, NULL, 190),

-- ── Heilmagnetische Behandlungen (Ziffer 18) ──
('18.1',  'Einfache heilmagnetische Spezialbehandlung',                                     'Heilmagnetismus',        5.50, 10.50,  8.00, 'Normaler Zeitumfang', 195),
('18.2',  'Heilmagnetische Spezialbehandlung (überdurchschnittlicher Zeitumfang)',           'Heilmagnetismus',        5.50, 10.50,  8.00, NULL, 196),

-- ── Psychotherapie (Ziffer 19) ──
('19.1',  'Psychotherapie, halbstündige Dauer',                                             'Psychotherapie',         15.50, 26.00, 20.00, NULL, 200),
('19.2',  'Psychotherapie, 50–90 Minuten Dauer',                                            'Psychotherapie',         26.00, 46.00, 36.00, NULL, 201),

-- ── Atemtherapie & Massagen (Ziffer 20) ──
('20.1',  'Atemtherapeutische Behandlungsverfahren',                                        'Atemtherapie & Massagen', 13.00, 31.00, 22.00, NULL, 210),
('20.2',  'Nervenpunktmassage nach Cornelius, Aurelius u.a.',                               'Atemtherapie & Massagen',  8.00, 15.50, 12.00, NULL, 211),
('20.3',  'Bindegewebsmassage',                                                             'Atemtherapie & Massagen',  8.00, 20.50, 14.00, NULL, 212),
('20.4',  'Teilmassage (Massage einzelner Körperteile)',                                    'Atemtherapie & Massagen',  5.50, 10.50,  8.00, NULL, 213),
('20.5',  'Großmassage',                                                                    'Atemtherapie & Massagen', 10.50, 18.00, 14.00, NULL, 214),
('20.6',  'Sondermassagen (Unterwasserdruckstrahl, Lymphdrainage, Schrägbettbehandlung)',    'Atemtherapie & Massagen', 10.50, 20.50, 15.50, NULL, 215),
('20.7',  'Behandlung mit physikalischen oder medico-mechanischen Apparaten',               'Atemtherapie & Massagen', 10.50, 26.00, 18.00, NULL, 216),
('20.8',  'Einreibungen zu therapeutischen Zwecken in die Haut',                            'Atemtherapie & Massagen',  5.50,  8.00,  7.00, NULL, 217),

-- ── Akupunktur (Ziffer 21) ──
('21.1',  'Akupunktur einschließlich Pulsdiagnose',                                         'Akupunktur',             10.30, 26.00, 18.00, NULL, 220),
('21.2',  'Moxibustionen, Elektroakupunktur, Injektionen in Akupunkturpunkte',              'Akupunktur',              5.20, 15.50, 10.00, NULL, 221),

-- ── Inhalationen (Ziffer 22) ──
('22.1',  'Inhalationen mit verschiedenen Apparaturen in der Sprechstunde',                 'Inhalationen',            5.50, 13.00,  9.00, NULL, 225),

-- ── Aerosole (Ziffer 23) ──
('23.1',  'Anwendung von Aerosolen mit Kompressor/Pressluft-/Sauerstoffapparaten',          'Aerosole',                5.20, 15.50, 10.00, NULL, 228),

-- ── Eigenblut / Eigenharn (Ziffer 24) ──
('24.1',  'Eigenblutinjektion einschl. Blutentnahme und Reinjektion',                       'Eigenblut/Eigenharn',    10.30, 13.00, 12.00, NULL, 230),
('24.2',  'Eigenharninjektion',                                                             'Eigenblut/Eigenharn',     5.20, 13.00,  9.00, NULL, 231),

-- ── Injektionen, Infusionen (Ziffer 25) ──
('25.1',  'Injektion, subkutan',                                                            'Injektionen',             0.00,  5.20,  5.20, NULL, 240),
('25.2',  'Injektion, intramuskulär',                                                       'Injektionen',             0.00,  5.20,  5.20, NULL, 241),
('25.3',  'Injektion, intravenös, intraarteriell',                                           'Injektionen',             0.00,  7.70,  7.70, NULL, 242),
('25.4',  'Intrakutane Reiztherapie (Quaddelbehandlung), pro Sitzung',                      'Injektionen',             7.20, 13.00, 10.00, NULL, 243),
('25.5',  'Injektion, intraartikulär',                                                      'Injektionen',             5.20, 15.50, 10.00, NULL, 244),
('25.6',  'Neural- oder segmentgezielte Injektionen nach Hunecke',                          'Injektionen',             7.70, 26.00, 16.00, NULL, 245),
('25.7',  'Infusion',                                                                       'Injektionen',             0.00,  8.70,  8.70, NULL, 246),
('25.8',  'Dauertropfinfusion',                                                             'Injektionen',             0.00, 12.80, 12.80, NULL, 247),
('25.9',  'Gasgemischinjektionen (z.B. Ozon/Sauerstoff), intramuskulär',                    'Injektionen',             7.70, 13.00, 10.00, NULL, 248),
('25.10', 'Gasgemischinjektionen, intraarteriell',                                          'Injektionen',            13.00, 26.00, 19.00, NULL, 249),
('25.11', 'HOT-Behandlung (Hämatogene Oxidationstherapie)',                                 'Injektionen',            26.00, 51.50, 38.00, NULL, 250),

-- ── Blutentnahmen (Ziffer 26) ──
('26.1',  'Blutentnahme',                                                                   'Blutentnahmen',           0.00,  3.60,  3.60, NULL, 255),
('26.2',  'Aderlass',                                                                       'Blutentnahmen',           0.00, 12.80, 12.80, NULL, 256),

-- ── Hautableitungsverfahren, Hautreizverfahren (Ziffer 27) ──
('27.1',  'Setzen von Blutegeln, ggf. einschl. Verband',                                   'Schröpfen & Hautreiz',   10.50, 31.00, 20.00, NULL, 260),
('27.2',  'Skarifikation der Haut',                                                        'Schröpfen & Hautreiz',    5.50, 10.50,  8.00, NULL, 261),
('27.3',  'Setzen von Schröpfköpfen, unblutig',                                            'Schröpfen & Hautreiz',    5.20,  8.00,  7.00, NULL, 262),
('27.4',  'Setzen von Schröpfköpfen, blutig',                                              'Schröpfen & Hautreiz',   10.50, 20.50, 15.00, NULL, 263),
('27.5',  'Schröpfkopfmassage einschl. Gleitmittel',                                       'Schröpfen & Hautreiz',    5.20, 10.50,  8.00, NULL, 264),
('27.6',  'Anwendung großer Saugapparate für ganze Extremitäten',                           'Schröpfen & Hautreiz',   10.50, 26.00, 18.00, NULL, 265),
('27.11', 'Baunscheidtieren',                                                               'Schröpfen & Hautreiz',   10.30, 20.50, 15.00, NULL, 270),
('27.12', 'Biersche Stauung',                                                              'Schröpfen & Hautreiz',    5.20,  8.00,  7.00, NULL, 271),

-- ── Infiltrationen (Ziffer 28) ──
('28.1',  'Paravertebrale Infiltration, einmalig / eine Körperregion',                      'Infiltrationen',          7.70, 15.50, 12.00, NULL, 275),
('28.2',  'Paravertebrale Infiltration, mehrmalig / mehrere Körperregionen',                'Infiltrationen',         10.30, 36.00, 22.00, NULL, 276),

-- ── Roedersches Verfahren (Ziffer 29) ──
('29.1',  'Roedersches Behandlungs- und Mandelabsaugverfahren',                            'Sonstige Behandlungen',   8.00, 15.50, 12.00, NULL, 280),

-- ── Sonstiges (Ziffer 30) ──
('30.1',  'Spülung des Ohres',                                                             'Sonstige Behandlungen',   8.00, 15.50, 12.00, NULL, 285),
('30.2',  'Beutelbegasung mit Ozon oder Sauerstoff für ganze Extremitäten',                 'Sonstige Behandlungen',  10.30, 36.00, 22.00, NULL, 286),

-- ── Wundversorgung (Ziffern 31–32) ──
('31.1',  'Eröffnung eines oberflächlichen Abszesses',                                     'Wundversorgung',          5.20, 13.00,  9.00, NULL, 290),
('31.2',  'Entfernung von Aknepusteln pro Sitzung',                                        'Wundversorgung',          5.20, 10.50,  8.00, NULL, 291),
('32.1',  'Versorgung einer kleinen frischen Wunde',                                        'Wundversorgung',          5.20, 10.50,  8.00, NULL, 292),
('32.2',  'Versorgung einer größeren und verunreinigten Wunde',                             'Wundversorgung',         10.30, 15.50, 13.00, NULL, 293),

-- ── Verbände (Ziffer 33) ──
('33.1',  'Verbände, jedes Mal',                                                            'Verbände',                5.20, 15.50, 10.00, NULL, 300),
('33.2',  'Elastische Stütz-, Tape- oder Pflasterverbände',                                'Verbände',                5.20, 15.50, 10.00, 'Materialkosten zum Gestehungspreis', 301),
('33.3',  'Kompressions- oder Zinkleimverband',                                            'Verbände',                5.20, 13.00,  9.00, NULL, 302),

-- ── Chiropraktik (Ziffer 34) ──
('34.1',  'Chiropraktische Behandlung',                                                     'Chiropraktik',           10.50, 18.00, 14.00, NULL, 310),
('34.2',  'Gezielter chiropraktischer Eingriff an der Wirbelsäule',                         'Chiropraktik',           15.40, 19.00, 17.00, 'Ab 3x pro Behandlungsfall: Begründung erforderlich', 311),

-- ── Osteopathie (Ziffer 35) ──
('35.1',  'Osteopathische Behandlung — Unterkiefer',                                        'Osteopathie',             7.70, 15.50, 12.00, NULL, 320),
('35.2',  'Osteopathische Behandlung — Schultergelenke',                                    'Osteopathie',            15.40, 26.00, 20.00, NULL, 321),
('35.3',  'Osteopathische Behandlung — Handgelenke/Oberschenkel/Unterschenkel/Vorderarme/Fußgelenke', 'Osteopathie', 15.40, 26.00, 20.00, NULL, 322),
('35.4',  'Osteopathische Behandlung — Schlüsselbeine und Kniegelenke',                     'Osteopathie',             5.20, 15.50, 10.00, NULL, 323),
('35.5',  'Osteopathische Behandlung — Daumen',                                             'Osteopathie',             5.20, 13.00,  9.00, NULL, 324),
('35.6',  'Osteopathische Behandlung — Finger und Zehen',                                   'Osteopathie',             5.20, 13.00,  9.00, NULL, 325),

-- ── Hydrotherapie (Ziffer 36) ──
('36.1',  'Leitung eines ansteigenden Vollbades',                                           'Hydrotherapie',           5.20, 15.50, 10.00, NULL, 330),
('36.2',  'Leitung eines ansteigenden Teilbades',                                           'Hydrotherapie',           5.50,  8.00,  7.00, NULL, 331),
('36.3',  'Spezialdarmbad (subaquales Darmbad)',                                            'Hydrotherapie',           7.70, 23.00, 15.00, NULL, 332),
('36.4',  'Kneippsche Güsse',                                                              'Hydrotherapie',           5.50,  8.00,  7.00, NULL, 333),

-- ── Elektrische Bäder, Heißluftbäder (Ziffer 37) ──
('37.1',  'Teilheißluftbad (z.B. Kopf oder Arm)',                                          'Elektrische Bäder',       5.50,  8.00,  7.00, NULL, 340),
('37.2',  'Ganzheißluftbad (z.B. Rumpf oder Beine)',                                       'Elektrische Bäder',       8.00, 10.50,  9.00, NULL, 341),
('37.3',  'Heißluftbad im geschlossenen Kasten',                                           'Elektrische Bäder',       5.20, 10.50,  8.00, NULL, 342),
('37.4',  'Elektrisches Vierzellenbad',                                                     'Elektrische Bäder',       8.00, 13.00, 10.00, NULL, 343),
('37.5',  'Elektrisches Vollbad (Stangerbad)',                                              'Elektrische Bäder',       7.70, 13.00, 10.00, NULL, 344),

-- ── Packungen (Ziffer 38) ──
('38.1',  'Fangopackungen',                                                                 'Packungen',               8.00, 15.50, 12.00, NULL, 350),
('38.2',  'Paraffinpackungen, örtliche',                                                    'Packungen',               8.00, 15.50, 12.00, NULL, 351),
('38.3',  'Paraffinganzpackungen',                                                          'Packungen',              10.50, 23.00, 16.00, NULL, 352),
('38.4',  'Kneippsche Wickel- und Ganzpackungen, Prießnitz- und Schlenzpackungen',          'Packungen',              10.50, 31.00, 20.00, NULL, 353),

-- ── Elektrotherapie (Ziffer 39) ──
('39.1',  'Einfache oder örtliche Lichtbestrahlungen',                                     'Elektrotherapie',         5.50,  8.00,  7.00, NULL, 360),
('39.2',  'Ganzbestrahlungen',                                                             'Elektrotherapie',         7.70, 10.50,  9.00, NULL, 361),
('39.4',  'Faradisation, Galvanisation und verwandte Verfahren (Schwellstromgeräte)',        'Elektrotherapie',         5.50, 15.50, 10.00, NULL, 363),
('39.5',  'Anwendung der Influenzmaschine',                                                 'Elektrotherapie',         5.50, 10.50,  8.00, NULL, 364),
('39.6',  'Anwendung von Heizsonnen (Infrarot)',                                            'Elektrotherapie',         5.50,  8.00,  7.00, NULL, 365),
('39.8',  'Behandlung mit hochgespannten/Hochfrequenzströmen',                              'Elektrotherapie',         5.50, 15.50, 10.00, NULL, 367),
('39.9',  'Langwellenbehandlung (Diathermie), Kurzwellen- und Mikrowellenbehandlung',       'Elektrotherapie',         8.00, 18.00, 13.00, NULL, 368),
('39.10', 'Magnetfeldtherapie mit besonderen Spezialapparaten',                             'Elektrotherapie',        10.50, 20.50, 15.00, NULL, 369),
('39.11', 'Elektromechanische und elektrothermische Behandlung',                             'Elektrotherapie',         5.50, 31.00, 18.00, 'Je nach Aufwand/Dauer', 370),
('39.12', 'Niederfrequente Reizstromtherapie',                                              'Elektrotherapie',         5.50, 26.00, 15.00, 'z.B. Jono Modulator', 371),
('39.13', 'Ultraschall-Behandlung',                                                         'Elektrotherapie',         5.50, 15.50, 10.00, NULL, 372)

ON CONFLICT (ziffer) DO UPDATE SET
  bezeichnung   = EXCLUDED.bezeichnung,
  kategorie     = EXCLUDED.kategorie,
  preis_min     = EXCLUDED.preis_min,
  preis_max     = EXCLUDED.preis_max,
  preis_default = EXCLUDED.preis_default,
  hinweis       = EXCLUDED.hinweis,
  sort_order    = EXCLUDED.sort_order;

-- ================================================================
-- Done.
-- ================================================================
