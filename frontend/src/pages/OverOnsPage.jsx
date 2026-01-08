import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Users, Target, Heart, Award } from "lucide-react";

export default function OverOnsPage() {
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
          <h1 className="font-heading font-black text-4xl sm:text-5xl mb-6">
            Over <span className="text-[#FF4500]">SpoedDienst24</span>
          </h1>
          <p className="text-xl text-slate-300">
            Wij verbinden huiseigenaren met betrouwbare vakmannen - 24 uur per dag, 7 dagen per week.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg prose-slate">
            <h2 className="font-heading font-bold text-2xl text-slate-900">Ons verhaal</h2>
            <p className="text-slate-600">
              SpoedDienst24 is opgericht vanuit de frustratie die iedereen kent: je hebt een lekkage, stroomstoring 
              of je bent buitengesloten - en dan begint het zoeken naar een betrouwbare vakman. Vaak op het slechtst 
              mogelijke moment.
            </p>
            <p className="text-slate-600">
              Wij geloven dat iedereen toegang moet hebben tot snelle, betrouwbare hulp. Daarom hebben we een platform 
              gebouwd waar je binnen minuten een gescreende vakman kunt boeken - voor een vaste prijs, met garantie.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-12 text-center">Onze waarden</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Target, title: "Betrouwbaarheid", desc: "Elke vakman wordt gescreend en beoordeeld" },
              { icon: Zap, title: "Snelheid", desc: "24/7 beschikbaar, ook voor spoed" },
              { icon: Heart, title: "Klanttevredenheid", desc: "Tevredenheidsgarantie op elke klus" },
              { icon: Award, title: "Kwaliteit", desc: "Alleen de beste vakmannen in ons netwerk" }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-14 h-14 bg-[#FF4500]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-[#FF4500]" />
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-12 text-center">SpoedDienst24 in cijfers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10.000+", label: "Klussen voltooid" },
              { number: "500+", label: "Actieve vakmannen" },
              { number: "4.7/5", label: "Gemiddelde beoordeling" },
              { number: "30 min", label: "Gem. reactietijd spoed" }
            ].map((stat, idx) => (
              <div key={idx}>
                <p className="font-heading font-black text-4xl text-[#FF4500]">{stat.number}</p>
                <p className="text-slate-600 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FF4500]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl text-white mb-4">Hulp nodig?</h2>
          <p className="text-white/90 mb-8">Boek direct een vakman of neem contact met ons op</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/boek/elektricien">
              <Button className="bg-white text-[#FF4500] hover:bg-slate-100 px-6 py-3 h-auto font-bold">Direct Boeken</Button>
            </Link>
            <a href="tel:0800-1234">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 px-6 py-3 h-auto font-bold">Bel 0800-1234</Button>
            </a>
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
