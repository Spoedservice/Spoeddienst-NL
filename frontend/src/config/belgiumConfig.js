// Belgian Configuration for SpoedDienst24.be
// Contains all Belgium-specific data: cities, terminology, contact info

export const BE_CONFIG = {
  country: "België",
  countryCode: "BE",
  currency: "EUR",
  phonePrefix: "+32",
  phoneExample: "+32 3 123 45 67",
  postalCodeFormat: "4 cijfers (bijv. 2000)",
  domain: "spoeddienst24.be",
  
  // Terminology differences
  terminology: {
    btw_nummer: "Ondernemingsnummer",
    kvk_nummer: "KBO-nummer",
    verzekering: "Verzekering BA",
    postcode: "Postcode",
    gemeente: "Gemeente"
  },
  
  // Contact info for Belgium
  contact: {
    phone: "+32 3 808 47 47",
    phoneDisplay: "03 808 47 47",
    email: "info@spoeddienst24.be",
    emergencyLine: "03 808 47 47"
  },
  
  // SEO
  seo: {
    siteName: "SpoedDienst24.be",
    titleSuffix: " | SpoedDienst24.be - 24/7 Vakmannen België",
    description: "24/7 spoed loodgieter, slotenmaker en elektricien in België. Binnen 30 minuten ter plaatse. ✓ Vaste prijzen ✓ Gecertificeerd ✓ 24/7 beschikbaar"
  }
};

// Belgian Cities - Flemish Region
// Includes Antwerp municipalities, Ghent, Bruges, Leuven and surrounding areas
export const BELGIAN_CITIES = [
  // Antwerpen en districten/gemeenten
  { name: "Antwerpen", slug: "antwerpen", province: "Antwerpen", isCapital: true },
  { name: "Berchem", slug: "berchem", province: "Antwerpen", parent: "Antwerpen" },
  { name: "Borgerhout", slug: "borgerhout", province: "Antwerpen", parent: "Antwerpen" },
  { name: "Deurne", slug: "deurne", province: "Antwerpen", parent: "Antwerpen" },
  { name: "Ekeren", slug: "ekeren", province: "Antwerpen", parent: "Antwerpen" },
  { name: "Hoboken", slug: "hoboken", province: "Antwerpen", parent: "Antwerpen" },
  { name: "Merksem", slug: "merksem", province: "Antwerpen", parent: "Antwerpen" },
  { name: "Wilrijk", slug: "wilrijk", province: "Antwerpen", parent: "Antwerpen" },
  { name: "Mortsel", slug: "mortsel", province: "Antwerpen" },
  { name: "Edegem", slug: "edegem", province: "Antwerpen" },
  { name: "Kontich", slug: "kontich", province: "Antwerpen" },
  { name: "Schoten", slug: "schoten", province: "Antwerpen" },
  { name: "Brasschaat", slug: "brasschaat", province: "Antwerpen" },
  { name: "Kapellen", slug: "kapellen", province: "Antwerpen" },
  { name: "Wommelgem", slug: "wommelgem", province: "Antwerpen" },
  
  // Gent en omgeving
  { name: "Gent", slug: "gent", province: "Oost-Vlaanderen", isCapital: true },
  { name: "Sint-Niklaas", slug: "sint-niklaas", province: "Oost-Vlaanderen" },
  { name: "Aalst", slug: "aalst", province: "Oost-Vlaanderen" },
  { name: "Dendermonde", slug: "dendermonde", province: "Oost-Vlaanderen" },
  { name: "Lokeren", slug: "lokeren", province: "Oost-Vlaanderen" },
  { name: "Wetteren", slug: "wetteren", province: "Oost-Vlaanderen" },
  
  // Brugge en West-Vlaanderen
  { name: "Brugge", slug: "brugge", province: "West-Vlaanderen", isCapital: true },
  { name: "Oostende", slug: "oostende", province: "West-Vlaanderen" },
  { name: "Kortrijk", slug: "kortrijk", province: "West-Vlaanderen" },
  { name: "Roeselare", slug: "roeselare", province: "West-Vlaanderen" },
  { name: "Knokke-Heist", slug: "knokke-heist", province: "West-Vlaanderen" },
  { name: "Blankenberge", slug: "blankenberge", province: "West-Vlaanderen" },
  
  // Leuven en Vlaams-Brabant
  { name: "Leuven", slug: "leuven", province: "Vlaams-Brabant", isCapital: true },
  { name: "Mechelen", slug: "mechelen", province: "Antwerpen" },
  { name: "Vilvoorde", slug: "vilvoorde", province: "Vlaams-Brabant" },
  { name: "Aarschot", slug: "aarschot", province: "Vlaams-Brabant" },
  { name: "Tienen", slug: "tienen", province: "Vlaams-Brabant" },
  { name: "Diest", slug: "diest", province: "Vlaams-Brabant" },
  { name: "Halle", slug: "halle", province: "Vlaams-Brabant" },
  
  // Limburg
  { name: "Hasselt", slug: "hasselt", province: "Limburg", isCapital: true },
  { name: "Genk", slug: "genk", province: "Limburg" },
  { name: "Sint-Truiden", slug: "sint-truiden", province: "Limburg" },
  { name: "Beringen", slug: "beringen", province: "Limburg" },
  { name: "Tongeren", slug: "tongeren", province: "Limburg" },
  
  // Extra grote steden
  { name: "Turnhout", slug: "turnhout", province: "Antwerpen" },
  { name: "Heist-op-den-Berg", slug: "heist-op-den-berg", province: "Antwerpen" },
  { name: "Lier", slug: "lier", province: "Antwerpen" }
];

