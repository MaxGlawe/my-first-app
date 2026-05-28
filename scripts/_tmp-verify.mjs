import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenv.config({ path: ".env.local" });
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const MAX = "455f151e-5da6-40f6-96a4-c2e0150784a7";
const CID = "b9f3a7c2-1d4e-4a8b-9c6f-2e5d8a0b3c71";

const { data: prod } = await sb.from("products").select("id, slug, produkt_typ, preis, preis_regulaer, status").eq("slug","chronischer-kreuzschmerz").maybeSingle();
console.log("PRODUKT:", JSON.stringify(prod));

const { data: pc } = await sb.from("product_contents").select("content_type, content_id").eq("product_id", prod?.id ?? "");
console.log("CONTENTS:", JSON.stringify(pc));

const { data: existing } = await sb.from("content_entitlements").select("id").eq("user_id",MAX).eq("content_type","masterclass").eq("content_id",CID).eq("source","purchase").maybeSingle();
if (!existing) {
  const { error } = await sb.from("content_entitlements").insert({ user_id: MAX, content_type:"masterclass", content_id: CID, source:"purchase", valid_from: new Date().toISOString(), valid_until: null });
  console.log("ENTITLEMENT:", error ? ("FEHLER: "+error.message) : "neu angelegt");
} else { console.log("ENTITLEMENT: existierte bereits"); }

const { data: check } = await sb.from("content_entitlements").select("source, valid_until").eq("user_id",MAX).eq("content_type","masterclass").eq("content_id",CID);
console.log("MAX-ZUGRIFF:", JSON.stringify(check));
