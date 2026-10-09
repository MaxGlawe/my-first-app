"use client"

import Script from "next/script"

/**
 * Meta Pixel — Basisladung und Ereignisse.
 *
 * Lädt den Pixel und feuert PageView. Rendert nichts, wenn
 * NEXT_PUBLIC_META_PIXEL_ID fehlt (lokal etwa).
 *
 * WO ER LÄUFT, steht nicht hier, sondern an jeder Seite einzeln. Das ist
 * Absicht: Ein Pixel in einem gemeinsamen Layout wäre irgendwann auch auf
 * Seiten, auf denen er nichts zu suchen hat. In Praxis OS betrifft das das
 * Sprechzimmer, das Therapeuten-OS und die Patienten-App — dort ist ein
 * identifizierter Mensch in einem Gesundheitskontext, und der geht Meta
 * nichts an. Die Liste der Seiten mit Pixel ist deshalb die Liste der
 * Dateien, die diese Komponente einbinden.
 *
 * Ursprünglich für den Schmerzcheck-Funnel gebaut (PROJ-23), seit dem
 * 09.10.2026 auch auf den Marketingseiten, auf denen die Konsultation
 * beworben wird.
 */
export function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  if (!pixelId) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  )
}

/** Fire the Pixel `Lead` event with a dedup eventID (matches the CAPI event). */
export function fireLeadPixel(eventId: string) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "Lead", {}, { eventID: eventId })
  }
}

/**
 * Klick auf „Konsultation buchen".
 *
 * Der Knopf führt auf den Buchungskalender unter physiotherapie-glawe.de —
 * eine fremde Seite, auf der unser Pixel nicht liegt. Ohne dieses Ereignis
 * endet die Spur hier, und Meta erfährt nie, dass die Anzeige jemanden bis an
 * den Kalender gebracht hat.
 *
 * `InitiateCheckout` und nicht `Schedule`: Gezählt wird der Klick, nicht die
 * Buchung. Ob der Termin zustande kam, weiss diese Seite nicht — das steht
 * allein im fremden Kalender. Ein Ereignis „Schedule" wäre also eine
 * Behauptung über etwas, das wir nicht sehen.
 */
export function fireKonsultationKlick(abschnitt: string) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "InitiateCheckout", {
      content_name: "videokonsultation",
      content_category: abschnitt,
    })
  }
}

/** Fire `InitiateCheckout` when a user clicks the Video-Analyse CTA in the report. */
export function fireInitiateCheckout(meta: Record<string, unknown> = {}) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", "InitiateCheckout", { content_name: "video_analyse", ...meta })
  }
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}
