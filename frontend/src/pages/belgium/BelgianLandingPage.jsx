import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, Droplets, Key, Phone, Clock, Shield, Star, 
  CheckCircle, Menu, X, ArrowRight, Settings, MapPin
} from "lucide-react";
import { BE_CONFIG, BELGIAN_CITIES, BELGIAN_SERVICES, beRoute } from "@/config/belgiumConfig";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = {
  Zap: Zap,
  Droplets: Droplets,
  Key: Key
};

const SERVICE_COLORS = {
  loodgieter: "from-blue-500 to-blue-600",
  slotenmaker: "from-amber-500 to-amber-600",
  elektricien: "from-yellow-400 to-yellow-500"
};

const SERVICE_ICONS = {
  loodgieter: Droplets,
  slotenmaker: Key,
  elektricien: Zap
};

export default function BelgianLandingPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({ total_bookings: 0, total_vakmannen: 0, total_reviews: 0, avg_rating: 4.8 });
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [user, setUser] = useState(null);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  };

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

  useEffect(() => {
    fetchServices();
    fetchStats();
    fetchReviews();
    checkAuth();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.toLowerCase().trim();
    const emergencyParam = isEmergency ? '?emergency=true' : '';
    
    if (!query) {
      navigate(beRoute(`/boek${emergencyParam}`));
      return;
    }
    
    if (query.includes("elektr") || query.includes("stroom") || query.includes("lamp") || query.includes("schakelaar") || query.includes("stopcontact") || query.includes("kortsluiting") || query.includes("zekering") || query.includes("differentieel")) {
      navigate(beRoute(`/boek?service=elektricien${isEmergency ? '&emergency=true' : ''}`));
    } else if (query.includes("lood") || query.includes("lek") || query.includes("kraan") || query.includes("water") || query.includes("afvoer") || query.includes("toilet") || query.includes("wc") || query.includes("verstop") || query.includes("riool") || query.includes("cv") || query.includes("verwarming")) {
      navigate(beRoute(`/boek?service=loodgieter${isEmergency ? '&emergency=true' : ''}`));
    } else if (query.includes("slot") || query.includes("deur") || query.includes("buiten") || query.includes("sleutel") || query.includes("inbraak") || query.includes("cilinder")) {
      navigate(beRoute(`/boek?service=slotenmaker${isEmergency ? '&emergency=true' : ''}`));
    } else {
      navigate(beRoute(`/boek${emergencyParam}`));
    }
  };

  const handleSuggestionClick = (term) => {
    setSearchQuery(term);
    const query = term.toLowerCase();
    const emergencyParam = isEmergency ? '&emergency=true' : '';
    
    if (query.includes("stroom") || query.includes("kortsluiting") || query.includes("differentieel")) {
      navigate(beRoute(`/boek?service=elektricien${emergencyParam}`));
    } else if (query.includes("lek") || query.includes("wc") || query.includes("verstop") || query.includes("riool")) {
      navigate(beRoute(`/boek?service=loodgieter${emergencyParam}`));
    } else if (query.includes("buiten") || query.includes("slot")) {
      navigate(beRoute(`/boek?service=slotenmaker${emergencyParam}`));
    } else {
      navigate(beRoute("/boek"));
    }
  };

  const mainCities = BELGIAN_CITIES.filter(c => 
    ["antwerpen", "brussel", "gent", "brugge", "leuven", "hasselt"].includes(c.slug)
  );

  return (
    <>
      <Helmet>
        <title>SpoedDienst24.be | 24/7 Spoed Loodgieter, Slotenmaker & Elektricien België</title>
        <meta name="description" content="24/7 spoed loodgieter, slotenmaker en elektricien in heel België. Binnen 30 minuten ter plaatse in Antwerpen, Brussel, Gent, Brugge, Leuven. Bel nu: 03 808 47 47" />
        <link rel="canonical" href="https://spoeddienst24.be" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to={beRoute("/")} className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#FF4500] rounded-md flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900">SpoedDienst24<span className="text-[#FF4500]">.be</span></span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-8">
                <Link to={beRoute("/dienst/elektricien")} className="text-slate-600 hover:text-slate-900 font-medium">Elektricien</Link>
                <Link to={beRoute("/dienst/loodgieter")} className="text-slate-600 hover:text-slate-900 font-medium">Loodgieter</Link>
                <Link to={beRoute("/dienst/slotenmaker")} className="text-slate-600 hover:text-slate-900 font-medium">Slotenmaker</Link>
                <Link to={beRoute("/over-ons")} className="text-slate-600 hover:text-slate-900 font-medium">Over Ons</Link>
              </nav>

              <div className="hidden md:flex items-center gap-4">
                {user?.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-1 text-[#FF4500] hover:text-[#CC3700] font-medium">
                    <Settings className="w-4 h-4" />
                    Beheer
                  </Link>
                )}
                <Link to={beRoute("/vakman/register")} className="text-slate-600 hover:text-slate-900 font-medium">Word Vakman</Link>
                {user ? (
                  <Link to={user.role === 'vakman' ? '/vakman/dashboard' : '/dashboard'}>
                    <Button variant="outline">Dashboard</Button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <Button variant="outline">Inloggen</Button>
                  </Link>
                )}
                <a href={`tel:${BE_CONFIG.contact.phone}`} className="flex items-center gap-2 bg-[#FF4500] text-white px-4 py-2 rounded-md font-medium hover:bg-[#CC3700] transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>{BE_CONFIG.contact.phoneDisplay}</span>
                </a>
                
                {/* Country Switcher */}
                <div className="flex items-center border-l pl-4 ml-2">
                  <a href="https://spoeddienst24.nl" className="text-slate-400 hover:text-slate-600 text-sm">🇳🇱</a>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-[#FF4500] text-sm font-medium">🇧🇪</span>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-slate-200 py-4">
              <nav className="flex flex-col gap-2 px-4">
                <Link to={beRoute("/dienst/elektricien")} className="py-2 text-slate-600 hover:text-slate-900">Elektricien</Link>
                <Link to={beRoute("/dienst/loodgieter")} className="py-2 text-slate-600 hover:text-slate-900">Loodgieter</Link>
                <Link to={beRoute("/dienst/slotenmaker")} className="py-2 text-slate-600 hover:text-slate-900">Slotenmaker</Link>
                <Link to={beRoute("/over-ons")} className="py-2 text-slate-600 hover:text-slate-900">Over Ons</Link>
                <Link to={beRoute("/vakman/register")} className="py-2 text-slate-600 hover:text-slate-900">Word Vakman</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="py-2 text-[#FF4500] hover:text-[#CC3700] font-medium flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Admin Beheer
                  </Link>
                )}
                {user ? (
                  <Link to={user.role === 'vakman' ? '/vakman/dashboard' : '/dashboard'} className="py-2 text-slate-600 hover:text-slate-900">Dashboard</Link>
                ) : (
                  <Link to="/login" className="py-2 text-slate-600 hover:text-slate-900">Inloggen</Link>
                )}
                <a href={`tel:${BE_CONFIG.contact.phone}`} className="flex items-center gap-2 bg-[#FF4500] text-white px-4 py-3 rounded-md font-medium hover:bg-[#CC3700] transition-colors mt-2">
                  <Phone className="w-4 h-4" />
                  <span>{BE_CONFIG.contact.phoneDisplay}</span>
                </a>
                {/* Country Switcher Mobile */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <a href="https://spoeddienst24.nl" className="px-3 py-1 bg-slate-100 rounded text-sm">🇳🇱 Nederland</a>
                  <span className="px-3 py-1 bg-[#FF4500] text-white rounded text-sm">🇧🇪 België</span>
                </div>
              </nav>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-[#FF4500] text-white mb-6 px-4 py-1.5 text-sm font-medium">
                  🇧🇪 24/7 Spoed Beschikbaar in België
                </Badge>
                <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 mb-4 leading-tight">
                  24/7 Spoed <span className="text-[#FF4500]">Loodgieter, Slotenmaker & Elektricien</span>
                </h1>
                <p className="text-xl text-slate-700 font-medium mb-2">
                  Heel Vlaanderen & Brussel — Direct hulp nodig?
                </p>
                <p className="text-lg text-slate-600 mb-8 max-w-lg">
                  Binnen 30 minuten ter plaatse. Direct hulp bij lekkage, verstopping, buitensluiting, stroomstoring en kortsluiting. Vaste prijs, gecertificeerde vakmannen.
                </p>

                {/* Search Box */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Input
                        type="text"
                        placeholder="Wat is je probleem? (bijv. lekkage, buitengesloten)"
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
                    >
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isEmergency ? 'translate-x-6' : ''}`} />
                    </div>
                    <span className="text-slate-700 font-medium">Spoed - Direct hulp nodig</span>
                  </label>
                </form>

                {/* Popular Search Suggestions */}
                <div className="mb-8">
                  <p className="text-sm text-slate-500 mb-2">Populaire zoekopdrachten:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Lekkage', 'WC verstopt', 'Buitengesloten', 'Stroomstoring', 'Riool verstopt', 'Kortsluiting', 'Slot vervangen', 'Differentieel'].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleSuggestionClick(term)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-[#FF4500] hover:text-[#FF4500] transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-5 h-5 text-[#FF4500]" />
                    <span className="text-sm font-medium">Snel geholpen</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Star className="w-5 h-5 text-[#FF4500]" />
                    <span className="text-sm font-medium">{stats.avg_rating || 4.8}/5 beoordeling</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Shield className="w-5 h-5 text-[#FF4500]" />
                    <span className="text-sm font-medium">Tevredenheidsgarantie</span>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative hidden lg:block">
                <div className="relative">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_spoeddienst-2/artifacts/v6mr67ur_27453350-93f2-4f60-b2c2-52bd24282a04-md.jpg" 
                    alt="SpoedDienst24 - Slotenmaker, Elektricien, Loodgieter - Binnen 30 minuten ter plaatse" 
                    className="rounded-2xl shadow-2xl w-full object-cover"
                  />
                  {/* Floating Badge */}
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">150+ Vakmannen</p>
                        <p className="text-sm text-slate-500">Actief in België</p>
                      </div>
                    </div>
                  </div>
                  {/* Location Badge */}
                  <div className="absolute -top-4 -right-4 bg-[#FF4500] text-white rounded-xl shadow-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium text-sm">Heel Vlaanderen</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Onze Diensten in België
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Professionele vakmannen voor al uw spoedreparaties in Vlaanderen en Brussel
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {BELGIAN_SERVICES.map(service => {
                const Icon = SERVICE_ICONS[service.slug];
                return (
                  <Link
                    key={service.slug}
                    to={beRoute(`/dienst/${service.slug}`)}
                    className={`group p-8 rounded-2xl bg-gradient-to-br ${SERVICE_COLORS[service.slug]} text-white hover:scale-105 transition-all duration-300 shadow-lg`}
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{service.name}</h3>
                    <p className="text-white/80 mb-4">{service.description}</p>
                    <div className="flex items-center gap-2 text-white font-medium group-hover:gap-4 transition-all">
                      <span>Meer info</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Regions Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-[#FF4500]/10 text-[#FF4500] mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                Werkgebied
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Actief in heel Vlaanderen & Brussel
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Ons netwerk van vakmannen bedekt alle Belgische provincies
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

            {/* City Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              {BELGIAN_CITIES.slice(0, 20).map(city => (
                <Link
                  key={city.slug}
                  to={beRoute(`/spoed-loodgieter/${city.slug}`)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:border-[#FF4500] hover:text-[#FF4500] rounded-full text-sm transition-colors"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Wat onze klanten zeggen
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <span className="text-2xl font-bold text-slate-900">{stats.avg_rating || 4.8}</span>
                  <span className="text-slate-500">gemiddelde beoordeling</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {reviews.slice(0, 3).map((review, index) => (
                  <Card key={index} className="border-2 hover:border-[#FF4500] transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-slate-600 mb-4">"{review.comment}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FF4500] rounded-full flex items-center justify-center text-white font-bold">
                          {review.customer_name?.charAt(0) || 'K'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{review.customer_name || 'Klant'}</p>
                          <p className="text-sm text-slate-500">{review.service_type}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#FF4500] to-[#CC3700]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Direct hulp nodig in België?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Onze vakmannen staan 24/7 klaar om u te helpen
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
                to={beRoute("/boek")}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-colors"
              >
                Online Boeken
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div>
                <Link to={beRoute("/")} className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-[#FF4500] rounded-md flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-bold text-xl">SpoedDienst24<span className="text-[#FF4500]">.be</span></span>
                </Link>
                <p className="text-slate-400 text-sm">
                  24/7 spoed vakmannen in heel Vlaanderen en Brussel.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Diensten</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><Link to={beRoute("/dienst/loodgieter")} className="hover:text-white">Loodgieter</Link></li>
                  <li><Link to={beRoute("/dienst/slotenmaker")} className="hover:text-white">Slotenmaker</Link></li>
                  <li><Link to={beRoute("/dienst/elektricien")} className="hover:text-white">Elektricien</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Spoedproblemen</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><Link to={beRoute("/lekkage-spoed")} className="hover:text-white">Lekkage Spoed</Link></li>
                  <li><Link to={beRoute("/buitengesloten-spoed")} className="hover:text-white">Buitengesloten</Link></li>
                  <li><Link to={beRoute("/stroomstoring-spoed")} className="hover:text-white">Stroomstoring</Link></li>
                  <li><Link to={beRoute("/toilet-verstopt-spoed")} className="hover:text-white">Toilet Verstopt</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Over Ons</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li><Link to={beRoute("/over-ons")} className="hover:text-white">Over SpoedDienst24.be</Link></li>
                  <li><Link to={beRoute("/prijzen")} className="hover:text-white">Prijzen</Link></li>
                  <li><Link to={beRoute("/garantie")} className="hover:text-white">Garantie</Link></li>
                  <li><Link to={beRoute("/vakman")} className="hover:text-white">Word Vakman</Link></li>
                </ul>
                
                <h4 className="font-bold mb-4 mt-6">Contact België</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${BE_CONFIG.contact.phone}`} className="hover:text-white">{BE_CONFIG.contact.phoneDisplay}</a>
                  </li>
                  <li>
                    <a href={`mailto:${BE_CONFIG.contact.email}`} className="hover:text-white">{BE_CONFIG.contact.email}</a>
                  </li>
                </ul>
                
                {/* Country Switcher */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-500 mb-2">Land wijzigen:</p>
                  <div className="flex gap-2">
                    <a href="https://spoeddienst24.nl" className="px-3 py-1 bg-slate-800 rounded text-sm hover:bg-slate-700">🇳🇱 Nederland</a>
                    <span className="px-3 py-1 bg-[#FF4500] rounded text-sm">🇧🇪 België</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* SEO Footer Links */}
            <div className="border-t border-slate-800 mt-8 pt-8">
              <h4 className="font-bold text-sm mb-4 text-slate-400">Spoed Loodgieter België</h4>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4">
                {BELGIAN_CITIES.slice(0, 15).map(city => (
                  <Link key={city.slug} to={beRoute(`/spoed-loodgieter/${city.slug}`)} className="hover:text-white">
                    Loodgieter {city.name}
                  </Link>
                ))}
              </div>
              
              <h4 className="font-bold text-sm mb-4 text-slate-400">Spoed Slotenmaker België</h4>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4">
                {BELGIAN_CITIES.slice(0, 15).map(city => (
                  <Link key={city.slug} to={beRoute(`/spoed-slotenmaker/${city.slug}`)} className="hover:text-white">
                    Slotenmaker {city.name}
                  </Link>
                ))}
              </div>
              
              <h4 className="font-bold text-sm mb-4 text-slate-400">Spoed Elektricien België</h4>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {BELGIAN_CITIES.slice(0, 15).map(city => (
                  <Link key={city.slug} to={beRoute(`/spoed-elektricien/${city.slug}`)} className="hover:text-white">
                    Elektricien {city.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500 text-sm">
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                <Link to={beRoute("/voorwaarden")} className="hover:text-white">Algemene Voorwaarden</Link>
                <span>|</span>
                <Link to={beRoute("/privacy")} className="hover:text-white">Privacy Policy</Link>
                <span>|</span>
                <Link to={beRoute("/cookies")} className="hover:text-white">Cookie Beleid</Link>
              </div>
              <p>© 2024 SpoedDienst24.be - Alle rechten voorbehouden | 24/7 Vakmannen in België</p>
              <p className="mt-2">Loodgieter België | Slotenmaker België | Elektricien België | Spoed Vakmannen Vlaanderen</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
