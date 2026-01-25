import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Droplets, Key, Star, Clock, Shield, ArrowLeft, ArrowRight, Phone, CheckCircle, MapPin } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = {
  elektricien: Zap,
  loodgieter: Droplets,
  slotenmaker: Key
};

export default function ServicePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [vakmannen, setVakmannen] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceData();
  }, [slug]);

  const fetchServiceData = async () => {
    try {
      const response = await axios.get(`${API}/services/${slug}`);
      setService(response.data.service);
      setVakmannen(response.data.vakmannen);
    } catch (error) {
      console.error("Error fetching service:", error);
    } finally {
      setLoading(false);
    }
  };

  const ServiceIcon = iconMap[slug] || Zap;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#FF4500] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading font-bold text-2xl text-slate-900 mb-4">Dienst niet gevonden</h1>
          <Link to="/">
            <Button>Terug naar home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
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
      <section className="relative">
        <div className="h-64 sm:h-80 overflow-hidden">
          <img 
            src={service.image_url} 
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4" />
              <span>Terug</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                <ServiceIcon className="w-8 h-8 text-[#FF4500]" />
              </div>
              <div>
                <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
                  {service.name}
                </h1>
                <p className="text-white/80 text-lg">{service.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border border-slate-200 hover:border-slate-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-slate-900">Reguliere klus</h3>
                    <p className="text-slate-500 text-sm">Binnen 24-48 uur een afspraak</p>
                  </div>
                  <Badge variant="outline">Standaard</Badge>
                </div>
                <div className="mb-6">
                  <span className="font-heading font-black text-4xl text-slate-900">€{service.base_price},-</span>
                  <span className="text-slate-500 ml-2">incl. BTW</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Gescreende vakmannen
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Tevredenheidsgarantie
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Betaal achteraf
                  </li>
                </ul>
                <Button 
                  className="w-full bg-slate-900 hover:bg-slate-800"
                  onClick={() => navigate(`/boek/${slug}`)}
                  data-testid="book-regular-btn"
                >
                  Boek nu <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#FF4500] relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#FF4500] text-white px-4 py-1 text-sm font-medium">
                24/7 Beschikbaar
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-xl text-slate-900">Spoed klus</h3>
                    <p className="text-slate-500 text-sm">Direct hulp, ook 's nachts</p>
                  </div>
                  <Badge className="bg-[#FF4500] text-white">Spoed</Badge>
                </div>
                <div className="mb-6">
                  <span className="font-heading font-black text-4xl text-[#FF4500]">€{service.emergency_price},-</span>
                  <span className="text-slate-500 ml-2">incl. BTW</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Vaak binnen 30 minuten reactie
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    24/7 beschikbaar
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Prioriteit behandeling
                  </li>
                </ul>
                <Button 
                  className="w-full bg-[#FF4500] hover:bg-[#CC3700]"
                  onClick={() => navigate(`/boek/${slug}?emergency=true`)}
                  data-testid="book-emergency-btn"
                >
                  Direct boeken <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Clock className="w-10 h-10 mx-auto mb-4 text-[#FF4500]" />
              <h3 className="font-heading font-bold text-lg mb-2">Snel geholpen</h3>
              <p className="text-slate-400 text-sm">Bij spoed vaak binnen 30 minuten een vakman</p>
            </div>
            <div>
              <Star className="w-10 h-10 mx-auto mb-4 text-[#FF4500]" />
              <h3 className="font-heading font-bold text-lg mb-2">Gescreende vakmannen</h3>
              <p className="text-slate-400 text-sm">Alleen betrouwbare en gekwalificeerde professionals</p>
            </div>
            <div>
              <Shield className="w-10 h-10 mx-auto mb-4 text-[#FF4500]" />
              <h3 className="font-heading font-bold text-lg mb-2">Tevredenheidsgarantie</h3>
              <p className="text-slate-400 text-sm">Niet tevreden? Wij lossen het op</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FF4500]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white mb-4">
            Direct hulp nodig?
          </h2>
          <p className="text-white/90 mb-6">
            Bel ons 24/7 of boek direct online
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:085 333 2847" className="inline-flex items-center justify-center gap-2 bg-white text-[#FF4500] px-6 py-3 rounded-md font-bold hover:bg-slate-100 transition-colors">
              <Phone className="w-5 h-5" />
              085 333 2847
            </a>
            <Button 
              onClick={() => navigate(`/boek/${slug}?emergency=true`)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 h-auto font-bold"
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
  );
}
