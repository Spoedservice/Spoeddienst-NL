import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Zap, Building2, Handshake, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";

export default function PartnerPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    setTimeout(() => {
      toast.success("Bedankt voor je aanvraag! We nemen binnen 2 werkdagen contact met je op.");
      setFormData({ company_name: "", contact_name: "", email: "", phone: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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

      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <Handshake className="w-16 h-16 text-[#FF4500] mx-auto mb-6" />
          <h1 className="font-heading font-black text-4xl sm:text-5xl mb-6">
            Partner worden van <span className="text-[#FF4500]">SpoedDienst24</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Bied jouw klanten toegang tot betrouwbare vakmannen via ons platform. 
            Ideaal voor woningcorporaties, makelaars, verzekeraars en vastgoedbeheerders.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-12 text-center">
            Voordelen van een partnerschap
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: "Toegang tot vakmannen",
                desc: "Directe toegang tot ons netwerk van gescreende en beoordeelde vakmannen in heel Nederland."
              },
              {
                icon: TrendingUp,
                title: "Schaalbaar",
                desc: "Van enkele klussen per maand tot honderden - ons platform schaalt mee met uw behoefte."
              },
              {
                icon: Handshake,
                title: "Maatwerk afspraken",
                desc: "Flexibele samenwerkingsvormen met op maat gemaakte tarieven en SLA's."
              }
            ].map((item, idx) => (
              <Card key={idx} className="border border-slate-200">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 bg-[#FF4500]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-[#FF4500]" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partner types */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8 text-center">
            Voor wie is een partnerschap interessant?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Woningcorporaties", desc: "Snel onderhoud en reparaties voor uw huurders" },
              { title: "Vastgoedbeheerders", desc: "Efficiënt beheer van meerdere panden" },
              { title: "Makelaars", desc: "Extra service voor kopers en verkopers" },
              { title: "Verzekeraars", desc: "Snelle afhandeling van schademeldingen" },
              { title: "Bouwmarkten", desc: "Installatie-service voor uw klanten" },
              { title: "Webshops", desc: "Montage en installatie van uw producten" }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start p-4 bg-white rounded-lg border border-slate-200">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-slate-900">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4 text-center">
            Neem contact op
          </h2>
          <p className="text-slate-600 text-center mb-8">
            Vul het formulier in en we nemen binnen 2 werkdagen contact met je op
          </p>

          <Card className="border border-slate-200">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Bedrijfsnaam</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      placeholder="Uw bedrijf"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_name">Contactpersoon</Label>
                    <Input
                      id="contact_name"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                      placeholder="Uw naam"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-mailadres</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="email@bedrijf.nl"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefoonnummer</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="06 12345678"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Bericht</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Vertel ons over uw situatie en wat u zoekt in een partnerschap..."
                    className="h-32"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#FF4500] hover:bg-[#CC3700] h-12"
                  disabled={loading}
                >
                  {loading ? "Verzenden..." : "Verstuur aanvraag"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-center">
        <Link to="/" className="text-white hover:text-[#FF4500]">← Terug naar home</Link>
        <p className="text-slate-500 text-sm mt-4">© 2024 SpoedDienst24.nl - Partner Programma</p>
      </footer>
    </div>
  );
}
