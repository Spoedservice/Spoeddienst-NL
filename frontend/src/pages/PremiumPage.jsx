import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Crown, CheckCircle, Star } from "lucide-react";

export default function PremiumPage() {
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

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="font-heading font-black text-4xl sm:text-5xl mb-6">
            SpoedDienst24 <span className="text-yellow-500">Premium</span>
          </h1>
          <p className="text-xl text-slate-300">
            Exclusieve voordelen voor onze trouwe klanten. Nooit meer zorgen over onderhoud.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Gratis */}
            <Card className="border border-slate-200">
              <CardContent className="p-8">
                <h2 className="font-heading font-bold text-2xl text-slate-900 mb-2">Standaard</h2>
                <p className="text-slate-500 mb-6">Voor incidentele klussen</p>
                <p className="font-heading font-black text-4xl text-slate-900 mb-6">Gratis</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Toegang tot alle vakmannen",
                    "24/7 spoed service",
                    "Vaste prijzen",
                    "3 maanden garantie"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/boek/elektricien">
                  <Button variant="outline" className="w-full">Direct boeken</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium */}
            <Card className="border-2 border-yellow-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <Star className="w-4 h-4" /> Populair
              </div>
              <CardContent className="p-8">
                <h2 className="font-heading font-bold text-2xl text-slate-900 mb-2">Premium</h2>
                <p className="text-slate-500 mb-6">Voor zorgeloos wonen</p>
                <p className="font-heading font-black text-4xl text-slate-900 mb-1">€39,95<span className="text-lg font-normal text-slate-500">/maand</span></p>
                <p className="text-slate-500 text-sm mb-6">of €399/jaar (bespaar €80)</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Alles van Standaard",
                    "10% korting op alle klussen",
                    "Voorrang bij spoed",
                    "12 maanden garantie",
                    "Gratis jaarlijkse check-up",
                    "Dedicated klantenservice"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-600">
                      <CheckCircle className="w-5 h-5 text-yellow-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white">
                  Word Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8">Veelgestelde vragen</h2>
          <div className="text-left space-y-6">
            {[
              { q: "Kan ik op elk moment opzeggen?", a: "Ja, Premium is maandelijks opzegbaar. Bij jaarabonnement is er geen tussentijdse opzegging mogelijk." },
              { q: "Hoe werkt de 10% korting?", a: "De korting wordt automatisch toegepast bij elke boeking zolang je Premium lid bent." },
              { q: "Wat houdt de jaarlijkse check-up in?", a: "Een vakman komt langs voor een preventieve controle van je belangrijkste installaties (elektra, water)." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border border-slate-200">
                <h3 className="font-heading font-bold text-slate-900 mb-2">{item.q}</h3>
                <p className="text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-center">
        <Link to="/" className="text-white hover:text-[#FF4500]">← Terug naar home</Link>
        <p className="text-slate-500 text-sm mt-4">© 2024 SpoedDienst24.nl</p>
      </footer>
    </div>
  );
}
