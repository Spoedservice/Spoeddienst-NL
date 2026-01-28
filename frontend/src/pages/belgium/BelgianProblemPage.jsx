import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, Droplet, Key, Phone, Clock, Shield, 
  CheckCircle, ArrowRight, AlertTriangle
} from "lucide-react";
import { BE_CONFIG, BELGIAN_CITIES, beRoute } from "@/config/belgiumConfig";

// SEO Problem pages for Belgian market
const BELGIAN_PROBLEMS = {
  "lekkage-spoed": {
    title: "Lekkage Spoed",
    metaTitle: "Spoed Lekkage België | 24/7 Loodgieter | SpoedDienst24.be",
    metaDescription: "Waterlekkage? Onze spoed loodgieters in België zijn binnen 30 minuten ter plaatse. 24/7 beschikbaar in Antwerpen, Brussel, Gent en heel Vlaanderen.",
    service: "loodgieter",
    icon: Droplet,
    color: "from-blue-500 to-blue-600",
    heroText: "Waterlekkage? Elke minuut telt!",
    description: "Een waterlekkage kan enorme schade veroorzaken aan uw woning. Onze ervaren loodgieters staan 24/7 klaar om de lekkage snel en vakkundig te verhelpen.",
    symptoms: [
      "Water druppelt van plafond of muur",
      "Vochtplekken op muren of vloer",
      "Onverklaarbaar hoog waterverbruik",
      "Sissend geluid in leidingen",
      "Schimmelvorming door vocht"
    ],
    solutions: [
      "Lekkage opsporen met thermische camera",
      "Leidingen repareren of vervangen",
      "Kranen en koppelingen herstellen",
      "Waterleiding afsluiten bij nood"
    ],
    price: "Vanaf €89"
  },
  "buitengesloten-spoed": {
    title: "Buitengesloten Spoed",
    metaTitle: "Buitengesloten België | 24/7 Slotenmaker | SpoedDienst24.be",
    metaDescription: "Buitengesloten? Onze slotenmakers openen uw deur binnen 20 minuten, zonder schade. 24/7 beschikbaar in heel België.",
    service: "slotenmaker",
    icon: Key,
    color: "from-amber-500 to-amber-600",
    heroText: "Buitengesloten? Wij openen uw deur!",
    description: "Sleutel vergeten of kwijtgeraakt? Onze professionele slotenmakers openen uw deur snel en vakkundig, in de meeste gevallen zonder schade.",
    symptoms: [
      "Sleutel vergeten binnen",
      "Sleutel kwijtgeraakt",
      "Sleutel afgebroken in slot",
      "Slot geblokkeerd",
      "Deur in het slot gevallen"
    ],
    solutions: [
      "Deur openen zonder schade",
      "Noodopening bij alle slottypen",
      "Slot vervangen indien nodig",
      "Nieuwe sleutels bijmaken"
    ],
    price: "Vanaf €69"
  },
  "stroomstoring-spoed": {
    title: "Stroomstoring Spoed",
    metaTitle: "Spoed Stroomstoring België | 24/7 Elektricien | SpoedDienst24.be",
    metaDescription: "Stroomstoring? Onze elektriciens in België zijn 24/7 beschikbaar. Binnen 30 minuten ter plaatse in Antwerpen, Brussel, Gent.",
    service: "elektricien",
    icon: Zap,
    color: "from-yellow-400 to-yellow-500",
    heroText: "Geen stroom? Wij helpen direct!",
    description: "Een stroomstoring kan uw hele huishouden platleggen. Onze elektriciens vinden de oorzaak en herstellen de stroomvoorziening zo snel mogelijk.",
    symptoms: [
      "Gehele woning zonder stroom",
      "Zekeringen slaan steeds af",
      "Differentieel schakelt uit",
      "Deel van huis zonder stroom",
      "Vonken bij stopcontacten"
    ],
    solutions: [
      "Oorzaak stroomstoring opsporen",
      "Zekeringkast controleren",
      "Kortsluiting verhelpen",
      "Defecte bedrading repareren"
    ],
    price: "Vanaf €89"
  },
  "inbraakschade-spoed": {
    title: "Inbraakschade Spoed",
    metaTitle: "Inbraakschade Herstel België | 24/7 Slotenmaker | SpoedDienst24.be",
    metaDescription: "Inbraakschade? Onze slotenmakers herstellen uw slot en deur direct. 24/7 beschikbaar in heel België. Veilig de nacht in.",
    service: "slotenmaker",
    icon: Key,
    color: "from-red-500 to-red-600",
    heroText: "Inbraakschade? Direct herstel!",
    description: "Na een inbraak wilt u zo snel mogelijk uw woning weer veilig maken. Onze slotenmakers herstellen de schade en plaatsen indien nodig nieuw hang- en sluitwerk.",
    symptoms: [
      "Deur geforceerd of beschadigd",
      "Slot kapot gemaakt",
      "Kozijn beschadigd",
      "Inbraaksporen aan raam",
      "Onveilig gevoel na inbraak"
    ],
    solutions: [
      "Noodreparatie deur en slot",
      "Nieuw inbraakwerend slot plaatsen",
      "Kozijn herstellen",
      "Veiligheidsscan woning"
    ],
    price: "Vanaf €149"
  },
  "toilet-verstopt-spoed": {
    title: "Toilet Verstopt Spoed",
    metaTitle: "Verstopt Toilet België | 24/7 Loodgieter | SpoedDienst24.be",
    metaDescription: "Toilet verstopt? Onze loodgieters in België ontstoppen uw toilet binnen 30 minuten. 24/7 service in heel Vlaanderen.",
    service: "loodgieter",
    icon: Droplet,
    color: "from-blue-500 to-blue-600",
    heroText: "Toilet verstopt? Snel opgelost!",
    description: "Een verstopt toilet is niet alleen onhandig, het kan ook voor waterschade zorgen. Onze loodgieters ontstoppen uw toilet snel en hygiënisch.",
    symptoms: [
      "Toilet loopt niet door",
      "Water stijgt bij doorspoelen",
      "Borrelend geluid in afvoer",
      "Vieze geur uit toilet",
      "Toilet overstroomt"
    ],
    solutions: [
      "Professionele ontstopping",
      "Camera-inspectie afvoer",
      "Hogedruk reiniging",
      "Preventief onderhoud"
    ],
    price: "Vanaf €69"
  }
};

