import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Phone, Shield, CheckCircle, Clock, Star,
  Building, Users, FileCheck, HeartHandshake
} from "lucide-react";
import { BE_CONFIG, beRoute } from "@/config/belgiumConfig";

export default function BelgianGarantiePage() {
  return (
    <>
      <Helmet>
        <title>Garantie | SpoedDienst24.be - 100% Tevredenheidsgarantie</title>
        <meta name="description" content="Bij SpoedDienst24.be bieden we 100% tevredenheidsgarantie. Niet tevreden? Geld terug of gratis herstel. Lees onze garantievoorwaarden." />
        <link rel="canonical" href="https://spoeddienst24.be/garantie" />
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

        {/* Hero */}
        <section className="bg-gradient-to-br from-green-600 to-green-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              100% Tevredenheidsgarantie
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Onze Garantie
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Wij staan volledig achter de kwaliteit van ons werk. 
              Niet tevreden? Dan lossen we het op of krijgt u uw geld terug.
            </p>
          </div>
        </section>

        {/* Guarantees */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-slate-900 mb-2">30 Minuten Garantie</h3>
                  <p className="text-slate-600 text-sm">
                    Bij spoedklussen binnen 30 minuten ter plaatse of korting op de rekening.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <Star className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Kwaliteitsgarantie</h3>
                  <p className="text-slate-600 text-sm">
                    6 maanden garantie op al het uitgevoerde werk en gebruikte materialen.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <FileCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Vaste Prijs</h3>
                  <p className="text-slate-600 text-sm">
                    De geoffreerde prijs is de eindprijs. Geen verrassingen achteraf.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="p-6 text-center">
                  <HeartHandshake className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-slate-900 mb-2">Geld Terug</h3>
                  <p className="text-slate-600 text-sm">
                    Niet tevreden en wij kunnen het niet oplossen? Dan krijgt u uw geld terug.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Garantievoorwaarden</h2>
            
            <div className="space-y-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Wat valt onder de garantie?
                  </h3>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Alle reparaties en werkzaamheden uitgevoerd door onze vakmannen</li>
                    <li>• Materialen die door ons zijn geleverd en geïnstalleerd</li>
                    <li>• Gebreken die ontstaan door fouten in vakmanschap</li>
                    <li>• Onderdelen die defect raken binnen de garantieperiode</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-500" />
                    Garantieperiode
                  </h3>
                  <ul className="space-y-2 text-slate-600">
                    <li>• <strong>6 maanden</strong> op uitgevoerde werkzaamheden</li>
                    <li>• <strong>Fabrieksgarantie</strong> op geleverde materialen (verschilt per product)</li>
                    <li>• Garantie gaat in op de datum van uitvoering</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-500" />
                    Hoe maak ik gebruik van de garantie?
                  </h3>
                  <ol className="space-y-2 text-slate-600 list-decimal list-inside">
                    <li>Neem contact op via {BE_CONFIG.contact.phoneDisplay} of info@spoeddienst24.be</li>
                    <li>Vermeld uw boekingsnummer en omschrijf het probleem</li>
                    <li>Wij plannen binnen 24 uur een inspectie</li>
                    <li>Bij gegronde klacht wordt het probleem kosteloos opgelost</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-[#FF4500] to-[#CC3700]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Vragen over onze garantie?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Neem gerust contact met ons op
            </p>
            <a 
              href={`tel:${BE_CONFIG.contact.phone}`}
              className="inline-flex items-center justify-center gap-2 bg-white text-[#FF4500] px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-100"
            >
              <Phone className="w-6 h-6" />
              {BE_CONFIG.contact.phoneDisplay}
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-400 text-sm">
              © 2024 SpoedDienst24.be - Uw tevredenheid is onze prioriteit
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
