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

const nlCities = ["Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Almere", "Breda", "Nijmegen"];
const beCities = ["Antwerpen", "Gent", "Brussel", "Charleroi", "Luik", "Brugge", "Namen", "Leuven", "Mechelen", "Aalst"];

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
  
  // Campaign state
  const [campaigns, setCampaigns] = useState([]);
  const [showCampaignCreator, setShowCampaignCreator] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [campaignConfig, setCampaignConfig] = useState({
    name: "",
    country: "NL",
    cities: [],
    services: ["elektricien", "loodgieter", "slotenmaker"],
    budget: 50,
    startDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, vakmannenRes, reviewsRes, statsRes, financialRes, marketingRes] = await Promise.all([
        axios.get(`${API}/admin/bookings`),
        axios.get(`${API}/admin/vakmannen`),
        axios.get(`${API}/admin/reviews`),
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/financial?period=${dateRange}`),
        axios.get(`${API}/admin/marketing`)
      ]);
      setBookings(bookingsRes.data);
      setVakmannen(vakmannenRes.data);
      setReviews(reviewsRes.data);
      setStats(statsRes.data);
      setFinancialStats({
        financial: financialRes.data,
        marketing: marketingRes.data
      });
      
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
      axios.get(`${API}/admin/financial?period=${dateRange}`)
        .then(res => setFinancialStats(prev => ({ ...prev, financial: res.data })))
        .catch(err => console.error(err));
    }
  }, [dateRange]);

  // Campaign functions
  const createCampaign = (country) => {
    const cities = country === "NL" ? nlCities : beCities;
    const template = selectedTemplate ? campaignTemplates[selectedTemplate] : campaignTemplates.spoed;
    
    const newCampaign = {
      id: Date.now(),
      name: campaignConfig.name || `${template.name} - ${country}`,
      country,
      cities: campaignConfig.cities.length > 0 ? campaignConfig.cities : cities.slice(0, 5),
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
      await axios.post(`${API}/admin/vakman/${vakmanId}/approve`);
      toast.success("Vakman goedgekeurd!");
      fetchAllData();
    } catch (error) {
      toast.error("Fout bij goedkeuren");
    }
  };

  const rejectVakman = async (vakmanId) => {
    try {
      await axios.post(`${API}/admin/vakman/${vakmanId}/reject`);
      toast.success("Vakman afgewezen");
      fetchAllData();
    } catch (error) {
      toast.error("Fout bij afwijzen");
    }
  };

  const approveReview = async (reviewId) => {
    try {
      await axios.post(`${API}/admin/review/${reviewId}/approve`);
      toast.success("Review goedgekeurd!");
      fetchAllData();
    } catch (error) {
      toast.error("Fout bij goedkeuren");
    }
  };

  const rejectReview = async (reviewId) => {
    try {
      await axios.post(`${API}/admin/review/${reviewId}/reject`);
      toast.success("Review verwijderd");
      fetchAllData();
    } catch (error) {
      toast.error("Fout bij verwijderen");
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`${API}/admin/booking/${bookingId}/status`, { status });
      toast.success(`Status gewijzigd naar ${status}`);
      fetchAllData();
    } catch (error) {
      toast.error("Fout bij wijzigen status");
    }
  };

  const exportBookings = () => {
    window.open(`${API}/admin/export/bookings`, '_blank');
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
                {/* Marketing Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-500 text-sm">Totale Boekingen</p>
                          <p className="text-2xl font-bold text-slate-900">{financialStats.marketing?.total_bookings || 0}</p>
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
                          <p className="text-slate-500 text-sm">Spoed Boekingen</p>
                          <p className="text-2xl font-bold text-red-600">{financialStats.marketing?.emergency_vs_regular?.emergency || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-500 text-sm">Conversie Ratio</p>
                          <p className="text-2xl font-bold text-green-600">{financialStats.marketing?.conversion_rate || 0}%</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Target className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-500 text-sm">Reguliere Boekingen</p>
                          <p className="text-2xl font-bold text-slate-900">{financialStats.marketing?.emergency_vs_regular?.regular || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-slate-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Service Performance */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Dienst Prestaties</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {financialStats.marketing?.service_performance?.map((service, idx) => (
                          <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">
                                  {service.service === "elektricien" ? "⚡" : service.service === "loodgieter" ? "💧" : "🔑"}
                                </span>
                                <span className="font-bold capitalize">{service.service}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">Boekingen</p>
                                <p className="font-bold text-lg">{service.bookings}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Omzet</p>
                                <p className="font-bold text-lg text-green-600">€{service.revenue}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Cities */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Top Steden</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(financialStats.marketing?.top_cities || {}).map(([city, count], idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#FF4500] rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{city}</span>
                                <span className="text-sm text-slate-500">{count} boekingen</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-[#FF4500] h-2 rounded-full"
                                  style={{ width: `${(count / Math.max(...Object.values(financialStats.marketing?.top_cities || {1: 1}))) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        {Object.keys(financialStats.marketing?.top_cities || {}).length === 0 && (
                          <p className="text-center text-slate-500 py-4">Geen gegevens</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emergency vs Regular */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Spoed vs Regulier</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center gap-8 py-4">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-3xl font-bold text-red-600">
                              {financialStats.marketing?.emergency_vs_regular?.emergency || 0}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">Spoed</p>
                        </div>
                        <div className="text-4xl text-slate-300">vs</div>
                        <div className="text-center">
                          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-3xl font-bold text-blue-600">
                              {financialStats.marketing?.emergency_vs_regular?.regular || 0}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">Regulier</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Popular Time Slots */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Populaire Tijdsloten</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(financialStats.marketing?.time_slots || {})
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([slot, count], idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span className="text-sm">{slot}</span>
                              </div>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          ))}
                        {Object.keys(financialStats.marketing?.time_slots || {}).length === 0 && (
                          <p className="text-center text-slate-500 py-4">Geen gegevens</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
