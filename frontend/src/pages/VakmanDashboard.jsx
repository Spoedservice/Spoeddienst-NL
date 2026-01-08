import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Zap, Droplets, Key, Calendar, Clock, MapPin, LogOut, User, Euro, CheckCircle, AlertCircle, Briefcase } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = {
  elektricien: Zap,
  loodgieter: Droplets,
  slotenmaker: Key
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

const statusLabels = {
  pending: "Nieuw",
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

  const handleUpdateStatus = async (bookingId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API}/bookings/${bookingId}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboard(token);
      toast.success("Status bijgewerkt");
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
      <header className="bg-slate-900 text-white py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">SpoedKlus</span>
            <Badge className="bg-slate-700 text-slate-300 ml-2">Vakman</Badge>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300 hidden sm:inline">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-white hover:bg-slate-800" data-testid="vakman-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Uitloggen
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Approval Warning */}
        {!vakman?.is_approved && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Account in behandeling</p>
              <p className="text-sm text-yellow-700">Je account wordt nog geverifieerd. Je ontvangt bericht zodra je bent goedgekeurd.</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Totaal klussen</p>
                  <p className="font-heading font-bold text-2xl text-slate-900">{stats.total_jobs}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Openstaand</p>
                  <p className="font-heading font-bold text-2xl text-slate-900">{stats.pending_jobs}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Afgerond</p>
                  <p className="font-heading font-bold text-2xl text-slate-900">{stats.completed_jobs}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Verdiensten</p>
                  <p className="font-heading font-bold text-2xl text-slate-900">€{stats.earnings || 0}</p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Euro className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Profiel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="w-7 h-7 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{vakman?.name}</p>
                    <p className="text-sm text-slate-500 capitalize">{vakman?.service_type}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Beschikbaarheid</p>
                      <p className="text-sm text-slate-500">
                        {vakman?.is_available ? 'Je ontvangt klussen' : 'Je ontvangt geen klussen'}
                      </p>
                    </div>
                    <Switch 
                      checked={vakman?.is_available} 
                      onCheckedChange={handleAvailabilityChange}
                      disabled={!vakman?.is_approved}
                      data-testid="availability-switch"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Uurtarief</span>
                    <span className="font-medium text-slate-900">€{vakman?.hourly_rate},-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Werkgebied</span>
                    <span className="font-medium text-slate-900">{vakman?.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Beoordeling</span>
                    <span className="font-medium text-slate-900">{vakman?.rating?.toFixed(1) || '-'}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bookings */}
          <div className="lg:col-span-2">
            <h2 className="font-heading font-bold text-xl text-slate-900 mb-4">Klussen</h2>
            
            {bookings.length === 0 ? (
              <Card className="border border-slate-200">
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                    Nog geen klussen
                  </h3>
                  <p className="text-slate-500">
                    {vakman?.is_approved 
                      ? 'Zodra er een klus binnenkomt zie je deze hier.'
                      : 'Wacht tot je account is goedgekeurd om klussen te ontvangen.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="border border-slate-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${booking.is_emergency ? 'bg-[#FF4500]/10' : 'bg-slate-100'}`}>
                            <ServiceIcon type={booking.service_type} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-heading font-bold text-slate-900">{booking.customer_name}</h3>
                              {booking.is_emergency && (
                                <Badge className="bg-[#FF4500] text-white text-xs">Spoed</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-500">{booking.customer_phone}</p>
                          </div>
                        </div>
                        <Badge className={statusColors[booking.status]}>
                          {statusLabels[booking.status]}
                        </Badge>
                      </div>

                      <p className="text-slate-600 mb-4">{booking.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {booking.preferred_date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.preferred_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {booking.address}, {booking.postal_code} {booking.city}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <p className="font-heading font-bold text-xl text-slate-900">€{booking.price},-</p>
                        
                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                            >
                              Afwijzen
                            </Button>
                            <Button 
                              size="sm"
                              className="bg-[#FF4500] hover:bg-[#CC3700]"
                              onClick={() => handleUpdateStatus(booking.id, 'accepted')}
                              data-testid={`accept-booking-${booking.id}`}
                            >
                              Accepteren
                            </Button>
                          </div>
                        )}
                        
                        {booking.status === 'accepted' && (
                          <Button 
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleUpdateStatus(booking.id, 'in_progress')}
                          >
                            Start klus
                          </Button>
                        )}
                        
                        {booking.status === 'in_progress' && (
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleUpdateStatus(booking.id, 'completed')}
                          >
                            Klus voltooid
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