export default function BelgianProblemPage() {
  const { slug } = useParams();
  const problem = BELGIAN_PROBLEMS[slug];
  
  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Pagina niet gevonden</h1>
          <Link to={beRoute("/")} className="text-[#FF4500] hover:underline">Terug naar home</Link>
        </div>
      </div>
    );
  }

  const Icon = problem.icon;
  const topCities = BELGIAN_CITIES.filter(c => 
    ["antwerpen", "brussel", "gent", "brugge", "leuven", "hasselt"].includes(c.slug)
  );

  return (
    <>
      <Helmet>
        <title>{problem.metaTitle}</title>
        <meta name="description" content={problem.metaDescription} />
        <link rel="canonical" href={`https://spoeddienst24.be/${slug}`} />
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
        <section className={`bg-gradient-to-br ${problem.color} text-white py-16`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  24/7 Spoed Service België
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-black mb-4">
                  {problem.heroText}
                </h1>
                
                <p className="text-xl text-white/90 mb-6">
                  {problem.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href={`tel:${BE_CONFIG.contact.phone}`}
                    className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-slate-100"
                  >
                    <Phone className="w-5 h-5" />
                    Bel Nu: {BE_CONFIG.contact.phoneDisplay}
                  </a>
                  <Link 
                    to={beRoute(`/boek?service=${problem.service}`)}
                    className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-slate-800"
                  >
                    Direct Boeken
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
              
              <div className="w-32 h-32 bg-white/10 rounded-3xl flex items-center justify-center">
                <Icon className="w-20 h-20 text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* Symptoms & Solutions */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Herkent u dit?
                  </h2>
                  <ul className="space-y-3">
                    {problem.symptoms.map((symptom, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    Onze oplossingen
                  </h2>
                  <ul className="space-y-3">
                    {problem.solutions.map((solution, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{solution}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500">Prijs indicatie</p>
                    <p className="text-2xl font-bold text-[#FF4500]">{problem.price}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust indicators */}
        <section className="py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-[#FF4500] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <p className="font-bold">30 minuten</p>
                <p className="text-sm text-slate-500">Ter plaatse</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-[#FF4500] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <p className="font-bold">Gecertificeerd</p>
                <p className="text-sm text-slate-500">Erkende vakmannen</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-[#FF4500] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <p className="font-bold">24/7</p>
                <p className="text-sm text-slate-500">Bereikbaar</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-[#FF4500] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <p className="font-bold">Vaste prijs</p>
                <p className="text-sm text-slate-500">Geen verrassingen</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cities */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
              {problem.title} in uw regio
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topCities.map(city => (
                <Link
                  key={city.slug}
                  to={beRoute(`/spoed-${problem.service}/${city.slug}`)}
                  className="p-4 bg-slate-50 rounded-xl text-center hover:bg-[#FF4500] hover:text-white transition-colors"
                >
                  <span className="font-medium">{city.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-[#FF4500] to-[#CC3700]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {problem.heroText}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Bel nu voor directe hulp
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
              © 2024 SpoedDienst24.be - 24/7 {problem.title} in heel België
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
