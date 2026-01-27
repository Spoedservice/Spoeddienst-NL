import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Droplet, Key, Phone, Clock, Shield, Star, 
  MapPin, CheckCircle, ArrowRight
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

const SERVICE_DETAILS = {
  loodgieter: {
    heroText: "Waterlekkage? Verstopt toilet? Onze loodgieters staan 24/7 voor u klaar in heel Vlaanderen en Brussel.",
    problems: [
      "Waterlekkage en lekke kranen",
      "Verstopte afvoer of toilet",
      "Kapotte cv-ketel of boiler",
      "Bevroren leidingen",
      "Rioolproblemen",
      "Sanitair installatie"
    ],
    urgentProblems: ["Lekkage", "Verstopping", "Geen warm water"]
  },
  slotenmaker: {
    heroText: "Buitengesloten? Slot kapot? Onze slotenmakers openen uw deur binnen 20 minuten, 24/7 in België.",
    problems: [
      "Buitengesloten - deur openen",
      "Slot vervangen of bijmaken",
      "Inbraakschade herstellen",
      "Sleutel afgebroken in slot",
      "Cilinderslot upgraden",
      "Meerpuntssluitingen"
    ],
    urgentProblems: ["Buitengesloten", "Inbraak", "Sleutel kwijt"]
  },
  elektricien: {
    heroText: "Stroomstoring? Kortsluiting? Onze elektriciens zijn 24/7 beschikbaar in heel België.",
    problems: [
      "Stroomstoring oplossen",
      "Kortsluiting verhelpen",
      "Zekeringkast/differentieel",
      "Stopcontacten & schakelaars",
      "Verlichting installatie",
      "Elektrische keuring"
    ],
    urgentProblems: ["Stroomstoring", "Kortsluiting", "Vonken"]
  }
};

export default function BelgianServicePage() {
  const { serviceSlug } = useParams();
  
  const service = BELGIAN_SERVICES.find(s => s.slug === serviceSlug);
  const details = SERVICE_DETAILS[serviceSlug];
  
  if (!service || !details) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Dienst niet gevonden</h1>
          <Link to={beRoute("/")} className="text-[#FF4500] hover:underline">Terug naar home</Link>
        </div>
      </div>
    );
  }

  const Icon = SERVICE_ICONS[serviceSlug] || Zap;
  const colorClass = SERVICE_COLORS[serviceSlug] || "from-orange-500 to-orange-600";
  
  // Get major cities per province for this service
  const citiesByProvince = {};
  BELGIAN_CITIES.forEach(city => {
    if (!citiesByProvince[city.province]) {
      citiesByProvince[city.province] = [];
    }
    citiesByProvince[city.province].push(city);
  });

  const pageTitle = `Spoed ${service.name} België | 24/7 Beschikbaar | SpoedDienst24.be`;
  const pageDescription = `Zoekt u een spoed ${service.name.toLowerCase()} in België? 24/7 beschikbaar in Antwerpen, Brussel, Gent, Brugge, Leuven en heel Vlaanderen. Binnen 30 minuten ter plaatse!`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`https://spoeddienst24.be/be/dienst/${serviceSlug}`} />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to={beRoute("/")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF4500] to-[#CC3700] rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">SpoedDienst24<span className="text-[#FF4500]">.be</span></span>
            </Link>
            
            <a 
              href={`tel:${BE_CONFIG.contact.phone}`}
              className="flex items-center gap-2 bg-[#FF4500] text-white px-4 py-2 rounded-full font-bold hover:bg-[#CC3700]"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{BE_CONFIG.contact.phoneDisplay}</span>
            </a>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-2 text-sm text-slate-500">
            <Link to={beRoute("/")} className="hover:text-[#FF4500]">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">{service.name}</span>
          </div>
        </div>

        {/* Hero */}
        <section className={`bg-gradient-to-br ${colorClass} text-white py-16`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  24/7 Beschikbaar in heel België
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-black mb-4">
                  Spoed {service.name} België
                </h1>
                
                <p className="text-xl text-white/90 mb-6">
                  {details.heroText}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {details.urgentProblems.map(problem => (
                    <Badge key={problem} className="bg-white/20 text-white border-white/30 px-4 py-1">
                      {problem}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href={`tel:${BE_CONFIG.contact.phone}`}
                    className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-slate-100"
                  >
                    <Phone className="w-5 h-5" />
                    Bel Direct: {BE_CONFIG.contact.phoneDisplay}
                  </a>
                  <Link 
                    to={`/be/boek?service=${serviceSlug}`}
                    className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-slate-800"
                  >
                    Online Boeken
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
              
              <div className="w-40 h-40 bg-white/10 rounded-3xl flex items-center justify-center">
                <Icon className="w-24 h-24 text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* What we solve */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Waar helpen onze {service.name.toLowerCase()}s bij?
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {details.problems.map(problem => (
                <Card key={problem} className="hover:border-[#FF4500] transition-colors">
                  <CardContent className="p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">{problem}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust indicators */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FF4500] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-lg">30 minuten</p>
                <p className="text-sm text-slate-500">Ter plaatse</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FF4500] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-lg">Gecertificeerd</p>
                <p className="text-sm text-slate-500">Erkende vakmannen</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FF4500] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-lg">4.9/5</p>
                <p className="text-sm text-slate-500">Klanttevredenheid</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FF4500] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <p className="font-bold text-lg">24/7</p>
                <p className="text-sm text-slate-500">Altijd bereikbaar</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cities by Province */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
              {service.name} per regio
            </h2>
            <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
              Onze {service.name.toLowerCase()}s zijn actief in heel Vlaanderen en Brussel
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(citiesByProvince).map(([province, cities]) => (
                <Card key={province} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#FF4500]" />
                      {province}
                    </h3>
                    <div className="space-y-2">
                      {cities.slice(0, 5).map(city => (
                        <Link
                          key={city.slug}
                          to={`/be/spoed-${serviceSlug}/${city.slug}`}
                          className="block text-sm text-slate-600 hover:text-[#FF4500] transition-colors"
                        >
                          {service.name} {city.name} →
                        </Link>
                      ))}
                      {cities.length > 5 && (
                        <p className="text-xs text-slate-400 mt-2">
                          + {cities.length - 5} meer steden
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-[#FF4500] to-[#CC3700]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {service.name} nodig in België?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Bel nu voor directe hulp of boek online
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={`tel:${BE_CONFIG.contact.phone}`}
                className="inline-flex items-center justify-center gap-2 bg-white text-[#FF4500] px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-100"
              >
                <Phone className="w-6 h-6" />
                {BE_CONFIG.contact.phoneDisplay}
              </a>
              <Link 
                to={`/be/boek?service=${serviceSlug}`}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800"
              >
                Online Boeken
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Link to={beRoute("/")} className="text-slate-400 hover:text-white text-sm">
              ← Terug naar SpoedDienst24.be
            </Link>
            <p className="text-slate-500 text-sm mt-4">
              © 2024 SpoedDienst24.be - 24/7 {service.name} in heel België
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
