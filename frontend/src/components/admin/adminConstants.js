/**
 * Admin Dashboard - Constants and Helpers
 */

// Campaign templates for marketing
export const campaignTemplates = {
  spoed: {
    name: "Spoed Campagne",
    description: "24/7 spoedservice voor dringende klussen",
    headlines: [
      "🚨 Spoed {service}? Binnen 30 min ter plaatse!",
      "24/7 Spoedservice - {service} Direct Beschikbaar",
      "Noodgeval? Bel Nu - {service} Staat Klaar!"
    ],
    keywords: ["{service} spoed", "nood {service}", "{service} 24 uur", "spoed {service} {city}"]
  },
  lokaal: {
    name: "Lokale Campagne",
    description: "Gerichte campagne voor specifieke steden",
    headlines: [
      "Betrouwbare {service} in {city}",
      "{service} Nodig in {city}? Wij Helpen Direct!",
      "Top {service} {city} - 5★ Beoordeeld"
    ],
    keywords: ["{service} {city}", "beste {service} {city}", "{service} bij mij in de buurt"]
  },
  seizoen: {
    name: "Seizoen Campagne",
    description: "Seizoensgebonden aanbiedingen",
    headlines: [
      "Winterklaar? Laat uw {service} checken!",
      "Voorjaarsactie: 15% Korting op {service}",
      "Zomeronderhoud - {service} Nu Regelen"
    ],
    keywords: ["winter {service}", "voorjaar onderhoud", "{service} actie"]
  }
};

// Dutch cities for marketing
export const nlCities = [
  { name: "Amsterdam", population: 872000 },
  { name: "Rotterdam", population: 651000 },
  { name: "Den Haag", population: 545000 },
  { name: "Utrecht", population: 357000 },
  { name: "Eindhoven", population: 234000 },
  { name: "Tilburg", population: 219000 },
  { name: "Groningen", population: 203000 },
  { name: "Almere", population: 215000 },
  { name: "Breda", population: 184000 },
  { name: "Nijmegen", population: 177000 }
];

// Belgian cities for marketing
export const beCities = [
  { name: "Antwerpen", population: 520000 },
  { name: "Gent", population: 262000 },
  { name: "Brussel", population: 185000 },
  { name: "Charleroi", population: 201000 },
  { name: "Luik", population: 197000 },
  { name: "Brugge", population: 118000 },
  { name: "Namen", population: 111000 },
  { name: "Leuven", population: 101000 },
  { name: "Mechelen", population: 86000 },
  { name: "Aalst", population: 85000 }
];

// Status badge configuration
export const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800", label: "In afwachting" },
  confirmed: { color: "bg-blue-100 text-blue-800", label: "Bevestigd" },
  in_progress: { color: "bg-purple-100 text-purple-800", label: "Bezig" },
  completed: { color: "bg-green-100 text-green-800", label: "Afgerond" },
  cancelled: { color: "bg-red-100 text-red-800", label: "Geannuleerd" }
};

// Service icons
export const getServiceIcon = (serviceType) => {
  const icons = {
    elektricien: "⚡",
    loodgieter: "🔧",
    slotenmaker: "🔐"
  };
  return icons[serviceType] || "🔧";
};

// Get auth headers for API calls
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};
