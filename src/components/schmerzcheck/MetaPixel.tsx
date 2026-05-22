"use client"

import Script from "next/script"

/**
 * PROJ-23: Meta Pixel base loader for the Schmerzcheck funnel.
 *
 * Loads the Pixel and fires PageView. The `Lead` event is fired from the form
 * with a shared eventID so it deduplicates against the server-side CAPI event.
 * Renders nothing when NEXT_PUBLIC_META_PIXEL_ID is unset (e.g. local dev).
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
