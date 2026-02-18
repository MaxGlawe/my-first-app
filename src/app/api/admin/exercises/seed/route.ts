/**
 * PROJ-8: Übungsdatenbank-Verwaltung
 * POST /api/admin/exercises/seed
 *
 * Seeds the Praxis-Bibliothek with 50+ standard physiotherapy exercises.
 * Access: Admin only.
 *
 * Idempotent: Checks for existing exercises before inserting (by name + is_public).
 * Returns: { inserted: number, skipped: number }
 */

import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-service"

// ----------------------------------------------------------------
// Standard PT Exercise Library (50+ exercises)
// Categories: Hüfte, Knie, Schulter, LWS, HWS, Core
// ----------------------------------------------------------------
const STANDARD_EXERCISES = [
  // ── KNIE ────────────────────────────────────────────────────────
  {
    name: "Kniebeugen (Bodyweight)",
    beschreibung: "Grundlegende Kräftigungsübung für Quadrizeps, Gesäß und Oberschenkelrückseite.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Füße schulterbreit aufstellen, Zehen leicht nach außen." },
      { nummer: 2, beschreibung: "Rücken gerade halten, Bauch anspannen." },
      { nummer: 3, beschreibung: "Langsam in die Hocke gehen, bis Oberschenkel parallel zum Boden." },
      { nummer: 4, beschreibung: "Knie zeigen in Richtung der Zehen (nicht einwärts fallen)." },
      { nummer: 5, beschreibung: "Kontrolliert wieder aufrichten." },
    ],
    muskelgruppen: ["Knie", "Oberschenkel", "Gesäß"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 60,
  },
  {
    name: "Einbeinige Kniebeuge",
    beschreibung: "Funktionelle Einbeinübung zur Stabilitätsschulung des Kniegelenks.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Auf einem Bein stehen, Hände vor dem Körper oder auf der Hüfte." },
      { nummer: 2, beschreibung: "Knie langsam beugen, bis ca. 60–90 Grad Beugung." },
      { nummer: 3, beschreibung: "Standbein-Knie zeigt in Richtung des 2. Zehs (nicht einwärts)." },
      { nummer: 4, beschreibung: "Kontrolliert zurück in die Ausgangsposition." },
    ],
    muskelgruppen: ["Knie", "Oberschenkel", "Gesäß"],
    schwierigkeitsgrad: "mittel",
    standard_saetze: 3,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 60,
  },
  {
    name: "Terminale Knieextension (TKE)",
    beschreibung: "Isoliertes Training des Vastus medialis obliquus (VMO) — wichtig nach Knie-OPs.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Theraband um ein festes Objekt befestigen, um das Knie schlingen." },
      { nummer: 2, beschreibung: "Leicht im Knie gebeugt stehen (ca. 20–30 Grad)." },
      { nummer: 3, beschreibung: "Knie vollständig strecken und 2 Sekunden halten." },
      { nummer: 4, beschreibung: "Langsam zurück in die leichte Beugung." },
    ],
    muskelgruppen: ["Knie", "Oberschenkel"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 20,
    standard_pause_sekunden: 45,
  },
  {
    name: "Hamstring Curl (Bauchlage)",
    beschreibung: "Kräftigung der ischiokruralen Muskulatur in Bauchlage.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "In Bauchlage auf der Behandlungsbank liegen." },
      { nummer: 2, beschreibung: "Bein gestreckt, Zehen aufziehen." },
      { nummer: 3, beschreibung: "Ferse Richtung Gesäß ziehen, so weit wie möglich ohne Schmerz." },
      { nummer: 4, beschreibung: "3 Sekunden halten, dann langsam ablassen." },
    ],
    muskelgruppen: ["Knie", "Oberschenkel"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 60,
  },
  {
    name: "Step-Up",
    beschreibung: "Funktionelles Treppensteigen als Rehabilitationsübung für das Knie.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Vor einer Stufe (10–20 cm) stehen." },
      { nummer: 2, beschreibung: "Ein Bein auf die Stufe stellen." },
      { nummer: 3, beschreibung: "Körper nach oben heben, bis das Bein vollständig gestreckt ist." },
      { nummer: 4, beschreibung: "Kontrolliert wieder heruntersteigen." },
    ],
    muskelgruppen: ["Knie", "Oberschenkel", "Gesäß"],
    schwierigkeitsgrad: "mittel",
    standard_saetze: 3,
    standard_wiederholungen: 12,
    standard_pause_sekunden: 60,
  },
  // ── HÜFTE ───────────────────────────────────────────────────────
  {
    name: "Hüftabduktion (Seitenlage)",
    beschreibung: "Kräftigung der Hüftabduktoren — wichtig nach Hüft-TEP und bei Knie-Schmerzen.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "In Seitenlage liegen, Beine gestreckt übereinander." },
      { nummer: 2, beschreibung: "Oberes Bein anheben bis ca. 45 Grad, Fuß bleibt neutral." },
      { nummer: 3, beschreibung: "2 Sekunden oben halten, dann langsam ablassen." },
      { nummer: 4, beschreibung: "Hüfte nicht nach hinten kippen." },
    ],
    muskelgruppen: ["Hüfte", "Gesäß"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 45,
  },
  {
    name: "Hüftextension (Bauchlage)",
    beschreibung: "Kräftigung von Gluteus maximus und ischiokruraler Muskulatur.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "In Bauchlage auf der Behandlungsbank liegen, Arme neben dem Körper." },
      { nummer: 2, beschreibung: "Knie leicht beugen (ca. 30 Grad)." },
      { nummer: 3, beschreibung: "Bein vom Boden abheben, dabei Gesäß anspannen." },
      { nummer: 4, beschreibung: "3 Sekunden halten, langsam ablassen." },
    ],
    muskelgruppen: ["Hüfte", "Gesäß"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 45,
  },
  {
    name: "Brücke (Bridging)",
    beschreibung: "Aktivierung von Gluteus maximus und LWS-stabilisierender Muskulatur.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Rückenlage, Knie gebeugt, Füße hüftbreit aufgestellt." },
      { nummer: 2, beschreibung: "Bauch leicht anspannen, dann Gesäß vom Boden heben." },
      { nummer: 3, beschreibung: "Körper bildet eine gerade Linie von Schultern bis Knie." },
      { nummer: 4, beschreibung: "3 Sekunden halten, dann langsam ablassen." },
    ],
    muskelgruppen: ["Hüfte", "Gesäß", "LWS", "Core"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 45,
  },
  {
    name: "Einbeiniges Bridging",
    beschreibung: "Fortgeschrittenes Bridging zur Stabilitätsschulung von Hüfte und Rumpf.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Rückenlage, ein Bein aufgestellt, das andere gestreckt anheben." },
      { nummer: 2, beschreibung: "Gesäß vom Boden heben, dabei Hüfte gerade halten (nicht abkippen)." },
      { nummer: 3, beschreibung: "3 Sekunden halten, dann langsam ablassen." },
    ],
    muskelgruppen: ["Hüfte", "Gesäß", "Core"],
    schwierigkeitsgrad: "mittel",
    standard_saetze: 3,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 60,
  },
  {
    name: "Clamshell (Muschel)",
    beschreibung: "Gezielte Aktivierung des Gluteus medius — wichtig bei Hüft- und Knieproblemen.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Seitenlage, Hüfte leicht gebeugt (ca. 45 Grad), Knie 90 Grad gebeugt." },
      { nummer: 2, beschreibung: "Oberes Knie anheben wie eine Muschel, die sich öffnet." },
      { nummer: 3, beschreibung: "Becken bleibt stabil — nicht nach hinten rollen." },
      { nummer: 4, beschreibung: "3 Sekunden oben halten, dann langsam ablassen." },
    ],
    muskelgruppen: ["Hüfte", "Gesäß"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 45,
  },
  {
    name: "Hüftbeuger-Dehnung (Hüftflexoren)",
    beschreibung: "Dehnung des Iliopsoas und Rectus femoris — wichtig bei LWS-Beschwerden und Hüft-OPs.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "In einen tiefen Ausfallschritt gehen (hinteres Knie auf dem Boden)." },
      { nummer: 2, beschreibung: "Hüfte nach vorne schieben, bis Dehnung im hinteren Oberschenkel/Leiste spürbar." },
      { nummer: 3, beschreibung: "Oberkörper aufrecht halten." },
      { nummer: 4, beschreibung: "30 Sekunden halten, Seite wechseln." },
    ],
    muskelgruppen: ["Hüfte", "Oberschenkel"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
  // ── SCHULTER ────────────────────────────────────────────────────
  {
    name: "Pendulum (Pendelübung)",
    beschreibung: "Schmerzarme Mobilisationsübung für die Schulter — geeignet direkt post-OP.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Vornüber beugen, nicht betroffener Arm stützt sich auf einem Tisch ab." },
      { nummer: 2, beschreibung: "Arm locker hängen lassen und mit kleinen Kreisbewegungen schwingen." },
      { nummer: 3, beschreibung: "Vorwärts/rückwärts und seitwärts schwingen, je 30 Sekunden." },
    ],
    muskelgruppen: ["Schulter"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
  {
    name: "Schulteraußenrotation mit Theraband",
    beschreibung: "Kräftigung der Rotatorenmanschette (Infraspinatus, Teres minor).",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Theraband auf Ellenbogenhöhe befestigen." },
      { nummer: 2, beschreibung: "Ellenbogen 90 Grad gebeugt, eng am Körper anliegend." },
      { nummer: 3, beschreibung: "Unterarm nach außen rotieren, gegen den Widerstand des Bandes." },
      { nummer: 4, beschreibung: "Kontrolliert zurück in die Ausgangsposition." },
    ],
    muskelgruppen: ["Schulter"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 60,
  },
  {
    name: "Schulterinnenrotation mit Theraband",
    beschreibung: "Kräftigung des Subscapularis (Innenrotator der Schulter).",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Theraband auf Ellenbogenhöhe befestigen, Ellenbogen 90 Grad gebeugt." },
      { nummer: 2, beschreibung: "Unterarm nach innen zur Körpermitte rotieren, gegen den Widerstand." },
      { nummer: 3, beschreibung: "Ellenbogen bleibt eng am Körper." },
      { nummer: 4, beschreibung: "Kontrolliert zurück in Ausgangsposition." },
    ],
    muskelgruppen: ["Schulter"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 60,
  },
  {
    name: "Schulterblatt-Retraktion",
    beschreibung: "Kräftigung der Rhomboiden und des mittleren Trapezius für eine aufrechte Haltung.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Aufrecht sitzen oder stehen, Arme seitlich des Körpers." },
      { nummer: 2, beschreibung: "Schulterblätter Richtung Wirbelsäule zusammenziehen." },
      { nummer: 3, beschreibung: "5 Sekunden halten, dann loslassen." },
    ],
    muskelgruppen: ["Schulter", "Rücken"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 45,
  },
  {
    name: "Schulterblatt-Depression",
    beschreibung: "Aktivierung des unteren Trapezius — wichtig bei Schulter-Impingement.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Aufrecht sitzen oder stehen." },
      { nummer: 2, beschreibung: "Schultern bewusst nach unten und hinten ziehen (nicht hochziehen)." },
      { nummer: 3, beschreibung: "5 Sekunden halten, dann entspannen." },
    ],
    muskelgruppen: ["Schulter", "Nacken"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 30,
  },
  {
    name: "Seitenliegen-Außenrotation",
    beschreibung: "Isoliertes Training der Rotatorenmanschette in Seitenlage.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "In Seitenlage liegen, Ellenbogen 90 Grad gebeugt, anliegend." },
      { nummer: 2, beschreibung: "Unterarm nach oben rotieren (Daumen zeigt zur Decke)." },
      { nummer: 3, beschreibung: "3 Sekunden oben halten, langsam zurück." },
    ],
    muskelgruppen: ["Schulter"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 60,
  },
  {
    name: "Wall Slide",
    beschreibung: "Schulterblatt-Steuerung und Rotatorenmanschette — Wandübung.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Rücken an die Wand lehnen, Arme im Ww-Griff an die Wand." },
      { nummer: 2, beschreibung: "Arme langsam nach oben gleiten lassen (wie Schneeschipper)." },
      { nummer: 3, beschreibung: "Ellenbogen und Handgelenke bleiben dabei Kontakt zur Wand." },
      { nummer: 4, beschreibung: "Langsam wieder nach unten gleiten." },
    ],
    muskelgruppen: ["Schulter", "Rücken"],
    schwierigkeitsgrad: "mittel",
    standard_saetze: 3,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 60,
  },
  // ── LWS (Lendenwirbelsäule) ──────────────────────────────────────
  {
    name: "Knie-zur-Brust-Zug (Rückenlage)",
    beschreibung: "Mobilisation und Dehnung der LWS und tiefen Hüftflexoren.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Rückenlage, beide Beine gestreckt." },
      { nummer: 2, beschreibung: "Ein Knie zur Brust ziehen, beide Hände umfassen das Knie." },
      { nummer: 3, beschreibung: "30 Sekunden halten, Seite wechseln." },
      { nummer: 4, beschreibung: "Dann beide Knie gleichzeitig zur Brust ziehen." },
    ],
    muskelgruppen: ["LWS", "Hüfte"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
  {
    name: "Katze-Kuh (Cat-Cow)",
    beschreibung: "Mobilisation der gesamten Wirbelsäule — klassische Physiotherapie-Übung.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "In den Vierfüßlerstand gehen (Knie unter Hüfte, Hände unter Schultern)." },
      { nummer: 2, beschreibung: "Einatmen: Rücken durchstrecken, Kopf anheben, Bauch senken (Kuh)." },
      { nummer: 3, beschreibung: "Ausatmen: Rücken runden, Kopf senken, Bauch einziehen (Katze)." },
      { nummer: 4, beschreibung: "Bewegung fließend 10-mal wiederholen." },
    ],
    muskelgruppen: ["LWS", "HWS", "Core"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 30,
  },
  {
    name: "Beckenbodentraining (Kegel)",
    beschreibung: "Aktivierung der Beckenbodenmuskulatur — wichtig bei LWS-Stabilisierung.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Rückenlage oder aufrecht sitzen." },
      { nummer: 2, beschreibung: "Beckenbodenmuskulatur anspannen (als würde man den Urinstrahl stoppen)." },
      { nummer: 3, beschreibung: "10 Sekunden halten, dann entspannen." },
    ],
    muskelgruppen: ["LWS", "Core"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 30,
  },
  {
    name: "Bird-Dog",
    beschreibung: "Kräftigung der tiefen Rückenstrecker und des Rumpfes im Vierfüßlerstand.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Vierfüßlerstand, Wirbelsäule neutral (keine Hohlkreuzlage)." },
      { nummer: 2, beschreibung: "Gegenüberliegenden Arm und Bein gleichzeitig anheben und strecken." },
      { nummer: 3, beschreibung: "3 Sekunden halten, dabei Bauch anspannen." },
      { nummer: 4, beschreibung: "Kontrolliert ablassen, Seite wechseln." },
    ],
    muskelgruppen: ["LWS", "Core", "Gesäß"],
    schwierigkeitsgrad: "mittel",
    standard_saetze: 3,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 45,
  },
  {
    name: "Seitstütz (Side Plank)",
    beschreibung: "Kräftigung der lateralen Rumpfmuskulatur und der Hüftabduktoren.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Auf die Seite legen, auf Ellenbogen oder Händen abstützen." },
      { nummer: 2, beschreibung: "Hüfte anheben, bis der Körper eine gerade Linie bildet." },
      { nummer: 3, beschreibung: "Position halten, Bauch anspannen." },
    ],
    muskelgruppen: ["Core", "LWS", "Hüfte"],
    schwierigkeitsgrad: "mittel",
    standard_saetze: 3,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 60,
  },
  {
    name: "Rumpfrotation (Rückenlage)",
    beschreibung: "Mobilisation der LWS und Dehnung der thorakolumbalen Faszie.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Rückenlage, Knie gebeugt, Füße aufgestellt." },
      { nummer: 2, beschreibung: "Knie gemeinsam langsam zu einer Seite kippen, bis Dehnung spürbar." },
      { nummer: 3, beschreibung: "30 Sekunden halten, Seite wechseln." },
      { nummer: 4, beschreibung: "Schultern bleiben am Boden." },
    ],
    muskelgruppen: ["LWS", "Core"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
  // ── HWS (Halswirbelsäule) ────────────────────────────────────────
  {
    name: "HWS-Chin-Tuck (Kinnrettraktion)",
    beschreibung: "Aktivierung der tiefen Halsflexoren und Korrektur des Vorwärtskopf-Haltungsfehlers.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Aufrecht sitzen oder stehen, Blick geradeaus." },
      { nummer: 2, beschreibung: "Kinn sanft zur Brust ziehen (Doppelkinn machen)." },
      { nummer: 3, beschreibung: "5 Sekunden halten, dann entspannen." },
    ],
    muskelgruppen: ["HWS", "Nacken"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 30,
  },
  {
    name: "HWS-Lateralflexion (Dehnung)",
    beschreibung: "Dehnung der seitlichen Halsmuskulatur (Skaleni, Levator scapulae).",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Aufrecht sitzen, eine Hand hält die Sitzfläche fest." },
      { nummer: 2, beschreibung: "Kopf zur Gegenseite neigen, bis Dehnung seitlich im Hals spürbar." },
      { nummer: 3, beschreibung: "30 Sekunden halten, Seite wechseln." },
    ],
    muskelgruppen: ["HWS", "Nacken"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
  {
    name: "HWS-Rotation (Mobilisation)",
    beschreibung: "Aktive Mobilisation der Halswirbelsäulen-Rotation.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Aufrecht sitzen, Chin-Tuck-Position einnehmen." },
      { nummer: 2, beschreibung: "Kopf langsam nach rechts drehen, so weit wie schmerzfrei möglich." },
      { nummer: 3, beschreibung: "2 Sekunden halten, dann zur anderen Seite." },
      { nummer: 4, beschreibung: "10 Wiederholungen pro Seite." },
    ],
    muskelgruppen: ["HWS", "Nacken"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 30,
  },
  {
    name: "Nackenisometrie (Seitwärts)",
    beschreibung: "Isometrische Kräftigung der seitlichen Halsmuskulatur ohne Bewegung.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Aufrecht sitzen, Hand seitlich gegen den Kopf drücken." },
      { nummer: 2, beschreibung: "Mit dem Kopf gegen die Hand drücken (kein Nachgeben)." },
      { nummer: 3, beschreibung: "5 Sekunden halten, dann entspannen." },
      { nummer: 4, beschreibung: "Beide Seiten trainieren." },
    ],
    muskelgruppen: ["HWS", "Nacken"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 30,
  },
  {
    name: "Trapezius-Dehnung",
    beschreibung: "Dehnung des oberen Trapezius — bei Nackenverspannungen und HWS-Syndrom.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Sitzen, eine Hand hinter den Rücken legen oder festhalten." },
      { nummer: 2, beschreibung: "Kopf zur Gegenseite neigen UND leicht nach vorne." },
      { nummer: 3, beschreibung: "Mit der anderen Hand leicht Druck auf den Kopf geben." },
      { nummer: 4, beschreibung: "30 Sekunden halten, Seite wechseln." },
    ],
    muskelgruppen: ["HWS", "Nacken", "Schulter"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
  // ── CORE ────────────────────────────────────────────────────────
  {
    name: "Unterarmstütz (Plank)",
    beschreibung: "Grundlegende isometrische Rumpfkräftigung.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Auf die Unterarme stützen, Ellenbogen unter den Schultern." },
      { nummer: 2, beschreibung: "Körper bildet eine gerade Linie von Kopf bis Ferse." },
      { nummer: 3, beschreibung: "Bauch anspannen, Gesäß nicht anheben oder absinken lassen." },
      { nummer: 4, beschreibung: "Position so lange wie möglich halten." },
    ],
    muskelgruppen: ["Core", "LWS", "Schulter"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 60,
  },
  {
    name: "Dead Bug",
    beschreibung: "Rumpfstabilisierung in Rückenlage — schont die LWS.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Rückenlage, Arme nach oben gestreckt, Beine 90 Grad angewinkelt." },
      { nummer: 2, beschreibung: "Lenden-Boden-Kontakt halten (neutraler Rücken)." },
      { nummer: 3, beschreibung: "Gleichzeitig rechten Arm und linkes Bein langsam absenken." },
      { nummer: 4, beschreibung: "Zurück zur Ausgangsposition, Seite wechseln." },
    ],
    muskelgruppen: ["Core", "LWS"],
    schwierigkeitsgrad: "mittel",
    standard_saetze: 3,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 60,
  },
  {
    name: "Pallof Press",
    beschreibung: "Anti-Rotations-Rumpfkräftigung mit Theraband.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Theraband seitlich auf Bauchnabelhöhe befestigen." },
      { nummer: 2, beschreibung: "Aufrecht stehen, Band mit beiden Händen greifen." },
      { nummer: 3, beschreibung: "Arme gerade nach vorne strecken, 3 Sekunden halten." },
      { nummer: 4, beschreibung: "Zurück zur Brust — Rumpf dreht sich dabei NICHT." },
    ],
    muskelgruppen: ["Core", "LWS"],
    schwierigkeitsgrad: "mittel",
    standard_saetze: 3,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 60,
  },
  // ── OBERSCHENKEL ────────────────────────────────────────────────
  {
    name: "Quadrizeps-Dehnung (Stehend)",
    beschreibung: "Dehnung des M. rectus femoris und der gesamten vorderen Oberschenkelmuskulatur.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Auf einem Bein stehen (Wand zur Unterstützung nutzen)." },
      { nummer: 2, beschreibung: "Ferse des anderen Beins Richtung Gesäß ziehen, Knie bleibt geschlossen." },
      { nummer: 3, beschreibung: "30 Sekunden halten, Seite wechseln." },
    ],
    muskelgruppen: ["Oberschenkel", "Knie"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
  {
    name: "Hamstring-Dehnung (Rückenlage)",
    beschreibung: "Dehnung der ischiocruralen Muskulatur in Rückenlage.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Rückenlage, Theraband oder Handtuch um den Fuß legen." },
      { nummer: 2, beschreibung: "Bein strecken und mit dem Band Richtung Körper ziehen." },
      { nummer: 3, beschreibung: "Bis zur spürbaren Dehnung auf der Rückseite des Oberschenkels." },
      { nummer: 4, beschreibung: "30 Sekunden halten, Seite wechseln." },
    ],
    muskelgruppen: ["Oberschenkel", "Hüfte"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
  {
    name: "Ausfallschritt (Lunge)",
    beschreibung: "Funktionelle Kräftigung des Beins — Training von Knie, Hüfte und Gesäß.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Aufrecht stehen, Füße zusammen." },
      { nummer: 2, beschreibung: "Großen Schritt nach vorne machen, hinteres Knie senkt sich fast zum Boden." },
      { nummer: 3, beschreibung: "Vorderes Knie bleibt über dem Fuß (nicht über die Zehen hinaus)." },
      { nummer: 4, beschreibung: "Zurück in die Ausgangsposition, Seite wechseln." },
    ],
    muskelgruppen: ["Oberschenkel", "Knie", "Hüfte", "Gesäß"],
    schwierigkeitsgrad: "mittel",
    standard_saetze: 3,
    standard_wiederholungen: 12,
    standard_pause_sekunden: 60,
  },
  {
    name: "Adduktoren-Dehnung (Schmetterlingspose)",
    beschreibung: "Dehnung der Hüftadduktoren — wichtig bei Leistenbeschwerden.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Im Schneidersitz sitzen, Fußsohlen aneinander, Knie fallen nach außen." },
      { nummer: 2, beschreibung: "Leichten Druck mit den Ellenbogen auf die Knie ausüben." },
      { nummer: 3, beschreibung: "Oberkörper leicht nach vorne beugen." },
      { nummer: 4, beschreibung: "30 Sekunden halten." },
    ],
    muskelgruppen: ["Oberschenkel", "Hüfte"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
  // ── RÜCKEN ──────────────────────────────────────────────────────
  {
    name: "Rudern mit Theraband",
    beschreibung: "Kräftigung der mittleren Rückenmuskulatur und der Schulterblatt-Stabilisatoren.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Theraband vor dem Körper befestigen oder um einen Fuß wickeln." },
      { nummer: 2, beschreibung: "Aufrecht sitzen oder stehen, Band mit beiden Händen greifen." },
      { nummer: 3, beschreibung: "Ellenbogen nach hinten ziehen, Schulterblätter zusammenziehen." },
      { nummer: 4, beschreibung: "3 Sekunden halten, dann kontrolliert zurück." },
    ],
    muskelgruppen: ["Rücken", "Schulter"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 60,
  },
  {
    name: "Superman (Rumpfstrecker in Bauchlage)",
    beschreibung: "Kräftigung der gesamten hinteren Kette: Rückenstrecker, Gesäß, Oberschenkel-Rückseite.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Bauchlage, Arme vor dem Körper ausgestreckt." },
      { nummer: 2, beschreibung: "Gleichzeitig Arme und Beine anheben (wie Superman im Flug)." },
      { nummer: 3, beschreibung: "3 Sekunden halten, dann langsam ablassen." },
    ],
    muskelgruppen: ["Rücken", "LWS", "Gesäß"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 60,
  },
  {
    name: "Brustwirbelsäulen-Rotation (Seitenlage)",
    beschreibung: "Mobilisation der BWS-Rotation — wichtig bei Schulter- und LWS-Problemen.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Seitenlage, Knie 90 Grad angewinkelt, Hände vor dem Körper." },
      { nummer: 2, beschreibung: "Oberen Arm langsam nach oben und zur Gegenseite führen." },
      { nummer: 3, beschreibung: "Augen folgen dem Arm, Hüfte bleibt stabil." },
      { nummer: 4, beschreibung: "5 Sekunden halten, dann zurück." },
    ],
    muskelgruppen: ["Rücken", "LWS", "Schulter"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 45,
  },
  // ── WADE / UNTERSCHENKEL ────────────────────────────────────────
  {
    name: "Wadenstretch (stehend)",
    beschreibung: "Dehnung des M. gastrocnemius und M. soleus — wichtig bei Achillodynie.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Vor einer Wand stehen, Hände abstützen." },
      { nummer: 2, beschreibung: "Ein Bein nach hinten strecken, Ferse bleibt am Boden." },
      { nummer: 3, beschreibung: "Vorderes Knie beugen, bis Dehnung in der Wade spürbar (Gastrocnemius)." },
      { nummer: 4, beschreibung: "30 Sekunden halten, dann hinteres Knie leicht beugen für Soleus." },
    ],
    muskelgruppen: ["Wade", "Unterschenkel"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
  {
    name: "Zehenstand (Calf Raise)",
    beschreibung: "Kräftigung der Wadenmuskulatur — wichtig bei Achillessehnen- und Sprunggelenkproblemen.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Aufrecht stehen, Hände leicht an der Wand abstützen." },
      { nummer: 2, beschreibung: "Auf die Zehenspitzen heben, Körper gerade halten." },
      { nummer: 3, beschreibung: "3 Sekunden oben halten, dann langsam wieder absenken." },
    ],
    muskelgruppen: ["Wade", "Unterschenkel"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 60,
  },
  {
    name: "Einbeiniger Zehenstand",
    beschreibung: "Fortgeschrittenes Wadentraining und Gleichgewichtstraining nach Sprunggelenksverletzungen.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Auf einem Bein stehen, das andere Bein leicht angeheben." },
      { nummer: 2, beschreibung: "Auf die Zehenspitzen heben, 3 Sekunden halten." },
      { nummer: 3, beschreibung: "Kontrolliert wieder absenken." },
    ],
    muskelgruppen: ["Wade", "Unterschenkel"],
    schwierigkeitsgrad: "mittel",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 60,
  },
  // ── BRUST ───────────────────────────────────────────────────────
  {
    name: "Liegestütz (modifiziert, auf Knien)",
    beschreibung: "Brustmuskelkräftigung für Anfänger oder nach Schulter-OPs.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Auf Knien und Händen abstützen, Hände schulterbreit." },
      { nummer: 2, beschreibung: "Körper gerade halten, Bauch anspannen." },
      { nummer: 3, beschreibung: "Brust zum Boden absenken, Ellenbogen seitlich führen." },
      { nummer: 4, beschreibung: "Kontrolliert wieder hochdrücken." },
    ],
    muskelgruppen: ["Brust", "Schulter", "Trizeps"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 60,
  },
  {
    name: "Brustdehnung (an der Tür)",
    beschreibung: "Dehnung des M. pectoralis major — wichtig bei Schulterimingement und Rundrücken.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "In einen Türrahmen stellen, Arme auf Schulterhöhe anlegen." },
      { nummer: 2, beschreibung: "Einen Schritt nach vorne machen, bis Dehnung in der Brust spürbar." },
      { nummer: 3, beschreibung: "30 Sekunden halten." },
    ],
    muskelgruppen: ["Brust", "Schulter"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
  // ── GLEICHGEWICHT / PROPRIOZEPTION ──────────────────────────────
  {
    name: "Einbeinstand (Propriozeption)",
    beschreibung: "Grundlegendes Gleichgewichtstraining — wichtig nach fast allen Verletzungen.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Auf einem Bein stehen, das andere leicht angehoben." },
      { nummer: 2, beschreibung: "30 Sekunden halten, Blick auf einen fixen Punkt." },
      { nummer: 3, beschreibung: "Steigerung: Augen schließen oder auf weicher Unterlage stehen." },
    ],
    muskelgruppen: ["Knie", "Hüfte", "Wade", "Unterschenkel"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
  {
    name: "Einbeinstand auf Wackelbrett",
    beschreibung: "Fortgeschrittenes Propriozeptionstraining zur Gelenkstabilisation.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Auf einem Wackelbrett oder Kissen auf einem Bein stehen." },
      { nummer: 2, beschreibung: "30–60 Sekunden halten, Gleichgewicht halten." },
      { nummer: 3, beschreibung: "Steigerung: Ball fangen oder Knie-Beugungen dazu." },
    ],
    muskelgruppen: ["Knie", "Hüfte", "Wade", "Unterschenkel"],
    schwierigkeitsgrad: "fortgeschritten",
    standard_saetze: 3,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
  // ── MOBILITÄT / GELENKE ─────────────────────────────────────────
  {
    name: "Sprunggelenk-Kreisen",
    beschreibung: "Mobilisation des oberen und unteren Sprunggelenks nach Verletzungen.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Sitzen oder liegen, Bein leicht angehoben." },
      { nummer: 2, beschreibung: "Fuß langsam in großen Kreisen bewegen — beide Richtungen." },
      { nummer: 3, beschreibung: "10 Kreise pro Richtung, dann Seite wechseln." },
    ],
    muskelgruppen: ["Unterschenkel", "Wade"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 30,
  },
  {
    name: "Schulterkreisen",
    beschreibung: "Aktive Mobilisation des Schultergelenks.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Aufrecht stehen oder sitzen." },
      { nummer: 2, beschreibung: "Schultern langsam nach vorne, oben, hinten, unten kreisen." },
      { nummer: 3, beschreibung: "10 Wiederholungen vorwärts, dann rückwärts." },
    ],
    muskelgruppen: ["Schulter", "Nacken"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 30,
  },
  {
    name: "Kniescheiben-Mobilisation",
    beschreibung: "Manuelle Mobilisation der Patella — wichtig nach Knie-OPs.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Rückenlage, Bein gestreckt und entspannt." },
      { nummer: 2, beschreibung: "Kniescheibe mit Daumen und Zeigefinger greifen." },
      { nummer: 3, beschreibung: "Kniescheibe sanft in alle Richtungen schieben (oben, unten, seitlich)." },
      { nummer: 4, beschreibung: "Je 10 Wiederholungen, kein Schmerz." },
    ],
    muskelgruppen: ["Knie"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 30,
  },
  // ── ADDITIONAL EXERCISES ─────────────────────────────────────────
  {
    name: "Miniband Walk (seitlich)",
    beschreibung: "Kräftigung der Hüftabduktoren mit Miniband — ideal bei Knieinstabilität.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Miniband um die Oberschenkel oder Knöchel legen." },
      { nummer: 2, beschreibung: "Leicht in die Hocke gehen, Knie zeigen über die Zehen." },
      { nummer: 3, beschreibung: "Seitwärts schrittweise gehen, Band unter Spannung halten." },
      { nummer: 4, beschreibung: "10 Schritte pro Seite, zurück." },
    ],
    muskelgruppen: ["Hüfte", "Gesäß", "Knie"],
    schwierigkeitsgrad: "mittel",
    standard_saetze: 3,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 60,
  },
  {
    name: "Theraband-Schulterflexion",
    beschreibung: "Kräftigung der vorderen Schultermuskulatur (Deltoideus anterior) mit Theraband.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Theraband unter dem Fuß fixieren, mit der Hand greifen." },
      { nummer: 2, beschreibung: "Arm gestreckt nach vorne heben, bis Schulterebene." },
      { nummer: 3, beschreibung: "2 Sekunden oben halten, dann kontrolliert ablassen." },
    ],
    muskelgruppen: ["Schulter"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 60,
  },
  {
    name: "Theraband-Schulterabduktion",
    beschreibung: "Kräftigung des mittleren Deltamuskels — wichtig bei Schulter-Impingement.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Theraband unter dem Fuß fixieren, mit der Hand greifen." },
      { nummer: 2, beschreibung: "Arm seitlich bis Schulterebene heben (nicht darüber)." },
      { nummer: 3, beschreibung: "2 Sekunden halten, dann kontrolliert ablassen." },
    ],
    muskelgruppen: ["Schulter"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 3,
    standard_wiederholungen: 15,
    standard_pause_sekunden: 60,
  },
  {
    name: "Beckenkippung (pelvic tilt)",
    beschreibung: "Bewusstmachung der Becken-Neutralposition — Grundlage aller Rückenübungen.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Rückenlage, Knie gebeugt, Füße aufgestellt." },
      { nummer: 2, beschreibung: "Lende leicht in den Boden drücken (Flachrücken) — 5 Sekunden." },
      { nummer: 3, beschreibung: "Dann leicht Hohlkreuz machen — 5 Sekunden." },
      { nummer: 4, beschreibung: "Neutrale Position zwischen beiden Extremen finden und halten." },
    ],
    muskelgruppen: ["LWS", "Core"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 10,
    standard_pause_sekunden: 30,
  },
  {
    name: "Kreuzheben (Romanian Deadlift, Bodyweight)",
    beschreibung: "Hüftgelenk-dominante Bewegung zur Kräftigung der hinteren Kette.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Aufrecht stehen, Füße hüftbreit." },
      { nummer: 2, beschreibung: "Hüfte nach hinten schieben, Oberkörper neigt sich nach vorne." },
      { nummer: 3, beschreibung: "Rücken bleibt gerade (neutrale Wirbelsäule)." },
      { nummer: 4, beschreibung: "Bis ca. Kniehöhe neigen, dann Hüfte wieder nach vorne schieben." },
    ],
    muskelgruppen: ["Hüfte", "Gesäß", "Oberschenkel", "LWS"],
    schwierigkeitsgrad: "mittel",
    standard_saetze: 3,
    standard_wiederholungen: 12,
    standard_pause_sekunden: 60,
  },
  {
    name: "Rückenstrecker-Dehnung (Kindshaltung)",
    beschreibung: "Mobilisation und Entlastung der LWS — auch nach Bridging zur Entspannung.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Knieend auf dem Boden, Gesäß zu den Fersen sinken lassen." },
      { nummer: 2, beschreibung: "Arme nach vorne strecken, Stirn ablegen." },
      { nummer: 3, beschreibung: "30 Sekunden in dieser Position entspannen." },
    ],
    muskelgruppen: ["LWS", "Rücken", "Schulter"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
  {
    name: "Fahrrad (liegend)",
    beschreibung: "Kräftigung der schrägen Bauchmuskulatur in Rückenlage.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Rückenlage, Hände hinter dem Kopf." },
      { nummer: 2, beschreibung: "Beine in Fahrradbewegung im Wechsel zur Brust ziehen." },
      { nummer: 3, beschreibung: "Gleichzeitig Oberkörper zur gegenüberliegenden Seite rotieren." },
      { nummer: 4, beschreibung: "Lende bleibt am Boden." },
    ],
    muskelgruppen: ["Core", "Hüfte"],
    schwierigkeitsgrad: "mittel",
    standard_saetze: 3,
    standard_wiederholungen: 20,
    standard_pause_sekunden: 60,
  },
  {
    name: "Piriformis-Dehnung (Rückenlage)",
    beschreibung: "Dehnung des M. piriformis — bei Ischiasbeschwerden und Hüftschmerzen.",
    ausfuehrung: [
      { nummer: 1, beschreibung: "Rückenlage, Beine aufgestellt." },
      { nummer: 2, beschreibung: "Knöchel des betroffenen Beins auf das andere Knie legen (Vier-Position)." },
      { nummer: 3, beschreibung: "Unteres Bein zur Brust ziehen, bis Dehnung im Gesäß spürbar." },
      { nummer: 4, beschreibung: "30 Sekunden halten, Seite wechseln." },
    ],
    muskelgruppen: ["Hüfte", "Gesäß"],
    schwierigkeitsgrad: "anfaenger",
    standard_saetze: 2,
    standard_wiederholungen: 1,
    standard_pause_sekunden: 30,
  },
] as const

