-- ============================================================
-- PROJ-18: Betriebliche Gesundheitsförderung (BGF)
--
-- REIHENFOLGE: Alle Tabellen → Alle Indexes → Alle RLS/Policies
--              → Triggers → Functions → Seed Data
-- ============================================================


-- ══════════════════════════════════════════════════════════════
-- SCHRITT 1: ALLE TABELLEN ERSTELLEN
-- ══════════════════════════════════════════════════════════════

-- 1a. user_profiles erweitern
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bgf_freigeschaltet BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bgf_freigeschaltet_am TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bgf_level TEXT CHECK (bgf_level IN ('gesperrt', 'berechtigt', 'lead')) DEFAULT 'gesperrt';

-- 1b. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  branche TEXT,
  groesse TEXT CHECK (groesse IN ('1-49', '50-99', '100-249', '250-499', '500+')),
  kontakt_name TEXT NOT NULL,
  kontakt_email TEXT NOT NULL,
  kontakt_telefon TEXT,
  adresse_strasse TEXT,
  adresse_plz TEXT,
  adresse_ort TEXT,
  vertrag_tier TEXT CHECK (vertrag_tier IN ('basic', 'pro', 'enterprise')) DEFAULT 'pro',
  vertrag_lizenzen INTEGER NOT NULL DEFAULT 50,
  vertrag_start DATE,
  vertrag_ende DATE,
  vertrag_preis_pro_ma_monat DECIMAL(8,2) DEFAULT 39.00,
  status TEXT CHECK (status IN ('pilot', 'aktiv', 'pausiert', 'gekuendigt')) DEFAULT 'pilot',
  pausen_fit_zeiten JSONB DEFAULT '["10:00","13:00","15:30"]'::jsonb,
  abteilungen TEXT[] DEFAULT '{}',
  therapeut_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1c. Organization Admins
CREATE TABLE IF NOT EXISTS organization_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  rolle TEXT CHECK (rolle IN ('hr_admin', 'hr_viewer', 'geschaeftsfuehrung')) DEFAULT 'hr_admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- 1d. Organization Members
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  vorname TEXT,
  nachname TEXT,
  abteilung TEXT,
  arbeitsplatz_typ TEXT CHECK (arbeitsplatz_typ IN (
    'buero', 'homeoffice', 'lager', 'produktion', 'handwerk', 'pflege', 'mischform'
  )) DEFAULT 'buero',
  status TEXT CHECK (status IN ('eingeladen', 'aktiv', 'pausiert', 'deaktiviert')) DEFAULT 'eingeladen',
  freigeschaltet_am TIMESTAMPTZ,
  freigeschaltet_von UUID REFERENCES user_profiles(id),
  ist_analyse_abgeschlossen BOOLEAN DEFAULT false,
  invite_token UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, email)
);

-- 1e. Ist-Analyse
CREATE TABLE IF NOT EXISTS ist_analyse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  arbeitsplatz_typ TEXT NOT NULL,
  bildschirmarbeit_stunden DECIMAL(3,1),
  sitz_stunden_pro_tag DECIMAL(3,1),
  heben_tragen BOOLEAN DEFAULT false,
  beschwerden_regionen TEXT[] DEFAULT '{}',
  schmerz_aktuell INTEGER CHECK (schmerz_aktuell BETWEEN 0 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 0 AND 10),
  schlaf_qualitaet INTEGER CHECK (schlaf_qualitaet BETWEEN 0 AND 10),
  bewegungseinschraenkung INTEGER CHECK (bewegungseinschraenkung BETWEEN 0 AND 10),
  bewegung_minuten_pro_woche INTEGER DEFAULT 0,
  sport_art TEXT,
  vorerkrankungen TEXT[] DEFAULT '{}',
  medikamente TEXT,
  ziele TEXT[] DEFAULT '{}',
  risiko_score INTEGER CHECK (risiko_score BETWEEN 0 AND 100),
  ki_empfehlung TEXT,
  pausen_fit_fokus TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, organization_id)
);

-- 1f. Pausen-Fit Sessions
CREATE TABLE IF NOT EXISTS pausen_fit_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  geplant_um TIMESTAMPTZ NOT NULL,
  gestartet_um TIMESTAMPTZ,
  abgeschlossen_um TIMESTAMPTZ,
  typ TEXT CHECK (typ IN ('morgen_aktivierung', 'mittag_mobilisation', 'nachmittag_reset')) NOT NULL,
  uebungen JSONB NOT NULL DEFAULT '[]'::jsonb,
  ergonomie_tipp TEXT,
  dauer_sekunden INTEGER,
  feedback_sterne INTEGER CHECK (feedback_sterne BETWEEN 1 AND 5),
  feedback_text TEXT,
  status TEXT CHECK (status IN ('geplant', 'gestartet', 'abgeschlossen', 'verpasst')) DEFAULT 'geplant',
  check_in_schmerz_bei_erstellung INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1g. Ergonomie-Tipps
