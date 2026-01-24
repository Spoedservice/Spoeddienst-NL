import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Zap, Droplets, Key, Calendar, Clock, MapPin, LogOut, User, Euro, 
  CheckCircle, AlertCircle, Briefcase, Phone, Mail, RefreshCw,
  ChevronLeft, ChevronRight, Filter, Eye, EyeOff, CalendarDays,
  ListTodo, Star
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = {
  elektricien: Zap,
  loodgieter: Droplets,
  slotenmaker: Key
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800"
};

const statusLabels = {
  pending: "Wacht op toewijzing",
  confirmed: "Nieuw - Actie vereist",
  accepted: "Geaccepteerd",
  in_progress: "Bezig",
  completed: "Voltooid",
  cancelled: "Geannuleerd"
};

export default function VakmanDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("opdrachten");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'vakman') {
      navigate('/dashboard');
      return;
    }
    
    setUser(parsedUser);
    fetchDashboard(token);
  }, [navigate]);

  const fetchDashboard = async (token) => {
    try {
      const response = await axios.get(`${API}/vakman/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = async (checked) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API}/vakman/availability?is_available=${checked}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(prev => ({
        ...prev,
        vakman: { ...prev.vakman, is_available: checked }
      }));
      toast.success(checked ? "Je bent nu beschikbaar voor klussen" : "Je bent nu niet beschikbaar");
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Kon beschikbaarheid niet updaten");
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API}/bookings/${bookingId}/vakman-accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboard(token);
      toast.success("Opdracht geaccepteerd!");
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast.error(error.response?.data?.detail || "Kon opdracht niet accepteren");
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API}/bookings/${bookingId}/vakman-reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboard(token);
      toast.success("Opdracht afgewezen. Admin is op de hoogte gesteld.");
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast.error(error.response?.data?.detail || "Kon opdracht niet afwijzen");
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API}/bookings/${bookingId}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboard(token);
      toast.success("Status bijgewerkt");
      setSelectedBooking(null);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Kon status niet bijwerken");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success("Uitgelogd");
    navigate('/');
  };

  const ServiceIcon = ({ type }) => {
    const Icon = iconMap[type] || Zap;
    return <Icon className="w-5 h-5" />;
  };

  // Get week dates for agenda
  const getWeekDates = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(currentWeek);
  const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  const getBookingsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return (dashboardData?.bookings || []).filter(b => b.preferred_date === dateStr);
  };

  const filteredBookings = (dashboardData?.bookings || []).filter(b => {
    if (filterStatus === "all") return true;
    return b.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#FF4500] border-t-transparent rounded-full" />
      </div>
    );
  }

  const vakman = dashboardData?.vakman;
  const bookings = dashboardData?.bookings || [];
  const stats = dashboardData?.stats || {};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg hidden sm:inline">SpoedDienst24</span>
            <Badge className="bg-slate-700 text-slate-300 ml-2">Vakman</Badge>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => fetchDashboard(localStorage.getItem('token'))} className="text-white hover:text-white hover:bg-slate-800">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-300 hidden sm:inline">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-white hover:bg-slate-800" data-testid="vakman-logout">
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Uitloggen</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Approval Warning */}
        {!vakman?.is_approved && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-yellow-800">Account in behandeling</p>
              <p className="text-sm text-yellow-700">Je account wordt nog geverifieerd. Je ontvangt bericht zodra je bent goedgekeurd.</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Totaal klussen</p>
                  <p className="font-bold text-2xl text-slate-900">{stats.total_jobs}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Openstaand</p>
                  <p className="font-bold text-2xl text-[#FF4500]">{stats.pending_jobs}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#FF4500]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Afgerond</p>
                  <p className="font-bold text-2xl text-green-600">{stats.completed_jobs}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Verdiensten</p>
                  <p className="font-bold text-2xl text-emerald-600">€{stats.earnings || 0}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Euro className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "opdrachten", label: "Opdrachten", icon: ListTodo, count: bookings.filter(b => b.status === 'confirmed').length },
            { id: "agenda", label: "Agenda", icon: CalendarDays },
            { id: "profiel", label: "Profiel", icon: User }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? "bg-[#FF4500] text-white" 
                  : "bg-white text-slate-600 hover:bg-slate-50 shadow-sm"
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

        {/* Opdrachten Tab */}
        {activeTab === "opdrachten" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Booking List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filter */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "all", label: "Alle" },
                  { value: "pending", label: "Nieuw" },
                  { value: "accepted", label: "Geaccepteerd" },
                  { value: "in_progress", label: "Bezig" },
                  { value: "completed", label: "Voltooid" }
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilterStatus(f.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      filterStatus === f.value 
                        ? "bg-slate-900 text-white" 
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredBookings.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-slate-900 mb-2">
                      Geen opdrachten
                    </h3>
                    <p className="text-slate-500">
                      {vakman?.is_approved 
                        ? 'Zodra er een klus binnenkomt zie je deze hier.'
                        : 'Wacht tot je account is goedgekeurd om klussen te ontvangen.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((booking) => (
                    <Card 
                      key={booking.id} 
                      className={`border-0 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                        selectedBooking?.id === booking.id ? 'ring-2 ring-[#FF4500]' : ''
                      }`}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              booking.is_emergency ? 'bg-[#FF4500]/10' : 'bg-slate-100'
                            }`}>
                              <ServiceIcon type={booking.service_type} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-900">{booking.customer_name}</h3>
                                {booking.is_emergency && (
                                  <Badge className="bg-[#FF4500] text-white text-xs">Spoed</Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 mt-1 line-clamp-1">{booking.description}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {booking.preferred_date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {booking.preferred_time}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Badge className={statusColors[booking.status]}>
                              {statusLabels[booking.status]}
                            </Badge>
                            <p className="font-bold text-lg text-slate-900 mt-2">€{booking.price},-</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Detail Panel */}
            <div className="lg:col-span-1">
              {selectedBooking ? (
                <Card className="border-0 shadow-sm sticky top-24">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Opdracht Details</CardTitle>
                      <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600">
                        <EyeOff className="w-4 h-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Customer Info */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Klantgegevens
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-slate-900">{selectedBooking.customer_name}</p>
                        <a href={`tel:${selectedBooking.customer_phone}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                          <Phone className="w-4 h-4" />
                          {selectedBooking.customer_phone}
                        </a>
                        <a href={`mailto:${selectedBooking.customer_email}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                          <Mail className="w-4 h-4" />
                          {selectedBooking.customer_email}
                        </a>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Locatie
                      </h4>
                      <div className="text-sm text-slate-600">
                        <p>{selectedBooking.address}</p>
                        <p>{selectedBooking.postal_code} {selectedBooking.city}</p>
                      </div>
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(`${selectedBooking.address}, ${selectedBooking.postal_code} ${selectedBooking.city}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                      >
                        Open in Google Maps →
                      </a>
                    </div>

                    {/* Schedule */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Afspraak
                      </h4>
                      <div className="text-sm text-slate-600">
                        <p><strong>Datum:</strong> {selectedBooking.preferred_date}</p>
                        <p><strong>Tijd:</strong> {selectedBooking.preferred_time}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Omschrijving</h4>
                      <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4">
                        {selectedBooking.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t space-y-2">
                      {/* Nieuw toegewezen door admin - vakman moet accepteren of afwijzen */}
                      {selectedBooking.status === 'confirmed' && (
                        <>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-blue-800 font-medium">
                              🔔 Deze opdracht is aan jou toegewezen. Accepteer of wijs af.
                            </p>
                          </div>
                          <Button 
                            className="w-full bg-[#FF4500] hover:bg-[#CC3700]"
                            onClick={() => handleAcceptBooking(selectedBooking.id)}
                            data-testid={`accept-booking-${selectedBooking.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accepteren
                          </Button>
                          <Button 
                            variant="outline"
                            className="w-full border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleRejectBooking(selectedBooking.id)}
                            data-testid={`reject-booking-${selectedBooking.id}`}
                          >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Afwijzen
                          </Button>
                        </>
                      )}
                      
                      {selectedBooking.status === 'accepted' && (
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleUpdateStatus(selectedBooking.id, 'in_progress')}
                        >
                          Start klus
                        </Button>
                      )}
                      
                      {selectedBooking.status === 'in_progress' && (
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Klus voltooid
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center">
                    <Eye className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Selecteer een opdracht om details te bekijken</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Agenda Tab */}
        {activeTab === "agenda" && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Weekoverzicht</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(currentWeek);
                      newDate.setDate(newDate.getDate() - 7);
                      setCurrentWeek(newDate);
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium px-2">
                    {weekDates[0].toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} - {weekDates[6].toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(currentWeek);
                      newDate.setDate(newDate.getDate() + 7);
                      setCurrentWeek(newDate);
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, idx) => {
                  const dayBookings = getBookingsForDate(date);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={idx} 
                      className={`min-h-[150px] border rounded-lg p-2 ${
                        isToday ? 'border-[#FF4500] bg-orange-50' : 'border-slate-200'
                      }`}
                    >
                      <div className={`text-center mb-2 ${isToday ? 'text-[#FF4500]' : 'text-slate-600'}`}>
                        <div className="text-xs font-medium">{dayNames[idx]}</div>
                        <div className={`text-lg font-bold ${isToday ? 'bg-[#FF4500] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                          {date.getDate()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {dayBookings.map((booking, bIdx) => (
                          <div 
                            key={bIdx}
                            className={`text-xs p-1.5 rounded cursor-pointer transition-colors ${
                              booking.is_emergency 
                                ? 'bg-[#FF4500]/10 text-[#FF4500] hover:bg-[#FF4500]/20' 
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                            onClick={() => {
                              setActiveTab("opdrachten");
                              setSelectedBooking(booking);
                            }}
                          >
                            <div className="font-medium truncate">{booking.customer_name}</div>
                            <div className="text-[10px] opacity-75">{booking.preferred_time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-[#FF4500]/20" />
                  <span>Spoed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-blue-100" />
                  <span>Regulier</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profiel Tab */}
        {activeTab === "profiel" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Profiel Informatie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#FF4500] to-orange-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {vakman?.name?.charAt(0)?.toUpperCase() || 'V'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{vakman?.name}</h3>
                    <p className="text-slate-500 capitalize">{vakman?.service_type}</p>
                    <Badge className={vakman?.is_approved ? "bg-green-100 text-green-800 mt-2" : "bg-yellow-100 text-yellow-800 mt-2"}>
                      {vakman?.is_approved ? "Geverifieerd" : "In afwachting"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium text-slate-900">{vakman?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Telefoon</p>
                    <p className="font-medium text-slate-900">{vakman?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Werkgebied</p>
                    <p className="font-medium text-slate-900">{vakman?.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Uurtarief</p>
                    <p className="font-medium text-slate-900">€{vakman?.hourly_rate},-</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-500 mb-2">Beschrijving</p>
                  <p className="text-slate-700">{vakman?.description || 'Geen beschrijving'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Instellingen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">Beschikbaarheid</p>
                    <p className="text-sm text-slate-500">
                      {vakman?.is_available ? 'Je ontvangt nieuwe opdrachten' : 'Je ontvangt geen nieuwe opdrachten'}
                    </p>
                  </div>
                  <Switch 
                    checked={vakman?.is_available} 
                    onCheckedChange={handleAvailabilityChange}
                    disabled={!vakman?.is_approved}
                    data-testid="availability-switch"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-slate-900">Beoordeling</p>
                      <p className="text-sm text-slate-500">{vakman?.total_reviews || 0} reviews</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star 
                        key={i} 
                        className={`w-6 h-6 ${i <= (vakman?.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
                      />
                    ))}
                    <span className="ml-2 font-bold text-lg">{vakman?.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-emerald-900">Totale Verdiensten</p>
                      <p className="text-sm text-emerald-700">Gebaseerd op voltooide opdrachten</p>
                    </div>
                    <p className="text-3xl font-bold text-emerald-600">€{stats.earnings || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
