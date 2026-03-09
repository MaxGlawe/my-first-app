export type Land = "DE" | "AT" | "CH"

export interface Stadt {
  slug: string
  name: string
  region: string
  land: Land
}

export interface Region {
  slug: string
  name: string
  land: Land
  cities: string[]
}

// ─── DEUTSCHLAND ────────────────────────────────────────────

const DE_STAEDTE: Stadt[] = [
  // Tier 1 — Top 20
  { slug: "berlin", name: "Berlin", region: "Berlin", land: "DE" },
  { slug: "hamburg", name: "Hamburg", region: "Hamburg", land: "DE" },
  { slug: "muenchen", name: "München", region: "Bayern", land: "DE" },
  { slug: "koeln", name: "Köln", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "frankfurt-am-main", name: "Frankfurt am Main", region: "Hessen", land: "DE" },
  { slug: "stuttgart", name: "Stuttgart", region: "Baden-Württemberg", land: "DE" },
  { slug: "duesseldorf", name: "Düsseldorf", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "leipzig", name: "Leipzig", region: "Sachsen", land: "DE" },
  { slug: "dortmund", name: "Dortmund", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "essen", name: "Essen", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "bremen", name: "Bremen", region: "Bremen", land: "DE" },
  { slug: "dresden", name: "Dresden", region: "Sachsen", land: "DE" },
  { slug: "hannover", name: "Hannover", region: "Niedersachsen", land: "DE" },
  { slug: "nuernberg", name: "Nürnberg", region: "Bayern", land: "DE" },
  { slug: "duisburg", name: "Duisburg", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "bochum", name: "Bochum", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "wuppertal", name: "Wuppertal", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "bielefeld", name: "Bielefeld", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "bonn", name: "Bonn", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "muenster", name: "Münster", region: "Nordrhein-Westfalen", land: "DE" },
  // Tier 2
  { slug: "augsburg", name: "Augsburg", region: "Bayern", land: "DE" },
  { slug: "karlsruhe", name: "Karlsruhe", region: "Baden-Württemberg", land: "DE" },
  { slug: "mannheim", name: "Mannheim", region: "Baden-Württemberg", land: "DE" },
  { slug: "wiesbaden", name: "Wiesbaden", region: "Hessen", land: "DE" },
  { slug: "gelsenkirchen", name: "Gelsenkirchen", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "moenchengladbach", name: "Mönchengladbach", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "braunschweig", name: "Braunschweig", region: "Niedersachsen", land: "DE" },
  { slug: "aachen", name: "Aachen", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "kiel", name: "Kiel", region: "Schleswig-Holstein", land: "DE" },
  { slug: "chemnitz", name: "Chemnitz", region: "Sachsen", land: "DE" },
  { slug: "halle", name: "Halle (Saale)", region: "Sachsen-Anhalt", land: "DE" },
  { slug: "magdeburg", name: "Magdeburg", region: "Sachsen-Anhalt", land: "DE" },
  { slug: "freiburg", name: "Freiburg im Breisgau", region: "Baden-Württemberg", land: "DE" },
  { slug: "krefeld", name: "Krefeld", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "mainz", name: "Mainz", region: "Rheinland-Pfalz", land: "DE" },
  { slug: "luebeck", name: "Lübeck", region: "Schleswig-Holstein", land: "DE" },
  { slug: "erfurt", name: "Erfurt", region: "Thüringen", land: "DE" },
  { slug: "oberhausen", name: "Oberhausen", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "rostock", name: "Rostock", region: "Mecklenburg-Vorpommern", land: "DE" },
  { slug: "kassel", name: "Kassel", region: "Hessen", land: "DE" },
  { slug: "hagen", name: "Hagen", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "potsdam", name: "Potsdam", region: "Brandenburg", land: "DE" },
  { slug: "saarbruecken", name: "Saarbrücken", region: "Saarland", land: "DE" },
  { slug: "hamm", name: "Hamm", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "ludwigshafen", name: "Ludwigshafen am Rhein", region: "Rheinland-Pfalz", land: "DE" },
  { slug: "oldenburg", name: "Oldenburg", region: "Niedersachsen", land: "DE" },
  { slug: "muelheim-an-der-ruhr", name: "Mülheim an der Ruhr", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "osnabrueck", name: "Osnabrück", region: "Niedersachsen", land: "DE" },
  { slug: "leverkusen", name: "Leverkusen", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "heidelberg", name: "Heidelberg", region: "Baden-Württemberg", land: "DE" },
  { slug: "solingen", name: "Solingen", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "darmstadt", name: "Darmstadt", region: "Hessen", land: "DE" },
  { slug: "paderborn", name: "Paderborn", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "regensburg", name: "Regensburg", region: "Bayern", land: "DE" },
  { slug: "ingolstadt", name: "Ingolstadt", region: "Bayern", land: "DE" },
  { slug: "wuerzburg", name: "Würzburg", region: "Bayern", land: "DE" },
  { slug: "wolfsburg", name: "Wolfsburg", region: "Niedersachsen", land: "DE" },
  { slug: "goettingen", name: "Göttingen", region: "Niedersachsen", land: "DE" },
  { slug: "offenbach", name: "Offenbach am Main", region: "Hessen", land: "DE" },
  { slug: "ulm", name: "Ulm", region: "Baden-Württemberg", land: "DE" },
  { slug: "heilbronn", name: "Heilbronn", region: "Baden-Württemberg", land: "DE" },
  { slug: "pforzheim", name: "Pforzheim", region: "Baden-Württemberg", land: "DE" },
  { slug: "reutlingen", name: "Reutlingen", region: "Baden-Württemberg", land: "DE" },
  { slug: "bottrop", name: "Bottrop", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "trier", name: "Trier", region: "Rheinland-Pfalz", land: "DE" },
  { slug: "bremerhaven", name: "Bremerhaven", region: "Bremen", land: "DE" },
  { slug: "recklinghausen", name: "Recklinghausen", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "remscheid", name: "Remscheid", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "bergisch-gladbach", name: "Bergisch Gladbach", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "jena", name: "Jena", region: "Thüringen", land: "DE" },
  { slug: "erlangen", name: "Erlangen", region: "Bayern", land: "DE" },
  { slug: "moers", name: "Moers", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "siegen", name: "Siegen", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "hildesheim", name: "Hildesheim", region: "Niedersachsen", land: "DE" },
  { slug: "salzgitter", name: "Salzgitter", region: "Niedersachsen", land: "DE" },
  { slug: "cottbus", name: "Cottbus", region: "Brandenburg", land: "DE" },
  { slug: "kaiserslautern", name: "Kaiserslautern", region: "Rheinland-Pfalz", land: "DE" },
  { slug: "guetersloh", name: "Gütersloh", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "schwerin", name: "Schwerin", region: "Mecklenburg-Vorpommern", land: "DE" },
  { slug: "witten", name: "Witten", region: "Nordrhein-Westfalen", land: "DE" },
  { slug: "hanau", name: "Hanau", region: "Hessen", land: "DE" },
  // Brandenburg — erweitert
  { slug: "frankfurt-oder", name: "Frankfurt (Oder)", region: "Brandenburg", land: "DE" },
  { slug: "brandenburg-an-der-havel", name: "Brandenburg an der Havel", region: "Brandenburg", land: "DE" },
  { slug: "eberswalde", name: "Eberswalde", region: "Brandenburg", land: "DE" },
  { slug: "bernau-bei-berlin", name: "Bernau bei Berlin", region: "Brandenburg", land: "DE" },
  { slug: "oranienburg", name: "Oranienburg", region: "Brandenburg", land: "DE" },
  { slug: "falkensee", name: "Falkensee", region: "Brandenburg", land: "DE" },
  { slug: "koenigs-wusterhausen", name: "Königs Wusterhausen", region: "Brandenburg", land: "DE" },
  { slug: "schwedt", name: "Schwedt/Oder", region: "Brandenburg", land: "DE" },
  { slug: "fuerstenwalde", name: "Fürstenwalde/Spree", region: "Brandenburg", land: "DE" },
  { slug: "neuruppin", name: "Neuruppin", region: "Brandenburg", land: "DE" },
  { slug: "luebben", name: "Lübben (Spreewald)", region: "Brandenburg", land: "DE" },
  { slug: "senftenberg", name: "Senftenberg", region: "Brandenburg", land: "DE" },
]

