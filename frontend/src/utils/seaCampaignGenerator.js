// Professional SEA Campaign Generator for Google Ads Editor
// Structured with themed ad groups, mix of match types, and location targeting
// Based on Google Ads best practices

const BASE_URL = "https://spoeddienst24.nl";

// =============================================================================
// AD GROUP THEMES AND KEYWORDS
// =============================================================================

const ELEKTRICIEN_AD_GROUPS = {
  spoedelektricien: {
    name: "Spoedelektricien",
    keywords: {
      exact: [
        "spoed elektricien", "elektricien spoed", "24/7 elektricien", "24 uur elektricien",
        "nood elektricien", "elektricien nooddienst", "elektricien direct", "elektricien nu",
        "spoedelektricien", "spoed electricien", "spoed elektricien nodig", "elektricien meteen",
        "elektricien snel", "elektricien vandaag", "elektricien dringend", "dringende elektricien"
      ],
      phrase: [
        "spoed elektricien inhuren", "elektricien met spoed", "elektricien spoed nodig",
        "snel elektricien nodig", "direct elektricien bellen", "elektricien nu beschikbaar",
        "elektricien binnen 30 minuten", "elektricien direct ter plaatse"
      ],
      broad_modifier: [
        "+elektricien +spoed", "+elektricien +nood", "+elektricien +direct", 
        "+elektricien +dringend", "+spoedelektricien", "+elektricien +24/7"
      ]
    },
    headlines: ["24/7 Spoed-Elektricien", "Direct Hulp bij Storing", "Elektricien Binnen 30 Min"],
    descriptions: [
      "Onze vakman verhelpt uw storing direct. Ervaren monteur 24/7 beschikbaar. Bel nu!",
      "Altijd binnen 30 min ter plaatse. Gecertificeerd elektricien. Vaste prijzen."
    ],
    path1: "spoed",
    path2: "elektricien"
  },
  stroomstoring: {
    name: "Stroomstoring",
    keywords: {
      exact: [
        "stroomstoring", "geen stroom", "stroom uitgevallen", "stroomuitval", "stroom weg",
        "geen elektriciteit", "stroomstoring oplossen", "stroom storing", "storing elektra",
        "elektra storing", "geen stroom in huis", "stroomuitval huis", "stroom weg huis",
        "plotseling geen stroom", "gedeeltelijk geen stroom", "stroom uit"
      ],
      phrase: [
        "stroomstoring in huis", "geen stroom wat nu", "stroom uitgevallen wat doen",
        "help geen stroom", "stroomstoring verhelpen", "stroomstoring oplossen spoed",
        "stroom uitgevallen hulp", "storing stroom oplossen"
      ],
      broad_modifier: [
        "+stroomstoring +oplossen", "+geen +stroom +huis", "+stroom +uitgevallen",
        "+elektra +storing", "+stroomuitval +hulp"
      ]
    },
    headlines: ["Stroomstoring Oplossen", "24/7 Hulp bij Kortsluiting", "Direct Stroom Hersteld"],
    descriptions: [
      "Onze expert lost snel uw stroomstoring of kortsluiting op. 24/7 bereikbaar.",
      "Snelle en vakkundige reparatie door erkend elektricien. Bel direct!"
    ],
    path1: "stroomstoring",
    path2: ""
  },
  kortsluiting: {
    name: "Kortsluiting",
    keywords: {
      exact: [
        "kortsluiting", "kortsluiting huis", "kortsluiting verhelpen", "kortsluiting elektra",
        "kortsluiting repareren", "kortsluiting meterkast", "kortsluiting gevaarlijk",
        "kortsluiting stopcontact", "kortsluiting oplossen", "kortsluiting elektricien"
      ],
      phrase: [
        "kortsluiting in huis", "kortsluiting wat doen", "kortsluiting laten repareren",
        "hulp bij kortsluiting", "kortsluiting direct verhelpen", "kortsluiting spoed"
      ],
      broad_modifier: [
        "+kortsluiting +verhelpen", "+kortsluiting +repareren", "+kortsluiting +hulp",
        "+kortsluiting +elektricien"
      ]
    },
    headlines: ["Kortsluiting Verhelpen", "Veilig & Vakkundig", "Direct Hulp bij Storing"],
    descriptions: [
      "Erkende elektricien lost kortsluiting op, dag en nacht. Veilig en snel.",
      "Vrijblijvende offerte, snelle service. 24/7 beschikbaar!"
    ],
    path1: "kortsluiting",
    path2: ""
  },
  groepenkast: {
    name: "Groepenkast",
    keywords: {
      exact: [
        "groepenkast storing", "groepenkast kapot", "groepenkast vervangen", "meterkast storing",
        "stoppenkast kapot", "stoppenkast vervangen", "groep valt uit", "groepen vallen uit",
        "automaat valt uit", "zekering kapot", "zekering springt", "stop doorgeslagen",
        "groepenkast vernieuwen", "meterkast vervangen", "nieuwe groepenkast"
      ],
      phrase: [
        "groepenkast storing oplossen", "probleem met groepenkast", "groepenkast laten vervangen",
        "stoppenkast laten vervangen", "meterkast storing repareren", "groep valt steeds uit",
        "groepenkast rookt", "groepenkast maakt geluid"
      ],
      broad_modifier: [
        "+groepenkast +storing", "+groepenkast +vervangen", "+stoppenkast +kapot",
        "+meterkast +storing", "+groep +valt +uit"
      ]
    },
    headlines: ["Stoppenkast Vervangen", "Problemen Groepenkast?", "Veiligheid Voorop"],
    descriptions: [
      "Vernieuw uw groepenkast snel en veilig. Erkende installateur direct beschikbaar.",
      "Ervaren monteur, scherpe prijs. 24/7 storingsdienst. Bel nu!"
    ],
    path1: "groepenkast",
    path2: ""
  },
  aardlekschakelaar: {
    name: "Aardlekschakelaar",
    keywords: {
      exact: [
        "aardlekschakelaar", "aardlek", "aardlekschakelaar springt", "aardlek springt",
        "aardlekschakelaar valt uit", "aardlekschakelaar slaat af", "aardlek problemen",
        "aardlek storing", "aardlekschakelaar kapot", "aardlek opsporen"
      ],
      phrase: [
        "aardlekschakelaar valt steeds uit", "aardlek springt steeds", "aardlek opsporen laten",
        "probleem met aardlekschakelaar", "aardlekschakelaar blijft uitvallen"
      ],
      broad_modifier: [
        "+aardlekschakelaar +storing", "+aardlek +springt", "+aardlek +uitvallen"
      ]
    },
    headlines: ["Aardlek Opsporen", "Aardlekschakelaar Storing", "Veilig Elektra"],
    descriptions: [
      "Aardlek springt steeds? Onze elektricien spoort het probleem snel op.",
      "Veilige en vakkundige reparatie. 24/7 beschikbaar. Bel direct!"
    ],
    path1: "aardlek",
    path2: ""
  },
  stopcontact: {
    name: "Stopcontact",
    keywords: {
      exact: [
        "stopcontact kapot", "stopcontact werkt niet", "stopcontact vonkt", "stopcontact rook",
        "stopcontact verbrande geur", "stopcontact vervangen", "stopcontact doet het niet",
        "geen stroom stopcontact", "stopcontact geeft schok", "stopcontact gevaarlijk"
      ],
      phrase: [
        "stopcontact werkt niet meer", "stopcontact laten vervangen", "stopcontact vonkt gevaarlijk",
        "probleem met stopcontact", "stopcontact rook geur"
      ],
      broad_modifier: [
        "+stopcontact +kapot", "+stopcontact +vonkt", "+stopcontact +vervangen"
      ]
    },
    headlines: ["Stopcontact Kapot?", "Veilig Vervangen", "Direct Gerepareerd"],
    descriptions: [
      "Stopcontact vonkt of werkt niet? Laat het veilig vervangen door een vakman.",
      "Ervaren elektricien, snelle service. Bel voor directe hulp!"
    ],
    path1: "stopcontact",
    path2: ""
  }
};

