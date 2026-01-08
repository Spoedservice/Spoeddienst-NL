import { Link } from "react-router-dom";
import { Zap, Phone, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 mb-8">Privacybeleid</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 mb-6">Laatst bijgewerkt: januari 2024</p>
          
          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">1. Inleiding</h2>
          <p className="text-slate-600 mb-4">
            SpoedDienst24.nl ("wij", "ons" of "onze") respecteert uw privacy en is toegewijd aan het beschermen van uw persoonsgegevens. Dit privacybeleid informeert u over hoe wij omgaan met uw persoonsgegevens wanneer u onze website bezoekt en vertelt u over uw privacyrechten.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">2. Welke gegevens verzamelen wij?</h2>
          <p className="text-slate-600 mb-4">Wij kunnen de volgende categorieën persoonsgegevens verzamelen:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li><strong>Identiteitsgegevens:</strong> voornaam, achternaam</li>
            <li><strong>Contactgegevens:</strong> e-mailadres, telefoonnummer, adres</li>
            <li><strong>Technische gegevens:</strong> IP-adres, browsertype, tijdzone</li>
            <li><strong>Gebruiksgegevens:</strong> informatie over hoe u onze website gebruikt</li>
            <li><strong>Boekingsgegevens:</strong> details van diensten die u bij ons boekt</li>
          </ul>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">3. Hoe gebruiken wij uw gegevens?</h2>
          <p className="text-slate-600 mb-4">Wij gebruiken uw persoonsgegevens voor de volgende doeleinden:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>Het verwerken en uitvoeren van uw boekingen</li>
            <li>Het versturen van bevestigingen en updates over uw diensten</li>
            <li>Het beantwoorden van uw vragen en verzoeken</li>
            <li>Het verbeteren van onze website en dienstverlening</li>
            <li>Het voldoen aan wettelijke verplichtingen</li>
          </ul>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">4. Delen van gegevens</h2>
          <p className="text-slate-600 mb-4">
            Wij delen uw persoonsgegevens alleen met:
          </p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li>Vakmannen die uw klus uitvoeren</li>
            <li>Betalingsdienstverleners voor het verwerken van betalingen</li>
            <li>Autoriteiten wanneer dit wettelijk verplicht is</li>
          </ul>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">5. Bewaartermijn</h2>
          <p className="text-slate-600 mb-4">
            Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk voor de doeleinden waarvoor ze zijn verzameld. Voor boekingsgegevens hanteren wij een bewaartermijn van 7 jaar conform de wettelijke bewaarplicht.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">6. Uw rechten</h2>
          <p className="text-slate-600 mb-4">Onder de AVG heeft u de volgende rechten:</p>
          <ul className="list-disc pl-6 text-slate-600 mb-4 space-y-2">
            <li><strong>Recht op inzage:</strong> U kunt opvragen welke gegevens wij van u hebben</li>
            <li><strong>Recht op rectificatie:</strong> U kunt onjuiste gegevens laten corrigeren</li>
            <li><strong>Recht op verwijdering:</strong> U kunt verzoeken uw gegevens te verwijderen</li>
            <li><strong>Recht op beperking:</strong> U kunt de verwerking van uw gegevens beperken</li>
            <li><strong>Recht op overdraagbaarheid:</strong> U kunt uw gegevens in een gangbaar formaat ontvangen</li>
            <li><strong>Recht van bezwaar:</strong> U kunt bezwaar maken tegen de verwerking van uw gegevens</li>
          </ul>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">7. Beveiliging</h2>
          <p className="text-slate-600 mb-4">
            Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te beschermen tegen ongeoorloofde toegang, verlies of misbruik. Onze website maakt gebruik van SSL-encryptie.
          </p>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">8. Contact</h2>
          <p className="text-slate-600 mb-4">
            Voor vragen over dit privacybeleid of om uw rechten uit te oefenen, kunt u contact met ons opnemen:
          </p>
          <ul className="list-none text-slate-600 mb-4 space-y-2">
            <li><strong>E-mail:</strong> info@spoeddienst24.nl</li>
            <li><strong>Telefoon:</strong> 085 333 2847</li>
          </ul>

          <h2 className="font-heading font-bold text-xl text-slate-900 mt-8 mb-4">9. Wijzigingen</h2>
          <p className="text-slate-600 mb-4">
            Wij kunnen dit privacybeleid van tijd tot tijd wijzigen. De meest recente versie is altijd beschikbaar op onze website.
          </p>
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
