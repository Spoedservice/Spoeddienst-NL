import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Download, ExternalLink, Search, CheckCircle, MapPin, Zap, Droplets, Key, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

const DUTCH_CITIES = [
  { slug: "amsterdam", name: "Amsterdam", province: "Noord-Holland" },
  { slug: "rotterdam", name: "Rotterdam", province: "Zuid-Holland" },
  { slug: "den-haag", name: "Den Haag", province: "Zuid-Holland" },
  { slug: "utrecht", name: "Utrecht", province: "Utrecht" },
  { slug: "eindhoven", name: "Eindhoven", province: "Noord-Brabant" },
  { slug: "tilburg", name: "Tilburg", province: "Noord-Brabant" },
  { slug: "groningen", name: "Groningen", province: "Groningen" },
  { slug: "almere", name: "Almere", province: "Flevoland" },
  { slug: "breda", name: "Breda", province: "Noord-Brabant" },
  { slug: "nijmegen", name: "Nijmegen", province: "Gelderland" },
  { slug: "enschede", name: "Enschede", province: "Overijssel" },
  { slug: "arnhem", name: "Arnhem", province: "Gelderland" },
  { slug: "haarlem", name: "Haarlem", province: "Noord-Holland" },
  { slug: "amersfoort", name: "Amersfoort", province: "Utrecht" },
  { slug: "zaanstad", name: "Zaanstad", province: "Noord-Holland" },
  { slug: "apeldoorn", name: "Apeldoorn", province: "Gelderland" },
  { slug: "s-hertogenbosch", name: "'s-Hertogenbosch", province: "Noord-Brabant" },
  { slug: "maastricht", name: "Maastricht", province: "Limburg" },
  { slug: "leiden", name: "Leiden", province: "Zuid-Holland" },
  { slug: "dordrecht", name: "Dordrecht", province: "Zuid-Holland" },
  { slug: "zwolle", name: "Zwolle", province: "Overijssel" },
  { slug: "ede", name: "Ede", province: "Gelderland" },
  { slug: "zoetermeer", name: "Zoetermeer", province: "Zuid-Holland" },
  { slug: "leeuwarden", name: "Leeuwarden", province: "Friesland" },
  { slug: "alkmaar", name: "Alkmaar", province: "Noord-Holland" },
  { slug: "delft", name: "Delft", province: "Zuid-Holland" },
  { slug: "venlo", name: "Venlo", province: "Limburg" },
  { slug: "deventer", name: "Deventer", province: "Overijssel" },
  { slug: "helmond", name: "Helmond", province: "Noord-Brabant" },
  { slug: "hengelo", name: "Hengelo", province: "Overijssel" },
  { slug: "gouda", name: "Gouda", province: "Zuid-Holland" },
  { slug: "hilversum", name: "Hilversum", province: "Noord-Holland" },
  { slug: "purmerend", name: "Purmerend", province: "Noord-Holland" },
  { slug: "vlaardingen", name: "Vlaardingen", province: "Zuid-Holland" },
  { slug: "roosendaal", name: "Roosendaal", province: "Noord-Brabant" },
  { slug: "hoorn", name: "Hoorn", province: "Noord-Holland" },
  { slug: "assen", name: "Assen", province: "Drenthe" },
  { slug: "middelburg", name: "Middelburg", province: "Zeeland" },
  { slug: "emmen", name: "Emmen", province: "Drenthe" },
  { slug: "den-bosch", name: "Den Bosch", province: "Noord-Brabant" },
];

const SERVICES = [
  { slug: "loodgieter", name: "Loodgieter", icon: Droplets, color: "text-blue-500", bgColor: "bg-blue-100" },
  { slug: "slotenmaker", name: "Slotenmaker", icon: Key, color: "text-amber-500", bgColor: "bg-amber-100" },
  { slug: "elektricien", name: "Elektricien", icon: Zap, color: "text-yellow-500", bgColor: "bg-yellow-100" },
];

const SERVICE_KEYWORDS = {
  loodgieter: [
    "spoed loodgieter", "loodgieter", "loodgieter 24/7", "24 uurs loodgieter",
    "lekkage", "wc verstopt", "riool verstopt", "afvoer verstopt"
  ],
  slotenmaker: [
    "spoed slotenmaker", "slotenmaker", "slotenmaker 24/7", "24 uurs slotenmaker",
    "buitengesloten", "slot vervangen", "deur openen", "sleutel kwijt"
  ],
  elektricien: [
    "spoed elektricien", "elektricien", "elektricien 24/7", "24 uurs elektricien",
    "stroomstoring", "kortsluiting", "geen stroom", "groepenkast"
  ]
};

const BASE_URL = "https://spoeddienst24.nl";

