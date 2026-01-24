import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Zap, ArrowLeft } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success("Succesvol ingelogd!");
      
      if (response.data.user.role === 'vakman') {
        navigate('/vakman/dashboard');
      } else if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.detail || "Ongeldige inloggegevens");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            <CardTitle className="font-heading text-2xl">Inloggen</CardTitle>
            <p className="text-slate-500 text-sm mt-2">Log in op je account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  data-testid="login-email"
                />
              </div>
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
                  data-testid="login-password"
                />
                <div className="text-right mt-1">
                  <Link to="/wachtwoord-vergeten" className="text-sm text-[#FF4500] hover:underline">
                    Wachtwoord vergeten?
                  </Link>
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#FF4500] hover:bg-[#CC3700]"
                disabled={loading}
                data-testid="login-submit"
              >
                {loading ? "Bezig..." : "Inloggen"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-slate-500">
                Nog geen account?{" "}
                <Link to="/register" className="text-[#FF4500] hover:underline font-medium">
                  Registreer hier
                </Link>
              </p>
              <p className="text-slate-500 mt-2">
                Vakman?{" "}
                <Link to="/vakman/register" className="text-[#FF4500] hover:underline font-medium">
                  Meld je aan
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
