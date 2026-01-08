import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Droplets, Key, Euro } from "lucide-react";

const prijzen = [
  {
    dienst: "Elektricien",
    icon: Zap,
    items: [
      { naam: "Stroomstoring oplossen", prijs: "€69,-", type: "Vanaf" },
      { naam: "Stopcontact plaatsen", prijs: "€89,-", type: "Vanaf" },
      { naam: "Lamp ophangen", prijs: "€49,-", type: "Vanaf" },
      { naam: "Meterkast vervangen", prijs: "€399,-", type: "Vanaf" },
      { naam: "Spoed elektricien", prijs: "€99,-", type: "Vanaf" }
    ]
  },
  {
    dienst: "Loodgieter",
    icon: Droplets,
    items: [
      { naam: "Lekkage oplossen", prijs: "€75,-", type: "Vanaf" },
      { naam: "Afvoer ontstoppen", prijs: "€109,-", type: "Vanaf" },
      { naam: "Kraan vervangen", prijs: "€89,-", type: "Vanaf" },
      { naam: "Toilet repareren", prijs: "€95,-", type: "Vanaf" },
      { naam: "Spoed loodgieter", prijs: "€109,-", type: "Vanaf" }
    ]
  },
  {
    dienst: "Slotenmaker",
    icon: Key,
    items: [
      { naam: "Deur openen (buitengesloten)", prijs: "€89,-", type: "Vanaf" },
      { naam: "Slot vervangen", prijs: "€129,-", type: "Vanaf" },
      { naam: "Cilinderslot plaatsen", prijs: "€149,-", type: "Vanaf" },
      { naam: "Inbraakschade herstellen", prijs: "€179,-", type: "Vanaf" },
      { naam: "Spoed slotenmaker", prijs: "€129,-", type: "Vanaf" }
    ]
  }
];

export default function PrijsgidsenPage() {
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

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Euro className="w-16 h-16 text-[#FF4500] mx-auto mb-6" />
          <h1 className="font-heading font-black text-4xl sm:text-5xl mb-6">
            <span className="text-[#FF4500]">Prijsgidsen</span>
          </h1>
          <p className="text-xl text-slate-300">
            Transparante prijzen voor al onze diensten. Geen verrassingen, geen verborgen kosten.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {prijzen.map((categorie, idx) => (
              <Card key={idx} className="border border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#FF4500]/10 rounded-lg flex items-center justify-center">
                      <categorie.icon className="w-6 h-6 text-[#FF4500]" />
                    </div>
                    <h2 className="font-heading font-bold text-2xl text-slate-900">{categorie.dienst}</h2>
                  </div>
                  <div className="space-y-4">
                    {categorie.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                        <span className="text-slate-700">{item.naam}</span>
                        <span className="font-heading font-bold text-slate-900">{item.prijs}</span>
                      </div>
                    ))}
                  </div>
                  <Link to={`/boek/${categorie.dienst.toLowerCase()}`}>
                    <Button className="w-full mt-6 bg-[#FF4500] hover:bg-[#CC3700]">
                      Boek {categorie.dienst}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 bg-slate-50 p-8 rounded-xl">
            <h3 className="font-heading font-bold text-xl text-slate-900 mb-4">Prijsinformatie</h3>
            <ul className="space-y-2 text-slate-600">
              <li>• Alle prijzen zijn inclusief BTW</li>
              <li>• Geen voorrijkosten</li>
              <li>• Meerwerk wordt altijd vooraf besproken</li>
              <li>• Spoedtarieven gelden voor service buiten kantooruren</li>
              <li>• Exacte prijs afhankelijk van de specifieke situatie</li>
            </ul>
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
