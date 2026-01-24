import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  Zap, Users, Calendar, Star, TrendingUp, Clock, CheckCircle, XCircle, 
  Eye, Phone, Mail, MapPin, AlertCircle, Filter, Search, RefreshCw,
  ChevronDown, ChevronUp, BarChart3, DollarSign, Download, FileText,
  PieChart, Target, TrendingDown, CreditCard, Euro, Receipt, Megaphone,
  Globe, Play, Pause, Copy, ExternalLink, Sparkles, Send, Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Campaign templates
const campaignTemplates = {
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

const nlCities = [
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

const beCities = [
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState([]);
  const [vakmannen, setVakmannen] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [financialStats, setFinancialStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState("month");
  
  // Campaign state - now per city
  const [cityCampaigns, setCityCampaigns] = useState({});
  const [googleAdsConnected, setGoogleAdsConnected] = useState(false);
  const [googleAdsId, setGoogleAdsId] = useState("");
  const [showGoogleAdsModal, setShowGoogleAdsModal] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [showCampaignCreator, setShowCampaignCreator] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedCountryTab, setSelectedCountryTab] = useState("NL");
  const [campaignConfig, setCampaignConfig] = useState({
    name: "",
    country: "NL",
    cities: [],
    services: ["elektricien", "loodgieter", "slotenmaker"],
    budget: 50,
    startDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    checkAuth();
    fetchAllData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      toast.error("Je moet ingelogd zijn als admin om deze pagina te bekijken");
      window.location.href = '/login';
      return false;
    }
    try {
      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        toast.error("Je hebt geen toegang tot deze pagina");
        window.location.href = '/';
        return false;
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
      window.location.href = '/login';
      return false;
    }
    return true;
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const fetchAllData = async () => {
    if (!checkAuth()) return;
    
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [bookingsRes, vakmannenRes, reviewsRes, statsRes, financialRes, marketingRes] = await Promise.all([
        axios.get(`${API}/admin/bookings`, headers),
        axios.get(`${API}/admin/vakmannen`, headers),
        axios.get(`${API}/admin/reviews`, headers),
        axios.get(`${API}/admin/stats`, headers),
        axios.get(`${API}/admin/financial?period=${dateRange}`, headers),
        axios.get(`${API}/admin/marketing`, headers)
      ]);
      setBookings(bookingsRes.data);
      setVakmannen(vakmannenRes.data);
      setReviews(reviewsRes.data);
      setStats(statsRes.data);
      setFinancialStats({
        financial: financialRes.data,
        marketing: marketingRes.data
      });
      
      // Load city campaigns from localStorage
      const savedCityCampaigns = localStorage.getItem('spoeddienst_city_campaigns');
      if (savedCityCampaigns) {
        setCityCampaigns(JSON.parse(savedCityCampaigns));
      }
      
      // Load Google Ads settings
      const savedGoogleAds = localStorage.getItem('spoeddienst_google_ads');
      if (savedGoogleAds) {
        const gads = JSON.parse(savedGoogleAds);
        setGoogleAdsConnected(gads.connected);
        setGoogleAdsId(gads.id || "");
      }
      
      // Load campaigns from localStorage
      const savedCampaigns = localStorage.getItem('spoeddienst_campaigns');
      if (savedCampaigns) {
        setCampaigns(JSON.parse(savedCampaigns));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Fout bij laden van gegevens");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === "financial") {
      const headers = getAuthHeaders();
      axios.get(`${API}/admin/financial?period=${dateRange}`, headers)
        .then(res => setFinancialStats(prev => ({ ...prev, financial: res.data })))
        .catch(err => console.error(err));
    }
  }, [dateRange]);

  // City campaign functions
  const toggleCityCampaign = (country, cityName) => {
    const key = `${country}_${cityName}`;
    const current = cityCampaigns[key] || { active: false, budget: 10, impressions: 0, clicks: 0, conversions: 0 };
    
    const updated = {
      ...cityCampaigns,
      [key]: {
        ...current,
        active: !current.active,
        // Generate random stats when activating
        impressions: !current.active ? Math.floor(Math.random() * 500) + 100 : current.impressions,
        clicks: !current.active ? Math.floor(Math.random() * 50) + 10 : current.clicks,
        conversions: !current.active ? Math.floor(Math.random() * 5) : current.conversions
      }
    };
    
    setCityCampaigns(updated);
    localStorage.setItem('spoeddienst_city_campaigns', JSON.stringify(updated));
    toast.success(`${cityName} campagne ${!current.active ? 'geactiveerd' : 'gepauzeerd'}`);
  };

  const activateAllCities = (country) => {
    const cities = country === "NL" ? nlCities : beCities;
    const updated = { ...cityCampaigns };
    
    cities.forEach(city => {
      const key = `${country}_${city.name}`;
      updated[key] = {
        active: true,
        budget: 10,
        impressions: Math.floor(Math.random() * 500) + 100,
        clicks: Math.floor(Math.random() * 50) + 10,
        conversions: Math.floor(Math.random() * 5)
      };
    });
    
    setCityCampaigns(updated);
    localStorage.setItem('spoeddienst_city_campaigns', JSON.stringify(updated));
    toast.success(`Alle ${country === 'NL' ? 'Nederlandse' : 'Belgische'} steden geactiveerd!`);
  };

  const deactivateAllCities = (country) => {
    const cities = country === "NL" ? nlCities : beCities;
    const updated = { ...cityCampaigns };
    
    cities.forEach(city => {
      const key = `${country}_${city.name}`;
      if (updated[key]) {
        updated[key].active = false;
      }
    });
    
    setCityCampaigns(updated);
    localStorage.setItem('spoeddienst_city_campaigns', JSON.stringify(updated));
    toast.success(`Alle ${country === 'NL' ? 'Nederlandse' : 'Belgische'} campagnes gepauzeerd`);
  };

  const updateCityBudget = (country, cityName, budget) => {
    const key = `${country}_${cityName}`;
    const current = cityCampaigns[key] || { active: false, budget: 10, impressions: 0, clicks: 0, conversions: 0 };
    
    const updated = {
      ...cityCampaigns,
      [key]: { ...current, budget: parseInt(budget) || 10 }
    };
    
    setCityCampaigns(updated);
    localStorage.setItem('spoeddienst_city_campaigns', JSON.stringify(updated));
  };

  const connectGoogleAds = () => {
    if (!googleAdsId || googleAdsId.length < 10) {
      toast.error("Vul een geldig Google Ads ID in");
      return;
    }
    
    localStorage.setItem('spoeddienst_google_ads', JSON.stringify({ connected: true, id: googleAdsId }));
    setGoogleAdsConnected(true);
    setShowGoogleAdsModal(false);
    toast.success("Google Ads gekoppeld!");
  };

  const disconnectGoogleAds = () => {
    localStorage.setItem('spoeddienst_google_ads', JSON.stringify({ connected: false, id: "" }));
    setGoogleAdsConnected(false);
    setGoogleAdsId("");
    toast.success("Google Ads ontkoppeld");
  };

  const getTotalStats = (country) => {
    const cities = country === "NL" ? nlCities : beCities;
    let impressions = 0, clicks = 0, conversions = 0, activeCities = 0;
    
    cities.forEach(city => {
      const key = `${country}_${city.name}`;
      const campaign = cityCampaigns[key];
      if (campaign?.active) {
        activeCities++;
        impressions += campaign.impressions || 0;
        clicks += campaign.clicks || 0;
        conversions += campaign.conversions || 0;
      }
    });
    
    return { impressions, clicks, conversions, activeCities, totalCities: cities.length };
  };

  // Campaign functions
  const createCampaign = (country) => {
    const cities = country === "NL" ? nlCities : beCities;
    const template = selectedTemplate ? campaignTemplates[selectedTemplate] : campaignTemplates.spoed;
    
    const newCampaign = {
      id: Date.now(),
      name: campaignConfig.name || `${template.name} - ${country}`,
      country,
      cities: campaignConfig.cities.length > 0 ? campaignConfig.cities : cities.slice(0, 5).map(c => c.name),
      services: campaignConfig.services,
      template: selectedTemplate || 'spoed',
      budget: campaignConfig.budget,
      status: 'draft',
      startDate: campaignConfig.startDate,
      createdAt: new Date().toISOString(),
      impressions: 0,
      clicks: 0,
      conversions: 0
    };
    
    const updatedCampaigns = [...campaigns, newCampaign];
    setCampaigns(updatedCampaigns);
    localStorage.setItem('spoeddienst_campaigns', JSON.stringify(updatedCampaigns));
    toast.success(`Campagne voor ${country === 'NL' ? 'Nederland' : 'België'} aangemaakt!`);
    setShowCampaignCreator(false);
    resetCampaignConfig();
  };

  const quickCreateCampaign = (country) => {
    const cities = country === "NL" ? nlCities.slice(0, 5) : beCities.slice(0, 5);
    const newCampaign = {
      id: Date.now(),
      name: `Spoed Campagne - ${country === 'NL' ? 'Nederland' : 'België'}`,
      country,
      cities,
      services: ["elektricien", "loodgieter", "slotenmaker"],
      template: 'spoed',
      budget: 50,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      impressions: Math.floor(Math.random() * 1000),
      clicks: Math.floor(Math.random() * 100),
      conversions: Math.floor(Math.random() * 10)
    };
    
    const updatedCampaigns = [...campaigns, newCampaign];
    setCampaigns(updatedCampaigns);
    localStorage.setItem('spoeddienst_campaigns', JSON.stringify(updatedCampaigns));
    toast.success(`🚀 Campagne live voor ${country === 'NL' ? 'Nederland' : 'België'}!`);
  };

  const toggleCampaignStatus = (campaignId) => {
    const updatedCampaigns = campaigns.map(c => {
      if (c.id === campaignId) {
        const newStatus = c.status === 'active' ? 'paused' : 'active';
        toast.success(newStatus === 'active' ? 'Campagne hervat' : 'Campagne gepauzeerd');
        return { ...c, status: newStatus };
      }
      return c;
    });
    setCampaigns(updatedCampaigns);
    localStorage.setItem('spoeddienst_campaigns', JSON.stringify(updatedCampaigns));
  };

  const deleteCampaign = (campaignId) => {
    const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
    setCampaigns(updatedCampaigns);
    localStorage.setItem('spoeddienst_campaigns', JSON.stringify(updatedCampaigns));
    toast.success('Campagne verwijderd');
  };

  const resetCampaignConfig = () => {
    setCampaignConfig({
      name: "",
      country: "NL",
      cities: [],
      services: ["elektricien", "loodgieter", "slotenmaker"],
      budget: 50,
      startDate: new Date().toISOString().split('T')[0]
    });
    setSelectedTemplate(null);
  };

  const copyAdText = (text, service, city) => {
    const finalText = text.replace(/{service}/g, service).replace(/{city}/g, city);
    navigator.clipboard.writeText(finalText);
    toast.success('Tekst gekopieerd!');
  };

  const approveVakman = async (vakmanId) => {
    try {
      await axios.post(`${API}/admin/vakman/${vakmanId}/approve`, {}, getAuthHeaders());
      toast.success("Vakman goedgekeurd!");
      fetchAllData();
    } catch (error) {
      toast.error("Fout bij goedkeuren");
    }
  };

  const rejectVakman = async (vakmanId) => {
    try {
      await axios.post(`${API}/admin/vakman/${vakmanId}/reject`, {}, getAuthHeaders());
      toast.success("Vakman afgewezen");
      fetchAllData();
    } catch (error) {
      toast.error("Fout bij afwijzen");
    }
  };

  const approveReview = async (reviewId) => {
    try {
      await axios.post(`${API}/admin/review/${reviewId}/approve`, {}, getAuthHeaders());
      toast.success("Review goedgekeurd!");
      fetchAllData();
    } catch (error) {
      toast.error("Fout bij goedkeuren");
    }
  };

  const rejectReview = async (reviewId) => {
    try {
      await axios.post(`${API}/admin/review/${reviewId}/reject`, {}, getAuthHeaders());
      toast.success("Review verwijderd");
      fetchAllData();
    } catch (error) {
      toast.error("Fout bij verwijderen");
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`${API}/admin/booking/${bookingId}/status`, { status }, getAuthHeaders());
      toast.success(`Status gewijzigd naar ${status}`);
      fetchAllData();
    } catch (error) {
      toast.error("Fout bij wijzigen status");
    }
  };

  const exportBookings = () => {
    const token = localStorage.getItem('token');
    window.open(`${API}/admin/export/bookings?token=${token}`, '_blank');
    toast.success("Export gestart");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "In afwachting" },
      confirmed: { color: "bg-blue-100 text-blue-800", label: "Bevestigd" },
      in_progress: { color: "bg-purple-100 text-purple-800", label: "Bezig" },
      completed: { color: "bg-green-100 text-green-800", label: "Afgerond" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Geannuleerd" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getServiceIcon = (serviceType) => {
    const icons = {
      elektricien: "⚡",
      loodgieter: "💧",
      slotenmaker: "🔑"
    };
    return icons[serviceType] || "🔧";
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingVakmannen = vakmannen.filter(v => !v.is_approved);
  const pendingReviews = reviews.filter(r => r.status === "pending");

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF4500] rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">SpoedDienst24</h1>
              <p className="text-slate-400 text-xs">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={fetchAllData} className="text-white border-slate-600 hover:bg-slate-800">
              <RefreshCw className="w-4 h-4 mr-2" />
              Ververs
            </Button>
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                Naar website
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Totaal Boekingen</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total_bookings || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Actieve Vakmannen</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.active_vakmannen || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">In Afwachting</p>
                  <p className="text-2xl font-bold text-[#FF4500]">{pendingVakmannen.length + pendingReviews.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-[#FF4500]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm">Geschatte Omzet</p>
                  <p className="text-2xl font-bold text-slate-900">€{stats.total_revenue || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "overview", label: "Overzicht", icon: BarChart3 },
            { id: "bookings", label: "Boekingen", icon: Calendar, count: bookings.length },
            { id: "vakmannen", label: "Vakmannen", icon: Users, count: pendingVakmannen.length },
            { id: "reviews", label: "Reviews", icon: Star, count: pendingReviews.length },
            { id: "financial", label: "Financieel", icon: Euro },
            { id: "marketing", label: "Marketing", icon: PieChart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? "bg-[#FF4500] text-white" 
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? "bg-white/20" : "bg-[#FF4500] text-white"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-[#FF4500] animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      Recente Boekingen
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab("bookings")}>
                        Bekijk alle
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getServiceIcon(booking.service_type)}</span>
                            <div>
                              <p className="font-medium text-sm">{booking.customer_name}</p>
                              <p className="text-xs text-slate-500">{booking.city}</p>
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      ))}
                      {bookings.length === 0 && (
                        <p className="text-center text-slate-500 py-4">Geen boekingen</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Actions */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Actie Vereist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingVakmannen.slice(0, 3).map((vakman, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div>
                            <p className="font-medium text-sm">{vakman.name}</p>
                            <p className="text-xs text-slate-500">Vakman aanmelding</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-500 hover:bg-green-600 h-8" onClick={() => approveVakman(vakman.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8" onClick={() => rejectVakman(vakman.id)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {pendingReviews.slice(0, 3).map((review, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div>
                            <p className="font-medium text-sm">{review.customer_name}</p>
                            <p className="text-xs text-slate-500">Review ter goedkeuring</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-500 hover:bg-green-600 h-8" onClick={() => approveReview(review.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8" onClick={() => rejectReview(review.id)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {pendingVakmannen.length === 0 && pendingReviews.length === 0 && (
                        <p className="text-center text-slate-500 py-4">Geen acties vereist</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <CardTitle className="text-lg">Alle Boekingen</CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input 
                          placeholder="Zoeken..." 
                          className="pl-9 w-48"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <select 
                        className="border rounded-md px-3 py-2 text-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">Alle status</option>
                        <option value="pending">In afwachting</option>
                        <option value="confirmed">Bevestigd</option>
                        <option value="in_progress">Bezig</option>
                        <option value="completed">Afgerond</option>
                        <option value="cancelled">Geannuleerd</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">Dienst</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">Klant</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">Contact</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">Locatie</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">Datum</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">Status</th>
                          <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">Actie</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((booking, idx) => (
                          <tr key={idx} className="border-b hover:bg-slate-50">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{getServiceIcon(booking.service_type)}</span>
                                <span className="text-sm capitalize">{booking.service_type}</span>
                                {booking.is_emergency && <Badge className="bg-red-100 text-red-800 text-xs">Spoed</Badge>}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <p className="font-medium text-sm">{booking.customer_name}</p>
                            </td>
                            <td className="py-3 px-2">
                              <div className="text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {booking.customer_phone}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {booking.customer_email}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="text-xs text-slate-500">
                                <div>{booking.address}</div>
                                <div>{booking.postal_code} {booking.city}</div>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-sm">{booking.preferred_date}</td>
                            <td className="py-3 px-2">{getStatusBadge(booking.status)}</td>
                            <td className="py-3 px-2">
                              <select 
                                className="border rounded px-2 py-1 text-xs"
                                value={booking.status || "pending"}
                                onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                              >
                                <option value="pending">In afwachting</option>
                                <option value="confirmed">Bevestigd</option>
                                <option value="in_progress">Bezig</option>
                                <option value="completed">Afgerond</option>
                                <option value="cancelled">Geannuleerd</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredBookings.length === 0 && (
                      <p className="text-center text-slate-500 py-8">Geen boekingen gevonden</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vakmannen Tab */}
            {activeTab === "vakmannen" && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Vakmannen Beheer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vakmannen.map((vakman, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${vakman.is_approved ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="font-bold text-lg">{vakman.name}</h3>
                                <Badge className={vakman.is_approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                  {vakman.is_approved ? "Goedgekeurd" : "In afwachting"}
                                </Badge>
                                <Badge variant="outline" className="capitalize">{vakman.service_type}</Badge>
                              </div>
                            </div>
                            {!vakman.is_approved && (
                              <div className="flex gap-2 flex-shrink-0">
                                <Button className="bg-green-500 hover:bg-green-600" onClick={() => approveVakman(vakman.id)}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Goedkeuren
                                </Button>
                                <Button variant="destructive" onClick={() => rejectVakman(vakman.id)}>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Afwijzen
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {/* Contact & Locatie */}
                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <a href={`mailto:${vakman.email}`} className="hover:text-[#FF4500]">{vakman.email}</a>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <a href={`tel:${vakman.phone}`} className="hover:text-[#FF4500]">{vakman.phone}</a>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              {vakman.location}
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Euro className="w-4 h-4 text-slate-400" />
                              €{vakman.hourly_rate}/uur
                            </div>
                          </div>

                          {/* Bedrijfsgegevens */}
                          <div className="bg-white/50 rounded-lg p-3 border border-slate-200">
                            <h4 className="font-medium text-slate-700 mb-2 text-sm">Bedrijfsgegevens</h4>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-slate-500">KVK-nummer:</span>
                                <p className="font-medium text-slate-900">{vakman.kvk_nummer || <span className="text-red-500 italic">Niet opgegeven</span>}</p>
                              </div>
                              <div>
                                <span className="text-slate-500">BTW-nummer:</span>
                                <p className="font-medium text-slate-900">{vakman.btw_nummer || <span className="text-slate-400 italic">Niet opgegeven</span>}</p>
                              </div>
                              <div>
                                <span className="text-slate-500">Verzekering:</span>
                                <p className="font-medium text-slate-900">{vakman.verzekering || <span className="text-red-500 italic">Niet opgegeven</span>}</p>
                              </div>
                              <div>
                                <span className="text-slate-500">Verzekeraar:</span>
                                <p className="font-medium text-slate-900">{vakman.verzekering_maatschappij || <span className="text-slate-400 italic">Niet opgegeven</span>}</p>
                              </div>
                            </div>
                          </div>

                          {/* Beschrijving */}
                          {vakman.description && (
                            <div>
                              <span className="text-sm text-slate-500">Beschrijving:</span>
                              <p className="text-sm text-slate-700 mt-1">{vakman.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {vakmannen.length === 0 && (
                      <p className="text-center text-slate-500 py-8">Geen vakmannen geregistreerd</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Reviews Beheer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border ${review.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold">{review.customer_name}</h3>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                                ))}
                              </div>
                              <Badge className={review.status === 'approved' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                {review.status === 'approved' ? "Gepubliceerd" : "In afwachting"}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">"{review.comment}"</p>
                            <div className="flex gap-4 text-xs text-slate-500">
                              <span>Dienst: {review.service}</span>
                              <span>Plaats: {review.city}</span>
                            </div>
                          </div>
                          {review.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button className="bg-green-500 hover:bg-green-600" onClick={() => approveReview(review.id)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Goedkeuren
                              </Button>
                              <Button variant="destructive" onClick={() => rejectReview(review.id)}>
                                <XCircle className="w-4 h-4 mr-2" />
                                Verwijderen
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <p className="text-center text-slate-500 py-8">Geen reviews</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Financial Tab */}
            {activeTab === "financial" && (
              <div className="space-y-6">
                {/* Period Selector & Export */}
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex gap-2">
                    {["day", "week", "month", "year"].map(period => (
                      <button
                        key={period}
                        onClick={() => setDateRange(period)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          dateRange === period 
                            ? "bg-[#FF4500] text-white" 
                            : "bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {period === "day" ? "Vandaag" : period === "week" ? "Week" : period === "month" ? "Maand" : "Jaar"}
                      </button>
                    ))}
                  </div>
                  <Button onClick={exportBookings} className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Exporteer CSV
                  </Button>
                </div>

                {/* Financial Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-500 text-sm">Totale Omzet</p>
                          <p className="text-2xl font-bold text-green-600">€{financialStats.financial?.total_revenue || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Euro className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-500 text-sm">Betaald</p>
                          <p className="text-2xl font-bold text-blue-600">€{financialStats.financial?.paid_revenue || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-500 text-sm">Openstaand</p>
                          <p className="text-2xl font-bold text-orange-600">€{financialStats.financial?.pending_revenue || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Receipt className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-500 text-sm">Gem. Orderwaarde</p>
                          <p className="text-2xl font-bold text-purple-600">€{financialStats.financial?.average_order_value || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Daily Revenue Chart */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Omzet Laatste 7 Dagen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {financialStats.financial?.daily_revenue?.map((day, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="text-sm text-slate-500 w-12">{day.date}</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-[#FF4500] to-orange-400 h-full rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${Math.max(10, (day.revenue / Math.max(...(financialStats.financial?.daily_revenue?.map(d => d.revenue) || [1]))) * 100)}%` }}
                              >
                                <span className="text-xs text-white font-medium">€{day.revenue}</span>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 w-16">{day.bookings} boek.</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Revenue by Service */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Omzet per Dienst</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(financialStats.financial?.revenue_by_service || {}).map(([service, revenue], idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {service === "elektricien" ? "⚡" : service === "loodgieter" ? "💧" : "🔑"}
                              </span>
                              <span className="font-medium capitalize">{service}</span>
                            </div>
                            <span className="font-bold text-green-600">€{revenue.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Status */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Betalingsstatus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <span className="font-medium">Betaald</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">{financialStats.financial?.payment_status?.paid || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 text-yellow-600" />
                            <span className="font-medium">Openstaand</span>
                          </div>
                          <span className="text-2xl font-bold text-yellow-600">{financialStats.financial?.payment_status?.unpaid || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bookings by Status */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Boekingen per Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(financialStats.financial?.bookings_by_status || {}).map(([status, count], idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                            <span className="text-sm capitalize">{status.replace("_", " ")}</span>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Marketing Tab */}
            {activeTab === "marketing" && (
              <div className="space-y-6">
                {/* Google Ads Connection */}
                <Card className={`border-2 ${googleAdsConnected ? 'border-green-300 bg-green-50' : 'border-dashed border-slate-300'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${googleAdsConnected ? 'bg-green-100' : 'bg-slate-100'}`}>
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">Google Ads</h3>
                          <p className="text-sm text-slate-500">
                            {googleAdsConnected ? `Gekoppeld: ${googleAdsId}` : 'Koppel je Google Ads account'}
                          </p>
                        </div>
                      </div>
                      {googleAdsConnected ? (
                        <div className="flex gap-2">
                          <Badge className="bg-green-100 text-green-800">Verbonden</Badge>
                          <Button variant="outline" size="sm" onClick={disconnectGoogleAds}>Ontkoppelen</Button>
                        </div>
                      ) : (
                        <Button onClick={() => setShowGoogleAdsModal(true)} className="bg-blue-600 hover:bg-blue-700">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Koppelen
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Country Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCountryTab("NL")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      selectedCountryTab === "NL" 
                        ? "bg-gradient-to-r from-[#FF4500] to-orange-500 text-white shadow-lg" 
                        : "bg-white text-slate-600 hover:bg-slate-50 border"
                    }`}
                  >
                    <span className="text-xl">🇳🇱</span>
                    Nederland
                    <Badge className={selectedCountryTab === "NL" ? "bg-white/20 text-white" : "bg-slate-100"}>
                      {getTotalStats("NL").activeCities}/{nlCities.length}
                    </Badge>
                  </button>
                  <button
                    onClick={() => setSelectedCountryTab("BE")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      selectedCountryTab === "BE" 
                        ? "bg-gradient-to-r from-yellow-500 to-red-500 text-white shadow-lg" 
                        : "bg-white text-slate-600 hover:bg-slate-50 border"
                    }`}
                  >
                    <span className="text-xl">🇧🇪</span>
                    België
                    <Badge className={selectedCountryTab === "BE" ? "bg-white/20 text-white" : "bg-slate-100"}>
                      {getTotalStats("BE").activeCities}/{beCities.length}
                    </Badge>
                  </button>
                </div>

                {/* Country Stats */}
                {(() => {
                  const stats = getTotalStats(selectedCountryTab);
                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-500 text-sm">Actieve Steden</p>
                              <p className="text-2xl font-bold text-green-600">{stats.activeCities}/{stats.totalCities}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-green-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-500 text-sm">Impressies</p>
                              <p className="text-2xl font-bold text-blue-600">{stats.impressions.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Eye className="w-6 h-6 text-blue-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-500 text-sm">Clicks</p>
                              <p className="text-2xl font-bold text-purple-600">{stats.clicks.toLocaleString()}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                              <Target className="w-6 h-6 text-purple-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-slate-500 text-sm">Conversies</p>
                              <p className="text-2xl font-bold text-[#FF4500]">{stats.conversions}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                              <TrendingUp className="w-6 h-6 text-[#FF4500]" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })()}

                {/* City Campaigns */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Flag className="w-5 h-5 text-[#FF4500]" />
                        Stad Campagnes - {selectedCountryTab === "NL" ? "Nederland" : "België"}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => activateAllCities(selectedCountryTab)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Alle Aan
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deactivateAllCities(selectedCountryTab)}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Alle Uit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {(selectedCountryTab === "NL" ? nlCities : beCities).map((city, idx) => {
                        const key = `${selectedCountryTab}_${city.name}`;
                        const campaign = cityCampaigns[key] || { active: false, budget: 10, impressions: 0, clicks: 0, conversions: 0 };
                        
                        return (
                          <div 
                            key={idx}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              campaign.active 
                                ? 'border-green-300 bg-green-50' 
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {/* Toggle */}
                                <button
                                  onClick={() => toggleCityCampaign(selectedCountryTab, city.name)}
                                  className={`relative w-14 h-8 rounded-full transition-colors ${
                                    campaign.active ? 'bg-green-500' : 'bg-slate-300'
                                  }`}
                                >
                                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                                    campaign.active ? 'translate-x-7' : 'translate-x-1'
                                  }`} />
                                </button>
                                
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-900">{city.name}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {(city.population / 1000).toFixed(0)}k inwoners
                                    </Badge>
                                  </div>
                                  {campaign.active && (
                                    <p className="text-xs text-green-600 mt-1">Campagne actief</p>
                                  )}
                                </div>
                              </div>

                              {campaign.active && (
                                <div className="flex items-center gap-6">
                                  <div className="text-center">
                                    <p className="text-xs text-slate-500">Impressies</p>
                                    <p className="font-bold text-blue-600">{campaign.impressions}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-slate-500">Clicks</p>
                                    <p className="font-bold text-purple-600">{campaign.clicks}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-slate-500">Conv.</p>
                                    <p className="font-bold text-green-600">{campaign.conversions}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">€</span>
                                    <input
                                      type="number"
                                      value={campaign.budget}
                                      onChange={(e) => updateCityBudget(selectedCountryTab, city.name, e.target.value)}
                                      className="w-16 px-2 py-1 border rounded text-center"
                                      min="5"
                                      max="500"
                                    />
                                    <span className="text-xs text-slate-500">/dag</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Ad Templates */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#FF4500]" />
                      Advertentie Templates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {Object.entries(campaignTemplates).map(([key, template]) => (
                        <div 
                          key={key}
                          onClick={() => setSelectedTemplate(key)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedTemplate === key 
                              ? 'border-[#FF4500] bg-orange-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <h4 className="font-bold text-slate-900 mb-1">{template.name}</h4>
                          <p className="text-xs text-slate-500 mb-3">{template.description}</p>
                          {selectedTemplate === key && (
                            <div className="space-y-2 pt-3 border-t">
                              {template.headlines.slice(0, 2).map((h, i) => (
                                <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded">
                                  <span className="truncate flex-1">{h}</span>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); copyAdText(h, 'Elektricien', 'Amsterdam'); }}>
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Google Ads Modal */}
            {showGoogleAdsModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
                        </svg>
                        Google Ads Koppelen
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowGoogleAdsModal(false)}>
                        <XCircle className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Google Ads Klant-ID</label>
                      <Input 
                        value={googleAdsId}
                        onChange={(e) => setGoogleAdsId(e.target.value)}
                        placeholder="123-456-7890"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Te vinden in je Google Ads account rechtsboven
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                      <p className="font-medium mb-1">Hoe te koppelen:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Log in op ads.google.com</li>
                        <li>Kopieer je Klant-ID (rechtsboven)</li>
                        <li>Plak het hierboven</li>
                      </ol>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setShowGoogleAdsModal(false)}>
                        Annuleren
                      </Button>
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={connectGoogleAds}>
                        Koppelen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Campaign Creator Modal */}
            {showCampaignCreator && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Nieuwe Campagne</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowCampaignCreator(false)}>
                        <XCircle className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Campagne Naam</label>
                      <Input 
                        value={campaignConfig.name}
                        onChange={(e) => setCampaignConfig({...campaignConfig, name: e.target.value})}
                        placeholder="bijv. Winter Spoed Campagne"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Land</label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setCampaignConfig({...campaignConfig, country: 'NL', cities: []})}
                          className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                            campaignConfig.country === 'NL' ? 'border-[#FF4500] bg-orange-50' : 'border-slate-200'
                          }`}
                        >
                          <span className="text-3xl mb-2 block">🇳🇱</span>
                          <span className="font-medium">Nederland</span>
                        </button>
                        <button
                          onClick={() => setCampaignConfig({...campaignConfig, country: 'BE', cities: []})}
                          className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                            campaignConfig.country === 'BE' ? 'border-[#FF4500] bg-orange-50' : 'border-slate-200'
                          }`}
                        >
                          <span className="text-3xl mb-2 block">🇧🇪</span>
                          <span className="font-medium">België</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Steden</label>
                      <div className="flex flex-wrap gap-2">
                        {(campaignConfig.country === 'NL' ? nlCities : beCities).map((city) => (
                          <button
                            key={city}
                            onClick={() => {
                              const cities = campaignConfig.cities.includes(city)
                                ? campaignConfig.cities.filter(c => c !== city)
                                : [...campaignConfig.cities, city];
                              setCampaignConfig({...campaignConfig, cities});
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                              campaignConfig.cities.includes(city)
                                ? 'bg-[#FF4500] text-white border-[#FF4500]'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Dagelijks Budget (€)</label>
                      <Input 
                        type="number"
                        value={campaignConfig.budget}
                        onChange={(e) => setCampaignConfig({...campaignConfig, budget: parseInt(e.target.value)})}
                        min="10"
                        max="1000"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setShowCampaignCreator(false)}>
                        Annuleren
                      </Button>
                      <Button 
                        className="flex-1 bg-[#FF4500] hover:bg-[#CC3700]"
                        onClick={() => createCampaign(campaignConfig.country)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Campagne Aanmaken
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
