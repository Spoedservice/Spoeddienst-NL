import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, CheckCircle, Phone } from "lucide-react";

export default function GarantiePage() {
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
          <Link to="/boek/elektricien">
            <Button className="bg-[#FF4500] hover:bg-[#CC3700]">Direct Boeken</Button>
          </Link>
        </div>
      </header>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-16 h-16 text-[#FF4500] mx-auto mb-6" />
          <h1 className="font-heading font-black text-4xl sm:text-5xl mb-6">
            Onze <span className="text-[#FF4500]">Garantie</span>
          </h1>
          <p className="text-xl text-slate-300">
            Bij SpoedDienst24 sta je nooit alleen. Wij garanderen kwaliteit en tevredenheid.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8 text-center">Wat houdt onze garantie in?</h2>
          
          <div className="space-y-6">
            {[
              {
                title: "Tevredenheidsgarantie",
                desc: "Niet tevreden met het uitgevoerde werk? Neem binnen 7 dagen contact met ons op en we zorgen voor een oplossing - hetzij door de vakman terug te sturen, hetzij door (gedeeltelijke) restitutie."
              },
              {
                title: "Garantie op vakwerk",
                desc: "Op alle uitgevoerde werkzaamheden zit standaard 3 maanden garantie. Gaat er binnen deze periode iets mis met het uitgevoerde werk? Dan komt de vakman kosteloos terug."
              },
              {
                title: "Vaste prijsgarantie",
                desc: "De prijs die je ziet bij het boeken is de prijs die je betaalt. Geen verborgen kosten, geen verrassingen achteraf. Meerwerk wordt altijd vooraf besproken en goedgekeurd."
              },
              {
                title: "Betrouwbare vakmannen",
                desc: "Alle vakmannen in ons netwerk zijn gescreend op identiteit, KvK-inschrijving en vakbekwaamheid. Daarnaast monitoren we continu de klanttevredenheid."
              }
            ].map((item, idx) => (
              <Card key={idx} className="border border-slate-200">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-heading font-bold text-xl text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8 text-center">Garantie claimen?</h2>
          <div className="bg-white p-8 rounded-xl border border-slate-200">
            <p className="text-slate-600 mb-6">
              Heb je een klacht of wil je een beroep doen op onze garantie? Neem dan contact met ons op:
            </p>
            <ul className="space-y-3 text-slate-700">
              <li><strong>E-mail:</strong> garantie@spoeddienst24.nl</li>
              <li><strong>Telefoon:</strong> 0800-1234 (24/7 bereikbaar)</li>
              <li><strong>Vermeld:</strong> Je boekingsnummer en een omschrijving van het probleem</li>
            </ul>
            <p className="text-slate-600 mt-6">
              We streven ernaar om binnen 24 uur te reageren en samen met jou tot een passende oplossing te komen.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FF4500]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl text-white mb-4">Vragen over onze garantie?</h2>
          <p className="text-white/90 mb-8">Neem gerust contact met ons op</p>
          <a href="tel:0800-1234" className="inline-flex items-center gap-2 bg-white text-[#FF4500] px-6 py-3 rounded-md font-bold hover:bg-slate-100">
            <Phone className="w-5 h-5" /> 0800-1234
          </a>
        </div>
      </section>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-center">
        <Link to="/" className="text-white hover:text-[#FF4500]">← Terug naar home</Link>
        <p className="text-slate-500 text-sm mt-4">© 2024 SpoedDienst24.nl</p>
      </footer>
    </div>
  );
}
