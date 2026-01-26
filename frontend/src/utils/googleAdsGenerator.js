// Complete Google Ads Editor CSV Generator
// Generates campaigns with ~1000+ keywords

const BASE_URL = "https://spoeddienst24.nl";

// Extended keyword database based on user's SEO research
const COMPLETE_KEYWORDS = {
  loodgieter: {
    general: [
      "spoed loodgieter", "loodgieter", "loodgieter 24/7", "24 uurs loodgieter", "24 uur loodgieter",
      "loodgieter nodig", "loodgieter bellen", "loodgieter spoedservice", "loodgieter spoed",
      "loodgieter in de buurt", "loodgieter dichtbij", "direct een loodgieter", "loodgieter nu beschikbaar",
      "loodgieter per direct", "loodgieter nooddienst", "loodgieter gezocht spoed", "dringend loodgieter nodig",
      "betrouwbare loodgieter", "goedkope loodgieter", "goedkope spoed loodgieter", "direct hulp loodgieter",
      "nood loodgieter", "loodgieter spoeddienst", "loodgieter spoedklus", "loodgieter 24 uur bereikbaar"
    ],
    problems: [
      "lekkage", "lekkage repareren", "lekkage spoed", "waterlekkage", "lekkage plafond", "lekkage in muur",
      "badkamer lekkage spoed", "lekkage opsporen", "lekkage slaapkamer",
      "wc verstopt", "toilet verstopt", "wc verstopt spoed", "wc loopt over", "toilet spoelt niet door", "mijn wc is verstopt",
      "riool verstopt", "rioollucht in huis", "riool ontstoppen spoed", "oorzaak rioollucht",
      "afvoer verstopt", "gootsteen verstopt", "keukenafvoer verstopt", "afvoer stinkt", "gootsteen loopt niet door",
      "verstopping verhelpen", "ontstoppingsdienst 24/7", "ontstoppingsdienst in de buurt",
      "kraan lekt", "leiding lekt", "leiding gesprongen", "waterleiding kapot", "leiding bevroren",
      "cv ketel lekt", "cv ketel storing", "radiator lekt", "radiator lekt water", "radiator wordt niet warm",
      "daklekkage", "daklekkage spoed", "dakgoot lekt", "dakgoot verstopt", "dakgoot overstroomt", "regenpijp lekt", "regenpijp verstopt",
      "kelder staat onder water", "badkamer onder water", "huis staat onder water", "vocht in kelder", "vochtige muur oorzaak",
      "borrelende afvoer", "geluid in leidingen"
    ],
    cities: [
      "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Tilburg", "Groningen",
      "Almere", "Breda", "Nijmegen", "Enschede", "Arnhem", "Haarlem", "Amersfoort",
      "Apeldoorn", "Maastricht", "Leiden", "Dordrecht", "Zwolle", "Zoetermeer",
      "Alkmaar", "Delft", "Venlo", "Deventer", "Helmond", "Gouda", "Hilversum",
      "Zaandam", "Assen", "Emmen", "Ede", "Lelystad", "Hoofddorp", "Oss"
    ]
  },
  slotenmaker: {
    general: [
      "spoed slotenmaker", "slotenmaker", "slotenmaker 24/7", "24 uurs slotenmaker", "24 uur slotenmaker",
      "slotenmaker nodig", "slotenmaker bellen", "slotenmaker spoedservice", "slotenmaker spoed",
      "slotenmaker in de buurt", "slotenmaker dichtbij", "direct een slotenmaker", "slotenmaker nu beschikbaar",
      "slotenmaker per direct", "slotenmaker gezocht spoed", "dringend slotenmaker nodig",
      "betrouwbare slotenmaker", "goedkope slotenmaker", "goedkope spoed slotenmaker", "sleutelservice spoed",
      "nood slotenmaker", "slotenmaker spoeddienst", "slotenmaker hulp nodig", "slotenmaker spoed hulp",
      "slotenmaker vandaag", "slotenmaker morgen", "zo spoedig mogelijk slotenmaker", "slotenservice 24/7"
    ],
    problems: [
      "buitengesloten", "buitengesloten huis", "ik ben buitengesloten", "buitengesloten wat nu",
      "buitengesloten sleutel binnen", "deur op slot sleutel binnen", "ik heb mezelf buitengesloten",
      "sleutel afgebroken in slot", "sleutel afgebroken", "sleutel afgebroken wat nu", "afgebroken sleutel verwijderen",
      "sleutel zit vast in slot", "sleutel kwijt", "sleutel verloren", "sleutelbos kwijt", "sleutel binnen vergeten",
      "sleutel kwijtgeraakt", "huis niet meer in sleutel kwijt", "ik ben mijn sleutels kwijt",
      "deur gaat niet open", "deur in slot gevallen", "deur wil niet open wat doen", "deur op slot gevallen",
      "deur gaat niet op slot", "deur klemt op slot", "ik kan mijn huis niet in",
      "slot vervangen", "kapot slot vervangen", "sloten vervangen na inbraak", "nieuwe sloten plaatsen spoed",
      "inbraakschade slot", "inbraakschade slot repareren"
    ],
    cities: [
      "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Tilburg", "Groningen",
      "Almere", "Breda", "Nijmegen", "Enschede", "Arnhem", "Haarlem", "Amersfoort",
      "Apeldoorn", "Maastricht", "Leiden", "Dordrecht", "Zwolle", "Zoetermeer",
      "Alkmaar", "Delft", "Venlo", "Deventer", "Helmond", "Gouda", "Hilversum",
      "Zaandam", "Assen", "Lelystad", "Hoofddorp"
    ]
  },
  elektricien: {
    general: [
      "spoed elektricien", "elektricien", "elektricien 24/7", "24 uurs elektricien", "24 uur elektricien",
      "elektricien nodig", "elektricien bellen", "elektricien spoedservice", "elektricien spoed",
      "elektricien in de buurt", "elektricien dichtbij", "direct een elektricien", "elektricien nu beschikbaar",
      "elektricien per direct", "elektricien storingsdienst", "elektricien gezocht spoed", "dringend elektricien nodig",
      "betrouwbare elektricien", "goedkope elektricien", "nood elektricien", "elektra storingsdienst",
      "elektricien spoeddienst", "spoed klus elektricien", "spoed hulp elektricien", "spoed reparatie elektricien",
      "ik heb een elektricien nodig", "elektriciensbedrijf spoed"
    ],
    problems: [
      "stroomstoring", "stroomstoring oplossen", "stroomstoring wat te doen", "geen stroom", "stroom uitgevallen", 
      "stroom uit", "mijn stroom is uitgevallen", "geen stroom in huis", "gedeeltelijk geen stroom", "ik heb geen stroom",
      "help geen stroom in huis", "wat te doen bij stroomuitval",
      "kortsluiting", "kortsluiting in huis", "kortsluiting meterkast", "kortsluiting gevaarlijk", "kortsluiting probleem",
      "wat te doen bij kortsluiting",
      "groepenkast storing", "meterkast storing", "groep valt steeds uit", "geknetter in meterkast",
      "groepenkast maakt geluid", "brandlucht meterkast", "meterkast rook",
      "aardlekschakelaar valt uit", "aardlek springt steeds", "aardlekschakelaar blijft omslaan", "aardlekschakelaar schakelt uit",
      "zekering springt", "stop gesprongen", "stop doorgeslagen wat nu", "zekeringkapot",
      "automaat valt uit", "automaat valt steeds uit",
      "stopcontact doet het niet", "stopcontact vonkt", "stopcontact geeft schok", "stopcontact rook", "geen stroom op stopcontact",
      "vreemde geur stopcontact",
      "lamp knippert", "lamp valt uit", "licht doet het niet meer", "lichten vallen uit", "lamp knalt door", "lamp springt steeds kapot",
      "schakelaar wordt heet", "schakelaar kapot vervangen",
      "boiler geen stroom", "kookplaat geen stroom", "oven krijgt geen stroom", "thermostaat geen stroom",
      "deurbel doet het niet", "alarm installatie storing"
    ],
    cities: [
      "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Tilburg", "Groningen",
      "Almere", "Breda", "Nijmegen", "Enschede", "Arnhem", "Haarlem", "Amersfoort",
      "Apeldoorn", "Maastricht", "Leiden", "Dordrecht", "Zwolle", "Zoetermeer",
      "Alkmaar", "Delft", "Venlo", "Deventer", "Helmond", "Gouda", "Hilversum",
      "Zaandam", "Vlaardingen", "Leeuwarden", "Lelystad", "Den Bosch"
    ]
  }
};

