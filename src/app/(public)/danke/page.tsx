import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Calendar, ArrowRight } from "lucide-react"

// Premium-Markenwelt (Masterclass-Format)
const PAPER = "#F8F5F0"
const INK = "#0f172a"
const BODY = "#334155"
const MUTED = "#64748b"
const GREEN = "#2C3E2D"
const LINE = "#e7e1d6"

export const metadata: Metadata = {
  title: "Vielen Dank | Praxis OS",
}

export default function DankePage() {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
      <div className="container mx-auto px-4 py-20 max-w-lg text-center">
        <div className="mb-6">
          <CheckCircle2 className="mx-auto h-16 w-16" style={{ color: GREEN }} />
        </div>

        <h1 className="text-2xl mb-3" style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}>
          Vielen Dank für deine Anfrage!
        </h1>

        <p className="leading-relaxed mb-8" style={{ color: BODY }}>
          Wir haben deine Angaben erhalten und melden uns innerhalb von 24 Stunden
          bei dir. Im nächsten Schritt vereinbaren wir einen Termin für
          deine persönliche Erstuntersuchung per Video.
        </p>

        {bookingUrl && (
          <div
            className="rounded-2xl border p-6 mb-8"
            style={{ backgroundColor: "rgba(201,183,156,0.12)", borderColor: LINE }}
          >
            <Calendar className="mx-auto h-10 w-10 mb-3" style={{ color: GREEN }} />
            <h2 className="text-lg mb-2" style={{ fontFamily: "var(--font-serif)", fontWeight: 600, color: INK }}>
              Termin buchen
            </h2>
            <p className="text-sm mb-4" style={{ color: MUTED }}>
              Du kannst bereits jetzt deinen ersten Termin buchen:
            </p>
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
              <Button className="rounded-xl text-white hover:opacity-90" style={{ backgroundColor: GREEN }}>
                Termin buchen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        )}

        <Link href="/">
          <Button
            variant="outline"
            className="rounded-xl hover:bg-black/[0.03]"
            style={{ borderColor: LINE, color: GREEN, backgroundColor: "transparent" }}
          >
            Zurück zur Startseite
          </Button>
        </Link>
      </div>
    </div>
  )
}
