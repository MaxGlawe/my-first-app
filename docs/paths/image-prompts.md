# KI-Bild-Prompts — Kurs-Hero-Bilder

Ein Hero-Bild pro Kurs (4 Stück). Werden im Kurs-Katalog (Karten-Kopf) und auf der
Kurs-Detailseite (Header) angezeigt. Solange kein Bild gesetzt ist, zeigt das
Frontend einen Farbverlauf-Platzhalter — nichts bricht.

## Stil-Guide (für alle 4 Bilder gleich halten — Kohärenz!)

> Premium, hell, luftig. KEINE dunklen oder klinisch-sterilen Bilder. Kein
> Stockfoto-Look, keine lächelnden Models mit Daumen hoch. Eher: ruhig,
> hochwertig, fast editorial — wie ein modernes Gesundheits-Magazin 2026.

- **Format:** Querformat, ~1600×900 px (16:9)
- **Licht:** weiches Tageslicht, viel Helligkeit, sanfte Schatten
- **Farbe:** je Kurs eine Leitfarbe (siehe unten), dezent — nicht knallig
- **Bildsprache:** abstrakt-anatomisch oder ruhige Detailaufnahme, kein Klischee
- **Keine Schrift im Bild**, keine Logos, keine Wasserzeichen
- **Tiefenschärfe:** weicher Hintergrund, klarer Fokuspunkt

## Die 4 Prompts

### 1 · Hydrations-Boost — Leitfarbe Cyan/Türkis
```
Editorial wellness photography, a single glass of water on a light wooden
surface catching soft morning sunlight, delicate water droplets and gentle
ripples, airy bright background in soft cyan and white tones, shallow depth
of field, premium minimalist 2026 health magazine aesthetic, no text, no logo
```
→ Datei: `public/kurse/hydrations-boost-hero.png`

### 2 · Rücken-Mobility — Leitfarbe Emerald/Grün
```
Editorial wellness photography, a person mid-gentle-stretch seen from behind
in soft focus, bright airy studio with emerald and sage green accents, natural
daylight, sense of calm controlled movement, premium minimalist 2026 health
magazine aesthetic, abstract and uncluttered, no text, no logo
```
→ Datei: `public/kurse/ruecken-mobility-hero.png`

### 3 · Schmerz-Tagebuch-Routine — Leitfarbe Rose
```
Editorial still life photography, an open blank notebook with a pen on a light
linen surface, soft rose and warm white tones, gentle morning light, calm and
reflective mood, premium minimalist 2026 health magazine aesthetic, shallow
depth of field, no text, no logo
```
→ Datei: `public/kurse/schmerz-tagebuch-routine-hero.png`

### 4 · Faszien-Tiefenarbeit — Leitfarbe Indigo/Violett
```
Abstract anatomical illustration of fascia connective tissue, a delicate
translucent web-like 3D network, soft indigo and violet tones on a light
background, scientific yet beautiful, premium minimalist 2026 aesthetic,
glowing soft light, no text, no logo
```
→ Datei: `public/kurse/faszien-tiefenarbeit-hero.png`

> Hinweis: Bei Faszien-Tiefenarbeit kannst du später auch echte anatomische
> Detailbilder ergänzen (Modul-Bilder) — das ist eine spätere Erweiterung.

## So aktivierst du die Bilder

1. Bilder mit deinem KI-Tool generieren (Stil-Guide beachten).
2. Als PNG in den Ordner `public/kurse/` legen — exakt die Dateinamen oben.
3. In **jeder** der 4 `docs/paths/*.md`-Dateien diese Zeile in den
   `>`-Frontmatter-Block am Dateianfang einfügen, z. B. für Hydrations-Boost:
   ```
   > **Hero-Bild:** /kurse/hydrations-boost-hero.png
   ```
4. Seed-Skript neu ausführen: `node scripts/seed-paths.mjs`
   → `learning_paths.hero_image` wird befüllt, die Bilder erscheinen automatisch
   im Katalog und auf den Detailseiten.
