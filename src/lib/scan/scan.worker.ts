/**
 * PROJ-27 Etappe 5 — Bildaufbereitung für den Befund-Scan.
 *
 * Läuft in einem Web Worker, damit die Oberfläche währenddessen nicht
 * einfriert. Ein Handyfoto hat leicht zwölf Megapixel; eine perspektivische
 * Entzerrung darauf im Haupt-Thread würde das Gerät für ein bis zwei
 * Sekunden lahmlegen — genau in dem Moment, in dem der Patient denkt, die
 * App sei abgestürzt.
 *
 * WARUM KEIN OPENCV.JS:
 *
 * Das Briefing schlug eine OpenCV-basierte Kantenerkennung vor. Dagegen
 * spricht dreierlei:
 *
 *   1. Grösse. OpenCV.js sind rund acht Megabyte WebAssembly. Über
 *      Mobilfunk geladen, bevor jemand sein erstes Foto machen darf.
 *   2. Auslieferung. Unsere CSP erlaubt Skripte nur von 'self'; die
 *      Bibliothek müsste also mit ausgeliefert werden und liegt dann dauerhaft
 *      im Build.
 *   3. Nutzen. Automatische Kantenerkennung trifft bei einem weissen Blatt
 *      auf hellem Tisch oft daneben — und dann korrigiert der Nutzer die
 *      Ecken doch von Hand.
 *
 * Deshalb: Ecken von Hand, sinnvoll vorbelegt, und eine Entzerrung, die wir
 * selbst rechnen. Das ist ein paar Kilobyte gross, funktioniert offline und
 * hat keine Abhängigkeit, die in zwei Jahren nicht mehr gepflegt wird.
 */

export interface Ecke {
  x: number
  y: number
}

export interface WarpAuftrag {
  typ: "warp"
  bild: ImageBitmap
  /** Reihenfolge: oben-links, oben-rechts, unten-rechts, unten-links. */
  ecken: [Ecke, Ecke, Ecke, Ecke]
  zielBreite: number
  zielHoehe: number
  /** Kontrastanhebung und Weissabgleich — macht Kopien lesbarer. */
  aufhellen: boolean
}

export interface SchaerfeAuftrag {
  typ: "schaerfe"
  bild: ImageBitmap
}

/**
 * Projektive Transformation: Acht Unbekannte aus vier Punktpaaren.
 *
 * Wir rechnen die Abbildung vom ZIEL zum QUELLBILD (nicht umgekehrt). Das ist
 * der Trick, der die Löcher vermeidet: Jeder Zielpixel fragt, woher er kommt,
 * statt dass jeder Quellpixel sucht, wohin er geht.
 */
function homographie(
  quelle: [Ecke, Ecke, Ecke, Ecke],
  breite: number,
  hoehe: number
): number[] {
  const ziel: Ecke[] = [
    { x: 0, y: 0 },
    { x: breite, y: 0 },
    { x: breite, y: hoehe },
    { x: 0, y: hoehe },
  ]

  // Gleichungssystem A·h = b aufstellen (8×8).
  const A: number[][] = []
  const b: number[] = []
  for (let i = 0; i < 4; i++) {
    const { x: X, y: Y } = ziel[i]
    const { x, y } = quelle[i]
    A.push([X, Y, 1, 0, 0, 0, -x * X, -x * Y])
    b.push(x)
    A.push([0, 0, 0, X, Y, 1, -y * X, -y * Y])
    b.push(y)
  }

  // Gauss mit Spaltenpivotisierung. Acht Gleichungen — Aufwand vernachlässigbar.
  const n = 8
  for (let sp = 0; sp < n; sp++) {
    let best = sp
    for (let z = sp + 1; z < n; z++) {
      if (Math.abs(A[z][sp]) > Math.abs(A[best][sp])) best = z
    }
    ;[A[sp], A[best]] = [A[best], A[sp]]
    ;[b[sp], b[best]] = [b[best], b[sp]]

    const pivot = A[sp][sp]
    if (Math.abs(pivot) < 1e-10) continue

    for (let z = sp + 1; z < n; z++) {
      const f = A[z][sp] / pivot
      if (f === 0) continue
      for (let s = sp; s < n; s++) A[z][s] -= f * A[sp][s]
      b[z] -= f * b[sp]
    }
  }

  const h = new Array(n).fill(0)
  for (let z = n - 1; z >= 0; z--) {
    let summe = b[z]
    for (let s = z + 1; s < n; s++) summe -= A[z][s] * h[s]
    h[z] = Math.abs(A[z][z]) < 1e-10 ? 0 : summe / A[z][z]
  }
  return [...h, 1]
}

