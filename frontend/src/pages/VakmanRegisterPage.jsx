import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Zap, Droplets, Key, ArrowLeft, CheckCircle, Building2, FileText, Shield } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const services = [
  { id: "elektricien", name: "Elektricien", icon: Zap },
  { id: "loodgieter", name: "Loodgieter", icon: Droplets },
  { id: "slotenmaker", name: "Slotenmaker", icon: Key }
];

const verzekeringOpties = [
  "Aansprakelijkheidsverzekering (AVB)",
  "Bedrijfsaansprakelijkheidsverzekering",
  "Beroepsaansprakelijkheidsverzekering",
  "Combinatieverzekering",
  "Anders"
];

export default function VakmanRegisterPage() {
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
    kvk_nummer: "",
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

    if (!formData.kvk_nummer || formData.kvk_nummer.length < 8) {
      toast.error("Vul een geldig KVK-nummer in (8 cijfers)");
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
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        service_type: formData.service_type,
        description: formData.description,
        hourly_rate: parseFloat(formData.hourly_rate),
        location: formData.location,
        kvk_nummer: formData.kvk_nummer,
        btw_nummer: formData.btw_nummer,
        verzekering: formData.verzekering,
        verzekering_maatschappij: formData.verzekering_maatschappij
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success("Aanmelding succesvol! Je account wordt binnenkort goedgekeurd.");
      navigate('/vakman/dashboard');
    } catch (error) {
      console.error("Register error:", error);
      toast.error(error.response?.data?.detail || "Registratie mislukt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
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
            <CardTitle className="font-heading text-2xl">Word Vakman</CardTitle>
            <p className="text-slate-500 text-sm mt-2">
              Meld je aan als vakman en ontvang klussen in jouw regio
            </p>
          </CardHeader>
          <CardContent>
            {/* Benefits */}
            <div className="bg-slate-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-slate-900 mb-3">Voordelen</h3>
              <ul className="space-y-2">
                {[
                  "Ontvang klussen in jouw regio",
                  "Bepaal je eigen uurtarief",
                  "Flexibele werktijden",
                  "Veilige betalingen via ons platform"
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Persoonlijke gegevens */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-sm">1</span>
                  Persoonlijke gegevens
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Volledige naam *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Jan Jansen"
                      className="mt-1"
                      required
                      data-testid="vakman-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mailadres *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="jan@voorbeeld.nl"
                      className="mt-1"
                      required
                      data-testid="vakman-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefoonnummer *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="06 12345678"
                      className="mt-1"
                      required
                      data-testid="vakman-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Werkgebied *</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Amsterdam e.o."
                      className="mt-1"
                      required
                      data-testid="vakman-location"
                    />
                  </div>
                </div>
              </div>

              {/* Bedrijfsgegevens */}
              <div className="border-t pt-6">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Bedrijfsgegevens
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kvk_nummer" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      KVK-nummer *
                    </Label>
                    <Input
                      id="kvk_nummer"
                      name="kvk_nummer"
                      value={formData.kvk_nummer}
                      onChange={handleInputChange}
                      placeholder="12345678"
                      maxLength={8}
                      className="mt-1"
                      required
                      data-testid="vakman-kvk"
                    />
                    <p className="text-xs text-slate-500 mt-1">8 cijfers, te vinden op kvk.nl</p>
                  </div>
                  <div>
                    <Label htmlFor="btw_nummer" className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      BTW-nummer
                    </Label>
                    <Input
                      id="btw_nummer"
                      name="btw_nummer"
                      value={formData.btw_nummer}
                      onChange={handleInputChange}
                      placeholder="NL123456789B01"
                      className="mt-1"
                      data-testid="vakman-btw"
                    />
                    <p className="text-xs text-slate-500 mt-1">Optioneel voor kleine ondernemers</p>
                  </div>
                </div>
              </div>

              {/* Verzekering */}
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
                      value={formData.verzekering}
                      onChange={handleInputChange}
                      className="mt-1 w-full h-10 px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent"
                      required
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
                      id="verzekering_maatschappij"
                      name="verzekering_maatschappij"
                      value={formData.verzekering_maatschappij}
                      onChange={handleInputChange}
                      placeholder="bijv. Interpolis, Nationale-Nederlanden"
                      className="mt-1"
                      data-testid="vakman-verzekering-maatschappij"
                    />
                  </div>
                </div>
              </div>

              {/* Vakgebied */}
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
                      value={formData.service_type}
                      onChange={handleInputChange}
                      className="mt-1 w-full h-10 px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent"
                      required
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
                      id="hourly_rate"
                      name="hourly_rate"
                      type="number"
                      value={formData.hourly_rate}
                      onChange={handleInputChange}
                      placeholder="65"
                      className="mt-1"
                      required
                      data-testid="vakman-rate"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Over jezelf & ervaring *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Vertel iets over je ervaring, specialisaties en certificeringen..."
                    className="mt-1 h-24"
                    required
                    data-testid="vakman-description"
                  />
                </div>
              </div>

              {/* Wachtwoord */}
              <div className="border-t pt-6">
                <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-sm">5</span>
                  Account aanmaken
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Wachtwoord *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="mt-1"
                      required
                      data-testid="vakman-password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Bevestig wachtwoord *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="mt-1"
                      required
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
                {loading ? "Bezig..." : "Aanmelden als Vakman"}
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
                Al een account?{" "}
                <Link to="/login" className="text-[#FF4500] hover:underline font-medium">
                  Log hier in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
