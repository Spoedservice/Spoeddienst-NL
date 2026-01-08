import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export default function VakmanVoorwaardenPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">SpoedDienst24</span>
          </Link>
          <Link to="/vakman/register">
            <Button className="bg-[#FF4500] hover:bg-[#CC3700]">
              Word Vakman
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <article className="max-w-4xl mx-auto prose prose-slate prose-headings:font-heading">
          <h1 className="font-heading font-bold text-4xl text-slate-900 mb-8">
            Vakman Voorwaarden SpoedDienst24
          </h1>
          
          <p className="text-slate-600 text-lg mb-8">
            Laatst bijgewerkt: Januari 2024
          </p>

          <section className="mb-8">
            <h2 className="font-heading font-bold text-2xl text-slate-900 mt-8 mb-4">1. Algemeen</h2>
            <p className="text-slate-600 mb-4">
              Deze voorwaarden zijn van toepassing op alle vakmannen die zich aanmelden bij SpoedDienst24.nl. 
              Door je aan te melden als vakman ga je akkoord met deze voorwaarden.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading font-bold text-2xl text-slate-900 mt-8 mb-4">2. Aanmelding en Goedkeuring</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Je dient te beschikken over een geldig KvK-nummer</li>
              <li>Je dient aantoonbare ervaring te hebben in je vakgebied</li>
              <li>SpoedDienst24 behoudt zich het recht voor om aanmeldingen te weigeren</li>
              <li>Na goedkeuring ontvang je toegang tot het vakman dashboard</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading font-bold text-2xl text-slate-900 mt-8 mb-4">3. Kwaliteitseisen</h2>
            <p className="text-slate-600 mb-4">
              Als vakman bij SpoedDienst24 verwachten wij:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Professionele uitvoering van alle klussen</li>
              <li>Tijdige communicatie met klanten</li>
              <li>Naleving van afgesproken tijden</li>
              <li>Correcte facturatie via het platform</li>
              <li>Minimaal een 4.0 gemiddelde beoordeling behouden</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading font-bold text-2xl text-slate-900 mt-8 mb-4">4. Betalingen en Commissie</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Betalingen verlopen via het SpoedDienst24 platform</li>
              <li>Uitbetalingen vinden wekelijks plaats</li>
              <li>SpoedDienst24 hanteert een commissie van 15% per klus</li>
              <li>De vakman is zelf verantwoordelijk voor BTW-afdracht</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading font-bold text-2xl text-slate-900 mt-8 mb-4">5. Aansprakelijkheid</h2>
            <p className="text-slate-600 mb-4">
              De vakman is zelf verantwoordelijk voor:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Het hebben van een adequate bedrijfsaansprakelijkheidsverzekering</li>
              <li>Schade ontstaan tijdens de uitvoering van werkzaamheden</li>
              <li>Naleving van alle relevante wet- en regelgeving</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading font-bold text-2xl text-slate-900 mt-8 mb-4">6. Beëindiging</h2>
            <p className="text-slate-600 mb-4">
              SpoedDienst24 behoudt zich het recht voor om de samenwerking te beëindigen bij:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Herhaalde negatieve beoordelingen</li>
              <li>Overtreding van deze voorwaarden</li>
              <li>Fraude of misleiding</li>
              <li>Langdurige inactiviteit</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading font-bold text-2xl text-slate-900 mt-8 mb-4">7. Contact</h2>
            <p className="text-slate-600">
              Voor vragen over deze voorwaarden kun je contact opnemen via:<br />
              E-mail: vakman@spoeddienst24.nl<br />
              Telefoon: 0800-1234
            </p>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-center">
        <Link to="/vakman" className="text-white hover:text-[#FF4500]">← Terug naar vakman info</Link>
        <p className="text-slate-500 text-sm mt-4">© 2024 SpoedDienst24.nl</p>
      </footer>
    </div>
  );
}
