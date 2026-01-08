import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Droplets, Key, CheckCircle, Phone, ArrowRight, Euro, Clock, Users, Star, Smartphone, CreditCard } from "lucide-react";

export default function VakmanInfoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">SpoedDienst24</span>
          </Link>
          <Link to="/vakman/register">
            <Button className="bg-[#FF4500] hover:bg-[#CC3700]">
              Aanmelden als vakman
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-[#FF4500] text-white mb-4">Word Vakman</Badge>
              <h1 className="font-heading font-black text-4xl sm:text-5xl mb-6 leading-tight">
                Direct klussen in <span className="text-[#FF4500]">jouw buurt!</span>
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                Via SpoedDienst24 ontvang je dagelijks klussen in jouw regio. 
                Geen offertes, geen gedoe - accepteer klussen wanneer het jou uitkomt en verdien extra.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/vakman/register">
                  <Button className="bg-[#FF4500] hover:bg-[#CC3700] h-14 px-8 text-lg font-bold w-full sm:w-auto">
                    Meld je nu aan
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
              
              {/* App Store Badges */}
              <div className="flex gap-4 mt-8">
                <a href="https://apps.apple.com/nl/app/" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity">
                  <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download SpoedDienst24 Vakman App in de App Store" className="h-10" />
                </a>
                <a href="https://play.google.com/store/apps/" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Download SpoedDienst24 Vakman App in de Play Store" className="h-10" />
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&q=80"
                alt="Professionele vakman aan het werk - Word vakman bij SpoedDienst24"
                title="Word vakman bij SpoedDienst24 en ontvang dagelijks klussen"
                className="rounded-2xl shadow-2xl w-full h-[450px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4 text-center">
            Wat zijn de voordelen?
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Sluit je aan bij honderden vakmannen die dagelijks klussen via SpoedDienst24
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Users, 
                title: "Relevante klussen", 
                desc: "Je ontvangt alleen aanvragen die relevant zijn voor jou. Geef zelf aan in welke regio en welk vakgebied je wilt werken." 
              },
              { 
                icon: Clock, 
                title: "Bespaar tijd", 
                desc: "Geen gedoe met offertes. Accepteer de klus wanneer het jou uitkomt en de afspraak is direct bevestigd." 
              },
              { 
                icon: Euro, 
                title: "Eerlijk verdienen", 
                desc: "Werk voor een vaste prijs of uurtarief. Alleen wanneer jij verdient, doen wij dat ook. Dat is wel zo eerlijk!" 
              }
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

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-12 text-center">
            Hoe werkt het?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                step: 1, 
                title: "Meld je aan", 
                desc: "Registreer je met je KvK-nummer. We controleren je identiteit en beoordelen je ervaring." 
              },
              { 
                step: 2, 
                title: "Ontvang klussen", 
                desc: "Krijg relevante klussen in jouw regio en vakgebied direct in de app." 
              },
              { 
                step: 3, 
                title: "Verdien geld", 
                desc: "Voer de klus uit, factureer via de app en ontvang snel je betaling." 
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-[#FF4500] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-heading font-bold text-2xl">
                  {item.step}
                </div>
                <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-12 text-center">
            Wat bieden wij vakmannen?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Relevante klussen", desc: "Ontvang alleen klussen die passen bij jouw vakgebied en beschikbaarheid" },
              { title: "Eerlijke verdiensten", desc: "Transparante en marktconforme tarieven, geen verborgen kosten" },
              { title: "Geen offertes nodig", desc: "Accepteer direct klussen met duidelijke omschrijving" },
              { title: "Eenvoudige facturatie", desc: "Factureer moeiteloos via de app, klant betaalt direct via QR-code" },
              { title: "Snelle uitbetaling", desc: "Wekelijkse uitbetalingen, je weet precies wanneer je geld ontvangt" },
              { title: "Ondersteuning", desc: "Ons team staat 5 dagen per week klaar voor assistentie" },
              { title: "Groei je profiel", desc: "Bouw een sterk profiel met positieve klantbeoordelingen" },
              { title: "Flexibel werken", desc: "Werk wanneer het jou uitkomt, selecteer je eigen klussen" }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 border border-slate-200 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-heading font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FF4500]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl text-white mb-4">
            Klaar om te starten?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Meld je vandaag nog aan en ontvang direct klussen in jouw buurt
          </p>
          <Link to="/vakman/register">
            <Button className="bg-white text-[#FF4500] hover:bg-slate-100 h-14 px-8 text-lg font-bold">
              Aanmelden als vakman
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-white/70 text-sm mt-4">
            <Link to="/vakman/faq" className="underline hover:text-white">Bekijk de veelgestelde vragen</Link>
            {" | "}
            <Link to="/vakman/voorwaarden" className="underline hover:text-white">Vakman voorwaarden</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-center">
        <Link to="/" className="text-white hover:text-[#FF4500]">← Terug naar home</Link>
        <p className="text-slate-500 text-sm mt-4">© 2024 SpoedDienst24.nl - Voor Vakmannen</p>
      </footer>
    </div>
  );
}
