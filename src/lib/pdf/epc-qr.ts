import QRCode from "qrcode"

interface EpcQrData {
  bic: string
  name: string
  iban: string
  amount: number
  reference: string
}

/**
 * Generiert einen EPC QR-Code (GiroCode) als Data-URL.
 * Format: European Payments Council Standard (EPC069-12)
 * Wird von allen gängigen Banking-Apps erkannt.
 */
export async function generateEpcQrCode(data: EpcQrData): Promise<string> {
  // IBAN bereinigen (Leerzeichen entfernen)
  const cleanIban = data.iban.replace(/\s/g, "")
  const cleanBic = (data.bic || "").replace(/\s/g, "")

  // EPC QR-Code Payload
  // Spec: https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/quick-response-code-guidelines
  const payload = [
    "BCD",                              // Service Tag
    "002",                              // Version
    "1",                                // Encoding (1 = UTF-8)
    "SCT",                              // Identification Code (SEPA Credit Transfer)
    cleanBic,                           // BIC (optional bei DE)
    data.name.substring(0, 70),         // Name des Empfängers (max 70 Zeichen)
    cleanIban,                          // IBAN
    `EUR${data.amount.toFixed(2)}`,     // Betrag
    "",                                 // Purpose (leer)
    "",                                 // Structured Reference (leer)
    data.reference.substring(0, 140),   // Unstructured Reference (Verwendungszweck)
    "",                                 // Information (leer)
  ].join("\n")

  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 200,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  })

  return dataUrl
}