// Additional typos and voice search variations
const TYPOS_AND_VOICE = {
  elektricien: [
    "electricien", "elektrisien", "eletricien", "elektricein", "elektricer",
    "electronicien", "eliktricien", "elektricen", "elektriciën"
  ],
  stroomstoring: [
    "stroomstorring", "stroom storring", "stroomstooring", "stoom storing"
  ],
  voice_queries: [
    "waar kan ik een elektricien vinden",
    "wie kan kortsluiting oplossen",
    "hoe vind ik een spoed elektricien",
    "waar kan ik stroomstoring laten repareren",
    "wie repareert mijn groepenkast"
  ]
};

// Cities for location targeting
const CITIES = [
  { name: "Amsterdam", slug: "amsterdam" },
  { name: "Rotterdam", slug: "rotterdam" },
  { name: "Den Haag", slug: "den-haag" },
  { name: "Utrecht", slug: "utrecht" },
  { name: "Eindhoven", slug: "eindhoven" },
  { name: "Tilburg", slug: "tilburg" },
  { name: "Groningen", slug: "groningen" },
  { name: "Almere", slug: "almere" },
  { name: "Breda", slug: "breda" },
  { name: "Nijmegen", slug: "nijmegen" },
  { name: "Enschede", slug: "enschede" },
  { name: "Arnhem", slug: "arnhem" },
  { name: "Haarlem", slug: "haarlem" },
  { name: "Amersfoort", slug: "amersfoort" },
  { name: "Apeldoorn", slug: "apeldoorn" },
  { name: "Maastricht", slug: "maastricht" },
  { name: "Leiden", slug: "leiden" },
  { name: "Dordrecht", slug: "dordrecht" },
  { name: "Zwolle", slug: "zwolle" },
  { name: "Zoetermeer", slug: "zoetermeer" },
  { name: "Alkmaar", slug: "alkmaar" },
  { name: "Delft", slug: "delft" },
  { name: "Venlo", slug: "venlo" },
  { name: "Deventer", slug: "deventer" },
  { name: "Helmond", slug: "helmond" },
  { name: "Den Bosch", slug: "den-bosch" },
  { name: "Gouda", slug: "gouda" },
  { name: "Hilversum", slug: "hilversum" },
  { name: "Zaandam", slug: "zaandam" },
  { name: "Leeuwarden", slug: "leeuwarden" }
];

