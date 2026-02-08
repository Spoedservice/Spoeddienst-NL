import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { Zap, Phone, ArrowLeft } from 'lucide-react';
import GlobalFooter from "@/components/common/GlobalFooter";
import { BE_CONFIG, beRoute } from "@/config/belgiumConfig";

export default function BelgianVoorwaardenPage() {
  return (
    <>
      <Helmet>
        <title>Algemene Voorwaarden | SpoedDienst24.be</title>
        <meta name="description" content="Lees de algemene voorwaarden van SpoedDienst24.be voor onze spoeddiensten in België." />
        <link rel="canonical" href="https://spoeddienst24.be/voorwaarden" />
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
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">Algemene Voorwaarden</h1>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 mb-8">
              Deze algemene voorwaarden zijn van toepassing op alle diensten aangeboden door SpoedDienst24.be.
              Door gebruik te maken van onze diensten, gaat u akkoord met deze voorwaarden.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Artikel 1 - Definities</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>SpoedDienst24.be:</strong> Het platform dat klanten verbindt met gekwalificeerde vakmannen in België.</li>
                <li><strong>Klant:</strong> De persoon of entiteit die een dienst boekt via ons platform.</li>
                <li><strong>Vakman:</strong> De zelfstandige professional die diensten uitvoert via ons platform.</li>
                <li><strong>Dienst:</strong> De werkzaamheden uitgevoerd door een vakman op verzoek van een klant.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Artikel 2 - Toepasselijkheid</h2>
              <p className="text-slate-600 mb-4">
                Deze voorwaarden zijn van toepassing op alle boekingen, diensten en overeenkomsten via SpoedDienst24.be.
                Afwijkingen zijn alleen geldig indien schriftelijk overeengekomen.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Artikel 3 - Dienstverlening</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>SpoedDienst24.be is een bemiddelingsplatform tussen klanten en zelfstandige vakmannen.</li>
                <li>Alle vakmannen zijn zelfstandige ondernemers met eigen verantwoordelijkheid.</li>
                <li>Wij streven naar een reactietijd van 30 minuten bij spoedgevallen, maar garanderen dit niet.</li>
                <li>Prijzen zijn inclusief BTW en worden vooraf gecommuniceerd.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Artikel 4 - Prijzen en Betaling</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Alle genoemde prijzen zijn in Euro's en inclusief 21% BTW.</li>
                <li>Betaling geschiedt na voltooiing van de werkzaamheden.</li>
                <li>Wij accepteren Bancontact, iDEAL, creditcard en contante betaling.</li>
                <li>Bij niet-betaling behouden wij ons het recht voor om incassokosten in rekening te brengen.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Artikel 5 - Garantie</h2>
              <p className="text-slate-600 mb-4">
                Wij bieden een tevredenheidsgarantie op alle uitgevoerde werkzaamheden. Indien u niet tevreden bent,
                nemen wij binnen 24 uur contact met u op om het probleem kosteloos op te lossen.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Artikel 6 - Annulering</h2>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Annulering is kosteloos tot 2 uur voor de afgesproken tijd.</li>
                <li>Bij annulering binnen 2 uur kan een voorrijkost van €29,- in rekening worden gebracht.</li>
                <li>Bij spoedgevallen gelden afwijkende annuleringsvoorwaarden.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Artikel 7 - Aansprakelijkheid</h2>
              <p className="text-slate-600 mb-4">
                SpoedDienst24.be is niet aansprakelijk voor schade die voortvloeit uit de werkzaamheden van de vakman.
                De vakman draagt een eigen beroepsaansprakelijkheidsverzekering.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Artikel 8 - Klachten</h2>
              <p className="text-slate-600 mb-4">
                Klachten kunnen worden ingediend via info@spoeddienst24.be of telefonisch via {BE_CONFIG.contact.phoneDisplay}.
                Wij streven ernaar om klachten binnen 48 uur af te handelen.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Artikel 9 - Toepasselijk Recht</h2>
              <p className="text-slate-600 mb-4">
                Op deze voorwaarden is Belgisch recht van toepassing. Geschillen worden voorgelegd aan de bevoegde
                rechtbank in België.
              </p>
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
