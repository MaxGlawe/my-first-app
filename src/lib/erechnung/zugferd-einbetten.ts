/**
 * E-Rechnung: XML in das Rechnungs-PDF einbetten (ZUGFeRD / Factur-X)
 *
 * jsPDF kann weder Dateianhänge noch PDF/A-Metadaten schreiben. Das fertige
 * PDF wird deshalb hier mit pdf-lib nachbearbeitet:
 *
 *   1. factur-x.xml als eingebettete Datei mit AFRelationship /Data
 *   2. XMP-Metadaten mit dem Factur-X-Namensraum, damit Empfängersysteme das
 *      Dokument überhaupt als E-Rechnung erkennen
 *   3. PDF/A-3B-Kennzeichnung (pdfaid:part=3, conformance=B)
 *
 * Ohne Schritt 2 ist das XML zwar vorhanden, wird von Buchhaltungssystemen
 * aber nicht ausgewertet — sie suchen anhand der XMP-Angaben nach dem Anhang.
 */

import { PDFDocument, PDFName, PDFString, PDFArray, PDFDict, AFRelationship } from "pdf-lib"

const XMP_NS = "urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#"

/**
 * XMP-Metadatenblock. Enthält neben der PDF/A-Kennzeichnung die
 * Factur-X-Beschreibung: Dateiname, Profil und Dokumenttyp.
 */
