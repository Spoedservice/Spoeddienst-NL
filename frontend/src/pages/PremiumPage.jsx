import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Crown, CheckCircle, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PremiumPage() {
  const [loading, setLoading] = useState(null);

  const handleSubscribe = async (plan) => {
    setLoading(plan);
    try {
      const response = await axios.post(`${API}/premium/subscribe`, { 
        plan: plan,
        amount: plan === 'monthly' ? 39.95 : 399.00
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.success("Bedankt! Je ontvangt een e-mail met betalingsinstructies.");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Er is iets misgegaan. Probeer het later opnieuw.");
    } finally {
      setLoading(null);
    }
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
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={() => handleSubscribe('monthly')}
                    disabled={loading !== null}
                    data-testid="subscribe-monthly"
                  >
                    {loading === 'monthly' ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Bezig...</>
                    ) : (
                      "Maandelijks - €39,95/mnd"
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                    onClick={() => handleSubscribe('yearly')}
                    disabled={loading !== null}
                    data-testid="subscribe-yearly"
                  >
                    {loading === 'yearly' ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Bezig...</>
                    ) : (
                      "Jaarlijks - €399/jaar (bespaar €80)"
                    )}
                  </Button>
                </div>
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
              { q: "Wat houdt de jaarlijkse check-up in?", a: "Een vakman komt langs voor een preventieve controle van je belangrijkste installaties (elektra, water)." },
              { q: "Hoe kan ik betalen?", a: "Je kunt betalen via iDEAL, creditcard of bankoverschrijving. Betalingen worden veilig verwerkt." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg border border-slate-200">
                <h3 className="font-heading font-bold text-slate-900 mb-2">{item.q}</h3>
                <p className="text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Betaalgegevens sectie */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-2xl mx-auto">
          <h3 className="font-heading font-bold text-xl text-slate-900 mb-4 text-center">
            Betalen via bankoverschrijving?
          </h3>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <p className="text-slate-600 text-sm mb-4">
              Je kunt ook handmatig overmaken naar onderstaande rekening. 
              Vermeld je e-mailadres bij de betaling.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">IBAN:</span>
                <span className="font-mono font-medium text-slate-900">NL07REVO6329249105</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">BIC:</span>
                <span className="font-mono font-medium text-slate-900">CHASDEFX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">T.n.v.:</span>
                <span className="font-medium text-slate-900">SpoedDienst24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bedrag maandelijks:</span>
                <span className="font-medium text-slate-900">€39,95</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bedrag jaarlijks:</span>
                <span className="font-medium text-slate-900">€399,00</span>
              </div>
            </div>
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