// ─── ÖSTERREICH ─────────────────────────────────────────────

const AT_STAEDTE: Stadt[] = [
  // Wien
  { slug: "wien", name: "Wien", region: "Wien", land: "AT" },
  // Niederösterreich
  { slug: "st-poelten", name: "St. Pölten", region: "Niederösterreich", land: "AT" },
  { slug: "wiener-neustadt", name: "Wiener Neustadt", region: "Niederösterreich", land: "AT" },
  { slug: "baden-bei-wien", name: "Baden bei Wien", region: "Niederösterreich", land: "AT" },
  { slug: "krems-an-der-donau", name: "Krems an der Donau", region: "Niederösterreich", land: "AT" },
  { slug: "amstetten", name: "Amstetten", region: "Niederösterreich", land: "AT" },
  // Oberösterreich
  { slug: "linz", name: "Linz", region: "Oberösterreich", land: "AT" },
  { slug: "wels", name: "Wels", region: "Oberösterreich", land: "AT" },
  { slug: "steyr", name: "Steyr", region: "Oberösterreich", land: "AT" },
  { slug: "leonding", name: "Leonding", region: "Oberösterreich", land: "AT" },
  // Steiermark
  { slug: "graz", name: "Graz", region: "Steiermark", land: "AT" },
  { slug: "leoben", name: "Leoben", region: "Steiermark", land: "AT" },
  { slug: "kapfenberg", name: "Kapfenberg", region: "Steiermark", land: "AT" },
  // Kärnten
  { slug: "klagenfurt", name: "Klagenfurt", region: "Kärnten", land: "AT" },
  { slug: "villach", name: "Villach", region: "Kärnten", land: "AT" },
  // Salzburg
  { slug: "salzburg", name: "Salzburg", region: "Salzburg", land: "AT" },
  { slug: "hallein", name: "Hallein", region: "Salzburg", land: "AT" },
  // Tirol
  { slug: "innsbruck", name: "Innsbruck", region: "Tirol", land: "AT" },
  { slug: "hall-in-tirol", name: "Hall in Tirol", region: "Tirol", land: "AT" },
  { slug: "woergl", name: "Wörgl", region: "Tirol", land: "AT" },
  { slug: "kufstein", name: "Kufstein", region: "Tirol", land: "AT" },
  // Vorarlberg
  { slug: "dornbirn", name: "Dornbirn", region: "Vorarlberg", land: "AT" },
  { slug: "feldkirch", name: "Feldkirch", region: "Vorarlberg", land: "AT" },
  { slug: "bregenz", name: "Bregenz", region: "Vorarlberg", land: "AT" },
  { slug: "lustenau", name: "Lustenau", region: "Vorarlberg", land: "AT" },
  // Burgenland
  { slug: "eisenstadt", name: "Eisenstadt", region: "Burgenland", land: "AT" },
]

