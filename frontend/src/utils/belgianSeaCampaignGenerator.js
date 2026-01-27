// Belgian SEA Campaign Generator for Google Ads Editor
// Professional campaign structure for spoeddienst24.be
// Targets Flemish cities with Belgian-specific keywords

import { BELGIAN_CITIES } from "@/config/belgiumConfig";

const BASE_URL = "https://spoeddienst24.be";

// =============================================================================
// BELGIAN AD GROUP THEMES AND KEYWORDS
// =============================================================================

export const BELGIAN_AD_GROUPS = {
  spoedelektricien: {
    name: "Spoedelektricien",
    keywords: {
      exact: [
        "spoed elektricien", "elektricien spoed", "24/7 elektricien", "24 uur elektricien",
        "nood elektricien", "elektricien nooddienst", "elektricien direct", "elektricien nu",
        "spoedelektricien", "elektricien dringend", "elektricien weekend", "elektricien nacht",
        "elektriek spoed", "elektrieker spoed", "dringende elektriciën"
      ],
      phrase: [
        "spoed elektricien inhuren", "elektricien met spoed nodig",
        "snel elektricien nodig", "direct elektricien bellen",
        "elektricien binnen 30 minuten", "elektricien direct ter plaatse"
      ],
      broad_modifier: [
        "+elektricien +spoed", "+elektricien +nood", "+elektricien +direct", 
        "+elektricien +dringend", "+spoedelektricien", "+elektricien +24/7"
      ]
    },
    headlines: ["24/7 Spoed-Elektricien", "Direct Hulp bij Storing", "Elektricien Binnen 30 Min"],
    descriptions: [
      "Onze vakman verhelpt uw storing direct in heel Vlaanderen. Bel nu!",
      "Altijd binnen 30 min ter plaatse. Gecertificeerde elektricien België."
    ],
    path1: "spoed",
    path2: "elektricien"
  },
  stroomstoring: {
    name: "Stroomstoring",
    keywords: {
      exact: [
        "stroomstoring", "geen stroom", "stroom uitgevallen", "stroomuitval", "stroom weg",
        "geen elektriciteit", "stroomstoring oplossen", "storing elektra", "stroom panne",
        "elektriciteitspanne", "stroompanne", "black-out huis"
      ],
      phrase: [
        "stroomstoring in huis", "geen stroom wat nu", "stroom uitgevallen wat doen",
        "help geen stroom", "stroomstoring verhelpen België"
      ],
      broad_modifier: [
        "+stroomstoring +oplossen", "+geen +stroom +huis", "+stroom +uitgevallen",
        "+elektra +storing", "+stroompanne"
      ]
    },
    headlines: ["Stroomstoring Oplossen", "24/7 Hulp België", "Direct Stroom Hersteld"],
    descriptions: [
      "Onze expert lost snel uw stroomstoring op in heel Vlaanderen.",
      "Snelle en vakkundige reparatie. 24/7 bereikbaar in België!"
    ],
    path1: "stroomstoring",
    path2: ""
  },
  kortsluiting: {
    name: "Kortsluiting",
    keywords: {
      exact: [
        "kortsluiting", "kortsluiting huis", "kortsluiting verhelpen", "kortsluiting elektra",
        "kortsluiting repareren", "kortsluiting zekeringkast", "kortsluiting gevaarlijk"
      ],
      phrase: [
        "kortsluiting in huis", "kortsluiting wat doen", "kortsluiting laten repareren",
        "hulp bij kortsluiting België"
      ],
      broad_modifier: [
        "+kortsluiting +verhelpen", "+kortsluiting +repareren", "+kortsluiting +hulp"
      ]
    },
    headlines: ["Kortsluiting Verhelpen", "Veilig & Vakkundig", "Direct Hulp"],
    descriptions: [
      "Erkende elektricien lost kortsluiting op, dag en nacht in België.",
      "Vrijblijvende offerte, snelle service. 24/7 beschikbaar!"
    ],
    path1: "kortsluiting",
    path2: ""
  },
  zekeringkast: {
    name: "Zekeringkast",
    keywords: {
      exact: [
        "zekeringkast storing", "zekeringkast kapot", "zekeringkast vervangen",
        "differentieel springt", "differentieel valt uit", "automaat valt uit",
        "zekering kapot", "zekering springt", "elektrische kast storing",
        "verdeelkast probleem", "zekeringkast vernieuwen"
      ],
      phrase: [
        "zekeringkast storing oplossen", "probleem met zekeringkast",
        "zekeringkast laten vervangen", "differentieel valt steeds uit"
      ],
      broad_modifier: [
        "+zekeringkast +storing", "+zekeringkast +vervangen", "+differentieel +springt",
        "+automaat +valt +uit"
      ]
    },
    headlines: ["Zekeringkast Storing", "Differentieel Springt?", "Veiligheid Voorop"],
    descriptions: [
      "Vernieuw uw zekeringkast snel en veilig. Erkend installateur België.",
      "Ervaren monteur, scherpe prijs. 24/7 storingsdienst Vlaanderen."
    ],
    path1: "zekeringkast",
    path2: ""
  },
  stopcontact: {
    name: "Stopcontact",
    keywords: {
      exact: [
        "stopcontact kapot", "stopcontact werkt niet", "stopcontact vonkt",
        "stopcontact vervangen", "stopcontact doet het niet", "stopcontact rook"
      ],
      phrase: [
        "stopcontact werkt niet meer", "stopcontact laten vervangen België",
        "probleem met stopcontact"
      ],
      broad_modifier: [
        "+stopcontact +kapot", "+stopcontact +vonkt", "+stopcontact +vervangen"
      ]
    },
    headlines: ["Stopcontact Kapot?", "Veilig Vervangen", "Direct Gerepareerd"],
    descriptions: [
      "Stopcontact vonkt of werkt niet? Vakman in heel Vlaanderen.",
      "Ervaren elektricien België, snelle service. Bel direct!"
    ],
    path1: "stopcontact",
    path2: ""
  }
};

