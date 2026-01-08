import { Link } from "react-router-dom";
import { Zap, ArrowLeft } from "lucide-react";

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Terug</span>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">SpoedDienst24</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mb-8">Cookiebeleid</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 mb-6">Laatst bijgewerkt: januari 2024</p>
          
          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">1. Wat zijn cookies?</h2>
          <p className="text-slate-600 mb-4">
            Cookies zijn kleine tekstbestanden die op uw computer of mobiele apparaat worden opgeslagen wanneer u onze website bezoekt. Ze helpen ons om uw voorkeuren te onthouden en de website beter te laten functioneren.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">2. Welke cookies gebruiken wij?</h2>
          
          <h3 className="font-heading font-semibold text-lg text-slate-900 mt-6 mb-3">2.1 Noodzakelijke cookies</h3>
          <p className="text-slate-600 mb-4">
            Deze cookies zijn essentieel voor het functioneren van de website. Zonder deze cookies kunnen bepaalde functies niet werken.
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>Sessiecookies voor het onthouden van uw login</li>
            <li>Beveiligingscookies ter bescherming tegen fraude</li>
            <li>Cookies voor het onthouden van uw cookievoorkeuren</li>
          </ul>

          <h3 className="font-heading font-semibold text-lg text-slate-900 mt-6 mb-3">2.2 Functionele cookies</h3>
          <p className="text-slate-600 mb-4">
            Deze cookies onthouden uw voorkeuren en keuzes om uw ervaring te verbeteren.
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>Taalvoorkeuren</li>
            <li>Eerder ingevulde formuliergegevens</li>
            <li>Locatievoorkeuren</li>
          </ul>

          <h3 className="font-heading font-semibold text-lg text-slate-900 mt-6 mb-3">2.3 Analytische cookies</h3>
          <p className="text-slate-600 mb-4">
            Deze cookies helpen ons te begrijpen hoe bezoekers onze website gebruiken, zodat wij deze kunnen verbeteren.
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>Google Analytics (geanonimiseerd)</li>
            <li>Paginaweergaven en bezoekduur</li>
            <li>Apparaat- en browserinformatie</li>
          </ul>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">3. Bewaartermijn</h2>
          <p className="text-slate-600 mb-4">
            De bewaartermijn van cookies verschilt per type:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li><strong>Sessiecookies:</strong> worden verwijderd wanneer u de browser sluit</li>
            <li><strong>Permanente cookies:</strong> blijven maximaal 12 maanden bewaard</li>
            <li><strong>Analytische cookies:</strong> maximaal 26 maanden</li>
          </ul>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">4. Cookies beheren</h2>
          <p className="text-slate-600 mb-4">
            U kunt cookies beheren via uw browserinstellingen. Let op: het uitschakelen van cookies kan de functionaliteit van de website beïnvloeden.
          </p>
          <p className="text-slate-600 mb-4"><strong>Instructies per browser:</strong></p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li><strong>Chrome:</strong> Instellingen → Privacy en beveiliging → Cookies</li>
            <li><strong>Firefox:</strong> Instellingen → Privacy & Beveiliging → Cookies</li>
            <li><strong>Safari:</strong> Voorkeuren → Privacy → Cookies</li>
            <li><strong>Edge:</strong> Instellingen → Privacy → Cookies</li>
          </ul>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">5. Cookies van derden</h2>
          <p className="text-slate-600 mb-4">
            Wij maken gebruik van diensten van derden die ook cookies kunnen plaatsen:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li><strong>Google Analytics:</strong> voor websitestatistieken</li>
            <li><strong>Stripe:</strong> voor veilige betalingsverwerking</li>
          </ul>
          <p className="text-slate-600 mb-4">
            Wij hebben geen controle over cookies van derden. Raadpleeg het privacybeleid van deze partijen voor meer informatie.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">6. Uw rechten</h2>
          <p className="text-slate-600 mb-4">
            Conform de AVG heeft u het recht om:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>Te weten welke cookies wij gebruiken</li>
            <li>Uw toestemming voor cookies in te trekken</li>
            <li>Cookies te verwijderen uit uw browser</li>
          </ul>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">7. Wijzigingen</h2>
          <p className="text-slate-600 mb-4">
            Wij kunnen dit cookiebeleid van tijd tot tijd aanpassen. De meest recente versie is altijd beschikbaar op deze pagina.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">8. Contact</h2>
          <p className="text-slate-600 mb-4">
            Heeft u vragen over ons cookiebeleid? Neem contact met ons op:
          </p>
          <ul className="list-none text-slate-600 mb-4 space-y-2">
            <li><strong>E-mail:</strong> info@spoeddienst24.nl</li>
            <li><strong>Telefoon:</strong> 085 333 2847</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400 text-sm">© 2024 SpoedDienst24.nl. Alle rechten voorbehouden.</p>
        </div>
      </footer>
    </div>
  );
}
