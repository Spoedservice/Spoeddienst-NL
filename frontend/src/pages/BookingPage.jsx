import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Zap, Droplets, Key, CalendarIcon, Clock, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = {
  elektricien: Zap,
  loodgieter: Droplets,
  slotenmaker: Key
};

const timeSlots = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
  "20:00 - 22:00 (Spoed)"
];

export default function BookingPage() {
  const { serviceType, bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [isEmergency, setIsEmergency] = useState(searchParams.get('emergency') === 'true');
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    description: "",
    address: "",
    postal_code: "",
    city: "",
    preferred_time: "",
    customer_name: "",
    customer_email: "",
    customer_phone: ""
  });

  useEffect(() => {
    if (serviceType) {
      fetchService();
    }
  }, [serviceType]);

  const fetchService = async () => {
    try {
      const response = await axios.get(`${API}/services/${serviceType}`);
      setService(response.data.service);
    } catch (error) {
      console.error("Error fetching service:", error);
      toast.error("Dienst niet gevonden");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const bookingData = {
        service_type: serviceType,
        is_emergency: isEmergency,
        description: formData.description,
        address: formData.address,
        postal_code: formData.postal_code,
        city: formData.city,
        preferred_date: date ? format(date, 'yyyy-MM-dd') : '',
        preferred_time: formData.preferred_time,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone
      };

      const response = await axios.post(`${API}/bookings`, bookingData);
      
      // Geen online betaling - redirect naar success pagina
      toast.success("Boeking succesvol ontvangen!");
      navigate(`/booking/success?booking_id=${response.data.booking.id}`);
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Er is iets misgegaan. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  const ServiceIcon = iconMap[serviceType] || Zap;
  const price = service ? (isEmergency ? service.emergency_price : service.base_price) : 0;

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.description.length > 10;
      case 2:
        return date && formData.preferred_time;
      case 3:
        return formData.address && formData.postal_code && formData.city;
      case 4:
        return formData.customer_name && formData.customer_email && formData.customer_phone;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Terug</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">SpoedDienst24</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm
                  ${step >= s ? 'bg-[#FF4500] text-white' : 'bg-slate-200 text-slate-500'}`}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-[#FF4500]' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-[#FF4500]/10 rounded-lg flex items-center justify-center">
                    <ServiceIcon className="w-6 h-6 text-[#FF4500]" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-xl">{service?.name || 'Dienst'}</CardTitle>
                    <p className="text-sm text-slate-500">
                      {step === 1 && "Beschrijf je probleem"}
                      {step === 2 && "Kies datum en tijd"}
                      {step === 3 && "Jouw adres"}
                      {step === 4 && "Jouw gegevens"}
                    </p>
                  </div>
                </div>
                {isEmergency && (
                  <Badge className="bg-[#FF4500] text-white w-fit">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Spoed aanvraag
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {/* Step 1: Problem Description */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="description" className="text-base font-medium">Wat is het probleem?</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Beschrijf zo uitgebreid mogelijk wat er aan de hand is..."
                        className="mt-2 h-32"
                        data-testid="description-input"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer p-4 border border-slate-200 rounded-lg hover:border-[#FF4500] transition-colors">
                        <div 
                          className={`relative w-12 h-6 rounded-full transition-colors ${isEmergency ? 'bg-[#FF4500]' : 'bg-slate-200'}`}
                          onClick={() => setIsEmergency(!isEmergency)}
                          data-testid="emergency-toggle"
                        >
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isEmergency ? 'translate-x-6' : ''}`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Spoed - Direct hulp nodig</p>
                          <p className="text-sm text-slate-500">24/7 beschikbaar, snellere reactietijd</p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 2: Date & Time */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Selecteer een datum</Label>
                      <div className="mt-2 flex justify-center">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          locale={nl}
                          disabled={(date) => date < new Date()}
                          className="rounded-md border"
                          data-testid="date-calendar"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-base font-medium">Selecteer een tijdslot</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setFormData({ ...formData, preferred_time: slot })}
                            className={`p-3 border rounded-lg text-sm font-medium transition-colors
                              ${formData.preferred_time === slot 
                                ? 'border-[#FF4500] bg-[#FF4500]/5 text-[#FF4500]' 
                                : 'border-slate-200 hover:border-slate-300'}`}
                            data-testid={`time-slot-${slot.replace(/\s/g, '-')}`}
                          >
                            <Clock className="w-4 h-4 inline mr-2" />
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Address */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Straat en huisnummer</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Hoofdstraat 123"
                        className="mt-1"
                        data-testid="address-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postal_code">Postcode</Label>
                        <Input
                          id="postal_code"
                          name="postal_code"
                          value={formData.postal_code}
                          onChange={handleInputChange}
                          placeholder="1234 AB"
                          className="mt-1"
                          data-testid="postal-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">Plaats</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Amsterdam"
                          className="mt-1"
                          data-testid="city-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Contact Details */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customer_name">Naam</Label>
                      <Input
                        id="customer_name"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleInputChange}
                        placeholder="Jan Jansen"
                        className="mt-1"
                        data-testid="name-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_email">E-mailadres</Label>
                      <Input
                        id="customer_email"
                        name="customer_email"
                        type="email"
                        value={formData.customer_email}
                        onChange={handleInputChange}
                        placeholder="jan@voorbeeld.nl"
                        className="mt-1"
                        data-testid="email-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_phone">Telefoonnummer</Label>
                      <Input
                        id="customer_phone"
                        name="customer_phone"
                        type="tel"
                        value={formData.customer_phone}
                        onChange={handleInputChange}
                        placeholder="06 12345678"
                        className="mt-1"
                        data-testid="phone-input"
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(step - 1)}
                      data-testid="prev-btn"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Vorige
                    </Button>
                  ) : (
                    <div />
                  )}
                  
                  {step < 4 ? (
                    <Button 
                      onClick={() => setStep(step + 1)}
                      disabled={!canProceed()}
                      className="bg-[#FF4500] hover:bg-[#CC3700]"
                      data-testid="next-btn"
                    >
                      Volgende
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit}
                      disabled={!canProceed() || loading}
                      className="bg-[#FF4500] hover:bg-[#CC3700]"
                      data-testid="submit-btn"
                    >
                      {loading ? "Bezig..." : "Bevestig & Betaal"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div>
            <Card className="border border-slate-200 sticky top-4">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Overzicht</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <ServiceIcon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{service?.name}</p>
                    <p className="text-sm text-slate-500">{isEmergency ? 'Spoed' : 'Regulier'}</p>
                  </div>
                </div>

                {date && (
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span>{format(date, 'd MMMM yyyy', { locale: nl })}</span>
                  </div>
                )}

                {formData.preferred_time && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{formData.preferred_time}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Totaal</span>
                    <span className="font-heading font-bold text-2xl text-slate-900">€{price},-</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">incl. BTW</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Tevredenheidsgarantie</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Veilig betalen</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