// Belgian services with BE-specific descriptions
export const BELGIAN_SERVICES = [
  {
    slug: "loodgieter",
    name: "Loodgieter",
    icon: "droplet",
    description: "24/7 spoed loodgieter in België. Lekkages, verstoppingen en sanitair snel opgelost.",
    keywords: ["spoed loodgieter", "loodgieter België", "lekkage", "verstopping", "sanitair"]
  },
  {
    slug: "slotenmaker", 
    name: "Slotenmaker",
    icon: "key",
    description: "Buitengesloten in België? Onze slotenmakers openen uw deur binnen 20 minuten.",
    keywords: ["slotenmaker", "buitengesloten", "slot vervangen", "deur openen"]
  },
  {
    slug: "elektricien",
    name: "Elektricien",
    icon: "zap", 
    description: "Stroomstoring of kortsluiting? Onze elektriciens in België staan 24/7 paraat.",
    keywords: ["elektricien", "stroomstoring", "kortsluiting", "elektriciteit"]
  }
];

// Belgian problem pages
export const BELGIAN_PROBLEMS = {
  // Loodgieter
  "lekkage-spoed": {
    slug: "lekkage-spoed",
    service: "loodgieter",
    title: "Spoed Lekkage België | 24/7 Loodgieter",
    h1: "Lekkage in België? Binnen 30 minuten een loodgieter!",
    description: "Waterlekkage in België? Onze spoedloodgieters zijn 24/7 beschikbaar in heel Vlaanderen."
  },
  "wc-verstopt": {
    slug: "wc-verstopt",
    service: "loodgieter",
    title: "WC Verstopt België | Spoed Ontstopping",
    h1: "WC Verstopt? Direct ontstopt in België!",
    description: "Toilet verstopt in België? Onze ontstoppingsdienst is 24/7 bereikbaar in Vlaanderen."
  },
  // Slotenmaker
  "buitengesloten": {
    slug: "buitengesloten",
    service: "slotenmaker",
    title: "Buitengesloten België | 24/7 Slotenmaker",
    h1: "Buitengesloten in België? Binnen 20 minuten binnen!",
    description: "Buitengesloten in Antwerpen, Gent, Brugge of elders in België? 24/7 slotenmaker beschikbaar."
  },
  // Elektricien
  "stroomstoring": {
    slug: "stroomstoring",
    service: "elektricien",
    title: "Stroomstoring België | 24/7 Elektricien",
    h1: "Stroomstoring in België? Direct verholpen!",
    description: "Geen stroom in België? Onze elektriciens zijn 24/7 beschikbaar in heel Vlaanderen."
  }
};

// Export all
export default {
  config: BE_CONFIG,
  cities: BELGIAN_CITIES,
  services: BELGIAN_SERVICES,
  problems: BELGIAN_PROBLEMS
};
