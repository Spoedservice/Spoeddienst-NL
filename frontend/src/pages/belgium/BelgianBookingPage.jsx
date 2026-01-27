import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Zap, Droplet, Key, Phone, Clock, Shield, Upload,
  CheckCircle, ArrowRight, ArrowLeft, MapPin, X, Loader2
} from "lucide-react";
import { BE_CONFIG, BELGIAN_CITIES, BELGIAN_SERVICES, beRoute } from "@/config/belgiumConfig";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SERVICE_ICONS = {
  loodgieter: Droplet,
  slotenmaker: Key,
  elektricien: Zap
};

const URGENCY_OPTIONS = [
  { value: "spoed", label: "Spoed (binnen 2 uur)", description: "Dringend probleem dat direct opgelost moet worden" },
  { value: "vandaag", label: "Vandaag", description: "Binnen dezelfde dag" },
  { value: "morgen", label: "Morgen", description: "De volgende werkdag" },
  { value: "gepland", label: "Gepland", description: "Kies een specifieke datum" }
];

export default function BelgianBookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preSelectedService = searchParams.get("service");
  const preSelectedCity = searchParams.get("city");

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  
  const [formData, setFormData] = useState({
    service: preSelectedService || "",
    urgency: "spoed",
    description: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    postcode: "",
    city: preSelectedCity ? BELGIAN_CITIES.find(c => c.slug === preSelectedCity)?.name || "" : "",
    preferredDate: "",
    photos: []
  });

  const [filteredCities, setFilteredCities] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  useEffect(() => {
    if (formData.city.length >= 2) {
      const matches = BELGIAN_CITIES.filter(c => 
        c.name.toLowerCase().includes(formData.city.toLowerCase())
      ).slice(0, 8);
      setFilteredCities(matches);
    } else {
      setFilteredCities([]);
    }
  }, [formData.city]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceSelect = (serviceSlug) => {
    setFormData(prev => ({ ...prev, service: serviceSlug }));
  };

  const handleCitySelect = (city) => {
    setFormData(prev => ({ ...prev, city: city.name }));
    setShowCityDropdown(false);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is te groot (max 10MB)`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setUploadedPhotos(prev => [...prev, {
          name: file.name,
          preview: reader.result,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.service) {
        toast.error("Selecteer een dienst");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!formData.description || formData.description.length < 10) {
        toast.error("Beschrijf uw probleem (minimaal 10 tekens)");
        return false;
      }
    }
    if (currentStep === 3) {
      if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.postcode || !formData.city) {
        toast.error("Vul alle verplichte velden in");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Vul een geldig e-mailadres in");
        return false;
      }
      // Belgian phone validation (more flexible)
      const phoneClean = formData.phone.replace(/[\s\-\(\)]/g, "");
      if (phoneClean.length < 9) {
        toast.error("Vul een geldig telefoonnummer in");
        return false;
      }
      // Belgian postcode validation (4 digits)
      if (!/^\d{4}$/.test(formData.postcode)) {
        toast.error("Vul een geldige Belgische postcode in (4 cijfers)");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    
    try {
      // Upload photos first if any
      let photoUrls = [];
      if (uploadedPhotos.length > 0) {
        const uploadFormData = new FormData();
        uploadedPhotos.forEach(photo => {
          uploadFormData.append("files", photo.file);
        });
        
        try {
          const uploadResponse = await fetch(`${API_URL}/api/upload`, {
            method: "POST",
            body: uploadFormData
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            photoUrls = uploadResult.urls || [];
          }
        } catch {
          console.log("Photo upload failed, continuing without photos");
        }
      }

      // Create booking
      const bookingData = {
        service_type: formData.service,
        is_emergency: formData.urgency === "spoed",
        description: formData.description,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        address: formData.address,
        postal_code: formData.postcode,
        city: formData.city,
        preferred_date: formData.preferredDate || new Date().toISOString().split("T")[0],
        preferred_time: formData.urgency === "spoed" ? "zo snel mogelijk" : "overdag",
        photo_url: photoUrls.length > 0 ? photoUrls[0] : null
      };

      console.log("Sending booking data:", JSON.stringify(bookingData, null, 2));

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Booking error response:", errorData);
        throw new Error(errorData.detail || "Boeking mislukt");
      }

      const result = await response.json();
      toast.success("Boeking succesvol! We nemen zo snel mogelijk contact met u op.");
      
      // Redirect to success page or show confirmation
      navigate("/booking/success", { 
        state: { 
          bookingId: result.booking_id,
          service: formData.service,
          country: "BE"
        } 
      });
      
    } catch (error) {
      console.error("Booking error:", error);
      console.error("Form data was:", JSON.stringify(formData, null, 2));
      const errorMessage = error.message || "Onbekende fout";
      toast.error(`Fout: ${errorMessage}. Bel ons direct op ${BE_CONFIG.contact.phoneDisplay}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = BELGIAN_SERVICES.find(s => s.slug === formData.service);
  const SelectedIcon = selectedService ? SERVICE_ICONS[selectedService.slug] : null;

  return (
    <>
      <Helmet>
        <title>Boek een Vakman | SpoedDienst24.be - 24/7 Service België</title>
        <meta name="description" content="Boek direct een loodgieter, slotenmaker of elektricien in België. 24/7 beschikbaar, binnen 30 minuten ter plaatse." />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to={beRoute("/")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF4500] to-[#CC3700] rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">SpoedDienst24<span className="text-[#FF4500]">.be</span></span>
            </Link>
            
            <a 
              href={`tel:${BE_CONFIG.contact.phone}`}
              className="flex items-center gap-2 bg-[#FF4500] text-white px-4 py-2 rounded-full font-bold hover:bg-[#CC3700]"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{BE_CONFIG.contact.phoneDisplay}</span>
            </a>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s ? "bg-[#FF4500] text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 4 && (
                  <div className={`w-12 h-1 ${step > s ? "bg-[#FF4500]" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Service Selection */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Welke dienst heeft u nodig?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {BELGIAN_SERVICES.map(service => {
                    const Icon = SERVICE_ICONS[service.slug];
                    const isSelected = formData.service === service.slug;
                    return (
                      <button
                        key={service.slug}
                        onClick={() => handleServiceSelect(service.slug)}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          isSelected 
                            ? "border-[#FF4500] bg-orange-50" 
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                            isSelected ? "bg-[#FF4500] text-white" : "bg-slate-100"
                          }`}>
                            <Icon className="w-7 h-7" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{service.name}</h3>
                            <p className="text-sm text-slate-500">{service.description}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-6 h-6 text-[#FF4500] ml-auto" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={nextStep} 
                    disabled={!formData.service}
                    className="bg-[#FF4500] hover:bg-[#CC3700]"
                  >
                    Volgende <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Problem Description */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Beschrijf uw probleem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Urgency */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Hoe urgent is het?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {URGENCY_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setFormData(prev => ({ ...prev, urgency: option.value }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.urgency === option.value
                            ? "border-[#FF4500] bg-orange-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <p className="font-semibold text-sm">{option.label}</p>
                        <p className="text-xs text-slate-500">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date picker for planned */}
                {formData.urgency === "gepland" && (
                  <div className="space-y-2">
                    <Label htmlFor="preferredDate">Gewenste datum</Label>
                    <Input
                      id="preferredDate"
                      name="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Omschrijving van het probleem *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Beschrijf zo gedetailleerd mogelijk wat er aan de hand is..."
                    rows={4}
                  />
                </div>

                {/* Photo Upload */}
                <div className="space-y-3">
                  <Label>Foto's toevoegen (optioneel)</Label>
                  <p className="text-sm text-slate-500">
                    Foto's helpen onze vakmannen om het probleem beter in te schatten
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative w-24 h-24">
                        <img 
                          src={photo.preview} 
                          alt={photo.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    {uploadedPhotos.length < 5 && (
                      <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#FF4500] transition-colors">
                        <Upload className="w-6 h-6 text-slate-400" />
                        <span className="text-xs text-slate-400 mt-1">Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Terug
                  </Button>
                  <Button 
                    onClick={nextStep}
                    className="bg-[#FF4500] hover:bg-[#CC3700]"
                  >
                    Volgende <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Contact Details */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Uw gegevens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Naam *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Uw volledige naam"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefoonnummer *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={BE_CONFIG.phoneExample}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mailadres *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="uw@email.be"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adres *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Straat en huisnummer"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      placeholder="2000"
                      maxLength={4}
                    />
                  </div>
                  <div className="col-span-2 space-y-2 relative">
                    <Label htmlFor="city">Gemeente *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      onFocus={() => setShowCityDropdown(true)}
                      placeholder="Antwerpen"
                      autoComplete="off"
                    />
                    {showCityDropdown && filteredCities.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 z-10 max-h-48 overflow-auto">
                        {filteredCities.map(city => (
                          <button
                            key={city.slug}
                            onClick={() => handleCitySelect(city)}
                            className="w-full px-4 py-2 text-left hover:bg-slate-100 flex items-center gap-2"
                          >
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{city.name}</span>
                            <span className="text-xs text-slate-400">{city.province}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Terug
                  </Button>
                  <Button 
                    onClick={nextStep}
                    className="bg-[#FF4500] hover:bg-[#CC3700]"
                  >
                    Controleren <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Bevestig uw boeking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    {SelectedIcon && (
                      <div className="w-14 h-14 bg-[#FF4500] rounded-xl flex items-center justify-center">
                        <SelectedIcon className="w-7 h-7 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg">{selectedService?.name}</h3>
                      <Badge className={
                        formData.urgency === "spoed" 
                          ? "bg-red-100 text-red-700" 
                          : "bg-slate-100 text-slate-700"
                      }>
                        {URGENCY_OPTIONS.find(o => o.value === formData.urgency)?.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-slate-600 mb-1">Probleem:</p>
                    <p className="text-slate-900">{formData.description}</p>
                  </div>

                  {uploadedPhotos.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-slate-600 mb-2">{uploadedPhotos.length} foto('s) toegevoegd</p>
                      <div className="flex gap-2">
                        {uploadedPhotos.map((photo, index) => (
                          <img 
                            key={index}
                            src={photo.preview} 
                            alt=""
                            className="w-16 h-16 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Naam</p>
                      <p className="font-medium">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Telefoon</p>
                      <p className="font-medium">{formData.phone}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Adres</p>
                      <p className="font-medium">{formData.address}, {formData.postcode} {formData.city}</p>
                    </div>
                  </div>
                </div>

                {/* Trust signals */}
                <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-[#FF4500]" />
                    Binnen 30 min ter plaatse
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-[#FF4500]" />
                    Vaste prijzen
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Terug
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-[#FF4500] hover:bg-[#CC3700] px-8"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Bezig...
                      </>
                    ) : (
                      <>
                        Bevestig Boeking
                        <CheckCircle className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency CTA */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 mb-2">Liever direct bellen?</p>
            <a 
              href={`tel:${BE_CONFIG.contact.phone}`}
              className="inline-flex items-center gap-2 text-[#FF4500] font-bold text-lg hover:underline"
            >
              <Phone className="w-5 h-5" />
              {BE_CONFIG.contact.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
