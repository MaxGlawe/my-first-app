-- Fix: Im Shop-Hero (Hero3DCarousel) lief für die Masterclass das Bonus-
-- Kartendeck-Cover (kartendeck/00-cover.png) statt des echten Masterclass-
-- Covers. Ursache: Die Anlage-Migration (20260527000001) nutzte
-- `ON CONFLICT (slug) DO NOTHING` — die Produktzeile existierte bereits mit
-- dem Kartendeck-Cover, sodass der korrekte hero_bild-Wert nie übernommen wurde.
--
-- Idempotent: setzt hero_bild nur, wenn er abweicht.

UPDATE products
SET hero_bild = '/images/masterclass/chronischer-kreuzschmerz/cover.jpg'
WHERE slug = 'chronischer-kreuzschmerz'
  AND hero_bild IS DISTINCT FROM '/images/masterclass/chronischer-kreuzschmerz/cover.jpg';
