import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Phone, Mail, MapPin, Search, Eye, CheckCircle, XCircle, 
  Camera, RefreshCw, Download, Clock 
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SERVICE_ICONS = {
  loodgieter: "🔧",
  slotenmaker: "🔑",
  elektricien: "⚡"
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

const STATUS_LABELS = {
  pending: "In afwachting",
  confirmed: "Bevestigd",
  in_progress: "Bezig",
  completed: "Afgerond",
  cancelled: "Geannuleerd"
};

export default function BookingsManagement({ 
  bookings, 
  vakmannen, 
  onRefresh, 
  token,
  onAssignBooking 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assigning, setAssigning] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await axios.put(
        `${API}/admin/booking/${bookingId}/status`,
        { status: newStatus },
        { headers }
      );
      toast.success(`Status gewijzigd naar ${STATUS_LABELS[newStatus]}`);
      onRefresh();
    } catch (error) {
      toast.error("Fout bij wijzigen status");
    }
  };

  const assignBooking = async (bookingId, vakmanId) => {
    setAssigning(bookingId);
    try {
      await axios.post(
        `${API}/bookings/${bookingId}/assign`,
        { vakman_id: vakmanId },
        { headers }
      );
      toast.success("Boeking toegewezen aan vakman");
      onRefresh();
    } catch (error) {
      toast.error("Fout bij toewijzen boeking");
    } finally {
      setAssigning(null);
    }
  };

  const getAvailableVakmannen = (serviceType) => {
    return vakmannen.filter(v => v.service_type === serviceType && v.is_approved);
  };

  const exportBookings = () => {
    window.open(`${API}/admin/export/bookings?token=${token}`, '_blank');
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <CardTitle className="text-lg">Alle Boekingen ({filteredBookings.length})</CardTitle>
          <div className="flex gap-2 flex-wrap">
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
              className="border rounded-md px-3 py-2 text-sm bg-white"
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
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={exportBookings}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
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
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">Foto</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">Monteur</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">Status</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-slate-500">Actie</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking, idx) => (
                <tr key={idx} className="border-b hover:bg-slate-50">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{SERVICE_ICONS[booking.service_type] || "🔧"}</span>
                      <span className="text-sm capitalize">{booking.service_type}</span>
                      {booking.is_emergency && (
                        <Badge className="bg-red-100 text-red-800 text-xs">Spoed</Badge>
                      )}
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
                  <td className="py-3 px-2">
                    {booking.photo_url ? (
                      <a 
                        href={`${process.env.REACT_APP_BACKEND_URL}${booking.photo_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Camera className="w-5 h-5" />
                      </a>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {booking.vakman_name ? (
                      <div className="text-sm">
                        <p className="font-medium">{booking.vakman_name}</p>
                        <p className="text-xs text-slate-500">{booking.vakman_phone}</p>
                      </div>
                    ) : booking.status === "pending" ? (
                      <select
                        className="text-xs border rounded px-2 py-1 bg-white"
                        onChange={(e) => e.target.value && assignBooking(booking.id, e.target.value)}
                        disabled={assigning === booking.id}
                      >
                        <option value="">Toewijzen...</option>
                        {getAvailableVakmannen(booking.service_type).map(v => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <Badge className={STATUS_COLORS[booking.status]}>
                      {STATUS_LABELS[booking.status]}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedBooking(selectedBooking === booking.id ? null : booking.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {booking.status === "pending" && (
                        <Button
                          size="sm"
                          className="h-8 bg-green-500 hover:bg-green-600"
                          onClick={() => updateBookingStatus(booking.id, "confirmed")}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          size="sm"
                          className="h-8 bg-purple-500 hover:bg-purple-600"
                          onClick={() => updateBookingStatus(booking.id, "in_progress")}
                        >
                          <Clock className="w-4 h-4" />
                        </Button>
                      )}
                      {booking.status === "in_progress" && (
                        <Button
                          size="sm"
                          className="h-8 bg-green-600 hover:bg-green-700"
                          onClick={() => updateBookingStatus(booking.id, "completed")}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {booking.status !== "cancelled" && booking.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8"
                          onClick={() => updateBookingStatus(booking.id, "cancelled")}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredBookings.length === 0 && (
            <p className="text-center text-slate-500 py-8">Geen boekingen gevonden</p>
          )}
        </div>

        {/* Booking Details Modal/Expanded View */}
        {selectedBooking && (
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
            {(() => {
              const booking = bookings.find(b => b.id === selectedBooking);
              if (!booking) return null;
              return (
                <div className="space-y-2">
                  <h4 className="font-bold">Beschrijving Probleem:</h4>
                  <p className="text-sm text-slate-600">{booking.description || "Geen beschrijving"}</p>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div>
                      <strong>Aangemaakt:</strong> {new Date(booking.created_at).toLocaleString('nl-NL')}
                    </div>
                    {booking.assigned_at && (
                      <div>
                        <strong>Toegewezen:</strong> {new Date(booking.assigned_at).toLocaleString('nl-NL')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