// Negative keywords
const NEGATIVE_KEYWORDS = [
  "opleiding", "cursus", "vacature", "salaris", "wat is", "betekenis",
  "studie", "stage", "leren", "school", "mbo", "hbo", "wikipedia",
  "zelf doen", "handleiding", "youtube", "gratis", "goedkoop tweedehands"
];

// =============================================================================
// CSV GENERATOR
// =============================================================================

/**
 * Generate professional SEA campaign CSV for Google Ads Editor
 */
export function generateElektricienSEACSV(options = {}) {
  const {
    campaignName = "Elektricien",
    dailyBudget = 50,
    maxCpc = 2.00,
    includeLocations = true,
    includeTypos = true,
    includeVoiceSearch = true
  } = options;

  const rows = [];
  
  // CSV Header matching user's requested structure
  rows.push([
    "Zoekwoord", "Matchtype", "Advertentiegroep", "Campagne", "Locatie",
    "Headline1", "Headline2", "Headline3", "Description1", "Description2", "ZichtbareURL"
  ].join(","));

  // Track keyword count
  let keywordCount = 0;

  // Generate keywords for each ad group
  Object.entries(ELEKTRICIEN_AD_GROUPS).forEach(([adGroupKey, adGroup]) => {
    
    // National keywords (no specific city)
    ["exact", "phrase", "broad_modifier"].forEach(matchType => {
      const keywords = adGroup.keywords[matchType] || [];
      keywords.forEach(keyword => {
        rows.push(formatRow({
          keyword,
          matchType,
          adGroup: adGroup.name,
          campaign: campaignName,
          location: "Nederland",
          headlines: adGroup.headlines,
          descriptions: adGroup.descriptions,
          path1: adGroup.path1,
          path2: adGroup.path2
        }));
        keywordCount++;
      });
    });

    // City-specific keywords
    if (includeLocations) {
      CITIES.forEach(city => {
        // Generate city-specific keywords for this ad group theme
        const cityKeywords = generateCityKeywords(adGroupKey, city.name);
        
        cityKeywords.forEach(({ keyword, matchType }) => {
          rows.push(formatRow({
            keyword,
            matchType,
            adGroup: `${adGroup.name} ${city.name}`,
            campaign: campaignName,
            location: city.name,
            headlines: [
              `${adGroup.headlines[0]} ${city.name}`.substring(0, 30),
              adGroup.headlines[1],
              `Binnen 30 Min ${city.name}`.substring(0, 30)
            ],
            descriptions: [
              `Lokale elektricien in ${city.name}, binnen 30 min ter plaatse. Bel direct!`,
              adGroup.descriptions[1]
            ],
            path1: city.slug,
            path2: adGroup.path1
          }));
          keywordCount++;
        });
      });
    }
  });

  // Add typos
  if (includeTypos) {
    TYPOS_AND_VOICE.elektricien.forEach(typo => {
      ["spoed", "24/7", "direct", "nooddienst"].forEach(modifier => {
        rows.push(formatRow({
          keyword: `${modifier} ${typo}`,
          matchType: "broad_modifier",
          adGroup: "Spoedelektricien",
          campaign: campaignName,
          location: "Nederland",
          headlines: ELEKTRICIEN_AD_GROUPS.spoedelektricien.headlines,
          descriptions: ELEKTRICIEN_AD_GROUPS.spoedelektricien.descriptions,
          path1: "spoed",
          path2: "elektricien"
        }));
        keywordCount++;
      });
    });
  }

  // Add voice search queries
  if (includeVoiceSearch) {
    TYPOS_AND_VOICE.voice_queries.forEach(query => {
      rows.push(formatRow({
        keyword: query,
        matchType: "phrase",
        adGroup: "Voice Search",
        campaign: campaignName,
        location: "Nederland",
        headlines: ["24/7 Elektricien Hulp", "Direct Antwoord", "Bel Nu"],
        descriptions: [
          "Zoekt u een elektricien? Wij helpen u direct, 24/7 beschikbaar!",
          "Erkende elektricien, snelle service. Bel voor hulp!"
        ],
        path1: "elektricien",
        path2: "spoed"
      }));
      keywordCount++;
    });
  }

  return {
    csv: rows.join("\n"),
    keywordCount,
    adGroupCount: Object.keys(ELEKTRICIEN_AD_GROUPS).length + (includeLocations ? CITIES.length : 0)
  };
}

