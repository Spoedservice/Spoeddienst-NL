import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Zap, ArrowLeft, Lock, CheckCircle, XCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ResetWachtwoordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Geen geldige reset link. Vraag een nieuwe aan.");
    }
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Wachtwoorden komen niet overeen");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Wachtwoord moet minimaal 6 tekens zijn");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/auth/reset-password`, {
        token,
        new_password: formData.password
      });
      setSuccess(true);
      toast.success("Wachtwoord succesvol gewijzigd!");
    } catch (error) {
      console.error("Reset password error:", error);
      if (error.response?.status === 400) {
        setError("Deze reset link is verlopen of al gebruikt. Vraag een nieuwe aan.");
      } else {
        toast.error(error.response?.data?.detail || "Er ging iets mis. Probeer het opnieuw.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span>Terug naar inloggen</span>
        </Link>

        <Card className="border border-slate-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-[#FF4500] rounded-md flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="font-heading text-2xl">Nieuw Wachtwoord</CardTitle>
            <p className="text-slate-500 text-sm mt-2">
              Kies een nieuw wachtwoord voor je account.
            </p>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Link Verlopen</h3>
                <p className="text-slate-600 mb-6">{error}</p>
                <Link to="/wachtwoord-vergeten">
                  <Button className="bg-[#FF4500] hover:bg-[#CC3700]">
                    Nieuwe Link Aanvragen
                  </Button>
                </Link>
              </div>
            ) : success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Wachtwoord Gewijzigd!</h3>
                <p className="text-slate-600 mb-6">
                  Je wachtwoord is succesvol gewijzigd. Je kunt nu inloggen met je nieuwe wachtwoord.
                </p>
                <Link to="/login">
                  <Button className="bg-[#FF4500] hover:bg-[#CC3700]">
                    Nu Inloggen
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Nieuw Wachtwoord</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                      minLength={6}
                      data-testid="reset-password"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Minimaal 6 tekens</p>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Bevestig Wachtwoord</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                      data-testid="reset-confirm-password"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#FF4500] hover:bg-[#CC3700]"
                  disabled={loading}
                  data-testid="reset-submit"
                >
                  {loading ? "Bezig..." : "Wachtwoord Wijzigen"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
