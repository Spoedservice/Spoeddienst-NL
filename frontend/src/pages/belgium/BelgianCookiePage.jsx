import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet-async";
import { Zap, Phone, ArrowLeft, Cookie } from 'lucide-react';
import GlobalFooter from "@/components/common/GlobalFooter";
import { BE_CONFIG, beRoute } from "@/config/belgiumConfig";

export default function BelgianCookiePage() {
  return (
    <>
      <Helmet>
        <title>Cookie Beleid | SpoedDienst24.be</title>
        <meta name="description" content="Informatie over het gebruik van cookies op SpoedDienst24.be." />
        <link rel="canonical" href="https://spoeddienst24.be/cookies" />
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
              <Cookie className="w-6 h-6 text-[#FF4500]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Cookie Beleid</h1>
          </div>
          
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 mb-8">
              SpoedDienst24.be maakt gebruik van cookies om uw ervaring op onze website te verbeteren.
              Dit beleid legt uit wat cookies zijn en hoe wij ze gebruiken.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Wat zijn cookies?</h2>
              <p className="text-slate-600">
                Cookies zijn kleine tekstbestanden die op uw apparaat worden geplaatst wanneer u onze website bezoekt.
                Ze helpen ons om de website goed te laten werken, de website veiliger te maken, en om inzicht te krijgen
                in hoe de website wordt gebruikt.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Welke cookies gebruiken wij?</h2>
              
              <div className="bg-slate-50 rounded-lg p-6 mb-4">
                <h3 className="font-bold text-slate-900 mb-2">Noodzakelijke cookies</h3>
                <p className="text-slate-600 text-sm mb-2">
                  Deze cookies zijn essentieel voor het functioneren van de website.
                </p>
                <ul className="list-disc pl-6 text-slate-600 text-sm space-y-1">
                  <li>Sessiecookies voor inloggen</li>
                  <li>Beveiligingscookies</li>
                  <li>Cookies voor het boekingsformulier</li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 mb-4">
                <h3 className="font-bold text-slate-900 mb-2">Analytische cookies</h3>
                <p className="text-slate-600 text-sm mb-2">
                  Deze cookies helpen ons om te begrijpen hoe bezoekers onze website gebruiken.
                </p>
                <ul className="list-disc pl-6 text-slate-600 text-sm space-y-1">
                  <li>Google Analytics (G-CE8N2M1HL8)</li>
                  <li>Paginabezoeken en -duur</li>
                  <li>Verkeerbronnen</li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-lg p-6 mb-4">
                <h3 className="font-bold text-slate-900 mb-2">Marketing cookies</h3>
                <p className="text-slate-600 text-sm mb-2">
                  Deze cookies worden gebruikt voor advertentiedoeleinden.
                </p>
                <ul className="list-disc pl-6 text-slate-600 text-sm space-y-1">
                  <li>Google Ads conversietracking</li>
                  <li>Remarketing cookies</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Hoe kunt u cookies beheren?</h2>
              <p className="text-slate-600 mb-4">
                U kunt uw cookievoorkeuren op elk moment aanpassen via uw browserinstellingen.
                Houd er rekening mee dat het uitschakelen van bepaalde cookies de functionaliteit van
                onze website kan beïnvloeden.
              </p>
              <p className="text-slate-600">
                Meer informatie over het beheren van cookies vindt u op{' '}
                <a href="https://www.allaboutcookies.org" className="text-[#FF4500] hover:underline" target="_blank" rel="noopener noreferrer">
                  www.allaboutcookies.org
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Contact</h2>
              <p className="text-slate-600">
                Heeft u vragen over ons cookiebeleid? Neem dan contact met ons op via{' '}
                <a href="mailto:info@spoeddienst24.be" className="text-[#FF4500] hover:underline">
                  info@spoeddienst24.be
                </a>
              </p>
            </section>

            <div className="bg-slate-50 rounded-lg p-6 mt-8">
              <p className="text-sm text-slate-500">
                <strong>Laatst bijgewerkt:</strong> Januari 2025
              </p>
            </div>
          </div>
        </main>

        <GlobalFooter />
      </div>
    </>
  );
}
