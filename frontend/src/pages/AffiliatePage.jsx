import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Zap, TrendingUp, Euro, Users, CheckCircle, ArrowRight } from "lucide-react";

export default function AffiliatePage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", website: "", message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Bedankt voor je aanmelding! We nemen binnen 2 werkdagen contact op.");
      setFormData({ name: "", email: "", website: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">SpoedDienst24</span>
          </Link>
        </div>
      </header>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <TrendingUp className="w-16 h-16 text-[#FF4500] mx-auto mb-6" />
          <h1 className="font-heading font-black text-4xl sm:text-5xl mb-6">
            Affiliate <span className="text-[#FF4500]">Programma</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Verdien geld door SpoedDienst24 te promoten. Ontvang commissie voor elke boeking via jouw unieke link.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-12 text-center">Hoe werkt het?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: "Meld je aan", desc: "Registreer gratis en ontvang je unieke affiliate link" },
              { icon: TrendingUp, title: "Promoot", desc: "Deel je link via je website, social media of e-mail" },
              { icon: Euro, title: "Verdien", desc: "Ontvang €15 per voltooide boeking via jouw link" }
            ].map((item, idx) => (
              <Card key={idx} className="border border-slate-200 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-[#FF4500]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-[#FF4500]" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8 text-center">Voordelen</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "€15 commissie per voltooide boeking",
              "30 dagen cookie-tracking",
              "Real-time statistieken dashboard",
              "Maandelijkse uitbetaling",
              "Marketing materialen beschikbaar",
              "Dedicated affiliate manager"
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8 text-center">Word Affiliate</h2>
          <Card className="border border-slate-200">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Naam</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Je naam" required />
                </div>
                <div>
                  <Label htmlFor="email">E-mailadres</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="je@email.nl" required />
                </div>
                <div>
                  <Label htmlFor="website">Website (optioneel)</Label>
                  <Input id="website" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} placeholder="https://jouwwebsite.nl" />
                </div>
                <div>
                  <Label htmlFor="message">Hoe ga je promoten?</Label>
                  <Textarea id="message" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="Vertel ons hoe je SpoedDienst24 wilt promoten..." className="h-24" />
                </div>
                <Button type="submit" className="w-full bg-[#FF4500] hover:bg-[#CC3700] h-12" disabled={loading}>
                  {loading ? "Verzenden..." : "Aanmelden als affiliate"} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-center">
        <Link to="/" className="text-white hover:text-[#FF4500]">← Terug naar home</Link>
        <p className="text-slate-500 text-sm mt-4">© 2024 SpoedDienst24.nl - Affiliate Programma</p>
      </footer>
    </div>
  );
}
