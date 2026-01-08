import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Droplets, Key, Building2, CheckCircle, Phone, ArrowRight, Shield, Clock, Euro, FileText } from "lucide-react";

export default function VVEPage() {
  const navigate = useNavigate();

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
          <a href="tel:085 333 2847" className="flex items-center gap-2 bg-[#FF4500] text-white px-4 py-2 rounded-md font-medium hover:bg-[#CC3700] transition-colors">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">085 333 2847</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-[#FF4500] text-white mb-4">VvE Klusservice</Badge>
              <h1 className="font-heading font-black text-4xl sm:text-5xl text-slate-900 mb-6 leading-tight">
                VvE Klusservice voor <span className="text-[#FF4500]">Onderhoud & Reparaties</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8">
                Met SpoedDienst24 regel je als VvE snel en makkelijk een vakman uit de buurt voor onderhoud. 
                Vaste prijzen, garantie op de klus en veilig achteraf betalen via factuur op naam van de VvE.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/boek/elektricien')}
                  className="bg-[#FF4500] hover:bg-[#CC3700] h-12 px-6"
                  data-testid="vve-book-btn"
                >
                  Direct een vakman boeken
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <a href="tel:085 333 2847">
                  <Button variant="outline" className="h-12 px-6 w-full sm:w-auto">
                    <Phone className="w-4 h-4 mr-2" />
                    Bel 085 333 2847
                  </Button>
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80"
                alt="VvE gebouw onderhoud - SpoedDienst24 levert professionele vakmannen voor appartementencomplexen"
                title="VvE klusservice - Betrouwbare vakmannen voor uw VvE"
                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-[#FF4500] mb-2" />
              <span className="text-sm font-medium text-slate-900">Snel geholpen</span>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-8 h-8 text-[#FF4500] mb-2" />
              <span className="text-sm font-medium text-slate-900">Garantie op werk</span>
            </div>
            <div className="flex flex-col items-center">
              <Euro className="w-8 h-8 text-[#FF4500] mb-2" />
              <span className="text-sm font-medium text-slate-900">Geen voorrijkosten</span>
            </div>
            <div className="flex flex-col items-center">
              <FileText className="w-8 h-8 text-[#FF4500] mb-2" />
              <span className="text-sm font-medium text-slate-900">Factuur op VvE naam</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services for VvE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4 text-center">
            Populaire VvE Klussen
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Van lekkages tot elektra storingen - onze vakmannen staan 24/7 klaar voor uw VvE
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Droplets, title: "Loodgieter", desc: "Lekkages, verstoppingen, sanitair", price: "75", slug: "loodgieter" },
              { icon: Zap, title: "Elektricien", desc: "Storingen, installaties, intercom", price: "69", slug: "elektricien" },
              { icon: Key, title: "Slotenmaker", desc: "Sloten, toegangssystemen", price: "89", slug: "slotenmaker" }
            ].map((service, idx) => (
              <Card 
                key={idx} 
                className="border border-slate-200 hover:border-[#FF4500] transition-colors cursor-pointer"
                onClick={() => navigate(`/boek/${service.slug}`)}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-[#FF4500]/10 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-[#FF4500]" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{service.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Vanaf</span>
                    <span className="font-heading font-bold text-xl text-slate-900">€{service.price},-</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why SpoedDienst24 for VvE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-12 text-center">
            Waarom SpoedDienst24 voor uw VvE?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Geen voorrijkosten", desc: "Bij SpoedDienst24 betaalt uw VvE geen onnodige voorrijkosten. De prijsindicatie is vooraf duidelijk." },
              { title: "Betrouwbare professionals", desc: "Onze vakmannen worden zorgvuldig gescreend en beoordeeld door andere klanten." },
              { title: "Flexibele boeking", desc: "Boek gemakkelijk een vakman wanneer het de VvE uitkomt, zonder gedoe met offertes." },
              { title: "Factuur op VvE naam", desc: "Ontvang de factuur direct op naam van de VvE. Betaal veilig achteraf via iDEAL of factuur." },
              { title: "24/7 Spoed beschikbaar", desc: "Bij noodgevallen staat onze spoed-service klaar, ook 's nachts en in het weekend." },
              { title: "Transparante prijzen", desc: "Vooraf weet u wat u betaalt. Geen verborgen kosten of verrassingen achteraf." }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-12 text-center">
            Hoe werkt het voor VvE's?
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Selecteer de klus", desc: "Kies de dienst en beschrijf het probleem" },
              { step: 2, title: "Plan een datum", desc: "Selecteer datum en tijd die past" },
              { step: 3, title: "Vakman komt langs", desc: "Een gescreende vakman voert de klus uit" },
              { step: 4, title: "Betaal achteraf", desc: "Ontvang factuur op naam van de VvE" }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-14 h-14 bg-[#FF4500] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-heading font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FF4500]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl text-white mb-4">
            Direct een vakman voor uw VvE?
          </h2>
          <p className="text-white/90 mb-8">
            Bel ons 24/7 of boek direct online - factuur op naam van de VvE
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:085 333 2847" className="inline-flex items-center justify-center gap-2 bg-white text-[#FF4500] px-6 py-3 rounded-md font-bold hover:bg-slate-100">
              <Phone className="w-5 h-5" />
              085 333 2847
            </a>
            <Button 
              onClick={() => navigate('/boek/loodgieter')}
              className="bg-slate-900 hover:bg-slate-800 px-6 py-3 h-auto font-bold"
            >
              Direct Boeken
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-center">
        <Link to="/" className="text-white hover:text-[#FF4500]">← Terug naar home</Link>
        <p className="text-slate-500 text-sm mt-4">© 2024 SpoedDienst24.nl - VvE Klusservice</p>
      </footer>
    </div>
  );
}
