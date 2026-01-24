import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Zap, ArrowLeft, Mail, CheckCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function WachtwoordVergetenPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setEmailSent(true);
      toast.success("Reset link verstuurd naar je email!");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.detail || "Er ging iets mis. Probeer het opnieuw.");
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
            <CardTitle className="font-heading text-2xl">Wachtwoord Vergeten</CardTitle>
            <p className="text-slate-500 text-sm mt-2">
              Vul je e-mailadres in en we sturen je een link om je wachtwoord te resetten.
            </p>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Email Verstuurd!</h3>
                <p className="text-slate-600 mb-4">
                  We hebben een link naar <strong>{email}</strong> gestuurd om je wachtwoord te resetten.
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  Controleer ook je spam folder als je de email niet ziet.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setEmailSent(false)}
                  className="mr-2"
                >
                  Andere email gebruiken
                </Button>
                <Link to="/login">
                  <Button className="bg-[#FF4500] hover:bg-[#CC3700]">
                    Terug naar inloggen
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">E-mailadres</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jan@voorbeeld.nl"
                      className="pl-10"
                      required
                      data-testid="forgot-email"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#FF4500] hover:bg-[#CC3700]"
                  disabled={loading}
                  data-testid="forgot-submit"
                >
                  {loading ? "Bezig..." : "Verstuur Reset Link"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              <p className="text-slate-500">
                Weet je je wachtwoord weer?{" "}
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
