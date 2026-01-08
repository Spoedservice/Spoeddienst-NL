import { Link } from "react-router-dom";
import { Zap, ArrowLeft } from "lucide-react";

export default function VoorwaardenPage() {
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
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mb-8">Algemene Voorwaarden</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 mb-6">Laatst bijgewerkt: januari 2024</p>
          
          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">Artikel 1 - Definities</h2>
          <p className="text-slate-600 mb-4">In deze algemene voorwaarden wordt verstaan onder:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li><strong>SpoedDienst24:</strong> SpoedDienst24.nl, gevestigd in Nederland</li>
            <li><strong>Klant:</strong> de natuurlijke of rechtspersoon die een dienst boekt via SpoedDienst24</li>
            <li><strong>Vakman:</strong> de zelfstandige professional die via SpoedDienst24 diensten aanbiedt</li>
            <li><strong>Dienst:</strong> de werkzaamheden die door een Vakman worden uitgevoerd</li>
            <li><strong>Boeking:</strong> het verzoek van een Klant voor het uitvoeren van een Dienst</li>
          </ul>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">Artikel 2 - Toepasselijkheid</h2>
          <p className="text-slate-600 mb-4">
            2.1 Deze algemene voorwaarden zijn van toepassing op alle boekingen via SpoedDienst24.nl en alle overeenkomsten die hieruit voortvloeien.
          </p>
          <p className="text-slate-600 mb-4">
            2.2 Door het plaatsen van een boeking accepteert de Klant deze algemene voorwaarden.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">Artikel 3 - Boekingen</h2>
          <p className="text-slate-600 mb-4">
            3.1 Een boeking komt tot stand na bevestiging door SpoedDienst24.
          </p>
          <p className="text-slate-600 mb-4">
            3.2 De Klant is verantwoordelijk voor het verstrekken van correcte en volledige informatie bij de boeking.
          </p>
          <p className="text-slate-600 mb-4">
            3.3 SpoedDienst24 spant zich in om een geschikte Vakman te koppelen aan de boeking.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">Artikel 4 - Prijzen en Betaling</h2>
          <p className="text-slate-600 mb-4">
            4.1 De op de website vermelde prijzen zijn richtprijzen inclusief BTW.
          </p>
          <p className="text-slate-600 mb-4">
            4.2 De definitieve prijs wordt bepaald na inspectie door de Vakman en in overleg met de Klant.
          </p>
          <p className="text-slate-600 mb-4">
            4.3 Betaling geschiedt direct aan de Vakman na afronding van de werkzaamheden, tenzij anders overeengekomen.
          </p>
          <p className="text-slate-600 mb-4">
            4.4 Bij spoedklussen gelden verhoogde tarieven zoals aangegeven op de website.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">Artikel 5 - Annulering</h2>
          <p className="text-slate-600 mb-4">
            5.1 De Klant kan een boeking kosteloos annuleren tot 24 uur voor de afgesproken tijd.
          </p>
          <p className="text-slate-600 mb-4">
            5.2 Bij annulering binnen 24 uur kunnen voorrijkosten in rekening worden gebracht.
          </p>
          <p className="text-slate-600 mb-4">
            5.3 Bij spoedboekingen is annulering niet mogelijk zodra de Vakman onderweg is.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">Artikel 6 - Garantie</h2>
          <p className="text-slate-600 mb-4">
            6.1 Op uitgevoerde werkzaamheden geldt een garantietermijn van minimaal 3 maanden.
          </p>
          <p className="text-slate-600 mb-4">
            6.2 De garantie vervalt bij onjuist gebruik of wijzigingen door derden.
          </p>
          <p className="text-slate-600 mb-4">
            6.3 Bij klachten over de garantie kunt u contact opnemen met onze klantenservice.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">Artikel 7 - Aansprakelijkheid</h2>
          <p className="text-slate-600 mb-4">
            7.1 SpoedDienst24 is een bemiddelingsplatform en niet aansprakelijk voor de werkzaamheden van Vakmannen.
          </p>
          <p className="text-slate-600 mb-4">
            7.2 Vakmannen zijn zelfstandig verantwoordelijk voor hun werk en dienen adequaat verzekerd te zijn.
          </p>
          <p className="text-slate-600 mb-4">
            7.3 De aansprakelijkheid van SpoedDienst24 is beperkt tot het bedrag dat in het desbetreffende geval onder de aansprakelijkheidsverzekering wordt uitgekeerd.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">Artikel 8 - Klachten</h2>
          <p className="text-slate-600 mb-4">
            8.1 Klachten over de dienstverlening dienen binnen 14 dagen na uitvoering schriftelijk te worden gemeld.
          </p>
          <p className="text-slate-600 mb-4">
            8.2 SpoedDienst24 streeft ernaar klachten binnen 5 werkdagen te behandelen.
          </p>
          <p className="text-slate-600 mb-4">
            8.3 U kunt klachten indienen via info@spoeddienst24.nl of telefonisch via 085 333 2847.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">Artikel 9 - Intellectueel Eigendom</h2>
          <p className="text-slate-600 mb-4">
            9.1 Alle intellectuele eigendomsrechten op de website en inhoud berusten bij SpoedDienst24.
          </p>
          <p className="text-slate-600 mb-4">
            9.2 Het is niet toegestaan om zonder toestemming content van de website te kopiëren of te verspreiden.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">Artikel 10 - Toepasselijk Recht</h2>
          <p className="text-slate-600 mb-4">
            10.1 Op alle overeenkomsten is Nederlands recht van toepassing.
          </p>
          <p className="text-slate-600 mb-4">
            10.2 Geschillen worden voorgelegd aan de bevoegde rechter in Nederland.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">Artikel 11 - Contact</h2>
          <p className="text-slate-600 mb-4">
            Voor vragen over deze voorwaarden kunt u contact opnemen:
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