CREATE TABLE IF NOT EXISTS ergonomie_tipps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kategorie TEXT CHECK (kategorie IN (
    'bildschirm', 'sitzen', 'stehen', 'heben', 'pausen', 'ernaehrung', 'stress', 'allgemein'
  )) NOT NULL,
  arbeitsplatz_typen TEXT[] DEFAULT '{}',
  tipp TEXT NOT NULL,
  quelle TEXT,
  aktiv BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ══════════════════════════════════════════════════════════════
-- SCHRITT 2: INDEXES
-- ══════════════════════════════════════════════════════════════

CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_therapeut ON organizations(therapeut_id);
CREATE INDEX idx_org_admins_org ON organization_admins(organization_id);
CREATE INDEX idx_org_admins_user ON organization_admins(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_status ON organization_members(status);
CREATE INDEX idx_org_members_invite ON organization_members(invite_token);
CREATE INDEX idx_ist_analyse_user ON ist_analyse(user_id);
CREATE INDEX idx_ist_analyse_org ON ist_analyse(organization_id);
CREATE INDEX idx_pausen_fit_user ON pausen_fit_sessions(user_id);
CREATE INDEX idx_pausen_fit_org ON pausen_fit_sessions(organization_id);
CREATE INDEX idx_pausen_fit_geplant ON pausen_fit_sessions(geplant_um);
CREATE INDEX idx_pausen_fit_status ON pausen_fit_sessions(status);
CREATE INDEX idx_pausen_fit_user_date ON pausen_fit_sessions(user_id, geplant_um DESC);


-- ══════════════════════════════════════════════════════════════
-- SCHRITT 3: RLS AKTIVIEREN + POLICIES
-- (Alle Tabellen existieren jetzt — Cross-References sind safe)
-- ══════════════════════════════════════════════════════════════

-- organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY organizations_admin ON organizations FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY organizations_bgf_therapeut ON organizations FOR SELECT USING (therapeut_id = auth.uid());
CREATE POLICY organizations_hr_admin ON organizations FOR SELECT USING (
  id IN (SELECT organization_id FROM organization_admins WHERE user_id = auth.uid())
);

-- organization_admins
ALTER TABLE organization_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_admins_admin ON organization_admins FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY org_admins_self ON organization_admins FOR SELECT USING (user_id = auth.uid());
CREATE POLICY org_admins_bgf_therapeut ON organization_admins FOR SELECT USING (
  organization_id IN (SELECT id FROM organizations WHERE therapeut_id = auth.uid())
);

-- organization_members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_members_admin ON organization_members FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY org_members_hr ON organization_members FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM organization_admins WHERE user_id = auth.uid())
);
CREATE POLICY org_members_hr_manage ON organization_members FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM organization_admins
    WHERE user_id = auth.uid() AND rolle = 'hr_admin'
  )
);
CREATE POLICY org_members_bgf_therapeut ON organization_members FOR SELECT USING (
  organization_id IN (SELECT id FROM organizations WHERE therapeut_id = auth.uid())
);
CREATE POLICY org_members_self ON organization_members FOR SELECT USING (user_id = auth.uid());

-- ist_analyse
ALTER TABLE ist_analyse ENABLE ROW LEVEL SECURITY;
CREATE POLICY ist_analyse_admin ON ist_analyse FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY ist_analyse_self ON ist_analyse FOR ALL USING (user_id = auth.uid());
CREATE POLICY ist_analyse_bgf_therapeut ON ist_analyse FOR SELECT USING (
  organization_id IN (SELECT id FROM organizations WHERE therapeut_id = auth.uid())
);

-- pausen_fit_sessions
ALTER TABLE pausen_fit_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY pausen_fit_admin ON pausen_fit_sessions FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY pausen_fit_self ON pausen_fit_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY pausen_fit_bgf_therapeut ON pausen_fit_sessions FOR SELECT USING (
  organization_id IN (SELECT id FROM organizations WHERE therapeut_id = auth.uid())
);

