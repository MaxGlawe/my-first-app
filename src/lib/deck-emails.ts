/**
 * Kaufbestätigungs-Mail für accountlose Bewegungskarten-Käufe (Decks).
 *
 * Käufer von Bewegungskarten (produkt_typ='deck') brauchen keinen Praxis-OS-
 * Account. Nach dem Kauf bekommen sie eine Bestätigungs-Mail mit einem
 * dauerhaft gültigen Link zu ihren Karten (kein Login).
 *
 * Stil identisch zur Käufer-Willkommens-Mail (src/app/api/buyer-accounts):
 * emerald Header, weißes Card-Layout, Footer „Physiotherapie Glawe — Praxis OS".
 * Deutsch, du-Form, HWG-sauber (keine Heilversprechen, kein „schmerzfrei").
 */

import { escapeHtml } from "@/lib/html-escape"

export interface DeckPurchaseEmailDeck {
  /** Anzeigetitel des Decks. */
  titel: string
  /** Vollständige Karten-URL inkl. signiertem Token (?t=…). */
  url: string
}

export interface RenderDeckPurchaseEmailInput {
  /** Vorname des Käufers (oder ein freundlicher Fallback). */
  firstName: string
  /** Liste der gekauften Decks mit ihren Zugangs-Links. */
  decks: DeckPurchaseEmailDeck[]
}

/**
 * Rendert Betreff + HTML-Body der Kaufbestätigungs-Mail für ein oder mehrere
 * gekaufte Decks. Wird vom Stripe-Webhook via `sendEmail` aufgerufen.
 */
export function renderDeckPurchaseEmail({
  firstName,
  decks,
}: RenderDeckPurchaseEmailInput): { subject: string; html: string } {
  const mehrere = decks.length > 1
  const subject = mehrere
    ? "Deine Bewegungskarten sind da — los geht's"
    : "Deine Bewegungskarten sind da — los geht's"

  // Pro Deck: Titel + großer „Zu deinen Karten"-Button.
  const deckBlocks = decks
    .map(
      (deck) => `
        <div style="border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px 22px; margin: 0 0 16px;">
          <p style="font-size: 12px; color: #059669; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 6px;">
            Bewegungskarten
          </p>
          <p style="font-size: 17px; color: #0f172a; font-weight: 700; margin: 0 0 16px; line-height: 1.4;">
            ${escapeHtml(deck.titel)}
          </p>
          <a href="${escapeHtml(deck.url)}"
             style="display: inline-block; background-color: #059669; color: #ffffff; padding: 13px 30px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Zu deinen Karten &rarr;
          </a>
        </div>`
    )
    .join("")

  const html = `
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9;">
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px 16px;">
      <div style="background-color: #ecfdf5; border: 1px solid #e2e8f0; border-bottom: none; border-radius: 16px 16px 0 0; padding: 36px 32px;">
        <p style="color: #059669; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">
          Praxis OS · Bewegungskarten
        </p>
        <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0;">
          Danke für deinen Kauf
        </h1>
      </div>
      <div style="background-color: #ffffff; padding: 36px 32px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="font-size: 16px; color: #1e293b; margin: 0 0 16px; line-height: 1.6;">
          Hallo ${escapeHtml(firstName)},
        </p>
        <p style="font-size: 15px; color: #475569; margin: 0 0 24px; line-height: 1.7;">
          ${
            mehrere
              ? "deine Bewegungskarten sind freigeschaltet. Über die folgenden Links kommst du jederzeit zu deinen Karten:"
              : "deine Bewegungskarten sind freigeschaltet. Über den folgenden Link kommst du jederzeit zu deinen Karten:"
          }
        </p>

        ${deckBlocks}

        <div style="background-color: #f1f5f9; border-radius: 10px; padding: 16px 20px; margin: 8px 0 24px;">
          <p style="font-size: 14px; color: #475569; margin: 0; line-height: 1.7;">
            <strong style="color: #0f172a;">Kein Konto nötig.</strong> ${
              mehrere ? "Diese Links bleiben" : "Dieser Link bleibt"
            } für dich gespeichert und dauerhaft gültig — leg ${
    mehrere ? "sie" : "ihn"
  } dir am besten gleich als Lesezeichen an.
          </p>
        </div>

        <div style="border-left: 3px solid #f59e0b; background-color: #fffbeb; border-radius: 0 10px 10px 0; padding: 14px 18px; margin: 0 0 8px;">
          <p style="font-size: 13px; color: #92400e; margin: 0; line-height: 1.6;">
            <strong>Sicherheit zuerst:</strong> Bewege dich nur im geparkten Auto bei
            angezogener Handbremse, ruhig und im angenehmen Bereich. Die Sicherheitskarte
            findest du direkt in deinem Deck — bitte vor der ersten Karte lesen.
          </p>
        </div>
      </div>
      <div style="background-color: #f8fafc; border-radius: 0 0 16px 16px; padding: 20px 32px; text-align: center; border: 1px solid #e2e8f0; border-top: none;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          Physiotherapie Glawe — Praxis OS
        </p>
      </div>
    </div>
  </body>
</html>
  `

  return { subject, html }
}
