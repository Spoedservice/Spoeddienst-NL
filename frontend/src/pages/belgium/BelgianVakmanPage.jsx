import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Phone, Shield, CheckCircle, Award, 
  Briefcase, Clock, Star, Users, ArrowRight
} from "lucide-react";
import { BE_CONFIG, beRoute } from "@/config/belgiumConfig";

const BENEFITS = [
  {
    icon: Clock,
    title: "Flexibele Werktijden",
    description: "Werk wanneer het jou uitkomt. Zelf je beschikbaarheid bepalen."
  },
  {
    icon: Users,
    title: "Constante Klantenflow",
    description: "Wij zorgen voor de klanten, jij voor het vakwerk."
  },
  {
    icon: Shield,
    title: "Verzekerd Werken",
    description: "Werk altijd verzekerd via onze collectieve polis."
  },
  {
    icon: Award,
    title: "Eerlijke Vergoeding",
    description: "Competitieve tarieven, snelle uitbetaling."
  },
  {
    icon: Star,
    title: "Reviews & Reputatie",
    description: "Bouw je online reputatie op via klantbeoordelingen."
  },
  {
    icon: Briefcase,
    title: "Geen Acquisitie",
    description: "Focus op je vak, wij regelen de marketing en administratie."
  }
];

const REQUIREMENTS = [
  "Erkend vakman (loodgieter, slotenmaker of elektricien)",
  "Geldig rijbewijs en eigen vervoer",
  "Professionele werkhouding en klantgerichtheid",
  "Beschikbaar voor spoedklussen (ook buiten kantooruren)",
  "Eigen gereedschap en basismateriaal",
  "Verzekering voor aansprakelijkheid"
];

export default function BelgianVakmanPage() {
  return (
    <>
      <Helmet>
        <title>Word Vakman | SpoedDienst24.be - Sluit je aan bij ons netwerk</title>
        <meta name="description" content="Word vakman bij SpoedDienst24.be. Flexibele werktijden, constante klantenflow en eerlijke vergoeding. Meld je vandaag nog aan als loodgieter, slotenmaker of elektricien." />
        <link rel="canonical" href="https://spoeddienst24.be/vakman" />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to={beRoute("/")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF4500] to-[#CC3700] rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">SpoedDienst24<span className="text-[#FF4500]">.be</span></span>
            </Link>
            <a 
              href={`tel:${BE_CONFIG.contact.phone}`}
              className="flex items-center gap-2 bg-[#FF4500] text-white px-4 py-2 rounded-full font-bold hover:bg-[#CC3700]"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{BE_CONFIG.contact.phoneDisplay}</span>
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-3xl">
              <Badge className="bg-[#FF4500] text-white border-none mb-4">
                Vacature Vakmannen België
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black mb-6">
                Word Vakman bij SpoedDienst24.be
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                Ben je een ervaren loodgieter, slotenmaker of elektricien? 
                Sluit je aan bij het grootste spoednetwerk van België en 
                profiteer van een constante stroom aan klanten.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/vakman/register"
                  className="inline-flex items-center justify-center gap-2 bg-[#FF4500] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#CC3700]"
                >
                  Direct Aanmelden
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a 
                  href={`tel:${BE_CONFIG.contact.phone}`}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20"
                >
                  <Phone className="w-5 h-5" />
                  Bel voor info
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
              Waarom werken bij SpoedDienst24.be?
            </h2>
            <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
              Als vakman bij ons profiteer je van vele voordelen
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BENEFITS.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="border-2 hover:border-[#FF4500] transition-colors">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-[#FF4500]/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-[#FF4500]" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 mb-2">{benefit.title}</h3>
                      <p className="text-slate-600">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Wat verwachten wij?</h2>
                <p className="text-slate-600 mb-6">
                  Om deel uit te maken van ons netwerk vragen wij het volgende:
                </p>
                <ul className="space-y-4">
                  {REQUIREMENTS.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Card className="bg-gradient-to-br from-[#FF4500] to-[#CC3700] text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Wat krijg je?</h3>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span>Gemiddeld 3-5 klussen per week</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span>Uitbetaling binnen 7 dagen</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span>Gratis vakman-app</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span>24/7 support team</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <span>Geen lidmaatschapskosten</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
              Hoe werkt het?
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Aanmelden", desc: "Vul het registratieformulier in met je gegevens" },
                { step: "2", title: "Verificatie", desc: "Wij controleren je certificaten en ervaring" },
                { step: "3", title: "Kennismaking", desc: "Kort gesprek over werkwijze en verwachtingen" },
                { step: "4", title: "Aan de slag", desc: "Ontvang je eerste klussen via de app" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-[#FF4500] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-[#FF4500] to-[#CC3700]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Klaar om te starten?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Meld je vandaag nog aan en ontvang binnen 48 uur een reactie
            </p>
            <Link 
              to="/vakman/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#FF4500] px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-100"
            >
              Word Vakman
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-400 text-sm">
              © 2024 SpoedDienst24.be - Word onderdeel van ons team
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
