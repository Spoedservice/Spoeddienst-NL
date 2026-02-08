import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { Zap, Phone, ArrowLeft, Shield } from 'lucide-react';
import GlobalFooter from "@/components/common/GlobalFooter";
import { BE_CONFIG, beRoute } from "@/config/belgiumConfig";

export default function BelgianPrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | SpoedDienst24.be</title>
        <meta name="description" content="Lees het privacybeleid van SpoedDienst24.be. Wij respecteren uw privacy en beschermen uw persoonsgegevens." />
        <link rel="canonical" href="https://spoeddienst24.be/privacy" />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to={beRoute("/")} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">SpoedDienst24<span className="text-[#FF4500]">.be</span></span>
            </Link>
            <a href={`tel:${BE_CONFIG.contact.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-[#FF4500]">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{BE_CONFIG.contact.phoneDisplay}</span>
            </a>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="bg-slate-50 border-b">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <Link to={beRoute("/")} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#FF4500]">
              <ArrowLeft className="w-4 h-4" />
              Terug naar home
            </Link>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#FF4500]/10 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#FF4500]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Privacy Policy</h1>
          </div>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 mb-8">
              SpoedDienst24.be respecteert uw privacy en verwerkt persoonsgegevens in overeenstemming met de 
              Algemene Verordening Gegevensbescherming (AVG/GDPR).
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">1. Wie zijn wij?</h2>
              <p className="text-slate-600">
                SpoedDienst24.be is een platform dat klanten verbindt met gekwalificeerde vakmannen in België.
                Wij zijn verantwoordelijk voor de verwerking van uw persoonsgegevens.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-slate-600">
                  <strong>Contact:</strong><br />
                  E-mail: info@spoeddienst24.be<br />
                  Telefoon: {BE_CONFIG.contact.phoneDisplay}
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">2. Welke gegevens verzamelen wij?</h2>
              <p className="text-slate-600 mb-4">Wij verzamelen de volgende persoonsgegevens:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Contactgegevens:</strong> Naam, e-mailadres, telefoonnummer</li>
                <li><strong>Adresgegevens:</strong> Straat, huisnummer, postcode, gemeente</li>
                <li><strong>Boekingsgegevens:</strong> Type dienst, datum, tijdstip, probleemomschrijving</li>
                <li><strong>Betalingsgegevens:</strong> Factuuradres, betalingshistorie</li>
                <li><strong>Technische gegevens:</strong> IP-adres, browsertype, apparaatinformatie</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">3. Waarvoor gebruiken wij uw gegevens?</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Het verwerken en uitvoeren van uw boeking</li>
                <li>Communicatie over uw dienstverlening</li>
                <li>Het sturen van facturen en betalingsherinneringen</li>
                <li>Het verbeteren van onze dienstverlening</li>
                <li>Het versturen van relevante servicemeldingen (indien u toestemming hebt gegeven)</li>
                <li>Het voldoen aan wettelijke verplichtingen</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">4. Rechtsgrond voor verwerking</h2>
              <p className="text-slate-600 mb-4">Wij verwerken uw gegevens op basis van:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Uitvoering overeenkomst:</strong> Om onze diensten aan u te kunnen leveren</li>
                <li><strong>Wettelijke verplichting:</strong> Bijvoorbeeld voor fiscale administratie</li>
                <li><strong>Toestemming:</strong> Voor marketingcommunicatie</li>
                <li><strong>Gerechtvaardigd belang:</strong> Voor het verbeteren van onze diensten</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">5. Delen van gegevens</h2>
              <p className="text-slate-600 mb-4">
                Wij delen uw gegevens alleen met:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Vakmannen:</strong> Om de gevraagde dienst uit te voeren</li>
                <li><strong>Betalingsdienstverleners:</strong> Voor het verwerken van betalingen</li>
                <li><strong>Hostingpartners:</strong> Voor het hosten van onze website en applicatie</li>
                <li><strong>Overheidsinstanties:</strong> Indien wettelijk verplicht</li>
              </ul>
              <p className="text-slate-600 mt-4">
                Wij verkopen uw gegevens nooit aan derden.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">6. Bewaartermijn</h2>
              <p className="text-slate-600">
                Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
                <li>Boekingsgegevens: 7 jaar (wettelijke bewaarplicht)</li>
                <li>Accountgegevens: Tot u uw account verwijdert</li>
                <li>Marketingvoorkeuren: Tot u zich uitschrijft</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">7. Uw rechten</h2>
              <p className="text-slate-600 mb-4">Onder de AVG/GDPR heeft u de volgende rechten:</p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Inzage:</strong> U kunt opvragen welke gegevens wij van u hebben</li>
                <li><strong>Rectificatie:</strong> U kunt onjuiste gegevens laten corrigeren</li>
                <li><strong>Verwijdering:</strong> U kunt verzoeken om verwijdering van uw gegevens</li>
                <li><strong>Beperking:</strong> U kunt de verwerking van uw gegevens beperken</li>
                <li><strong>Overdraagbaarheid:</strong> U kunt uw gegevens in een standaardformaat ontvangen</li>
                <li><strong>Bezwaar:</strong> U kunt bezwaar maken tegen bepaalde verwerkingen</li>
              </ul>
              <p className="text-slate-600 mt-4">
                Om uw rechten uit te oefenen, neem contact op via info@spoeddienst24.be.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">8. Cookies</h2>
              <p className="text-slate-600">
                Onze website maakt gebruik van cookies voor een optimale werking en analyse van websitegebruik.
                Lees meer in ons <Link to={beRoute("/cookies")} className="text-[#FF4500] hover:underline">Cookiebeleid</Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">9. Beveiliging</h2>
              <p className="text-slate-600">
                Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te beschermen
                tegen ongeoorloofde toegang, verlies of diefstal. Dit omvat SSL-encryptie, beveiligde servers en
                beperkte toegang tot persoonsgegevens.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">10. Klachten</h2>
              <p className="text-slate-600">
                Heeft u een klacht over de verwerking van uw persoonsgegevens? Neem dan contact met ons op.
                U heeft ook het recht om een klacht in te dienen bij de Belgische Gegevensbeschermingsautoriteit:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-slate-600">
                  <strong>Gegevensbeschermingsautoriteit (GBA)</strong><br />
                  Drukpersstraat 35, 1000 Brussel<br />
                  <a href="https://www.gegevensbeschermingsautoriteit.be" className="text-[#FF4500] hover:underline" target="_blank" rel="noopener noreferrer">
                    www.gegevensbeschermingsautoriteit.be
                  </a>
                </p>
              </div>
            </section>

            <div className="bg-slate-50 rounded-lg p-6 mt-8">
              <p className="text-sm text-slate-500">
                <strong>Laatst bijgewerkt:</strong> Januari 2025<br />
                <strong>Contact:</strong> info@spoeddienst24.be | {BE_CONFIG.contact.phoneDisplay}
              </p>
            </div>
          </div>
        </main>

        <GlobalFooter />
      </div>
    </>
  );
}