// ----------------------------------------------------------------
// POST /api/admin/exercises/seed
// ----------------------------------------------------------------
export async function POST() {
  const supabase = await createSupabaseServerClient()

  // ---- Authentication ----
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Nicht autorisiert. Bitte einloggen." },
      { status: 401 }
    )
  }

  // ---- Admin role check ----
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Benutzerprofil konnte nicht geladen werden." },
      { status: 500 }
    )
  }

  if (profile.role !== "admin") {
    return NextResponse.json(
      { error: "Nur Administratoren können die Übungsdatenbank befüllen." },
      { status: 403 }
    )
  }

  // ---- Use service client to bypass RLS for bulk seed ----
  const serviceClient = createSupabaseServiceClient()

  // ---- Check existing public exercises to skip duplicates ----
  const { data: existingExercises } = await serviceClient
    .from("exercises")
    .select("name")
    .eq("is_public", true)

  const existingNames = new Set((existingExercises ?? []).map((e) => e.name.toLowerCase()))

  // ---- Build insert payload — skip existing ones ----
  const toInsert = STANDARD_EXERCISES.filter(
    (ex) => !existingNames.has(ex.name.toLowerCase())
  ).map((ex) => ({
    ...ex,
    ausfuehrung: ex.ausfuehrung ? [...ex.ausfuehrung] : null,
    muskelgruppen: [...ex.muskelgruppen],
    is_public: true,
    created_by: user.id,
  }))

  const skipped = STANDARD_EXERCISES.length - toInsert.length

  if (toInsert.length === 0) {
    return NextResponse.json({
      inserted: 0,
      skipped,
      message: "Alle Standard-Übungen sind bereits vorhanden. Nichts wurde hinzugefügt.",
    })
  }

  // ---- Insert in batches of 25 to avoid payload limits ----
  const BATCH_SIZE = 25
  let totalInserted = 0

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE)
    const { error: insertError, data: insertedRows } = await serviceClient
      .from("exercises")
      .insert(batch)
      .select("id")

    if (insertError) {
      console.error("[POST /api/admin/exercises/seed] Insert error:", insertError)
      return NextResponse.json(
        {
          error: "Fehler beim Einfügen der Übungen.",
          details: insertError.message,
          inserted: totalInserted,
          skipped,
        },
        { status: 500 }
      )
    }

    totalInserted += insertedRows?.length ?? batch.length
  }

  return NextResponse.json({
    inserted: totalInserted,
    skipped,
    total: STANDARD_EXERCISES.length,
    message: `${totalInserted} Übungen erfolgreich hinzugefügt, ${skipped} bereits vorhanden.`,
  })
}