const SERVICE_META = {
  loodgieter: {
    name: "Loodgieter",
    headlines: ["Spoed Loodgieter 24/7", "Direct Geholpen", "Binnen 30 Min", "Vaste Prijzen", "Bel Nu 085 333 2847"],
    descriptions: [
      "24/7 spoed loodgieter bij lekkage of verstopping. Snel ter plaatse, vaste prijs. Bel nu!",
      "Professionele loodgieter direct beschikbaar. Lekkage? Verstopping? Wij helpen 24/7!"
    ]
  },
  slotenmaker: {
    name: "Slotenmaker",
    headlines: ["Spoed Slotenmaker 24/7", "Buitengesloten?", "Schadevrij Openen", "Direct Ter Plaatse", "Bel Nu 085 333 2847"],
    descriptions: [
      "24/7 spoed slotenmaker bij buitensluiting. Schadevrij openen, snel ter plaatse. Bel nu!",
      "Professionele slotenmaker direct beschikbaar. Buitengesloten? Wij helpen 24/7!"
    ]
  },
  elektricien: {
    name: "Elektricien",
    headlines: ["Spoed Elektricien 24/7", "Stroomstoring?", "Direct Hulp", "Veilig & Vakkundig", "Bel Nu 085 333 2847"],
    descriptions: [
      "24/7 spoed elektricien bij stroomstoring of kortsluiting. Veilig opgelost, snel ter plaatse!",
      "Professionele elektricien direct beschikbaar. Geen stroom? Wij helpen 24/7!"
    ]
  }
};