-- ergonomie_tipps
ALTER TABLE ergonomie_tipps ENABLE ROW LEVEL SECURITY;
CREATE POLICY ergonomie_tipps_read ON ergonomie_tipps FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY ergonomie_tipps_admin ON ergonomie_tipps FOR ALL USING (get_my_role() = 'admin');


-- ══════════════════════════════════════════════════════════════
-- SCHRITT 4: TRIGGERS
-- ══════════════════════════════════════════════════════════════

CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_org_members_updated_at
  BEFORE UPDATE ON organization_members FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_ist_analyse_updated_at
  BEFORE UPDATE ON ist_analyse FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ══════════════════════════════════════════════════════════════
-- SCHRITT 5: HELPER FUNCTIONS
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION is_bgf_therapeut()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(
    (SELECT bgf_freigeschaltet FROM user_profiles WHERE id = auth.uid()),
    false
  );
$$;
GRANT EXECUTE ON FUNCTION is_bgf_therapeut() TO authenticated;

CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_admins
    WHERE organization_id = org_id AND user_id = auth.uid()
  );
$$;
GRANT EXECUTE ON FUNCTION is_org_admin(UUID) TO authenticated;


-- ══════════════════════════════════════════════════════════════
-- SCHRITT 6: SEED DATA
-- ══════════════════════════════════════════════════════════════

INSERT INTO ergonomie_tipps (kategorie, arbeitsplatz_typen, tipp) VALUES
  ('bildschirm', '{buero,homeoffice}', 'Stellen Sie Ihren Bildschirm auf Augenhöhe — die Oberkante des Monitors sollte auf Höhe Ihrer Augen sein. Das reduziert Nackenverspannungen um bis zu 40%.'),
  ('bildschirm', '{buero,homeoffice}', 'Die 20-20-20 Regel: Alle 20 Minuten für 20 Sekunden einen Punkt in 20 Fuß (6 Meter) Entfernung ansehen. Reduziert Augenermüdung signifikant.'),
  ('sitzen', '{buero,homeoffice}', 'Ihre Füße sollten flach auf dem Boden stehen, Oberschenkel waagerecht. Nutzen Sie ggf. eine Fußstütze.'),
  ('sitzen', '{buero,homeoffice}', 'Wechseln Sie mindestens alle 30 Minuten Ihre Sitzposition. Dynamisches Sitzen belastet die Bandscheiben gleichmäßiger.'),
  ('sitzen', '{buero,homeoffice}', 'Die Armlehnen sollten so eingestellt sein, dass Ihre Schultern entspannt sind — nicht hochgezogen, nicht hängend.'),
  ('stehen', '{lager,produktion,handwerk}', 'Bei Steharbeitsplätzen: Gewicht regelmäßig verlagern, eine Fußbank nutzen und Schuhe mit guter Dämpfung tragen.'),
  ('heben', '{lager,produktion,handwerk,pflege}', 'Immer aus den Knien heben, nie aus dem Rücken. Last nah am Körper halten. Bei Lasten über 25 kg Hilfsmittel nutzen.'),
  ('heben', '{lager,produktion,handwerk,pflege}', 'Drehbewegungen unter Last vermeiden — Füße umsetzen statt den Rumpf zu verdrehen.'),
  ('pausen', '{buero,homeoffice,lager,produktion,handwerk,pflege,mischform}', 'Ein 10-minütiger Spaziergang nach dem Mittagessen senkt das Nachmittagstief und verbessert die Konzentration um bis zu 30%.'),
  ('pausen', '{buero,homeoffice,lager,produktion,handwerk,pflege,mischform}', 'Mikropausen (30-60 Sekunden Stretching alle 45 Minuten) sind effektiver als eine lange Pause am Stück.'),
  ('stress', '{buero,homeoffice,lager,produktion,handwerk,pflege,mischform}', '4-7-8 Atemtechnik: 4 Sekunden einatmen, 7 Sekunden halten, 8 Sekunden ausatmen. Drei Zyklen senken den Cortisolspiegel messbar.'),
  ('ernaehrung', '{buero,homeoffice,lager,produktion,handwerk,pflege,mischform}', 'Trinken Sie 30ml Wasser pro kg Körpergewicht. Dehydration ab 2% senkt die kognitive Leistung um bis zu 25%.'),
  ('allgemein', '{buero,homeoffice}', 'Blaulichtfilter nach 16 Uhr aktivieren — verbessert nachweislich die Schlafqualität und reduziert Augenbelastung.'),
  ('allgemein', '{buero,homeoffice}', 'Raumtemperatur zwischen 20-22°C halten. Jedes Grad darüber reduziert die Produktivität um ca. 2%.');
