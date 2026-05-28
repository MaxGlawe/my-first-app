UGC-Fotos für die durchlaufende Leiste auf der Masterclass-Verkaufsseite.

Format:   Querformat 4:3 (z. B. 1448 x 1086 px)
Typ:      JPG oder WEBP (JPG q88 ist gut; PNG-Renderings vorher umwandeln)
Anzahl:   5–8 Fotos wirken am besten (mit nur 1 Foto wiederholt sich die Leiste)
Inhalt:   echte/UGC-Lifestyle-Fotos (Karten in der Hand, Workbook auf dem
          Tisch, Bewegung im Alltag, Person mit Kopfhörer …) — keine Screenshots.

So einbauen:
1) Fotos in DIESEN Ordner legen, z. B. 02.jpg, 03.jpg, …
2) In src/components/shop/MasterclassSalesLayout.tsx das Array UGC_PHOTOS
   ergänzen (01.jpg ist schon drin):
     { src: `${UGC_BASE}/02.jpg`, alt: "kurze Bildbeschreibung" },

Solange das Array leer ist, zeigt die Leiste „Dein Foto"-Platzhalter.