/**
 * Generate city-specific keywords
 */
function generateCityKeywords(adGroupKey, cityName) {
  const keywords = [];
  const cityLower = cityName.toLowerCase();
  
  const baseTerms = {
    spoedelektricien: ["spoed elektricien", "elektricien spoed", "24/7 elektricien", "nood elektricien"],
    stroomstoring: ["stroomstoring", "geen stroom", "stroom uitgevallen"],
    kortsluiting: ["kortsluiting", "kortsluiting verhelpen"],
    groepenkast: ["groepenkast storing", "stoppenkast kapot", "groepenkast vervangen"],
    aardlekschakelaar: ["aardlekschakelaar", "aardlek storing"],
    stopcontact: ["stopcontact kapot", "stopcontact vervangen"]
  };

  const terms = baseTerms[adGroupKey] || [];
  
  terms.forEach(term => {
    // "elektricien Amsterdam"
    keywords.push({ keyword: `${term} ${cityName}`, matchType: "exact" });
    // "Amsterdam elektricien"
    keywords.push({ keyword: `${cityName} ${term}`, matchType: "phrase" });
    // Broad modifier
    keywords.push({ keyword: `+${term.split(' ').join(' +')} +${cityLower}`, matchType: "broad_modifier" });
  });

  return keywords;
}

/**
 * Format a single CSV row
 */
function formatRow({ keyword, matchType, adGroup, campaign, location, headlines, descriptions, path1, path2 }) {
  // Format match type for CSV
  let formattedKeyword = keyword;
  let matchTypeLabel = matchType;
  
  switch (matchType) {
    case "exact":
      formattedKeyword = `[${keyword}]`;
      matchTypeLabel = "Exact";
      break;
    case "phrase":
      formattedKeyword = `"${keyword}"`;
      matchTypeLabel = "Phrase";
      break;
    case "broad_modifier":
      formattedKeyword = keyword.includes('+') ? keyword : `+${keyword.split(' ').join(' +')}`;
      matchTypeLabel = "Broad Modifier";
      break;
  }

  const visibleUrl = `www.spoeddienst24.nl/${path1}${path2 ? '/' + path2 : ''}`;
  
  return [
    `"${formattedKeyword}"`,
    matchTypeLabel,
    `"${adGroup}"`,
    `"${campaign}"`,
    `"${location}"`,
    `"${(headlines[0] || '').substring(0, 30)}"`,
    `"${(headlines[1] || '').substring(0, 30)}"`,
    `"${(headlines[2] || '').substring(0, 30)}"`,
    `"${(descriptions[0] || '').substring(0, 90)}"`,
    `"${(descriptions[1] || '').substring(0, 90)}"`,
    `"${visibleUrl}"`
  ].join(",");
}

/**
 * Get negative keywords list
 */
export function getNegativeKeywords() {
  return NEGATIVE_KEYWORDS;
}

/**
 * Download CSV file
 */
export function downloadSEACSV(filename = "elektricien_sea_campaign.csv") {
  const result = generateElektricienSEACSV();
  
  const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return result;
}

// Export for use in other modules
export { ELEKTRICIEN_AD_GROUPS, CITIES, NEGATIVE_KEYWORDS };
