import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Zap, Droplets, Key, CheckCircle, Phone, Camera, X, Image } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const services = [
  {
    id: "elektricien",
    title: "Elektricien",
    description: "Storingen, installaties en reparaties",
    icon: Zap,
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-600",
    features: ["Binnen 15 minuten reactie", "Gecertificeerde vakmensen", "Garantie op werk"]
  },
  {
    id: "loodgieter",
    title: "Loodgieter",
    description: "Lekke kranen, verstoppingen en cv-onderhoud",
    icon: Droplets,
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
    features: ["Direct beschikbaar", "Ook voor spoedreparaties", "Professioneel gereedschap"]
  },
  {
    id: "slotenmaker",
    title: "Slotenmaker",
    description: "Buitengesloten, sloten vervangen",
    icon: Key,
    color: "green",
    bgColor: "bg-green-100",
    textColor: "text-green-600",
    features: ["24/7 bereikbaar", "Schadevrij openen", "Vaste prijzen"]
  }
];

const timeSlots = [
  "Zo snel mogelijk",
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00"
];

export default function BookingPage() {
  const { serviceType } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [selectedService, setSelectedService] = useState(serviceType || "");
  const [isEmergency, setIsEmergency] = useState(true);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [formData, setFormData] = useState({
    description: "",
    preferred_date: new Date().toISOString().split('T')[0],
    preferred_time: "Zo snel mogelijk",
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    address: "",
    postal_code: "",
    city: ""
  });

  useEffect(() => {
    if (serviceType) {
      setSelectedService(serviceType);
    }
  }, [serviceType]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedService) {
      toast.error("Selecteer eerst een dienst");
      return;
    }
    
    if (!formData.description || !formData.customer_name || !formData.customer_phone || 
        !formData.customer_email || !formData.address || !formData.postal_code || !formData.city) {
      toast.error("Vul alle verplichte velden in");
      return;
    }
    
    setLoading(true);
    try {
      const bookingData = {
        service_type: selectedService,
        is_emergency: isEmergency,
        description: formData.description,
        address: formData.address,
        postal_code: formData.postal_code,
        city: formData.city,
        preferred_date: formData.preferred_date,
        preferred_time: formData.preferred_time,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone
      };

      const response = await axios.post(`${API}/bookings`, bookingData);
      
      toast.success(`Bedankt ${formData.customer_name}! Uw boeking is ontvangen. We nemen binnen 15 minuten contact met u op.`);
      navigate(`/booking/success?booking_id=${response.data.booking.id}`);
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Er is iets misgegaan. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div 
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 bg-gradient-to-br from-orange-500 to-red-600 shadow-lg cursor-pointer hover:scale-105 transition-transform"
          >
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">SpoedDienst24</h1>
          <p className="text-lg text-slate-600">24/7 betrouwbare vakmannen voor al uw klussen</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Selecteer uw dienst</h2>
          
          {/* Service Selection */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {services.map((service) => {
              const Icon = service.icon;
              const isSelected = selectedService === service.id;
              
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`cursor-pointer border-2 rounded-xl p-6 text-center transition-all hover:-translate-y-1 ${
                    isSelected 
                      ? "border-[#FF4500] bg-orange-50 shadow-md" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  data-testid={`service-${service.id}`}
                >
                  <div className={`w-16 h-16 ${service.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${service.textColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{service.description}</p>
                  <div className="text-xs text-slate-500 space-y-1">
                    {service.features.map((feature, idx) => (
                      <p key={idx}>✓ {feature}</p>
                    ))}
                  </div>
                  {isSelected && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-[#FF4500]">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Geselecteerd</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Booking Form - Shows when service is selected */}
          {selectedService && (
            <form onSubmit={handleSubmit} className="border-t pt-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Beschrijf uw klus</h3>
              
              {/* Urgency Selection */}
              <div className="mb-6">
                <Label className="block text-sm font-medium text-slate-700 mb-3">Type afspraak</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setIsEmergency(false)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      !isEmergency ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="urgency" 
                        checked={!isEmergency}
                        onChange={() => setIsEmergency(false)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">Regulier</p>
                        <p className="text-sm text-slate-600">Plan vooruit - vanaf €49,-</p>
                      </div>
                    </div>
                  </div>
                  <div 
                    onClick={() => setIsEmergency(true)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      isEmergency ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="urgency" 
                        checked={isEmergency}
                        onChange={() => setIsEmergency(true)}
                        className="w-4 h-4 text-orange-600"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">Spoed 🚨</p>
                        <p className="text-sm text-slate-600">Direct hulp - vanaf €99,-</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Problem Description */}
              <div className="mb-6">
                <Label htmlFor="description">Omschrijving van het probleem *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-2"
                  placeholder="Beschrijf zo duidelijk mogelijk wat er aan de hand is..."
                  data-testid="description-input"
                />
              </div>

              {/* Date and Time */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="preferred_date">Gewenste datum *</Label>
                  <Input
                    type="date"
                    id="preferred_date"
                    name="preferred_date"
                    value={formData.preferred_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Gewenste tijd *</Label>
                  <Select 
                    value={formData.preferred_time} 
                    onValueChange={(value) => setFormData({...formData, preferred_time: value})}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecteer tijd" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="customer_name">Naam *</Label>
                  <Input
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    placeholder="Uw naam"
                    className="mt-2"
                    data-testid="name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="customer_phone">Telefoonnummer *</Label>
                  <Input
                    id="customer_phone"
                    name="customer_phone"
                    type="tel"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    placeholder="06 12345678"
                    className="mt-2"
                    data-testid="phone-input"
                  />
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="customer_email">E-mailadres *</Label>
                <Input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  placeholder="uw@email.nl"
                  className="mt-2"
                  data-testid="email-input"
                />
              </div>

              {/* Address */}
              <div className="mb-6">
                <Label htmlFor="address">Straat en huisnummer *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Voorbeeldstraat 123"
                  className="mt-2"
                  data-testid="address-input"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <Label htmlFor="postal_code">Postcode *</Label>
                  <Input
                    id="postal_code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    placeholder="1234 AB"
                    className="mt-2"
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
                    className="mt-2"
                    data-testid="city-input"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                data-testid="submit-button"
              >
                {loading ? "Bezig met versturen..." : "Bevestig boeking"}
              </Button>
            </form>
          )}
        </div>

        {/* USPs */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="font-bold text-slate-900 mb-1">15 minuten reactie</h3>
            <p className="text-sm text-slate-600">Bij spoedklussen direct beschikbaar</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-4xl mb-2">✓</div>
            <h3 className="font-bold text-slate-900 mb-1">Gecertificeerd vakmanschap</h3>
            <p className="text-sm text-slate-600">Alleen ervaren professionals</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="font-bold text-slate-900 mb-1">Geen verrassingen</h3>
            <p className="text-sm text-slate-600">Vaste prijzen, geen meerkosten</p>
          </div>
        </div>

        {/* Contact Footer */}
        <div className="text-center">
          <p className="text-slate-600 mb-2">Direct hulp nodig?</p>
          <a 
            href="tel:085 333 2847" 
            className="inline-flex items-center gap-2 bg-[#FF4500] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#CC3700] transition-colors"
          >
            <Phone className="w-5 h-5" />
            085 333 2847
          </a>
        </div>
      </div>
    </div>
  );
}