function buildXmp(args: {
  titel: string
  autor: string
  xmlDateiname: string
  profil: string
  erstellt: Date
}): string {
  const iso = args.erstellt.toISOString().replace(/\.\d{3}Z$/, "Z")
  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>3</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${args.titel}</rdf:li></rdf:Alt></dc:title>
      <dc:creator><rdf:Seq><rdf:li>${args.autor}</rdf:li></rdf:Seq></dc:creator>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/">
      <xmp:CreateDate>${iso}</xmp:CreateDate>
      <xmp:CreatorTool>Praxis OS</xmp:CreatorTool>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:pdfaExtension="http://www.aiim.org/pdfa/ns/extension/"
      xmlns:pdfaSchema="http://www.aiim.org/pdfa/ns/schema#"
      xmlns:pdfaProperty="http://www.aiim.org/pdfa/ns/property#">
      <pdfaExtension:schemas>
        <rdf:Bag>
          <rdf:li rdf:parseType="Resource">
            <pdfaSchema:schema>Factur-X PDFA Extension Schema</pdfaSchema:schema>
            <pdfaSchema:namespaceURI>${XMP_NS}</pdfaSchema:namespaceURI>
            <pdfaSchema:prefix>fx</pdfaSchema:prefix>
            <pdfaSchema:property>
              <rdf:Seq>
                <rdf:li rdf:parseType="Resource">
                  <pdfaProperty:name>DocumentFileName</pdfaProperty:name>
                  <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                  <pdfaProperty:category>external</pdfaProperty:category>
                  <pdfaProperty:description>Dateiname des Rechnungs-XML</pdfaProperty:description>
                </rdf:li>
                <rdf:li rdf:parseType="Resource">
                  <pdfaProperty:name>DocumentType</pdfaProperty:name>
                  <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                  <pdfaProperty:category>external</pdfaProperty:category>
                  <pdfaProperty:description>INVOICE</pdfaProperty:description>
                </rdf:li>
                <rdf:li rdf:parseType="Resource">
                  <pdfaProperty:name>Version</pdfaProperty:name>
                  <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                  <pdfaProperty:category>external</pdfaProperty:category>
                  <pdfaProperty:description>Version des Factur-X-Profils</pdfaProperty:description>
                </rdf:li>
                <rdf:li rdf:parseType="Resource">
                  <pdfaProperty:name>ConformanceLevel</pdfaProperty:name>
                  <pdfaProperty:valueType>Text</pdfaProperty:valueType>
                  <pdfaProperty:category>external</pdfaProperty:category>
                  <pdfaProperty:description>Konformitaetsgrad</pdfaProperty:description>
                </rdf:li>
              </rdf:Seq>
            </pdfaSchema:property>
          </rdf:li>
        </rdf:Bag>
      </pdfaExtension:schemas>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:fx="${XMP_NS}">
      <fx:DocumentType>INVOICE</fx:DocumentType>
      <fx:DocumentFileName>${args.xmlDateiname}</fx:DocumentFileName>
      <fx:Version>1.0</fx:Version>
      <fx:ConformanceLevel>${args.profil}</fx:ConformanceLevel>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`
}

export interface EinbettenOptions {
  /** Rechnungsnummer — landet in Titel und Beschreibung */
  rechnungsnummer: string
  aussteller: string
  /** Profilname laut Factur-X; EN 16931 ist der Standardfall */
  profil?: "EN 16931" | "BASIC" | "EXTENDED"
}

/**
 * Hängt das Factur-X-XML an ein bestehendes PDF und kennzeichnet es als
 * E-Rechnung. Gibt das neue PDF zurück; das Original bleibt unverändert.
 */
export async function pdfMitERechnungAnreichern(
  pdfBytes: Buffer | Uint8Array,
  xml: string,
  options: EinbettenOptions
): Promise<Buffer> {
  const profil = options.profil ?? "EN 16931"
  const xmlDateiname = "factur-x.xml"

  const doc = await PDFDocument.load(
    pdfBytes instanceof Buffer ? new Uint8Array(pdfBytes) : pdfBytes
  )

  doc.setTitle(`Rechnung ${options.rechnungsnummer}`)
  doc.setAuthor(options.aussteller)
  doc.setProducer("Praxis OS")
  doc.setCreator("Praxis OS")

  // 1. XML als eingebettete Datei. AFRelationship /Data ist für Factur-X
  //    vorgeschrieben — mit /Alternative erkennen viele Systeme es nicht.
  await doc.attach(new TextEncoder().encode(xml), xmlDateiname, {
    mimeType: "application/xml",
    description: "Factur-X/ZUGFeRD Rechnungsdaten nach EN 16931",
    creationDate: new Date(),
    modificationDate: new Date(),
    afRelationship: AFRelationship.Data,
  })

  // 2. XMP-Metadaten setzen. pdf-lib bietet dafür keine API, deshalb wird der
  //    Metadatenstrom direkt im Katalog registriert.
  const xmp = buildXmp({
    titel: `Rechnung ${options.rechnungsnummer}`,
    autor: options.aussteller,
    xmlDateiname,
    profil,
    erstellt: new Date(),
  })

  const metadataStream = doc.context.stream(xmp, {
    Type: PDFName.of("Metadata"),
    Subtype: PDFName.of("XML"),
  })
  const metadataRef = doc.context.register(metadataStream)
  doc.catalog.set(PDFName.of("Metadata"), metadataRef)

  // 3. PDF/A verlangt zwingend AF im Katalog (Zeiger auf die Anhänge).
  //    pdf-lib legt Names/EmbeddedFiles an, den AF-Eintrag aber nicht.
  const namesDict = doc.catalog.lookup(PDFName.of("Names")) as PDFDict | undefined
  const embedded = namesDict?.lookup(PDFName.of("EmbeddedFiles")) as PDFDict | undefined
  const namesArray = embedded?.lookup(PDFName.of("Names")) as PDFArray | undefined

  if (namesArray) {
    const af = doc.context.obj([])
    // Aufbau: [name1, ref1, name2, ref2, ...] — die Referenzen stehen auf
    // ungeraden Positionen.
    for (let i = 1; i < namesArray.size(); i += 2) {
      af.push(namesArray.get(i))
    }
    doc.catalog.set(PDFName.of("AF"), doc.context.register(af))
  }

  // 4. Sprache setzen — von PDF/A gefordert.
  doc.catalog.set(PDFName.of("Lang"), PDFString.of("de-DE"))

  const bytes = await doc.save({ useObjectStreams: false })
  return Buffer.from(bytes)
}
