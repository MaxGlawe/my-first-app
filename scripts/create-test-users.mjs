/**
 * Creates test accounts for each role in Praxis OS.
 * Run: node scripts/create-test-users.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://duacypqeyfymdqostguw.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1YWN5cHFleWZ5bWRxb3N0Z3V3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI4MjQyOCwiZXhwIjoyMDg2ODU4NDI4fQ.4zbmK80iKAxH96pIlSQxpTa_6naMiwPd98xua--SqAY";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TEST_PASSWORD = "Test1234!";

const testUsers = [
  {
    email: "hp@test.praxis.de",
    first_name: "Hans",
    last_name: "Heilpraktiker",
    role: "heilpraktiker",
  },
  {
    email: "physio@test.praxis.de",
    first_name: "Petra",
    last_name: "Physiotherapeut",
    role: "physiotherapeut",
  },
  {
    email: "praevention@test.praxis.de",
    first_name: "Paul",
    last_name: "Präventionstrainer",
    role: "praeventionstrainer",
  },
  {
    email: "trainer@test.praxis.de",
    first_name: "Tim",
    last_name: "PersonalTrainer",
    role: "personal_trainer",
  },
  {
    email: "tresen@test.praxis.de",
    first_name: "Tanja",
    last_name: "Praxismanagement",
    role: "praxismanagement",
  },
  {
    email: "patient@test.praxis.de",
    first_name: "Max",
    last_name: "Mustermann",
    role: "patient",
  },
];

async function main() {
  console.log("Creating test users...\n");

  for (const u of testUsers) {
    // 1. Create auth user (skip email confirmation)
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: u.email,
        password: TEST_PASSWORD,
        email_confirm: true,
        user_metadata: {
          first_name: u.first_name,
          last_name: u.last_name,
          role: u.role,
        },
      });

    if (authError) {
      if (authError.message.includes("already been registered")) {
        console.log(`⚠  ${u.email} — already exists, skipping auth creation`);
        // Still try to ensure profile exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existing = existingUsers?.users?.find(
          (eu) => eu.email === u.email
        );
        if (existing) {
          await ensureProfile(existing.id, u);
        }
        continue;
      }
      console.error(`✗  ${u.email} — auth error: ${authError.message}`);
      continue;
    }

    const userId = authData.user.id;

    // 2. Create user_profiles row
    await ensureProfile(userId, u);

    console.log(`✓  ${u.email} — created (${u.role})`);
  }

  console.log("\n--- Login-Daten ---");
  console.log(`Passwort für alle: ${TEST_PASSWORD}\n`);
  for (const u of testUsers) {
    console.log(`${u.role.padEnd(22)} → ${u.email}`);
  }
  console.log("");
}

async function ensureProfile(userId, u) {
  const { error: profileError } = await supabase.from("user_profiles").upsert(
    {
      id: userId,
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      role: u.role,
      status: "aktiv",
    },
    { onConflict: "id" }
  );

  if (profileError) {
    console.error(
      `  ⚠  Profile error for ${u.email}: ${profileError.message}`
    );
  }
}

main().catch(console.error);
