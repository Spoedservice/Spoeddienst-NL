import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Droplets, Key, Phone, Clock, Shield, Star, CheckCircle, ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { Helmet } from "react-helmet-async";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = {
  elektricien: Zap,
  loodgieter: Droplets,
  slotenmaker: Key
};

export default function CityServicePage() {
  const { city } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract service from URL path (e.g., /spoed-loodgieter/amsterdam -> loodgieter)
  const service = location.pathname.split('/')[1].replace('spoed-', '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API}/seo/cities/${city}/${service}`);
        setPageData(response.data);
      } catch (error) {
        console.error("Error fetching city page:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [city, service]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#FF4500] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading font-bold text-2xl text-slate-900 mb-4">Pagina niet gevonden</h1>
          <Link to="/">
            <Button>Terug naar home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const ServiceIcon = iconMap[service] || Zap;

  return (
    <>
      <Helmet>
        <title>{pageData.meta_title}</title>
        <meta name="description" content={pageData.meta_description} />
        <meta name="keywords" content={`spoed ${service} ${pageData.city.name}, ${service} 24/7 ${pageData.city.name}, ${service} nooddienst ${pageData.city.name}`} />
        <link rel="canonical" href={`https://spoeddienst24.nl/spoed-${service}/${city}/`} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-lg">SpoedDienst24</span>
            </Link>
            <a href="tel:085 333 2847" className="flex items-center gap-2 bg-[#FF4500] text-white px-4 py-2 rounded-md font-medium hover:bg-[#CC3700] transition-colors">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">085 333 2847</span>
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4" />
              <span>Terug naar home</span>
            </Link>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-[#FF4500] rounded-xl flex items-center justify-center flex-shrink-0">
                <ServiceIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-[#FF4500] text-white">24/7 Spoed</Badge>
                  <Badge variant="outline" className="text-white border-white/30">
                    <MapPin className="w-3 h-3 mr-1" />
                    {pageData.city.name}
                  </Badge>
                </div>
                <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl mb-4">
                  {pageData.h1}
                </h1>
                <p className="text-xl text-white/80 max-w-2xl">
                  {pageData.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <a href="tel:085 333 2847" className="inline-flex items-center justify-center gap-2 bg-[#FF4500] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#CC3700] transition-colors">
                <Phone className="w-5 h-5" />
                Bel Nu: 085 333 2847
              </a>
              <Button 
                onClick={() => navigate(`/boek/${service}?emergency=true&city=${pageData.city.name}`)}
                className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 h-auto font-bold text-lg"
              >
                Direct Boeken in {pageData.city.name}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Location info */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 mb-6">
                  Spoed {pageData.service.name} in {pageData.city.name}
                </h2>
                <p className="text-slate-600 mb-6">
                  Heeft u direct een {pageData.service.name.toLowerCase()} nodig in {pageData.city.name} of omgeving? 
                  SpoedDienst24 is 24/7 bereikbaar voor {pageData.service.description}. 
                  Onze vakmannen zijn snel ter plaatse in {pageData.city.name}, {pageData.city.province}.
                </p>
                <ul className="space-y-3">
                  {pageData.service.problems.map((problem, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-700">{problem}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Card className="border-2 border-[#FF4500]">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <MapPin className="w-12 h-12 text-[#FF4500] mx-auto mb-2" />
                    <h3 className="font-heading font-bold text-xl">{pageData.city.name}</h3>
                    <p className="text-slate-500">{pageData.city.province}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Reactietijd</span>
                      <span className="font-bold text-[#FF4500]">~15 min</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Beschikbaarheid</span>
                      <span className="font-bold text-green-600">24/7</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Werkgebied</span>
                      <span className="font-bold">{pageData.city.name} + 20km</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 mb-8 text-center">
              Waarom kiezen voor SpoedDienst24 in {pageData.city.name}?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FF4500]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-[#FF4500]" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">Snel in {pageData.city.name}</h3>
                <p className="text-slate-600">Onze vakmannen kennen {pageData.city.name} en zijn snel ter plaatse</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FF4500]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-[#FF4500]" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">Lokale experts</h3>
                <p className="text-slate-600">Ervaren {pageData.service.name.toLowerCase()}s uit {pageData.city.province}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FF4500]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[#FF4500]" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">Betrouwbaar</h3>
                <p className="text-slate-600">Gecertificeerd en verzekerd, garantie op alle werkzaamheden</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FF4500]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white mb-4">
              {pageData.service.name} nodig in {pageData.city.name}?
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Bel direct of boek online - wij zijn 24/7 bereikbaar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:085 333 2847" className="inline-flex items-center justify-center gap-2 bg-white text-[#FF4500] px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-100 transition-colors">
                <Phone className="w-5 h-5" />
                085 333 2847
              </a>
              <Button 
                onClick={() => navigate(`/boek/${service}?emergency=true`)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 h-auto font-bold text-lg"
              >
                Direct Boeken
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 SpoedDienst24. Alle rechten voorbehouden.
          </p>
        </footer>
      </div>
    </>
  );
}
