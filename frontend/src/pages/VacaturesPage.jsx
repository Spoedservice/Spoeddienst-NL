import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, MapPin, Clock, Users, Heart, ArrowRight } from "lucide-react";

const vacatures = [
  {
    id: 1,
    titel: "Klantenservice Medewerker",
    locatie: "Amsterdam (hybride)",
    type: "Fulltime",
    team: "Customer Success",
    beschrijving: "Help onze klanten en vakmannen met een glimlach. Je bent het eerste aanspreekpunt."
  },
  {
    id: 2,
    titel: "Full Stack Developer",
    locatie: "Amsterdam (hybride)",
    type: "Fulltime",
    team: "Engineering",
    beschrijving: "Bouw mee aan ons platform. React, Node.js, en een passie voor goede UX."
  },
  {
    id: 3,
    titel: "Marketing Manager",
    locatie: "Amsterdam",
    type: "Fulltime",
    team: "Marketing",
    beschrijving: "Leid onze marketingstrategie en help ons groeien naar heel Nederland."
  },
  {
    id: 4,
    titel: "Account Manager Zakelijk",
    locatie: "Amsterdam",
    type: "Fulltime",
    team: "Sales",
    beschrijving: "Bouw relaties met VvE's, woningcorporaties en andere zakelijke klanten."
  }
];

export default function VacaturesPage() {
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

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading font-black text-4xl sm:text-5xl mb-6">
            Werken bij <span className="text-[#FF4500]">SpoedDienst24</span>
          </h1>
          <p className="text-xl text-slate-300">
            Bouw mee aan de toekomst van huisonderhoud. We zoeken gepassioneerde mensen die het verschil willen maken.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8 text-center">Waarom SpoedDienst24?</h2>
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Users, title: "Geweldig team", desc: "Werk met gedreven collega's" },
              { icon: Heart, title: "Impact", desc: "Help dagelijks mensen" },
              { icon: Clock, title: "Flexibiliteit", desc: "Hybride werken mogelijk" },
              { icon: MapPin, title: "Locatie", desc: "Kantoor in Amsterdam" }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 bg-[#FF4500]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-[#FF4500]" />
                </div>
                <h3 className="font-heading font-bold text-slate-900">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8">Openstaande vacatures</h2>
          <div className="space-y-4">
            {vacatures.map((vacature) => (
              <Card key={vacature.id} className="border border-slate-200 hover:border-[#FF4500] transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-heading font-bold text-xl text-slate-900 mb-1">{vacature.titel}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-2">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{vacature.locatie}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{vacature.type}</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" />{vacature.team}</span>
                      </div>
                      <p className="text-slate-600">{vacature.beschrijving}</p>
                    </div>
                    <Button className="bg-[#FF4500] hover:bg-[#CC3700] whitespace-nowrap">
                      Solliciteer <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">Geen passende vacature?</h2>
          <p className="text-slate-600 mb-8">
            Stuur een open sollicitatie naar <a href="mailto:jobs@spoeddienst24.nl" className="text-[#FF4500] hover:underline">jobs@spoeddienst24.nl</a>
          </p>
        </div>
      </section>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-center">
        <Link to="/" className="text-white hover:text-[#FF4500]">← Terug naar home</Link>
        <p className="text-slate-500 text-sm mt-4">© 2024 SpoedDienst24.nl</p>
      </footer>
    </div>
  );
}
