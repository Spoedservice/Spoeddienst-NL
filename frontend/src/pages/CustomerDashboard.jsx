import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Zap, Droplets, Key, Calendar, Clock, MapPin, LogOut, User, Settings, ChevronRight } from "lucide-react";

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
  pending: "In behandeling",
  accepted: "Geaccepteerd",
  in_progress: "Bezig",
  completed: "Voltooid",
  cancelled: "Geannuleerd"
};

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
    fetchBookings(token);
  }, [navigate]);

  const fetchBookings = async (token) => {
    try {
      const response = await axios.get(`${API}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">SpoedDienst24</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 hidden sm:inline">Hallo, {user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="logout-btn">
              <LogOut className="w-4 h-4 mr-2" />
              Uitloggen
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{user?.name}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                  </div>
                </div>
                <nav className="space-y-1">
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 text-slate-900 font-medium"
                  >
                    <Calendar className="w-4 h-4" />
                    Mijn Boekingen
                  </Link>
                  <Link 
                    to="/" 
                    className="flex items-center gap-2 p-2 rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    <Zap className="w-4 h-4" />
                    Nieuwe Boeking
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-heading font-bold text-2xl text-slate-900">Mijn Boekingen</h1>
              <Link to="/">
                <Button className="bg-[#FF4500] hover:bg-[#CC3700]" data-testid="new-booking-btn">
                  Nieuwe Boeking
                </Button>
              </Link>
            </div>

            {bookings.length === 0 ? (
              <Card className="border border-slate-200">
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                    Nog geen boekingen
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Je hebt nog geen klussen geboekt. Maak je eerste boeking!
                  </p>
                  <Link to="/">
                    <Button className="bg-[#FF4500] hover:bg-[#CC3700]">
                      Boek een vakman
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="border border-slate-200 hover:border-slate-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            <ServiceIcon type={booking.service_type} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-heading font-bold text-lg text-slate-900 capitalize">
                                {booking.service_type}
                              </h3>
                              {booking.is_emergency && (
                                <Badge className="bg-[#FF4500] text-white text-xs">Spoed</Badge>
                              )}
                            </div>
                            <p className="text-slate-600 text-sm mb-2 line-clamp-1">
                              {booking.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
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
                                {booking.city}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={statusColors[booking.status]}>
                            {statusLabels[booking.status]}
                          </Badge>
                          <p className="font-heading font-bold text-xl text-slate-900 mt-2">
                            €{booking.price},-
                          </p>
                          <p className="text-xs text-slate-500">
                            {booking.payment_status === 'paid' ? 'Betaald' : 'Nog te betalen'}
                          </p>
                        </div>
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
