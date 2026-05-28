import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  hasMasterclassAccess,
  MASTERCLASS_SHOP_HREF,
} from "@/lib/masterclass/access";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import KartendeckClient from "./kartendeck-client";

export const metadata: Metadata = {
  title: "Übungskartendeck · Chronischer Kreuzschmerz",
  description:
    "Das Bonus-Übungskartendeck zur Masterclass Chronischer Kreuzschmerz: alle Schlüsselübungen als Karten — zum Durchblättern unterwegs und zum Ausdrucken.",
  robots: { index: false, follow: false },
};

export default async function KartendeckPage() {
  // Zugriffsschutz: Bonus-Deck ohne Vorschau — nur für Käufer/Admins.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!(await hasMasterclassAccess(user?.id))) {
    redirect(MASTERCLASS_SHOP_HREF);
  }

  return <KartendeckClient />;
}
