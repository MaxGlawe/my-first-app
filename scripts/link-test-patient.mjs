/**
 * Links the test patient account (patient@test.praxis.de) with
 * an existing patient record in the OS, and seeds sample data.
 *
 * Run: node scripts/link-test-patient.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://duacypqeyfymdqostguw.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1YWN5cHFleWZ5bWRxb3N0Z3V3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI4MjQyOCwiZXhwIjoyMDg2ODU4NDI4fQ.4zbmK80iKAxH96pIlSQxpTa_6naMiwPd98xua--SqAY";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PATIENT_EMAIL = "patient@test.praxis.de";

async function main() {
  console.log("=== Test-Patient mit OS verknüpfen ===\n");

  // 1. Find the auth user
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const authUser = usersData?.users?.find((u) => u.email === PATIENT_EMAIL);
  if (!authUser) {
    console.error(`✗ Auth-User ${PATIENT_EMAIL} nicht gefunden. Bitte zuerst create-test-users.mjs ausführen.`);
    process.exit(1);
  }
  console.log(`✓ Auth-User gefunden: ${authUser.id} (${PATIENT_EMAIL})`);

  // 2. List all patients in the OS
  const { data: patients, error: pErr } = await supabase
    .from("patients")
    .select("id, vorname, nachname, user_id")
    .order("created_at", { ascending: false })
    .limit(20);

  if (pErr || !patients || patients.length === 0) {
    console.log("\n⚠ Keine Patienten in der DB gefunden. Lege Test-Patienten an...");

    // Create a test patient record
    const { data: newPatient, error: createErr } = await supabase
      .from("patients")
      .insert({
        vorname: "Max",
        nachname: "Mustermann",
        geburtsdatum: "1990-05-15",
        geschlecht: "männlich",
        email: PATIENT_EMAIL,
        telefon: "0171-1234567",
        strasse: "Musterstraße 1",
        plz: "10115",
        ort: "Berlin",
        user_id: authUser.id,
      })
      .select("id, vorname, nachname")
      .single();

    if (createErr) {
      console.error("✗ Patient konnte nicht angelegt werden:", createErr.message);
      process.exit(1);
    }

    console.log(`✓ Test-Patient angelegt: ${newPatient.vorname} ${newPatient.nachname} (${newPatient.id})`);
    console.log(`✓ Bereits mit Auth-Account verknüpft!`);

    await seedPainDiary(newPatient.id);
    return;
  }

  console.log("\n--- Vorhandene Patienten ---");
  for (const p of patients) {
    const linked = p.user_id ? `(verknüpft: ${p.user_id})` : "(nicht verknüpft)";
    console.log(`  ${p.vorname} ${p.nachname} — ${p.id} ${linked}`);
  }

  // Check if already linked
  const alreadyLinked = patients.find((p) => p.user_id === authUser.id);
  if (alreadyLinked) {
    console.log(`\n✓ Patient ${alreadyLinked.vorname} ${alreadyLinked.nachname} ist bereits verknüpft!`);
    await seedPainDiary(alreadyLinked.id);
    return;
  }

  // Link the first unlinked patient
  const unlinked = patients.find((p) => !p.user_id);
  const target = unlinked || patients[0];

  console.log(`\n→ Verknüpfe ${target.vorname} ${target.nachname} mit ${PATIENT_EMAIL}...`);

  const { error: updateErr } = await supabase
    .from("patients")
    .update({ user_id: authUser.id })
    .eq("id", target.id);

  if (updateErr) {
    console.error("✗ Verknüpfung fehlgeschlagen:", updateErr.message);
    process.exit(1);
  }

  console.log(`✓ Verknüpft! Patient ${target.vorname} ${target.nachname} → ${PATIENT_EMAIL}`);

  await seedPainDiary(target.id);
}

// ── Seed pain diary entries (last 14 days) ──────────────────────────────────

async function seedPainDiary(patientId) {
  console.log("\n--- Schmerztagebuch-Einträge anlegen ---");

  const entries = [];
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Simulate improving trend: pain decreasing, wellbeing increasing
    const basePain = Math.max(1, Math.round(7 - i * 0.3 + (Math.random() * 2 - 1)));
    const baseWellbeing = Math.min(10, Math.round(3 + i * 0.4 + (Math.random() * 2 - 1)));

    const notes = [
      null,
      "Rückenschmerzen nach dem Aufstehen",
      null,
      "Training hat gutgetan, danach weniger Schmerzen",
      null,
      null,
      "Heute etwas steif, aber insgesamt besser",
      null,
      "Guter Tag, konnte wieder länger spazieren",
      null,
      null,
      "Leichte Verspannungen im Nacken",
      null,
      "Fühle mich viel besser als letzte Woche!",
    ][i];

    entries.push({
      patient_id: patientId,
      entry_date: dateStr,
      pain_level: Math.max(0, Math.min(10, basePain)),
      wellbeing: Math.max(0, Math.min(10, baseWellbeing)),
      notes,
    });
  }

  // Upsert all entries
  const { error } = await supabase
    .from("pain_diary_entries")
    .upsert(entries, { onConflict: "patient_id,entry_date" });

  if (error) {
    console.error("✗ Einträge konnten nicht angelegt werden:", error.message);
    console.log("  (Hast du die Migration 20260219000021_pain_diary.sql schon ausgeführt?)");
    return;
  }

  console.log(`✓ ${entries.length} Schmerztagebuch-Einträge angelegt (letzte 14 Tage)`);
  console.log("  Trend: Schmerz ↓ verbessert, Wohlbefinden ↑ verbessert\n");

  console.log("=== Fertig! ===");
  console.log(`\nJetzt kannst du:`);
  console.log(`  1. Als Therapeut einloggen → Patient öffnen → "Befindlichkeit"-Tab`);
  console.log(`  2. Dem Patienten eine Hausaufgabe zuweisen`);
  console.log(`  3. Als Patient einloggen (${PATIENT_EMAIL} / Test1234!)`);
  console.log(`  4. Dashboard, Training, Check-in, Progress testen`);
}

main().catch(console.error);
