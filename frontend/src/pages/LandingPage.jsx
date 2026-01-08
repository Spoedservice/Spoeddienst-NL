import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Droplets, Key, Phone, Clock, Shield, Star, CheckCircle, Menu, X, ArrowRight } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = {
  Zap: Zap,
  Droplets: Droplets,
  Key: Key
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({ total_bookings: 0, total_vakmannen: 0, total_reviews: 0, avg_rating: 4.7 });
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchStats();
    fetchReviews();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats/public`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API}/reviews/latest`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase();
    if (query.includes("elektr") || query.includes("stroom") || query.includes("lamp")) {
      navigate(`/boek/elektricien?emergency=${isEmergency}`);
    } else if (query.includes("lood") || query.includes("lek") || query.includes("kraan") || query.includes("water")) {
      navigate(`/boek/loodgieter?emergency=${isEmergency}`);
    } else if (query.includes("slot") || query.includes("deur") || query.includes("buiten")) {
      navigate(`/boek/slotenmaker?emergency=${isEmergency}`);
    } else {
      navigate(`/boek/elektricien?emergency=${isEmergency}`);
    }
  };

  const ServiceIcon = ({ name }) => {
    const Icon = iconMap[name] || Zap;
    return <Icon className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-header border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#FF4500] rounded-md flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-slate-900">SpoedDienst24</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/diensten/elektricien" className="text-slate-600 hover:text-slate-900 font-medium">Elektricien</Link>
              <Link to="/diensten/loodgieter" className="text-slate-600 hover:text-slate-900 font-medium">Loodgieter</Link>
              <Link to="/diensten/slotenmaker" className="text-slate-600 hover:text-slate-900 font-medium">Slotenmaker</Link>
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/vakman/register" className="text-slate-600 hover:text-slate-900 font-medium">Word Vakman</Link>
              <Link to="/login">
                <Button variant="outline" data-testid="login-btn">Inloggen</Button>
              </Link>
              <a href="tel:085 333 2847" className="flex items-center gap-2 bg-[#FF4500] text-white px-4 py-2 rounded-md font-medium hover:bg-[#CC3700] transition-colors">
                <Phone className="w-4 h-4" />
                <span>085 333 2847</span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 py-4">
            <nav className="flex flex-col gap-2 px-4">
              <Link to="/diensten/elektricien" className="py-2 text-slate-600">Elektricien</Link>
              <Link to="/diensten/loodgieter" className="py-2 text-slate-600">Loodgieter</Link>
              <Link to="/diensten/slotenmaker" className="py-2 text-slate-600">Slotenmaker</Link>
              <Link to="/vakman/register" className="py-2 text-slate-600">Word Vakman</Link>
              <Link to="/login" className="py-2 text-slate-600">Inloggen</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-[#FF4500] text-white mb-6 px-4 py-1.5 text-sm font-medium pulse-emergency">
                24/7 Spoed Beschikbaar
              </Badge>
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 mb-6 leading-tight">
                Boek snel een <span className="text-[#FF4500]">betrouwbare vakman</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg">
                Kies en boek je klus voor een vaste prijs. Je hebt vaak binnen 4 uur een afspraak met een gescreende vakman - bij spoed zijn wij nóg sneller!
              </p>

              {/* Search Box */}
              <form onSubmit={handleSearch} className="mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder="Zoek hier je klus (bijv. lekkage, stroomstoring)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-14 pl-4 pr-4 text-base bg-white border-slate-200"
                      data-testid="search-input"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="h-14 px-8 bg-[#FF4500] hover:bg-[#CC3700] text-white font-semibold text-base"
                    data-testid="search-btn"
                  >
                    Zoek Vakman
                  </Button>
                </div>
                
                {/* Emergency Toggle */}
                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                  <div 
                    className={`relative w-12 h-6 rounded-full transition-colors ${isEmergency ? 'bg-[#FF4500]' : 'bg-slate-200'}`}
                    onClick={() => setIsEmergency(!isEmergency)}
                    data-testid="emergency-toggle"
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isEmergency ? 'translate-x-6' : ''}`} />
                  </div>
                  <span className="text-slate-700 font-medium">Spoed - Direct hulp nodig</span>
                </label>
              </form>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-5 h-5 text-[#FF4500]" />
                  <span className="text-sm font-medium">Snel geholpen</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Star className="w-5 h-5 text-[#FF4500]" />
                  <span className="text-sm font-medium">4,7/5 beoordeling</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Shield className="w-5 h-5 text-[#FF4500]" />
                  <span className="text-sm font-medium">Tevredenheidsgarantie</span>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <img 
                src="https://customer-assets.emergentagent.com/job_handylink-13/artifacts/qqmd5gvo_27453350-93f2-4f60-b2c2-52bd24282a04-md.jpeg" 
                alt="SpoedDienst24 - Spoed Slotenmaker, Elektricien en Loodgieter - Binnen 30 minuten ter plaatse 24/7 bereikbaar"
                title="SpoedDienst24.nl - Spoed vakmannen voor slotenmaker, elektricien en loodgieter"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-contain bg-slate-900"
                loading="eager"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Gemiddelde reactietijd</p>
                    <p className="font-heading font-bold text-lg text-slate-900">15 minuten</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Bento Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-12">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mb-4">
              Onze diensten
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl">
              Kies een vakman en boek direct. Reguliere en spoed klussen mogelijk.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card 
                key={service.id} 
                className="service-card border border-slate-200 hover:border-[#FF4500] cursor-pointer overflow-hidden"
                onClick={() => navigate(`/boek/${service.slug}`)}
                data-testid={`service-card-${service.slug}`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image_url} 
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white text-slate-900 font-medium">
                      <ServiceIcon name={service.icon} />
                      <span className="ml-1">{service.name}</span>
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-heading font-bold text-xl text-slate-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-slate-600 mb-4 text-sm">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Vanaf</p>
                      <p className="font-heading font-bold text-2xl text-slate-900">€{service.base_price},-</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#FF4500] font-medium">Spoed</p>
                      <p className="font-heading font-bold text-lg text-[#FF4500]">€{service.emergency_price},-</p>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white">
                    Boek nu <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mb-4">
              Zo werkt het
            </h2>
            <p className="text-slate-600 text-lg">
              Makkelijk boeken, snel een afspraak en veilig achteraf betalen!
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Kies je klus", desc: "Selecteer de dienst en beschrijf je probleem" },
              { step: 2, title: "Boek direct", desc: "Kies een datum en tijd die jou uitkomt" },
              { step: 3, title: "Vakman komt", desc: "Een gescreende vakman komt op afspraak" },
              { step: 4, title: "Betaal achteraf", desc: "Na de klus betaal je veilig via ons platform" }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-[#FF4500] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-heading font-bold text-2xl">
                  {item.step}
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-heading font-black text-4xl text-white stat-number">{stats.total_bookings.toLocaleString()}+</p>
              <p className="text-slate-400 mt-2">Klussen</p>
            </div>
            <div>
              <p className="font-heading font-black text-4xl text-white stat-number">{stats.total_vakmannen}+</p>
              <p className="text-slate-400 mt-2">Vakmannen</p>
            </div>
            <div>
              <p className="font-heading font-black text-4xl text-white stat-number">{stats.total_reviews.toLocaleString()}+</p>
              <p className="text-slate-400 mt-2">Reviews</p>
            </div>
            <div>
              <p className="font-heading font-black text-4xl text-[#FF4500] stat-number">{stats.avg_rating}/5</p>
              <p className="text-slate-400 mt-2">Beoordeling</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mb-4">
              Wat zeggen tevreden klanten?
            </h2>
            <p className="text-slate-600 text-lg">
              Slimme huiseigenaren kiezen voor SpoedDienst24
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, idx) => (
              <Card key={idx} className="border border-slate-200 p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
                    />
                  ))}
                </div>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-heading font-bold text-slate-600">
                    {review.customer_name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{review.customer_name}</p>
                    <p className="text-sm text-slate-500">{review.service || 'Klus'}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FF4500]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-6">
            Direct hulp nodig?
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Bel ons 24/7 voor spoed klussen of boek online
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:085 333 2847" className="inline-flex items-center justify-center gap-2 bg-white text-[#FF4500] px-8 py-4 rounded-md font-bold text-lg hover:bg-slate-100 transition-colors">
              <Phone className="w-5 h-5" />
              085 333 2847
            </a>
            <Button 
              onClick={() => navigate('/boek/elektricien?emergency=true')}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 h-auto font-bold text-lg"
              data-testid="cta-book-btn"
            >
              Direct Boeken
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#FF4500] rounded-md flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="font-heading font-bold text-xl text-white">SpoedDienst24</span>
              </div>
              <p className="text-slate-400 text-sm">
                24/7 betrouwbare vakmannen voor al uw spoed en reguliere klussen.
              </p>
              <div className="mt-4">
                <p className="text-slate-400 text-sm">085 333 2847 (24/7)</p>
                <p className="text-slate-400 text-sm">info@spoeddienst24.nl</p>
              </div>
            </div>

            {/* Zakelijk */}
            <div>
              <h4 className="font-heading font-bold text-white mb-4">Zakelijk</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/vve" className="hover:text-white">VVE klusservice</Link></li>
                <li><Link to="/horeca" className="hover:text-white">Horeca klusservice</Link></li>
                <li><Link to="/kantoor" className="hover:text-white">Kantoor klusservice</Link></li>
                <li><Link to="/winkel" className="hover:text-white">Winkel klusservice</Link></li>
                <li><Link to="/partner" className="hover:text-white">Partner worden?</Link></li>
                <li><Link to="/affiliate" className="hover:text-white">Affiliate programma</Link></li>
              </ul>
            </div>

            {/* Vakman Info */}
            <div>
              <h4 className="font-heading font-bold text-white mb-4">Vakman info</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/vakman" className="hover:text-white">Word vakman</Link></li>
                <li><Link to="/vakman/app" className="hover:text-white">Vakman App</Link></li>
                <li><Link to="/vakman/voorwaarden" className="hover:text-white">Vakman voorwaarden</Link></li>
                <li><Link to="/vakman/faq" className="hover:text-white">Veelgestelde vragen vakman</Link></li>
                <li><Link to="/login" className="hover:text-white">Inloggen</Link></li>
              </ul>
            </div>

            {/* SpoedDienst24 Info */}
            <div>
              <h4 className="font-heading font-bold text-white mb-4">SpoedDienst24 info</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/over-ons" className="hover:text-white">Over ons</Link></li>
                <li><Link to="/garantie" className="hover:text-white">Garantie</Link></li>
                <li><Link to="/prijzen" className="hover:text-white">Prijsgidsen</Link></li>
                <li><Link to="/premium" className="hover:text-white">Premium lidmaatschap</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>

            {/* Contact & Overig */}
            <div>
              <h4 className="font-heading font-bold text-white mb-4">Contact & Overig</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="tel:085 333 2847" className="hover:text-white">Bel 085 333 2847</a></li>
                <li><a href="mailto:info@spoeddienst24.nl" className="hover:text-white">info@spoeddienst24.nl</a></li>
                <li><Link to="/vacatures" className="hover:text-white">Vacatures</Link></li>
              </ul>
              <h4 className="font-heading font-bold text-white mt-6 mb-4">Diensten</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/diensten/elektricien" className="hover:text-white">Elektricien</Link></li>
                <li><Link to="/diensten/loodgieter" className="hover:text-white">Loodgieter</Link></li>
                <li><Link to="/diensten/slotenmaker" className="hover:text-white">Slotenmaker</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 SpoedDienst24.nl. Alle rechten voorbehouden.
            </p>
            <div className="flex gap-6 text-slate-400 text-sm">
              <Link to="/privacy" className="hover:text-white">Privacybeleid</Link>
              <Link to="/voorwaarden" className="hover:text-white">Algemene voorwaarden</Link>
              <Link to="/cookies" className="hover:text-white">Cookiebeleid</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