export function generateGoogleAdsEditorCSV(options = {}) {
  const {
    services = ["loodgieter", "slotenmaker", "elektricien"],
    dailyBudget = 50,
    maxCpc = 2.00,
    utmSource = "google",
    utmMedium = "cpc",
    utmCampaign = "spoed"
  } = options;
  
  const rows = [];
  
  // Header
  rows.push([
    "Row Type", "Action", "Campaign status", "Campaign", "Campaign type", "Networks",
    "Budget", "Budget type", "Ad group", "Ad group status", "Max CPC", "Ad type",
    "Headline 1", "Headline 2", "Headline 3", "Description 1", "Description 2",
    "Final URL", "Path 1", "Path 2", "Keyword", "Match type", "Keyword status"
  ]);
  
  services.forEach(serviceSlug => {
    const data = COMPLETE_KEYWORDS[serviceSlug];
    const meta = SERVICE_META[serviceSlug];
    const campaignName = `Spoed ${meta.name} NL`;
    
    // Campaign row
    rows.push([
      "Campaign", "Add", "Enabled", campaignName, "Search", "Google search",
      dailyBudget, "Daily", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
    ]);
    
    // Ad Groups per city
    data.cities.forEach(city => {
      const citySlug = city.toLowerCase().replace(/\s+/g, "-").replace(/'/g, "");
      const adGroupName = city;
      const finalUrl = `${BASE_URL}/spoed-${serviceSlug}/${citySlug}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}_${serviceSlug}_${citySlug}`;
      
      // Ad Group row
      rows.push([
        "Ad group", "Add", "", campaignName, "", "", "", "",
        adGroupName, "Enabled", maxCpc.toFixed(2), "", "", "", "", "", "", "", "", "", "", "", ""
      ]);
      
      // Responsive Search Ad
      rows.push([
        "Ad", "Add", "", campaignName, "", "", "", "",
        adGroupName, "", "", "Responsive search ad",
        `Spoed ${meta.name} ${city}`,
        meta.headlines[1],
        meta.headlines[2],
        meta.descriptions[0],
        meta.descriptions[1],
        finalUrl, "spoed", serviceSlug, "", "", ""
      ]);
      
      // Keywords - General with city
      data.general.slice(0, 10).forEach(kw => {
        // Phrase match
        rows.push([
          "Keyword", "Add", "", campaignName, "", "", "", "",
          adGroupName, "", "", "", "", "", "", "", "",
          finalUrl, "", "", `"${kw} ${city.toLowerCase()}"`, "Phrase", "Enabled"
        ]);
        // Exact match for top keywords
        if (kw.includes("spoed") || kw === serviceSlug) {
          rows.push([
            "Keyword", "Add", "", campaignName, "", "", "", "",
            adGroupName, "", "", "", "", "", "", "", "",
            finalUrl, "", "", `[${kw} ${city.toLowerCase()}]`, "Exact", "Enabled"
          ]);
        }
      });
      
      // Keywords - Problems with city (top 5)
      data.problems.slice(0, 5).forEach(problem => {
        rows.push([
          "Keyword", "Add", "", campaignName, "", "", "", "",
          adGroupName, "", "", "", "", "", "", "", "",
          finalUrl, "", "", `"${problem} ${city.toLowerCase()}"`, "Phrase", "Enabled"
        ]);
      });
    });
    
    // National Ad Group (no city)
    const nationalAdGroup = "Landelijk";
    const nationalUrl = `${BASE_URL}/?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}_${serviceSlug}_landelijk`;
    
    rows.push([
      "Ad group", "Add", "", campaignName, "", "", "", "",
      nationalAdGroup, "Enabled", maxCpc.toFixed(2), "", "", "", "", "", "", "", "", "", "", "", ""
    ]);
    
    // National ad
    rows.push([
      "Ad", "Add", "", campaignName, "", "", "", "",
      nationalAdGroup, "", "", "Responsive search ad",
      `Spoed ${meta.name} Nederland`,
      "24/7 Beschikbaar",
      "Snel Ter Plaatse",
      meta.descriptions[0],
      meta.descriptions[1],
      nationalUrl, "spoed", serviceSlug, "", "", ""
    ]);
    
    // National keywords - General
    data.general.forEach(kw => {
      rows.push([
        "Keyword", "Add", "", campaignName, "", "", "", "",
        nationalAdGroup, "", "", "", "", "", "", "", "",
        nationalUrl, "", "", `"${kw}"`, "Phrase", "Enabled"
      ]);
      if (kw.includes("spoed") || kw.includes("24")) {
        rows.push([
          "Keyword", "Add", "", campaignName, "", "", "", "",
          nationalAdGroup, "", "", "", "", "", "", "", "",
          nationalUrl, "", "", `[${kw}]`, "Exact", "Enabled"
        ]);
      }
    });
    
    // National keywords - Problems
    data.problems.forEach(problem => {
      rows.push([
        "Keyword", "Add", "", campaignName, "", "", "", "",
        nationalAdGroup, "", "", "", "", "", "", "", "",
        nationalUrl, "", "", `"${problem}"`, "Phrase", "Enabled"
      ]);
    });
  });
  
  // Convert to CSV string
  const csvContent = rows.map(row => 
    row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(",")
  ).join("\n");
  
  return "\ufeff" + csvContent; // BOM for Excel UTF-8
}

export function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export function getKeywordCount(services = ["loodgieter", "slotenmaker", "elektricien"]) {
  let count = 0;
  services.forEach(s => {
    const data = COMPLETE_KEYWORDS[s];
    const cityKeywords = data.cities.length * (10 + 5) * 1.5; // general + problems, phrase + some exact
    const nationalKeywords = (data.general.length + data.problems.length) * 1.5;
    count += cityKeywords + nationalKeywords;
  });
  return Math.round(count);
}

export { COMPLETE_KEYWORDS, SERVICE_META };
