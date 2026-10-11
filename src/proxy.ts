import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'
import { STAEDTE_ENTFERNT } from '@/lib/staedte'

/**
 * Entfernte Staedteseiten: 410 statt 404.
 *
 * Oesterreich und die Schweiz sind seit dem 10.10.2026 raus (siehe
 * `lib/staedte`). 410 „Gone" sagt Suchmaschinen, dass die Adresse absichtlich
 * und dauerhaft verschwunden ist — Google nimmt sie dann schneller aus dem
 * Index als bei einem 404, der auch ein voruebergehender Fehler sein koennte.
 *
 * Hier und nicht in der Seite selbst: Eine Next.js-Seite kann keinen eigenen
 * Statuscode setzen, `notFound()` liefert immer 404.
 */
function entfernteStadt(request: NextRequest): NextResponse | null {
  const m = /^\/online-physiotherapie\/([^/]+)\/?$/.exec(request.nextUrl.pathname)
  if (!m || !STAEDTE_ENTFERNT.has(decodeURIComponent(m[1]))) return null

  return new NextResponse(
    '<!doctype html><html lang="de"><head><meta charset="utf-8">' +
      '<meta name="robots" content="noindex">' +
      '<title>Seite nicht mehr verfuegbar</title></head><body>' +
      '<h1>Diese Seite gibt es nicht mehr</h1>' +
      '<p>Unser Angebot richtet sich an Patientinnen und Patienten in Deutschland. ' +
      'Zur <a href="/">Startseite</a>.</p></body></html>',
    { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

export async function proxy(request: NextRequest) {
  const weg = entfernteStadt(request)
  if (weg) return weg

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Alles ausser:
     * - _next/static, _next/image (Build-Ausgabe)
     * - favicon.ico
     * - Dateien aus `public/` anhand ihrer Endung
     *
     * Die Endungsliste ist keine Kosmetik. Steht eine Endung nicht drin,
     * laeuft die Datei durch `updateSession()` — und weil `/anzeigen/...`
     * keine oeffentliche Route ist, antwortet der Server mit 307 auf
     * /login. Genau so ging es am 11.10.2026 den Schriftdateien der
     * Anzeigen-Seiten: Die Seite lud, sah fast richtig aus und setzte den
     * Text in Georgia. Aufgefallen ist es nur im Vergleich mit der
     * Vorlage, an zwei Ueberschriften, die eine Zeile zu viel brauchten.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|otf|eot|mp4|webm|pdf)$).*)',
  ],
}