export default function CityPagesOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [utmSource, setUtmSource] = useState("google");
  const [utmMedium, setUtmMedium] = useState("cpc");
  const [utmCampaign, setUtmCampaign] = useState("spoed");
  const [dailyBudget, setDailyBudget] = useState("50");

  const provinces = [...new Set(DUTCH_CITIES.map(c => c.province))].sort();

  const filteredCities = DUTCH_CITIES.filter(city => {
    const matchesSearch = city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         city.province.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvince = selectedProvince === "all" || city.province === selectedProvince;
    return matchesSearch && matchesProvince;
  });

  const getFullUrl = (service, city, withUtm = false) => {
    const baseUrl = `${BASE_URL}/spoed-${service}/${city}`;
    if (withUtm) {
      return `${baseUrl}?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}_${service}_${city}`;
    }
    return baseUrl;
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    toast.success("URL gekopieerd!");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const copyAllUrls = (withUtm = false) => {
    const services = selectedService === "all" ? SERVICES.map(s => s.slug) : [selectedService];
    const urls = [];
    
    services.forEach(service => {
      filteredCities.forEach(city => {
        urls.push(getFullUrl(service, city.slug, withUtm));
      });
    });
    
    navigator.clipboard.writeText(urls.join("\n"));
    toast.success(`${urls.length} URLs gekopieerd!`);
  };

  // Google Ads Editor Complete CSV Export
  const downloadGoogleAdsEditorCSV = () => {
    const services = selectedService === "all" ? SERVICES : SERVICES.filter(s => s.slug === selectedService);
    const rows = [];
    
    // Header row for Google Ads Editor
    rows.push([
      "Row Type",
      "Action", 
      "Campaign status",
      "Campaign",
      "Campaign type",
      "Networks",
      "Budget",
      "Budget type",
      "Ad group",
      "Ad group status",
      "Max CPC",
      "Ad type",
      "Headline 1",
      "Headline 2", 
      "Headline 3",
      "Description 1",
      "Description 2",
      "Final URL",
      "Path 1",
      "Path 2",
      "Keyword",
      "Match type",
      "Keyword status"
    ]);
    
    services.forEach(service => {
      const campaignName = `Spoed ${service.name} NL`;
      
      // Campaign row
      rows.push([
        "Campaign",
        "Add",
        "Enabled",
        campaignName,
        "Search",
        "Google search",
        dailyBudget,
        "Daily",
        "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
      ]);
      
      filteredCities.forEach(city => {
        const adGroupName = city.name;
        const finalUrl = getFullUrl(service.slug, city.slug, true);
        const keywords = SERVICE_KEYWORDS[service.slug] || [];
        
        // Ad Group row
        rows.push([
          "Ad group",
          "Add",
          "",
          campaignName,
          "",
          "",
          "",
          "",
          adGroupName,
          "Enabled",
          "2.00",
          "", "", "", "", "", "", "", "", "", "", "", ""
        ]);
        
        // Responsive Search Ad row
        rows.push([
          "Ad",
          "Add",
          "",
          campaignName,
          "",
          "",
          "",
          "",
          adGroupName,
          "",
          "",
          "Responsive search ad",
          `Spoed ${service.name} ${city.name}`,
          "24/7 Beschikbaar",
          "Binnen 30 Min Ter Plaatse",
          `Direct een spoed ${service.name.toLowerCase()} nodig in ${city.name}? Wij zijn 24/7 bereikbaar. Bel nu!`,
          `Professionele ${service.name.toLowerCase()}s in ${city.name}. Snel ter plaatse, vaste prijzen.`,
          finalUrl,
          "spoed",
          service.slug,
          "", "", ""
        ]);
        
        // Keyword rows
        keywords.forEach(baseKeyword => {
          const keyword = `${baseKeyword} ${city.name.toLowerCase()}`;
          
          // Phrase match
          rows.push([
            "Keyword",
            "Add",
            "",
            campaignName,
            "",
            "",
            "",
            "",
            adGroupName,
            "",
            "",
            "",
            "", "", "", "", "",
            finalUrl,
            "", "",
            `"${keyword}"`,
            "Phrase",
            "Enabled"
          ]);
          
          // Exact match for main keywords
          if (baseKeyword.includes("spoed") || baseKeyword === service.slug) {
            rows.push([
              "Keyword",
              "Add",
              "",
              campaignName,
              "",
              "",
              "",
              "",
              adGroupName,
              "",
              "",
              "",
              "", "", "", "", "",
              finalUrl,
              "", "",
              `[${keyword}]`,
              "Exact",
              "Enabled"
            ]);
          }
        });
      });
    });
    
    const csvContent = rows.map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `spoeddienst24_google_ads_editor_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("Google Ads Editor CSV gedownload! Importeer in Google Ads Editor.");
  };

  // Simple CSV for reference
  const downloadSimpleCSV = () => {
    const services = selectedService === "all" ? SERVICES.map(s => s.slug) : [selectedService];
    const rows = [["Service", "Stad", "Provincie", "URL", "URL met UTM", "Headline 1", "Headline 2", "Description"]];
    
    services.forEach(service => {
      const serviceName = SERVICES.find(s => s.slug === service)?.name || service;
      filteredCities.forEach(city => {
        rows.push([
          serviceName,
          city.name,
          city.province,
          getFullUrl(service, city.slug, false),
          getFullUrl(service, city.slug, true),
          `Spoed ${serviceName} ${city.name}`,
          `24/7 Beschikbaar - Snel Ter Plaatse`,
          `Direct een spoed ${serviceName.toLowerCase()} nodig in ${city.name}? Wij zijn 24/7 bereikbaar. Binnen 30 min ter plaatse. Bel nu!`
        ]);
      });
    });
    
    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `spoeddienst24_overzicht_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("Overzicht CSV gedownload!");
  };

  const totalPages = selectedService === "all" 
    ? filteredCities.length * 3 
    : filteredCities.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">City Pagina's voor Google Ads</h2>
          <p className="text-slate-500">
            {totalPages} landing pages klaar voor je campagnes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => copyAllUrls(true)}>
            <Copy className="w-4 h-4 mr-2" />
            Kopieer URLs
          </Button>
          <Button variant="outline" onClick={downloadSimpleCSV}>
            <Download className="w-4 h-4 mr-2" />
            Overzicht CSV
          </Button>
          <Button onClick={downloadGoogleAdsEditorCSV} className="bg-[#4285F4] hover:bg-[#3367D6] text-white">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Google Ads Editor CSV
          </Button>
        </div>
      </div>

      {/* Google Ads Editor Info */}
      <Card className="border-[#4285F4] bg-blue-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-[#4285F4] mb-2">📥 Google Ads Editor Import</h3>
          <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
            <li>Download de <strong>Google Ads Editor CSV</strong></li>
            <li>Open <strong>Google Ads Editor</strong> (gratis te downloaden van Google)</li>
            <li>Ga naar <strong>Account → Import → From file</strong></li>
            <li>Selecteer het gedownloade CSV bestand</li>
            <li>Controleer de preview en klik <strong>Post changes</strong></li>
          </ol>
          <p className="text-xs text-slate-500 mt-2">
            Dit maakt automatisch: {selectedService === "all" ? "3 campagnes" : "1 campagne"} met {filteredCities.length} ad groups, ads en keywords per campagne.
          </p>
        </CardContent>
      </Card>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* UTM Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">UTM Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">source</label>
                <Input 
                  value={utmSource} 
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="google"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">medium</label>
                <Input 
                  value={utmMedium} 
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="cpc"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">campaign</label>
                <Input 
                  value={utmCampaign} 
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="spoed"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Campagne Instellingen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Dagbudget (€)</label>
                <Input 
                  type="number"
                  value={dailyBudget} 
                  onChange={(e) => setDailyBudget(e.target.value)}
                  placeholder="50"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Max CPC</label>
                <Input 
                  value="€2.00"
                  disabled
                  className="h-8 text-sm bg-slate-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Zoek stad of provincie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedService} onValueChange={setSelectedService}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle services</SelectItem>
            {SERVICES.map(service => (
              <SelectItem key={service.slug} value={service.slug}>{service.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedProvince} onValueChange={setSelectedProvince}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Provincie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle provincies</SelectItem>
            {provinces.map(province => (
              <SelectItem key={province} value={province}>{province}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats per service */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SERVICES.map(service => {
          const ServiceIcon = service.icon;
          const isActive = selectedService === "all" || selectedService === service.slug;
          const keywordCount = (SERVICE_KEYWORDS[service.slug]?.length || 0) * filteredCities.length * 1.5;
          return (
            <Card 
              key={service.slug} 
              className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-[#FF4500]' : 'opacity-60'}`}
              onClick={() => setSelectedService(selectedService === service.slug ? "all" : service.slug)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${service.bgColor} rounded-lg flex items-center justify-center`}>
                    <ServiceIcon className={`w-5 h-5 ${service.color}`} />
                  </div>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-slate-500">
                      {filteredCities.length} steden • ~{Math.round(keywordCount)} keywords
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* City list */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredCities.map(city => {
          const servicesToShow = selectedService === "all" ? SERVICES : SERVICES.filter(s => s.slug === selectedService);
          
          return (
            <Card key={city.slug}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium">{city.name}</p>
                      <p className="text-sm text-slate-500">{city.province}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {servicesToShow.map(service => {
                      const ServiceIcon = service.icon;
                      const urlId = `${service.slug}-${city.slug}`;
                      const url = getFullUrl(service.slug, city.slug, true);
                      
                      return (
                        <div key={service.slug} className="flex items-center gap-1">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <ServiceIcon className={`w-3 h-3 ${service.color}`} />
                            {service.name}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => copyToClipboard(url, urlId)}
                          >
                            {copiedUrl === urlId ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-400" />
                            )}
                          </Button>
                          <a
                            href={getFullUrl(service.slug, city.slug, false)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-7 w-7 p-0 inline-flex items-center justify-center hover:bg-slate-100 rounded"
                          >
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCities.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Geen steden gevonden</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