function entzerren(auftrag: WarpAuftrag): ImageData {
  const { bild, ecken, zielBreite: B, zielHoehe: H } = auftrag

  const quellCanvas = new OffscreenCanvas(bild.width, bild.height)
  const qctx = quellCanvas.getContext("2d")!
  qctx.drawImage(bild, 0, 0)
  const quelle = qctx.getImageData(0, 0, bild.width, bild.height)
  const qd = quelle.data

  const h = homographie(ecken, B, H)
  const ziel = new ImageData(B, H)
  const zd = ziel.data

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < B; x++) {
      const nenner = h[6] * x + h[7] * y + h[8]
      const sx = (h[0] * x + h[1] * y + h[2]) / nenner
      const sy = (h[3] * x + h[4] * y + h[5]) / nenner

      const zi = (y * B + x) * 4

      if (sx < 0 || sy < 0 || sx >= bild.width - 1 || sy >= bild.height - 1) {
        zd[zi] = zd[zi + 1] = zd[zi + 2] = 255
        zd[zi + 3] = 255
        continue
      }

      // Bilinear — ohne Interpolation sieht schräg fotografierter Text
      // ausgefranst aus und wird von keiner Texterkennung mehr gelesen.
      const x0 = Math.floor(sx)
      const y0 = Math.floor(sy)
      const fx = sx - x0
      const fy = sy - y0
      const i00 = (y0 * bild.width + x0) * 4
      const i10 = i00 + 4
      const i01 = i00 + bild.width * 4
      const i11 = i01 + 4

      for (let k = 0; k < 3; k++) {
        const oben = qd[i00 + k] * (1 - fx) + qd[i10 + k] * fx
        const unten = qd[i01 + k] * (1 - fx) + qd[i11 + k] * fx
        zd[zi + k] = oben * (1 - fy) + unten * fy
      }
      zd[zi + 3] = 255
    }
  }

  if (auftrag.aufhellen) papierAufhellen(zd)
  return ziel
}

/**
 * Hebt Kontrast an, ohne den Text wegzufressen.
 *
 * Bewusst KEINE harte Schwelle auf Schwarzweiss: Ein handschriftlicher
 * Zusatz des Arztes oder ein blasser Stempel verschwindet dabei zuverlässig.
 * Stattdessen wird der obere Helligkeitsbereich auf Weiss gezogen und der
 * Rest gespreizt — das Blatt wird sauber, die Schrift bleibt vollständig.
 */
function papierAufhellen(d: Uint8ClampedArray): void {
  const histogramm = new Uint32Array(256)
  for (let i = 0; i < d.length; i += 4) {
    histogramm[(d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0]++
  }

  const gesamt = d.length / 4
  // Das oberste Fünftel gilt als Papier.
  let summe = 0
  let weissPunkt = 255
  for (let v = 255; v >= 0; v--) {
    summe += histogramm[v]
    if (summe > gesamt * 0.2) {
      weissPunkt = v
      break
    }
  }
  // Die dunkelsten zwei Prozent gelten als Schrift.
  summe = 0
  let schwarzPunkt = 0
  for (let v = 0; v < 256; v++) {
    summe += histogramm[v]
    if (summe > gesamt * 0.02) {
      schwarzPunkt = v
      break
    }
  }

  const spanne = Math.max(1, weissPunkt - schwarzPunkt)
  const tabelle = new Uint8ClampedArray(256)
  for (let v = 0; v < 256; v++) {
    tabelle[v] = Math.max(0, Math.min(255, ((v - schwarzPunkt) / spanne) * 255))
  }

  for (let i = 0; i < d.length; i += 4) {
    d[i] = tabelle[d[i]]
    d[i + 1] = tabelle[d[i + 1]]
    d[i + 2] = tabelle[d[i + 2]]
  }
}

/**
 * Schärfemass über die Varianz des Laplace-Operators.
 *
 * Ein niedriger Wert heisst: verwackelt oder unscharf. Genau das soll der
 * Nutzer erfahren, BEVOR er den Befund abschickt — und nicht erst, wenn der
 * Behandler ihn drei Tage später nicht entziffern kann.
 */
function schaerfe(bild: ImageBitmap): number {
  const max = 800
  const skala = Math.min(1, max / Math.max(bild.width, bild.height))
  const b = Math.max(1, Math.round(bild.width * skala))
  const h = Math.max(1, Math.round(bild.height * skala))

  const canvas = new OffscreenCanvas(b, h)
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(bild, 0, 0, b, h)
  const d = ctx.getImageData(0, 0, b, h).data

  const grau = new Float32Array(b * h)
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    grau[p] = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114
  }

  let summe = 0
  let summeQuadrat = 0
  let n = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < b - 1; x++) {
      const p = y * b + x
      const l =
        -4 * grau[p] + grau[p - 1] + grau[p + 1] + grau[p - b] + grau[p + b]
      summe += l
      summeQuadrat += l * l
      n++
    }
  }
  if (n === 0) return 0
  const mittel = summe / n
  return summeQuadrat / n - mittel * mittel
}

self.onmessage = async (e: MessageEvent<WarpAuftrag | SchaerfeAuftrag>) => {
  const auftrag = e.data
  try {
    if (auftrag.typ === "schaerfe") {
      self.postMessage({ typ: "schaerfe", wert: schaerfe(auftrag.bild) })
      auftrag.bild.close()
      return
    }

    const ergebnis = entzerren(auftrag)
    const canvas = new OffscreenCanvas(ergebnis.width, ergebnis.height)
    canvas.getContext("2d")!.putImageData(ergebnis, 0, 0)
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.88 })
    auftrag.bild.close()
    self.postMessage({ typ: "warp", blob })
  } catch (err) {
    self.postMessage({ typ: "fehler", nachricht: String(err) })
  }
}

export {}