// ─── SCHWEIZ ────────────────────────────────────────────────

const CH_STAEDTE: Stadt[] = [
  // Zürich
  { slug: "zuerich", name: "Zürich", region: "Zürich", land: "CH" },
  { slug: "winterthur", name: "Winterthur", region: "Zürich", land: "CH" },
  { slug: "uster", name: "Uster", region: "Zürich", land: "CH" },
  { slug: "dietikon", name: "Dietikon", region: "Zürich", land: "CH" },
  // Bern
  { slug: "bern", name: "Bern", region: "Bern", land: "CH" },
  { slug: "biel-bienne", name: "Biel/Bienne", region: "Bern", land: "CH" },
  { slug: "thun", name: "Thun", region: "Bern", land: "CH" },
  { slug: "burgdorf", name: "Burgdorf", region: "Bern", land: "CH" },
  // Basel
  { slug: "basel", name: "Basel", region: "Basel-Stadt", land: "CH" },
  { slug: "riehen", name: "Riehen", region: "Basel-Stadt", land: "CH" },
  { slug: "liestal", name: "Liestal", region: "Basel-Landschaft", land: "CH" },
  // Luzern
  { slug: "luzern", name: "Luzern", region: "Luzern", land: "CH" },
  { slug: "emmen", name: "Emmen", region: "Luzern", land: "CH" },
  { slug: "kriens", name: "Kriens", region: "Luzern", land: "CH" },
  // St. Gallen
  { slug: "st-gallen", name: "St. Gallen", region: "St. Gallen", land: "CH" },
  { slug: "rapperswil-jona", name: "Rapperswil-Jona", region: "St. Gallen", land: "CH" },
  // Aargau
  { slug: "aarau", name: "Aarau", region: "Aargau", land: "CH" },
  { slug: "baden-ch", name: "Baden", region: "Aargau", land: "CH" },
  { slug: "wettingen", name: "Wettingen", region: "Aargau", land: "CH" },
  // Genf
  { slug: "genf", name: "Genf", region: "Genf", land: "CH" },
  // Waadt
  { slug: "lausanne", name: "Lausanne", region: "Waadt", land: "CH" },
  { slug: "yverdon-les-bains", name: "Yverdon-les-Bains", region: "Waadt", land: "CH" },
  // Tessin
  { slug: "lugano", name: "Lugano", region: "Tessin", land: "CH" },
  { slug: "bellinzona", name: "Bellinzona", region: "Tessin", land: "CH" },
  // Solothurn
  { slug: "solothurn", name: "Solothurn", region: "Solothurn", land: "CH" },
  { slug: "olten", name: "Olten", region: "Solothurn", land: "CH" },
  // Zug
  { slug: "zug", name: "Zug", region: "Zug", land: "CH" },
  // Fribourg
  { slug: "fribourg", name: "Fribourg", region: "Freiburg", land: "CH" },
  // Schaffhausen
  { slug: "schaffhausen", name: "Schaffhausen", region: "Schaffhausen", land: "CH" },
  // Chur
  { slug: "chur", name: "Chur", region: "Graubünden", land: "CH" },
  { slug: "davos", name: "Davos", region: "Graubünden", land: "CH" },
]

