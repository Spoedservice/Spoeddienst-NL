import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Phone, Shield, Clock, Star, CheckCircle, 
  Award, Users, MapPin, Wrench
} from "lucide-react";
import { BE_CONFIG, beRoute } from "@/config/belgiumConfig";

export default function BelgianOverOnsPage() {
  return (
    <>
      <Helmet>
        <title>Over Ons | SpoedDienst24.be - 24/7 Vakmannen in België</title>
        <meta name="description" content="SpoedDienst24.be is uw betrouwbare partner voor spoed loodgieters, slotenmakers en elektriciens in heel België. 24/7 beschikbaar, binnen 30 minuten ter plaatse." />
        <link rel="canonical" href="https://spoeddienst24.be/over-ons" />
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
            <span className="text-slate-900">Over Ons</span>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#FF4500] to-[#CC3700] text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              Sinds 2020 actief in België
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              Over SpoedDienst24.be
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Uw betrouwbare partner voor spoed vakmannen in heel Vlaanderen en Brussel. 
              24 uur per dag, 7 dagen per week.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Onze Missie</h2>
                <p className="text-slate-600 mb-4">
                  Bij SpoedDienst24.be geloven we dat niemand lang hoeft te wachten op hulp bij 
                  een noodgeval. Of het nu gaat om een lekkage midden in de nacht, een kapot 
                  slot na een inbraak, of een stroomstoring - wij staan klaar.
                </p>
                <p className="text-slate-600 mb-4">
                  Ons netwerk van gecertificeerde vakmannen in heel België zorgt ervoor dat 
                  er altijd iemand in de buurt is om u te helpen. Binnen 30 minuten staat er 
                  een professional voor uw deur.
                </p>
                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="flex items-center gap-2 text-[#FF4500]">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Gecertificeerd</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#FF4500]">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Verzekerd</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#FF4500]">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Betrouwbaar</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-50">
                  <CardContent className="p-6 text-center">
                    <Clock className="w-10 h-10 text-[#FF4500] mx-auto mb-3" />
                    <p className="text-3xl font-bold text-slate-900">30</p>
                    <p className="text-sm text-slate-500">Minuten responstijd</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50">
                  <CardContent className="p-6 text-center">
                    <Users className="w-10 h-10 text-[#FF4500] mx-auto mb-3" />
                    <p className="text-3xl font-bold text-slate-900">150+</p>
                    <p className="text-sm text-slate-500">Vakmannen</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50">
                  <CardContent className="p-6 text-center">
                    <MapPin className="w-10 h-10 text-[#FF4500] mx-auto mb-3" />
                    <p className="text-3xl font-bold text-slate-900">50+</p>
                    <p className="text-sm text-slate-500">Steden</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-50">
                  <CardContent className="p-6 text-center">
                    <Star className="w-10 h-10 text-[#FF4500] mx-auto mb-3" />
                    <p className="text-3xl font-bold text-slate-900">4.9</p>
                    <p className="text-sm text-slate-500">Gemiddelde score</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Onze Waarden</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-2 hover:border-[#FF4500] transition-colors">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#FF4500] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Snelheid</h3>
                  <p className="text-slate-600">
                    Binnen 30 minuten staat er een vakman voor uw deur. 
                    Bij spoedgevallen telt elke minuut.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:border-[#FF4500] transition-colors">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#FF4500] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Betrouwbaarheid</h3>
                  <p className="text-slate-600">
                    Al onze vakmannen zijn gecertificeerd, verzekerd en 
                    gecontroleerd op kwaliteit en betrouwbaarheid.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:border-[#FF4500] transition-colors">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#FF4500] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Kwaliteit</h3>
                  <p className="text-slate-600">
                    Wij leveren alleen topkwaliteit werk. Niet tevreden? 
                    Dan lossen we het kosteloos op.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Coverage */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">Actief in heel België</h2>
            <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
              Ons netwerk van vakmannen bedekt heel Vlaanderen en Brussel
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {["Antwerpen", "Brussel", "Gent", "Brugge", "Leuven", "Hasselt", "Mechelen", "Kortrijk", "Oostende", "Aalst", "Turnhout", "Genk"].map(city => (
                <div key={city} className="bg-slate-50 rounded-xl p-4 text-center hover:bg-[#FF4500] hover:text-white transition-colors cursor-pointer">
                  <MapPin className="w-5 h-5 mx-auto mb-2" />
                  <span className="font-medium">{city}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-[#FF4500] to-[#CC3700]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hulp nodig? Wij staan klaar!
            </h2>
            <p className="text-xl text-white/90 mb-8">
              24/7 bereikbaar voor al uw spoedklussen
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
                <Wrench className="w-6 h-6" />
                Direct Boeken
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-400 text-sm">
              © 2024 SpoedDienst24.be - 24/7 Vakmannen in heel België
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
