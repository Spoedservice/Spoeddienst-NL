import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Droplet, Key, Phone, Euro, Clock, 
  CheckCircle, AlertTriangle, Info
} from "lucide-react";
import { BE_CONFIG, beRoute } from "@/config/belgiumConfig";

const PRICING_DATA = {
  loodgieter: {
    name: "Loodgieter",
    icon: Droplet,
    color: "from-blue-500 to-blue-600",
    services: [
      { name: "Voorrijkosten", price: "€29", note: "Eenmalig" },
      { name: "Uurtarief regulier", price: "€59/uur", note: "Ma-Vr 8:00-18:00" },
      { name: "Uurtarief avond", price: "€79/uur", note: "Ma-Vr 18:00-22:00" },
      { name: "Uurtarief nacht/weekend", price: "€99/uur", note: "22:00-8:00 + weekend" },
      { name: "Lekkage opsporen", price: "Vanaf €89", note: "" },
      { name: "Kraan vervangen", price: "Vanaf €79", note: "Excl. materiaal" },
      { name: "Toilet ontstoppen", price: "Vanaf €69", note: "" },
      { name: "CV-ketel storing", price: "Vanaf €99", note: "" },
    ]
  },
  slotenmaker: {
    name: "Slotenmaker",
    icon: Key,
    color: "from-amber-500 to-amber-600",
    services: [
      { name: "Voorrijkosten", price: "€29", note: "Eenmalig" },
      { name: "Deur openen (simpel)", price: "Vanaf €69", note: "Zonder schade" },
      { name: "Deur openen (complex)", price: "Vanaf €99", note: "Meerpuntsslot" },
      { name: "Cilinder vervangen", price: "Vanaf €89", note: "Incl. basis cilinder" },
      { name: "Slot vervangen", price: "Vanaf €129", note: "Incl. standaard slot" },
      { name: "Inbraakschade herstellen", price: "Vanaf €149", note: "" },
      { name: "Nacht/weekend toeslag", price: "+50%", note: "" },
    ]
  },
  elektricien: {
    name: "Elektricien",
    icon: Zap,
    color: "from-yellow-400 to-yellow-500",
    services: [
      { name: "Voorrijkosten", price: "€29", note: "Eenmalig" },
      { name: "Uurtarief regulier", price: "€65/uur", note: "Ma-Vr 8:00-18:00" },
      { name: "Uurtarief avond", price: "€85/uur", note: "Ma-Vr 18:00-22:00" },
      { name: "Uurtarief nacht/weekend", price: "€109/uur", note: "22:00-8:00 + weekend" },
      { name: "Stroomstoring oplossen", price: "Vanaf €89", note: "" },
      { name: "Stopcontact plaatsen", price: "Vanaf €69", note: "Excl. materiaal" },
      { name: "Zekeringkast controleren", price: "Vanaf €79", note: "" },
      { name: "Kortsluiting verhelpen", price: "Vanaf €99", note: "" },
    ]
  }
};

export default function BelgianPrijzenPage() {
  return (
    <>
      <Helmet>
        <title>Prijzen | SpoedDienst24.be - Transparante tarieven vakmannen België</title>
        <meta name="description" content="Bekijk onze transparante prijzen voor loodgieters, slotenmakers en elektriciens in België. Geen verrassingen, vaste tarieven. 24/7 beschikbaar." />
        <link rel="canonical" href="https://spoeddienst24.be/prijzen" />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to={beRoute("/")} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF4500] to-[#CC3700] rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl">SpoedDienst24<span className="text-[#FF4500]">.be</span></span>
            </Link>
            <a 
              href={`tel:${BE_CONFIG.contact.phone}`}
              className="flex items-center gap-2 bg-[#FF4500] text-white px-4 py-2 rounded-full font-bold hover:bg-[#CC3700]"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">{BE_CONFIG.contact.phoneDisplay}</span>
            </a>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-2 text-sm text-slate-500">
            <Link to={beRoute("/")} className="hover:text-[#FF4500]">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">Prijzen</span>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#FF4500] to-[#CC3700] text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              <Euro className="w-4 h-4 mr-1" />
              Transparante prijzen
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Onze Tarieven
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Geen verrassingen achteraf. Wij hanteren vaste, eerlijke prijzen 
              voor al onze diensten in België.
            </p>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-8 bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-900">Prijsindicatie</h3>
                <p className="text-amber-800 text-sm">
                  Onderstaande prijzen zijn indicatief. De exacte prijs hangt af van de 
                  complexiteit van de klus en eventueel benodigd materiaal. U ontvangt altijd 
                  vooraf een prijsopgave.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Tables */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="space-y-12">
              {Object.entries(PRICING_DATA).map(([key, service]) => {
                const Icon = service.icon;
                return (
                  <Card key={key} className="overflow-hidden">
                    <div className={`bg-gradient-to-r ${service.color} p-6`}>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">{service.name}</h2>
                          <p className="text-white/80">Tarieven in België</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-0">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left p-4 font-semibold text-slate-700">Dienst</th>
                            <th className="text-right p-4 font-semibold text-slate-700">Prijs</th>
                            <th className="text-right p-4 font-semibold text-slate-700 hidden sm:table-cell">Opmerking</th>
                          </tr>
                        </thead>
                        <tbody>
                          {service.services.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-slate-50">
                              <td className="p-4 text-slate-700">{item.name}</td>
                              <td className="p-4 text-right font-bold text-[#FF4500]">{item.price}</td>
                              <td className="p-4 text-right text-sm text-slate-500 hidden sm:table-cell">{item.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="p-4 bg-slate-50 border-t">
                        <Link 
                          to={beRoute(`/boek?service=${key}`)}
                          className="inline-flex items-center gap-2 text-[#FF4500] font-medium hover:underline"
                        >
                          Direct {service.name.toLowerCase()} boeken →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Guarantees */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Onze Garanties</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Vaste Prijsafspraak</h3>
                <p className="text-slate-600">
                  U ontvangt vooraf een prijsopgave. Geen verrassingen achteraf.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">30 Min Garantie</h3>
                <p className="text-slate-600">
                  Bij spoed binnen 30 minuten ter plaatse of korting op de rekening.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">Niet-goed-geld-terug</h3>
                <p className="text-slate-600">
                  Niet tevreden? Dan lossen we het kosteloos op of krijgt u uw geld terug.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-[#FF4500] to-[#CC3700]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Vraag een vrijblijvende offerte aan
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Bel ons of boek online voor een exacte prijsopgave
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={`tel:${BE_CONFIG.contact.phone}`}
                className="inline-flex items-center justify-center gap-2 bg-white text-[#FF4500] px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-100"
              >
                <Phone className="w-6 h-6" />
                {BE_CONFIG.contact.phoneDisplay}
              </a>
              <Link 
                to={beRoute("/boek")}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800"
              >
                Online Boeken
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-400 text-sm">
              © 2024 SpoedDienst24.be - Alle prijzen zijn inclusief BTW
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
