-- ============================================================
-- PROJ-20/21: Kurs-Hero-Bilder (Aufhübschen)
--
-- Setzt hero_bild der 4 Shop-Kurse auf die KI-generierten Cover.
-- Bilddateien liegen in public/images/kurse/. Vorher NULL → es
-- wurden Gradient-Platzhalter angezeigt. ProductCard und die
-- Kursseiten lesen hero_bild bereits aus.
--
-- Idempotent: UPDATE setzt jedes Mal denselben Wert.
-- ============================================================

UPDATE products SET hero_bild = '/images/kurse/hydrations-boost.png'
  WHERE slug = 'hydrations-boost';

UPDATE products SET hero_bild = '/images/kurse/ruecken-mobility.png'
  WHERE slug = 'ruecken-mobility';

UPDATE products SET hero_bild = '/images/kurse/schmerz-tagebuch-routine.png'
  WHERE slug = 'schmerz-tagebuch-routine';

UPDATE products SET hero_bild = '/images/kurse/faszien-tiefenarbeit.png'
  WHERE slug = 'faszien-tiefenarbeit';
