import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Calendar, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Vielen Dank | Praxis OS",
}

export default function DankePage() {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL

  return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center">
      <div className="mb-6">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-3">
        Vielen Dank für Ihre Anfrage!
      </h1>

      <p className="text-slate-600 leading-relaxed mb-8">
        Wir haben Ihre Angaben erhalten und melden uns innerhalb von 24 Stunden
        bei Ihnen. Im nächsten Schritt vereinbaren wir einen Termin für
        Ihre persönliche Erstuntersuchung per Video.
      </p>

      {bookingUrl && (
        <div className="rounded-2xl border bg-emerald-50 p-6 mb-8">
          <Calendar className="mx-auto h-10 w-10 text-emerald-600 mb-3" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Termin buchen
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Sie können bereits jetzt Ihren ersten Termin buchen:
          </p>
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Termin buchen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      )}

      <Link href="/">
        <Button variant="outline">Zurück zur Startseite</Button>
      </Link>
    </div>
  )
}
