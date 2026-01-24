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
import { Zap, Droplets, Key, CalendarIcon, Clock, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Star, MapPin, Euro, User, Phone } from "lucide-react";

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
  const [vakmannen, setVakmannen] = useState([]);
  const [selectedVakman, setSelectedVakman] = useState(null);
  const [loadingVakmannen, setLoadingVakmannen] = useState(false);
  
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
      fetchVakmannen();
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

  const fetchVakmannen = async () => {
    setLoadingVakmannen(true);
    try {
      const response = await axios.get(`${API}/vakmannen/available?service_type=${serviceType}`);
      setVakmannen(response.data);
    } catch (error) {
      console.error("Error fetching vakmannen:", error);
    } finally {
      setLoadingVakmannen(false);
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
        customer_phone: formData.customer_phone,
        assigned_vakman_id: selectedVakman?.id || null,
        assigned_vakman_name: selectedVakman?.name || null
      };

      const response = await axios.post(`${API}/bookings`, bookingData);
      
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
  const price = selectedVakman 
    ? (isEmergency ? selectedVakman.hourly_rate * 1.5 : selectedVakman.hourly_rate)
    : (service ? (isEmergency ? service.emergency_price : service.base_price) : 0);

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.description.length > 10;
      case 2:
        return selectedVakman !== null;
      case 3:
        return date && formData.preferred_time;
      case 4:
        return formData.address && formData.postal_code && formData.city;
      case 5:
        return formData.customer_name && formData.customer_email && formData.customer_phone;
      default:
        return false;
    }
  };

  const steps = [
    { num: 1, label: "Probleem" },
    { num: 2, label: "Monteur" },
    { num: 3, label: "Datum" },
    { num: 4, label: "Adres" },
    { num: 5, label: "Contact" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span>Terug naar home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
            isEmergency ? 'bg-[#FF4500]/10' : 'bg-blue-50'
          }`}>
            <ServiceIcon className={`w-8 h-8 ${isEmergency ? 'text-[#FF4500]' : 'text-blue-600'}`} />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
            {service?.title || 'Dienst'} Boeken
          </h1>
          {isEmergency && (
            <Badge className="mt-2 bg-[#FF4500] text-white">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Spoed Service
            </Badge>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-4 left-0 right-0 h-1 bg-slate-200 -z-10" />
          <div 
            className="absolute top-4 left-0 h-1 bg-[#FF4500] transition-all -z-10"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s.num ? 'bg-[#FF4500] text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${step >= s.num ? 'text-[#FF4500]' : 'text-slate-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 sm:p-8">
            {/* Step 1: Problem Description */}
            {step === 1 && (
              <div className="space-y-6" data-testid="step-problem">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Beschrijf het probleem</h2>
                  <p className="text-slate-500">Vertel ons wat er aan de hand is zodat de monteur zich kan voorbereiden.</p>
                </div>

                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setIsEmergency(false)}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      !isEmergency ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                    }`}
                  >
                    <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="font-medium">Regulier</div>
                    <div className="text-sm text-slate-500">Plan vooruit</div>
                  </button>
                  <button
                    onClick={() => setIsEmergency(true)}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      isEmergency ? 'border-[#FF4500] bg-orange-50' : 'border-slate-200'
                    }`}
                  >
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-[#FF4500]" />
                    <div className="font-medium">Spoed</div>
                    <div className="text-sm text-slate-500">Direct hulp</div>
                  </button>
                </div>

                <div>
                  <Label htmlFor="description">Probleemomschrijving *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Beschrijf zo duidelijk mogelijk wat er aan de hand is..."
                    className="mt-1 h-32"
                    data-testid="description-input"
                  />
                  <p className="text-xs text-slate-500 mt-1">Minimaal 10 karakters</p>
                </div>
              </div>
            )}

            {/* Step 2: Choose Vakman */}
            {step === 2 && (
              <div className="space-y-6" data-testid="step-vakman">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Kies uw monteur</h2>
                  <p className="text-slate-500">Selecteer een beschikbare monteur in uw regio.</p>
                </div>

                {loadingVakmannen ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-[#FF4500] border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-500">Monteurs laden...</p>
                  </div>
                ) : vakmannen.length === 0 ? (
                  <div className="text-center py-8 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="font-bold text-lg text-slate-900 mb-2">Geen monteurs beschikbaar</h3>
                    <p className="text-slate-600 mb-4">Er zijn momenteel geen monteurs beschikbaar voor deze dienst.</p>
                    <Button onClick={() => navigate('/')} variant="outline">
                      Terug naar home
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vakmannen.map((vakman) => (
                      <div
                        key={vakman.id}
                        onClick={() => setSelectedVakman(vakman)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedVakman?.id === vakman.id
                            ? 'border-[#FF4500] bg-orange-50 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        }`}
                        data-testid={`vakman-${vakman.id}`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-16 h-16 bg-gradient-to-br from-[#FF4500] to-orange-400 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                            {vakman.name?.charAt(0)?.toUpperCase() || 'V'}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-lg text-slate-900">{vakman.name}</h3>
                              {vakman.rating > 0 && (
                                <div className="flex items-center gap-1 bg-yellow-100 px-2 py-0.5 rounded-full">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="text-sm font-medium text-yellow-700">{vakman.rating?.toFixed(1)}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {vakman.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                {vakman.total_reviews || 0} reviews
                              </span>
                            </div>
                            
                            {vakman.description && (
                              <p className="text-sm text-slate-500 mt-2 line-clamp-2">{vakman.description}</p>
                            )}
                          </div>
                          
                          {/* Price */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-2xl font-bold text-[#FF4500]">
                              €{isEmergency ? Math.round(vakman.hourly_rate * 1.5) : vakman.hourly_rate}
                            </div>
                            <div className="text-xs text-slate-500">per uur</div>
                            {isEmergency && (
                              <Badge className="mt-1 bg-[#FF4500]/10 text-[#FF4500] text-xs">Spoed tarief</Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Selected indicator */}
                        {selectedVakman?.id === vakman.id && (
                          <div className="mt-3 pt-3 border-t border-orange-200 flex items-center gap-2 text-[#FF4500]">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Geselecteerd</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <div className="space-y-6" data-testid="step-datetime">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Kies datum en tijd</h2>
                  <p className="text-slate-500">Wanneer komt het u het beste uit?</p>
                </div>

                {selectedVakman && (
                  <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FF4500] to-orange-400 rounded-lg flex items-center justify-center text-white font-bold">
                      {selectedVakman.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{selectedVakman.name}</p>
                      <p className="text-sm text-slate-500">{selectedVakman.location}</p>
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <Label>Datum *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left mt-1 h-12">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, 'd MMMM yyyy', { locale: nl }) : 'Selecteer datum'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date()}
                          locale={nl}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Tijdslot *</Label>
                    <Select value={formData.preferred_time} onValueChange={(value) => setFormData({...formData, preferred_time: value})}>
                      <SelectTrigger className="mt-1 h-12" data-testid="time-select">
                        <SelectValue placeholder="Kies een tijdslot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Address */}
            {step === 4 && (
              <div className="space-y-6" data-testid="step-address">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Waar moeten we zijn?</h2>
                  <p className="text-slate-500">Vul het adres in waar de werkzaamheden uitgevoerd moeten worden.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Straat en huisnummer *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Voorbeeldstraat 123"
                      className="mt-1"
                      data-testid="address-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postal_code">Postcode *</Label>
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
                      <Label htmlFor="city">Plaats *</Label>
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
              </div>
            )}

            {/* Step 5: Contact */}
            {step === 5 && (
              <div className="space-y-6" data-testid="step-contact">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Uw gegevens</h2>
                  <p className="text-slate-500">Hoe kunnen we u bereiken?</p>
                </div>

                {/* Summary */}
                <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-bold text-slate-900">Samenvatting</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-slate-500">Dienst:</span>
                    <span className="font-medium">{service?.title}</span>
                    <span className="text-slate-500">Monteur:</span>
                    <span className="font-medium">{selectedVakman?.name || 'Eerste beschikbare'}</span>
                    <span className="text-slate-500">Datum:</span>
                    <span className="font-medium">{date ? format(date, 'd MMMM yyyy', { locale: nl }) : '-'}</span>
                    <span className="text-slate-500">Tijd:</span>
                    <span className="font-medium">{formData.preferred_time}</span>
                    <span className="text-slate-500">Adres:</span>
                    <span className="font-medium">{formData.address}, {formData.city}</span>
                  </div>
                  <div className="border-t pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Geschatte prijs:</span>
                    <span className="text-2xl font-bold text-[#FF4500]">€{price},-</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer_name">Uw naam *</Label>
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
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer_email">E-mail *</Label>
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
                      <Label htmlFor="customer_phone">Telefoon *</Label>
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
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💳 Betaling:</strong> U betaalt direct aan de monteur na afloop van de klus. Wij accepteren contant en pin.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Vorige
              </Button>
              
              {step < 5 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="gap-2 bg-[#FF4500] hover:bg-[#CC3700]"
                  data-testid="next-button"
                >
                  Volgende
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || loading}
                  className="gap-2 bg-[#FF4500] hover:bg-[#CC3700]"
                  data-testid="submit-button"
                >
                  {loading ? "Bezig..." : "Boeking Bevestigen"}
                  <CheckCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Price Indicator */}
        <div className="mt-6 text-center">
          <p className="text-slate-500">
            Geschatte prijs: <span className="font-bold text-[#FF4500] text-xl">€{price},-</span>
            {isEmergency && <span className="text-sm ml-2">(spoed tarief)</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
