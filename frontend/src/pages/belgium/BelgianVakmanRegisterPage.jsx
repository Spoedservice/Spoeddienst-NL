import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Zap, Droplets, Key, ArrowLeft, CheckCircle, Building2, FileText, Shield, Phone } from "lucide-react";
import { BE_CONFIG, beRoute } from "@/config/belgiumConfig";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const services = [
  { id: "elektricien", name: "Elektricien", icon: Zap },
  { id: "loodgieter", name: "Loodgieter", icon: Droplets },
  { id: "slotenmaker", name: "Slotenmaker", icon: Key }
];

const verzekeringOpties = [
  "Aansprakelijkheidsverzekering (BA)",
  "Bedrijfsaansprakelijkheidsverzekering",
  "Beroepsaansprakelijkheidsverzekering",
  "Combinatieverzekering",
  "Anders"
];

const voordelen = [
  "Ontvang klussen in jouw regio in België",
  "Bepaal je eigen uurtarief",
  "Flexibele werktijden",
  "Veilige betalingen via ons platform"
];

export default function BelgianVakmanRegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    service_type: "",
    description: "",
    hourly_rate: "",
    location: "",
    ondernemingsnummer: "", // Belgian business number instead of KVK
    btw_nummer: "",
    verzekering: "",
    verzekering_maatschappij: ""
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Wachtwoorden komen niet overeen");
      return;
    }

    if (!formData.service_type) {
      toast.error("Selecteer een vakgebied");
      return;
    }

    // Belgian business number validation (10 digits, starts with 0 or 1)
    const cleanOndNr = formData.ondernemingsnummer.replace(/[\s.]/g, "");
    if (!cleanOndNr || cleanOndNr.length !== 10) {
      toast.error("Vul een geldig ondernemingsnummer in (10 cijfers)");
      return;
    }

    if (!formData.verzekering) {
      toast.error("Selecteer een type verzekering");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/vakman/register`, {
        name: formData.name,
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone,
        password: formData.password,
        service_type: formData.service_type,
        description: formData.description,
        hourly_rate: parseFloat(formData.hourly_rate) || 0,
        location: formData.location,
        kvk_nummer: formData.ondernemingsnummer, // Send as kvk_nummer for backend compatibility
        btw_nummer: formData.btw_nummer,
        verzekering: formData.verzekering,
        verzekering_maatschappij: formData.verzekering_maatschappij,
        country: "BE" // Mark as Belgian registration
      });
      
      toast.success("Aanmelding succesvol! Je ontvangt binnenkort een e-mail van ons.");
      navigate(beRoute("/"));
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Er is iets misgegaan. Probeer het opnieuw.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link to={beRoute("/")} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span>Terug naar home</span>
        </Link>

        <Card className="border border-slate-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-[#FF4500] rounded-md flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Word Vakman in België</CardTitle>
            <p className="text-slate-500 text-sm mt-2">
              Meld je aan als vakman en ontvang klussen in Vlaanderen en Brussel
            </p>
          </CardHeader>

          <CardContent>
            {/* Voordelen */}
            <div className="bg-slate-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-slate-900 mb-3">Voordelen</h3>
              <ul className="space-y-2">
                {voordelen.map((voordeel, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {voordeel}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sectie 1: Persoonlijke gegevens */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-sm">1</span>
                  Persoonlijke gegevens
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Volledige naam *</Label>
                    <Input
                      className="mt-1"
                      id="name"
                      name="name"
                      placeholder="Jan Janssen"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      data-testid="vakman-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mailadres *</Label>
                    <Input
                      className="mt-1"
                      id="email"
                      name="email"
                      type="email"
                      placeholder="jan@voorbeeld.be"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      data-testid="vakman-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefoonnummer *</Label>
                    <Input
                      className="mt-1"
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="0498 12 34 56"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      data-testid="vakman-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Werkgebied *</Label>
                    <Input
                      className="mt-1"
                      id="location"
                      name="location"
                      placeholder="Antwerpen e.o."
                      required
                      value={formData.location}
                      onChange={handleInputChange}
                      data-testid="vakman-location"
                    />
                  </div>
                </div>
              </div>

              {/* Sectie 2: Bedrijfsgegevens België */}
              <div className="border-t pt-6">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Bedrijfsgegevens
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ondernemingsnummer" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      Ondernemingsnummer *
                    </Label>
                    <Input
                      className="mt-1"
                      id="ondernemingsnummer"
                      name="ondernemingsnummer"
                      placeholder="0123.456.789"
                      maxLength={14}
                      required
                      value={formData.ondernemingsnummer}
                      onChange={handleInputChange}
                      data-testid="vakman-ondernemingsnummer"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      10 cijfers, te vinden op de Kruispuntbank van Ondernemingen (KBO)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="btw_nummer" className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      BTW-nummer
                    </Label>
                    <Input
                      className="mt-1"
                      id="btw_nummer"
                      name="btw_nummer"
                      placeholder="BE0123456789"
                      value={formData.btw_nummer}
                      onChange={handleInputChange}
                      data-testid="vakman-btw"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Optioneel voor kleine ondernemers (vrijstelling)
                    </p>
                  </div>
                </div>
              </div>

              {/* Sectie 3: Verzekering */}
              <div className="border-t pt-6">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-sm">3</span>
                  Verzekering
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="verzekering" className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-400" />
                      Type verzekering *
                    </Label>
                    <select
                      id="verzekering"
                      name="verzekering"
                      className="mt-1 w-full h-10 px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent"
                      required
                      value={formData.verzekering}
                      onChange={handleInputChange}
                      data-testid="vakman-verzekering"
                    >
                      <option value="">Selecteer verzekering</option>
                      {verzekeringOpties.map((optie) => (
                        <option key={optie} value={optie}>{optie}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="verzekering_maatschappij">Verzekeringsmaatschappij</Label>
                    <Input
                      className="mt-1"
                      id="verzekering_maatschappij"
                      name="verzekering_maatschappij"
                      placeholder="bijv. AG Insurance, Ethias"
                      value={formData.verzekering_maatschappij}
                      onChange={handleInputChange}
                      data-testid="vakman-verzekering-maatschappij"
                    />
                  </div>
                </div>
              </div>

              {/* Sectie 4: Vakgebied & ervaring */}
              <div className="border-t pt-6">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-sm">4</span>
                  Vakgebied & ervaring
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="service_type">Vakgebied *</Label>
                    <select
                      id="service_type"
                      name="service_type"
                      className="mt-1 w-full h-10 px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent"
                      required
                      value={formData.service_type}
                      onChange={handleInputChange}
                      data-testid="vakman-service"
                    >
                      <option value="">Selecteer vakgebied</option>
                      <option value="elektricien">Elektricien</option>
                      <option value="loodgieter">Loodgieter</option>
                      <option value="slotenmaker">Slotenmaker</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="hourly_rate">Uurtarief (€) *</Label>
                    <Input
                      className="mt-1"
                      id="hourly_rate"
                      name="hourly_rate"
                      type="number"
                      placeholder="65"
                      required
                      value={formData.hourly_rate}
                      onChange={handleInputChange}
                      data-testid="vakman-rate"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Over jezelf & ervaring *</Label>
                  <Textarea
                    className="mt-1 h-24"
                    id="description"
                    name="description"
                    placeholder="Vertel iets over je ervaring, specialisaties en certificeringen..."
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    data-testid="vakman-description"
                  />
                </div>
              </div>

              {/* Sectie 5: Account aanmaken */}
              <div className="border-t pt-6">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-sm">5</span>
                  Account aanmaken
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Wachtwoord *</Label>
                    <Input
                      className="mt-1"
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      data-testid="vakman-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Bevestig wachtwoord *</Label>
                    <Input
                      className="mt-1"
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      data-testid="vakman-confirm-password"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#FF4500] hover:bg-[#CC3700] h-12 text-lg"
                disabled={loading}
                data-testid="vakman-submit"
              >
                {loading ? "Bezig met aanmelden..." : "Aanmelden als Vakman"}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Door je aan te melden ga je akkoord met onze{" "}
                <Link to="/voorwaarden" className="text-[#FF4500] hover:underline">algemene voorwaarden</Link>
                {" "}en{" "}
                <Link to="/privacy" className="text-[#FF4500] hover:underline">privacybeleid</Link>.
              </p>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-slate-500">
                Al een account? <Link to="/login" className="text-[#FF4500] hover:underline font-medium">Log hier in</Link>
              </p>
            </div>

            {/* Contact info */}
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-slate-500 mb-2">Vragen over aanmelden?</p>
              <a 
                href={`tel:${BE_CONFIG.contact.phone}`}
                className="inline-flex items-center gap-2 text-[#FF4500] font-medium hover:underline"
              >
                <Phone className="w-4 h-4" />
                {BE_CONFIG.contact.phoneDisplay}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
