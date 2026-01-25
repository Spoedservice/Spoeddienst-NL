import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Download, ExternalLink, Search, CheckCircle, MapPin, Zap, Droplets, Key } from "lucide-react";
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

const BASE_URL = "https://spoeddienst24.nl";

export default function CityPagesOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [utmSource, setUtmSource] = useState("google");
  const [utmMedium, setUtmMedium] = useState("cpc");
  const [utmCampaign, setUtmCampaign] = useState("spoed_campagne");

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

  const downloadCSV = () => {
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
    link.download = `spoeddienst24_city_pages_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("CSV gedownload!");
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => copyAllUrls(false)}>
            <Copy className="w-4 h-4 mr-2" />
            Kopieer URLs
          </Button>
          <Button variant="outline" onClick={() => copyAllUrls(true)}>
            <Copy className="w-4 h-4 mr-2" />
            Met UTM
          </Button>
          <Button onClick={downloadCSV} className="bg-[#FF4500] hover:bg-[#CC3700]">
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* UTM Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">UTM Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-500 mb-1 block">utm_source</label>
              <Input 
                value={utmSource} 
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="google"
              />
            </div>
            <div>
              <label className="text-sm text-slate-500 mb-1 block">utm_medium</label>
              <Input 
                value={utmMedium} 
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="cpc"
              />
            </div>
            <div>
              <label className="text-sm text-slate-500 mb-1 block">utm_campaign</label>
              <Input 
                value={utmCampaign} 
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="spoed_campagne"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Voorbeeld URL: {getFullUrl("loodgieter", "amsterdam", true)}
          </p>
        </CardContent>
      </Card>

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
                    <p className="text-sm text-slate-500">{filteredCities.length} steden</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* City list */}
      <div className="space-y-2">
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