// ─── COMBINED ───────────────────────────────────────────────

export const STAEDTE: Stadt[] = [...DE_STAEDTE, ...AT_STAEDTE, ...CH_STAEDTE]

// ─── REGIONEN ───────────────────────────────────────────────

export const REGIONEN: Region[] = [
  // Deutschland — Bundesländer
  { slug: "baden-wuerttemberg", name: "Baden-Württemberg", land: "DE", cities: ["stuttgart", "karlsruhe", "mannheim", "freiburg", "heidelberg", "ulm", "heilbronn", "pforzheim", "reutlingen"] },
  { slug: "bayern", name: "Bayern", land: "DE", cities: ["muenchen", "nuernberg", "augsburg", "regensburg", "ingolstadt", "wuerzburg", "erlangen"] },
  { slug: "berlin", name: "Berlin", land: "DE", cities: ["berlin"] },
  { slug: "brandenburg", name: "Brandenburg", land: "DE", cities: ["potsdam", "cottbus", "frankfurt-oder", "brandenburg-an-der-havel", "eberswalde", "bernau-bei-berlin", "oranienburg", "falkensee", "koenigs-wusterhausen", "schwedt", "fuerstenwalde", "neuruppin", "luebben", "senftenberg"] },
  { slug: "bremen", name: "Bremen", land: "DE", cities: ["bremen", "bremerhaven"] },
  { slug: "hamburg", name: "Hamburg", land: "DE", cities: ["hamburg"] },
  { slug: "hessen", name: "Hessen", land: "DE", cities: ["frankfurt-am-main", "wiesbaden", "kassel", "darmstadt", "offenbach", "hanau"] },
  { slug: "mecklenburg-vorpommern", name: "Mecklenburg-Vorpommern", land: "DE", cities: ["rostock", "schwerin"] },
  { slug: "niedersachsen", name: "Niedersachsen", land: "DE", cities: ["hannover", "braunschweig", "oldenburg", "osnabrueck", "wolfsburg", "goettingen", "hildesheim", "salzgitter"] },
  { slug: "nordrhein-westfalen", name: "Nordrhein-Westfalen", land: "DE", cities: ["koeln", "duesseldorf", "dortmund", "essen", "duisburg", "bochum", "wuppertal", "bielefeld", "bonn", "muenster", "gelsenkirchen", "moenchengladbach", "aachen", "krefeld", "oberhausen", "hagen", "hamm", "muelheim-an-der-ruhr", "leverkusen", "solingen", "paderborn", "bottrop", "recklinghausen", "remscheid", "bergisch-gladbach", "moers", "siegen", "guetersloh", "witten"] },
  { slug: "rheinland-pfalz", name: "Rheinland-Pfalz", land: "DE", cities: ["mainz", "ludwigshafen", "trier", "kaiserslautern"] },
  { slug: "saarland", name: "Saarland", land: "DE", cities: ["saarbruecken"] },
  { slug: "sachsen", name: "Sachsen", land: "DE", cities: ["leipzig", "dresden", "chemnitz"] },
  { slug: "sachsen-anhalt", name: "Sachsen-Anhalt", land: "DE", cities: ["halle", "magdeburg"] },
  { slug: "schleswig-holstein", name: "Schleswig-Holstein", land: "DE", cities: ["kiel", "luebeck"] },
  { slug: "thueringen", name: "Thüringen", land: "DE", cities: ["erfurt", "jena"] },

  // Österreich — Bundesländer
  { slug: "wien", name: "Wien", land: "AT", cities: ["wien"] },
  { slug: "niederoesterreich", name: "Niederösterreich", land: "AT", cities: ["st-poelten", "wiener-neustadt", "baden-bei-wien", "krems-an-der-donau", "amstetten"] },
  { slug: "oberoesterreich", name: "Oberösterreich", land: "AT", cities: ["linz", "wels", "steyr", "leonding"] },
  { slug: "steiermark", name: "Steiermark", land: "AT", cities: ["graz", "leoben", "kapfenberg"] },
  { slug: "kaernten", name: "Kärnten", land: "AT", cities: ["klagenfurt", "villach"] },
  { slug: "salzburg-land", name: "Salzburg", land: "AT", cities: ["salzburg", "hallein"] },
  { slug: "tirol", name: "Tirol", land: "AT", cities: ["innsbruck", "hall-in-tirol", "woergl", "kufstein"] },
  { slug: "vorarlberg", name: "Vorarlberg", land: "AT", cities: ["dornbirn", "feldkirch", "bregenz", "lustenau"] },
  { slug: "burgenland", name: "Burgenland", land: "AT", cities: ["eisenstadt"] },

  // Schweiz — Kantone
  { slug: "zuerich-kanton", name: "Zürich", land: "CH", cities: ["zuerich", "winterthur", "uster", "dietikon"] },
  { slug: "bern-kanton", name: "Bern", land: "CH", cities: ["bern", "biel-bienne", "thun", "burgdorf"] },
  { slug: "basel-stadt", name: "Basel-Stadt", land: "CH", cities: ["basel", "riehen"] },
  { slug: "basel-landschaft", name: "Basel-Landschaft", land: "CH", cities: ["liestal"] },
  { slug: "luzern-kanton", name: "Luzern", land: "CH", cities: ["luzern", "emmen", "kriens"] },
  { slug: "st-gallen-kanton", name: "St. Gallen", land: "CH", cities: ["st-gallen", "rapperswil-jona"] },
  { slug: "aargau", name: "Aargau", land: "CH", cities: ["aarau", "baden-ch", "wettingen"] },
  { slug: "genf-kanton", name: "Genf", land: "CH", cities: ["genf"] },
  { slug: "waadt", name: "Waadt", land: "CH", cities: ["lausanne", "yverdon-les-bains"] },
  { slug: "tessin", name: "Tessin", land: "CH", cities: ["lugano", "bellinzona"] },
  { slug: "solothurn-kanton", name: "Solothurn", land: "CH", cities: ["solothurn", "olten"] },
  { slug: "zug-kanton", name: "Zug", land: "CH", cities: ["zug"] },
  { slug: "freiburg-kanton", name: "Freiburg", land: "CH", cities: ["fribourg"] },
  { slug: "schaffhausen-kanton", name: "Schaffhausen", land: "CH", cities: ["schaffhausen"] },
  { slug: "graubuenden", name: "Graubünden", land: "CH", cities: ["chur", "davos"] },
]

// Backwards-compatible aliases
export type Bundesland = Region
export const BUNDESLAENDER = REGIONEN

export const LAND_NAMEN: Record<Land, string> = {
  DE: "Deutschland",
  AT: "Österreich",
  CH: "Schweiz",
}

export function getStadtBySlug(slug: string): Stadt | undefined {
  return STAEDTE.find((s) => s.slug === slug)
}

export function getRegionenByLand(land: Land): Region[] {
  return REGIONEN.filter((r) => r.land === land)
}

export function getStaedteByLand(land: Land): Stadt[] {
  return STAEDTE.filter((s) => s.land === land)
}
