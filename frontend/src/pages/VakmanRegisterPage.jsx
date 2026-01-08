import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Zap, Droplets, Key, ArrowLeft, CheckCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const services = [
  { id: "elektricien", name: "Elektricien", icon: Zap },
  { id: "loodgieter", name: "Loodgieter", icon: Droplets },
  { id: "slotenmaker", name: "Slotenmaker", icon: Key }
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
    location: ""
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
        location: formData.location
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Volledige naam</Label>
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
                  <Label htmlFor="email">E-mailadres</Label>
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
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefoonnummer</Label>
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
                  <Label htmlFor="location">Werkgebied</Label>
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

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_type">Vakgebied</Label>
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
                  <Label htmlFor="hourly_rate">Uurtarief (€)</Label>
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
                <Label htmlFor="description">Over jezelf</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Vertel iets over je ervaring en specialisaties..."
                  className="mt-1 h-24"
                  required
                  data-testid="vakman-description"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Wachtwoord</Label>
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
                  <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
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

              <Button 
                type="submit" 
                className="w-full bg-[#FF4500] hover:bg-[#CC3700]"
                disabled={loading}
                data-testid="vakman-submit"
              >
                {loading ? "Bezig..." : "Aanmelden als Vakman"}
              </Button>
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
