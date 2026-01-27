import { useParams, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
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

export default function BelgianCityServicePage() {
  const { citySlug } = useParams();
  const location = useLocation();
  
  // Extract service from URL path (e.g., /be/spoed-loodgieter/antwerpen -> loodgieter)
  const pathParts = location.pathname.split('/');
  const servicePathPart = pathParts[2] || ''; // e.g., "spoed-loodgieter"
  const serviceSlug = servicePathPart.replace('spoed-', ''); // e.g., "loodgieter"
  
  const city = BELGIAN_CITIES.find(c => c.slug === citySlug);
  const service = BELGIAN_SERVICES.find(s => s.slug === serviceSlug);
  
  if (!city || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Pagina niet gevonden</h1>
          <Link to={beRoute("/")} className="text-[#FF4500] hover:underline">Terug naar home</Link>
        </div>
      </div>
    );
  }

  const Icon = SERVICE_ICONS[serviceSlug] || Zap;
  const pageTitle = `Spoed ${service.name} ${city.name} | 24/7 Beschikbaar | SpoedDienst24.be`;
  const pageDescription = `Zoekt u een spoed ${service.name.toLowerCase()} in ${city.name}? Onze vakmannen zijn 24/7 beschikbaar en binnen 30 minuten ter plaatse. ✓ Vaste prijzen ✓ Gecertificeerd`;

  // Get nearby cities
  const nearbyCities = BELGIAN_CITIES
    .filter(c => c.province === city.province && c.slug !== citySlug)
    .slice(0, 6);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <link rel="canonical" href={`https://spoeddienst24.be/spoed-${serviceSlug}/${citySlug}`} />
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
            <Link to={beRoute(`/dienst/${serviceSlug}`)} className="hover:text-[#FF4500]">{service.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">{city.name}</span>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <Badge className="bg-[#FF4500] mb-4">
                  <MapPin className="w-3 h-3 mr-1" />
                  {city.name}, {city.province}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-black mb-4">
                  Spoed {service.name} in {city.name}
                </h1>
                
                <p className="text-xl text-slate-300 mb-6">
                  24/7 beschikbaar • Binnen 30 minuten ter plaatse • Vaste prijzen
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href={`tel:${BE_CONFIG.contact.phone}`}
                    className="inline-flex items-center justify-center gap-2 bg-[#FF4500] text-white px-6 py-3 rounded-full font-bold hover:bg-[#CC3700]"
                  >
                    <Phone className="w-5 h-5" />
                    Bel Direct: {BE_CONFIG.contact.phoneDisplay}
                  </a>
                  <Link 
                    to={beRoute(`/boek?service=${serviceSlug}&city=${citySlug}`)}
                    className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-slate-100"
                  >
                    Online Boeken
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
              
              <div className="w-32 h-32 bg-white/10 rounded-3xl flex items-center justify-center">
                <Icon className="w-20 h-20 text-[#FF4500]" />
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2 space-y-8">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                      24/7 {service.name} in {city.name}
                    </h2>
                    <div className="prose text-slate-600">
                      <p>
                        Heeft u snel een {service.name.toLowerCase()} nodig in {city.name} of omgeving? 
                        SpoedDienst24.be staat dag en nacht voor u klaar met gecertificeerde vakmannen.
                      </p>
                      
                      <h3 className="text-lg font-bold text-slate-900 mt-6 mb-3">
                        Onze service in {city.name}:
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>Binnen 30 minuten ter plaatse in {city.name}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>24/7 beschikbaar, ook in het weekend</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>Vaste, transparante tarieven</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>Ervaren en gecertificeerde {service.name.toLowerCase()}s</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span>Wij werken in heel {city.province}</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Trust Signals */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="text-center p-4">
                    <Clock className="w-8 h-8 text-[#FF4500] mx-auto mb-2" />
                    <p className="font-bold">30 min</p>
                    <p className="text-xs text-slate-500">Ter plaatse</p>
                  </Card>
                  <Card className="text-center p-4">
                    <Shield className="w-8 h-8 text-[#FF4500] mx-auto mb-2" />
                    <p className="font-bold">Gecertificeerd</p>
                    <p className="text-xs text-slate-500">Vakmannen</p>
                  </Card>
                  <Card className="text-center p-4">
                    <Star className="w-8 h-8 text-[#FF4500] mx-auto mb-2" />
                    <p className="font-bold">4.9/5</p>
                    <p className="text-xs text-slate-500">Beoordeling</p>
                  </Card>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* CTA Card */}
                <Card className="bg-[#FF4500] text-white">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">Spoed in {city.name}?</h3>
                    <p className="text-white/90 mb-4">Wij zijn 24/7 bereikbaar</p>
                    <a 
                      href={`tel:${BE_CONFIG.contact.phone}`}
                      className="block w-full bg-white text-[#FF4500] py-3 rounded-lg font-bold hover:bg-slate-100"
                    >
                      {BE_CONFIG.contact.phoneDisplay}
                    </a>
                  </CardContent>
                </Card>

                {/* Nearby Cities */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-slate-900 mb-4">
                      Ook actief in {city.province}
                    </h3>
                    <div className="space-y-2">
                      {nearbyCities.map(nearbyCity => (
                        <Link 
                          key={nearbyCity.slug}
                          to={beRoute(`/spoed-${serviceSlug}/${nearbyCity.slug}`)}
                          className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#FF4500]"
                        >
                          <MapPin className="w-4 h-4" />
                          {service.name} {nearbyCity.name}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-400 text-sm">
              © 2024 SpoedDienst24.be - 24/7 {service.name} in {city.name} en heel België
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
