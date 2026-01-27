import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Droplet, Key, Phone, Clock, Shield, Star, 
  MapPin, CheckCircle, ChevronRight, ArrowRight
} from "lucide-react";
import { BE_CONFIG, BELGIAN_CITIES, BELGIAN_SERVICES, beRoute } from "@/config/belgiumConfig";

const SERVICE_ICONS = {
  loodgieter: Droplet,
  slotenmaker: Key,
  elektricien: Zap
};

const SERVICE_COLORS = {
  loodgieter: "from-blue-500 to-blue-600",
  slotenmaker: "from-amber-500 to-amber-600",
  elektricien: "from-yellow-400 to-yellow-500"
};

export default function BelgianLandingPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);

  const mainCities = BELGIAN_CITIES.filter(c => c.isCapital);
  const popularSearches = [
    "spoed loodgieter Antwerpen",
    "slotenmaker Gent 24/7",
    "elektricien Brugge",
    "buitengesloten Leuven",
    "lekkage spoed Mechelen",
    "stroomstoring Hasselt"
  ];

  return (
    <>
      <Helmet>
        <title>24/7 Spoed Loodgieter, Slotenmaker & Elektricien België | SpoedDienst24.be</title>
        <meta name="description" content={BE_CONFIG.seo.description} />
        <meta property="og:title" content="SpoedDienst24.be - 24/7 Vakmannen in België" />
        <meta property="og:description" content={BE_CONFIG.seo.description} />
        <link rel="canonical" href="https://spoeddienst24.be" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to={beRoute("/")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF4500] to-[#CC3700] rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-slate-900">SpoedDienst24<span className="text-[#FF4500]">.be</span></h1>
                <p className="text-xs text-slate-500">24/7 Vakmannen in België</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              {/* Country Switcher */}
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Link to="/" className="px-2 py-1 rounded hover:bg-slate-100">🇳🇱 NL</Link>
                <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 font-medium">🇧🇪 BE</span>
              </div>
              
              <a 
                href={`tel:${BE_CONFIG.contact.phone}`}
                className="flex items-center gap-2 bg-[#FF4500] text-white px-4 py-2 rounded-full font-bold hover:bg-[#CC3700] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">{BE_CONFIG.contact.phoneDisplay}</span>
                <span className="sm:hidden">Bel Nu</span>
              </a>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-[#FF4500] rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
            <div className="text-center max-w-4xl mx-auto">
              {/* Belgian Badge */}
              <Badge className="bg-black/20 text-white border-white/20 mb-6 px-4 py-1">
                🇧🇪 Actief in heel Vlaanderen
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                24/7 Spoed Loodgieter,<br />
                <span className="text-[#FF4500]">Slotenmaker & Elektricien</span><br />
                in België
              </h1>
              
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Vakmannen binnen 30 minuten aan uw deur in Antwerpen, Gent, Brugge, Leuven en heel Vlaanderen. 
                Vaste prijzen, geen verrassingen.
              </p>

              {/* Service Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                {BELGIAN_SERVICES.map(service => {
                  const Icon = SERVICE_ICONS[service.slug];
                  return (
                    <Link
                      key={service.slug}
                      to={beRoute(`/dienst/${service.slug}`)}
                      className={`group p-6 rounded-2xl bg-gradient-to-br ${SERVICE_COLORS[service.slug]} text-white hover:scale-105 transition-all duration-300 shadow-lg`}
                    >
                      <Icon className="w-12 h-12 mb-3 mx-auto" />
                      <h3 className="text-xl font-bold">{service.name}</h3>
                      <p className="text-sm opacity-90 mt-1">24/7 beschikbaar</p>
                      <ArrowRight className="w-5 h-5 mx-auto mt-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  );
                })}
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#FF4500]" />
                  <span>Binnen 30 min ter plaatse</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#FF4500]" />
                  <span>Gecertificeerde vakmannen</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#FF4500]" />
                  <span>4.9/5 klanttevredenheid</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Cities Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Actief in heel Vlaanderen
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Onze vakmannen staan paraat in alle grote Vlaamse steden en gemeenten
              </p>
            </div>

            {/* Province Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
              {["Antwerpen", "Brussels Hoofdstedelijk Gewest", "Oost-Vlaanderen", "West-Vlaanderen", "Vlaams-Brabant", "Limburg"].map(province => {
                const provinceCities = BELGIAN_CITIES.filter(c => c.province === province);
                const displayName = province === "Brussels Hoofdstedelijk Gewest" ? "Brussel" : province;
                return (
                  <Card key={province} className="border-2 hover:border-[#FF4500] transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-slate-900 mb-2 text-sm">{displayName}</h3>
                      <p className="text-2xl font-bold text-[#FF4500]">{provinceCities.length}</p>
                      <p className="text-xs text-slate-500">steden</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Popular Cities */}
            <div className="flex flex-wrap justify-center gap-2">
              {BELGIAN_CITIES.slice(0, 20).map(city => (
                <Link
                  key={city.slug}
                  to={`/be/spoed-loodgieter/${city.slug}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-[#FF4500] hover:text-white rounded-full text-sm transition-colors"
                >
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Belgian Version */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Hoe werkt het?
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: 1, title: "Bel of boek online", desc: "Bel ons nummer of boek direct via de website" },
                { step: 2, title: "Wij komen direct", desc: "Een vakman is binnen 30 minuten bij u" },
                { step: 3, title: "Probleem opgelost", desc: "Professionele service met vaste prijzen" },
                { step: 4, title: "Betaal achteraf", desc: "Betaal pas na goedkeuring van het werk" }
              ].map(item => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Searches */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">
              Populaire zoekopdrachten in België
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {popularSearches.map((search, idx) => (
                <Badge key={idx} variant="outline" className="px-4 py-2 cursor-pointer hover:bg-slate-100">
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#FF4500] to-[#CC3700]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Spoed in België? Wij helpen direct!
            </h2>
            <p className="text-xl text-white/90 mb-8">
              24/7 beschikbaar in Antwerpen, Gent, Brugge, Leuven en heel Vlaanderen
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={`tel:${BE_CONFIG.contact.phone}`}
                className="inline-flex items-center justify-center gap-2 bg-white text-[#FF4500] px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-100 transition-colors"
              >
                <Phone className="w-6 h-6" />
                {BE_CONFIG.contact.phoneDisplay}
              </a>
              <Link 
                to="/be/boek"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-colors"
              >
                Online Boeken
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-[#FF4500] rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-xl">SpoedDienst24.be</span>
                </div>
                <p className="text-slate-400 text-sm">
                  24/7 spoeddiensten voor loodgieter, slotenmaker en elektricien in heel België.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Diensten</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><Link to="/be/dienst/loodgieter" className="hover:text-white">Loodgieter</Link></li>
                  <li><Link to="/be/dienst/slotenmaker" className="hover:text-white">Slotenmaker</Link></li>
                  <li><Link to="/be/dienst/elektricien" className="hover:text-white">Elektricien</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Steden</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  {mainCities.map(city => (
                    <li key={city.slug}>
                      <Link to={`/be/spoed-loodgieter/${city.slug}`} className="hover:text-white">{city.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Contact België</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${BE_CONFIG.contact.phone}`} className="hover:text-white">{BE_CONFIG.contact.phoneDisplay}</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>✉️</span>
                    <a href={`mailto:${BE_CONFIG.contact.email}`} className="hover:text-white">{BE_CONFIG.contact.email}</a>
                  </li>
                </ul>
                
                {/* Country Switcher in Footer */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-500 mb-2">Land wijzigen:</p>
                  <div className="flex gap-2">
                    <Link to="/" className="px-3 py-1 bg-slate-800 rounded text-sm hover:bg-slate-700">🇳🇱 Nederland</Link>
                    <span className="px-3 py-1 bg-[#FF4500] rounded text-sm">🇧🇪 België</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
              <p>© 2024 SpoedDienst24.be - Alle rechten voorbehouden | 24/7 Vakmannen in België</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