// Belgian typos and voice search
const BELGIAN_TYPOS_AND_VOICE = {
  elektricien: [
    "electricien", "elektrieker", "elektriciën", "elektrisien", "eletricien"
  ],
  voice_queries: [
    "waar kan ik een elektricien vinden in antwerpen",
    "wie kan kortsluiting oplossen in gent",
    "elektricien nodig in brugge",
    "stroomstoring hulp in leuven"
  ]
};

// Negative keywords for Belgium
export const BELGIAN_NEGATIVE_KEYWORDS = [
  "opleiding", "cursus", "vacature", "salaris", "wat is", "betekenis",
  "studie", "stage", "leren", "school", "wikipedia", "zelf doen",
  "handleiding", "youtube", "gratis", "goedkoop", "nederland", "holland"
];

// =============================================================================
// CSV GENERATOR FOR BELGIUM
// =============================================================================

export function generateBelgianSEACSV(options = {}) {
  const {
    campaignName = "Elektricien België",
    dailyBudget = 50,
    maxCpc = 2.00,
    includeLocations = true,
    includeTypos = true,
    includeVoiceSearch = true
  } = options;

  const rows = [];
  
  // CSV Header
  rows.push([
    "Zoekwoord", "Matchtype", "Advertentiegroep", "Campagne", "Locatie",
    "Headline1", "Headline2", "Headline3", "Description1", "Description2", "ZichtbareURL"
  ].join(","));

  let keywordCount = 0;

  // Generate keywords for each ad group
  Object.entries(BELGIAN_AD_GROUPS).forEach(([adGroupKey, adGroup]) => {
    
    // National Belgian keywords
    ["exact", "phrase", "broad_modifier"].forEach(matchType => {
      const keywords = adGroup.keywords[matchType] || [];
      keywords.forEach(keyword => {
        rows.push(formatBelgianRow({
          keyword,
          matchType,
          adGroup: adGroup.name,
          campaign: campaignName,
          location: "België",
          headlines: adGroup.headlines,
          descriptions: adGroup.descriptions,
          path1: adGroup.path1,
          path2: adGroup.path2
        }));
        keywordCount++;
      });
    });

    // City-specific keywords for Belgium
    if (includeLocations) {
      BELGIAN_CITIES.forEach(city => {
        const cityKeywords = generateBelgianCityKeywords(adGroupKey, city.name);
        
        cityKeywords.forEach(({ keyword, matchType }) => {
          rows.push(formatBelgianRow({
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

  // Add Belgian typos
  if (includeTypos) {
    BELGIAN_TYPOS_AND_VOICE.elektricien.forEach(typo => {
      ["spoed", "24/7", "direct"].forEach(modifier => {
        rows.push(formatBelgianRow({
          keyword: `${modifier} ${typo}`,
          matchType: "broad_modifier",
          adGroup: "Spoedelektricien",
          campaign: campaignName,
          location: "België",
          headlines: BELGIAN_AD_GROUPS.spoedelektricien.headlines,
          descriptions: BELGIAN_AD_GROUPS.spoedelektricien.descriptions,
          path1: "spoed",
          path2: "elektricien"
        }));
        keywordCount++;
      });
    });
  }

  // Add voice search queries
  if (includeVoiceSearch) {
    BELGIAN_TYPOS_AND_VOICE.voice_queries.forEach(query => {
      rows.push(formatBelgianRow({
        keyword: query,
        matchType: "phrase",
        adGroup: "Voice Search BE",
        campaign: campaignName,
        location: "België",
        headlines: ["24/7 Elektricien België", "Direct Antwoord", "Bel Nu"],
        descriptions: [
          "Zoekt u een elektricien in België? Wij helpen u direct, 24/7!",
          "Erkende elektricien Vlaanderen, snelle service. Bel voor hulp!"
        ],
        path1: "elektricien",
        path2: "belgie"
      }));
      keywordCount++;
    });
  }

  return {
    csv: rows.join("\n"),
    keywordCount,
    adGroupCount: Object.keys(BELGIAN_AD_GROUPS).length + (includeLocations ? BELGIAN_CITIES.length : 0)
  };
}

function generateBelgianCityKeywords(adGroupKey, cityName) {
  const keywords = [];
  const cityLower = cityName.toLowerCase();
  
  const baseTerms = {
    spoedelektricien: ["spoed elektricien", "elektricien spoed", "24/7 elektricien"],
    stroomstoring: ["stroomstoring", "geen stroom", "stroompanne"],
    kortsluiting: ["kortsluiting", "kortsluiting verhelpen"],
    zekeringkast: ["zekeringkast storing", "differentieel springt", "zekeringkast vervangen"],
    stopcontact: ["stopcontact kapot", "stopcontact vervangen"]
  };

  const terms = baseTerms[adGroupKey] || [];
  
  terms.forEach(term => {
    keywords.push({ keyword: `${term} ${cityName}`, matchType: "exact" });
    keywords.push({ keyword: `${cityName} ${term}`, matchType: "phrase" });
    keywords.push({ keyword: `+${term.split(' ').join(' +')} +${cityLower}`, matchType: "broad_modifier" });
  });

  return keywords;
}

function formatBelgianRow({ keyword, matchType, adGroup, campaign, location, headlines, descriptions, path1, path2 }) {
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

  const visibleUrl = `www.spoeddienst24.be/${path1}${path2 ? '/' + path2 : ''}`;
  
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

export function downloadBelgianSEACSV(filename = "elektricien_belgie_sea_campaign.csv") {
  const result = generateBelgianSEACSV();
  
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
