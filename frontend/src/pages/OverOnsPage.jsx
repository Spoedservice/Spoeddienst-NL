import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Target, Heart, Award, Shield, Clock, Users, TrendingUp, Star, CheckCircle, ArrowRight, Phone } from 'lucide-react';

export default function OverOnsPage() {
  const [activeValue, setActiveValue] = useState(0);

  const values = [
    {
      icon: Shield,
      title: "Betrouwbaarheid",
      description: "Elke vakman doorloopt een streng screeningsproces",
      details: "VOG-verificatie, referentiecontrole en minimaal 5 jaar werkervaring"
    },
    {
      icon: Zap,
      title: "Snelheid",
      description: "24/7 beschikbaar, ook voor spoedklussen",
      details: "Gemiddelde reactietijd van 15 minuten bij spoedsituaties"
    },
    {
      icon: Heart,
      title: "Klanttevredenheid",
      description: "100% tevredenheidsgarantie op elke klus",
      details: "Niet tevreden? We komen het gratis oplossen"
    },
    {
      icon: Award,
      title: "Kwaliteit",
      description: "Alleen top-vakmannen in ons netwerk",
      details: "Gemiddelde klantbeoordeling van 4.7 uit 5 sterren"
    }
  ];

  const timeline = [
    { year: "2021", event: "SpoedDienst24 opgericht", description: "Gestart met 15 vakmannen in Amsterdam" },
    { year: "2022", event: "Landelijke dekking", description: "Uitgebreid naar heel Nederland" },
    { year: "2023", event: "10.000 klussen", description: "Mijlpaal bereikt met meer dan 500 vakmannen" },
    { year: "2024", event: "Innovatie award", description: "Erkend als beste platform voor spoeddiensten" }
  ];

  const team = [
    { 
      role: "Oprichter & CEO", 
      name: "Linda Kluit", 
      quote: "Hulp moet er zijn wanneer je het nodig hebt",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face"
    },
    { 
      role: "Hoofd Vakmannen Netwerk", 
      name: "Ferry Soester", 
      quote: "Kwaliteit begint bij de mensen",
      image: "https://images.unsplash.com/photo-1651684215020-f7a5b6610f23?w=400&h=400&fit=crop&crop=face"
    },
    { 
      role: "Customer Success", 
      name: "Marieke van der Hurk", 
      quote: "Elke klant verdient een perfect resultaat",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">SpoedDienst24</span>
          </Link>
          <div className="flex items-center gap-4">
            <a href="tel:085 333 2847" className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-[#FF4500]">
              <Phone className="w-4 h-4" />
              <span>085 333 2847</span>
            </a>
            <Link to="/diensten" className="bg-[#FF4500] hover:bg-[#CC3700] text-white px-6 py-2 rounded-md font-medium transition-colors">
              Direct Boeken
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#FF4500] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#FF4500]/20 border border-[#FF4500]/30 rounded-full px-4 py-2 mb-6">
            <CheckCircle className="w-4 h-4 text-[#FF4500]" />
            <span className="text-sm font-medium">Sinds 2021 • 10.000+ tevreden klanten</span>
          </div>
          <h1 className="font-black text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Hulp wanneer je het <span className="text-[#FF4500]">echt nodig hebt</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Van waterlekkage om 3 uur 's nachts tot een kapotte CV op zondagochtend - wij verbinden je binnen minuten met de juiste vakman.
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>24/7 beschikbaar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Vaste prijzen</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Tevredenheidsgarantie</span>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center mb-16">
            <div>
              <h2 className="font-bold text-2xl sm:text-3xl text-slate-900 mb-6">Het begon met frustratie</h2>
              <div className="space-y-4 text-slate-600">
                <p className="leading-relaxed">
                  Het is zondagavond. Je staat onder de douche en plots: geen warm water. De CV is defect. Je begint te googlen, belt wat nummers - niemand neemt op. De nummers die wel opnemen? Onduidelijke prijzen, geen beschikbaarheid, of ze klinken gewoon niet betrouwbaar.
                </p>
                <p className="leading-relaxed">
                  Deze frustratie kenden onze oprichters maar al te goed. In 2021 besloten ze: dit kan beter. Veel beter.
                </p>
                <p className="leading-relaxed font-medium text-slate-900">
                  SpoedDienst24 maakt het simpel: één platform, honderden gescreende vakmannen, binnen 15 minuten hulp.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-200">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#FF4500] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">Onze missie</h3>
                    <p className="text-slate-600 text-sm">Iedereen verdient toegang tot snelle, betrouwbare hulp - zonder stress of onduidelijkheid.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">Onze visie</h3>
                    <p className="text-slate-600 text-sm">Het meest vertrouwde platform voor spoeddiensten in Nederland worden.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values - Interactive */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bold text-2xl sm:text-3xl text-slate-900 mb-4">Waar we voor staan</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Onze vier kernwaarden bepalen alles wat we doen</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                onMouseEnter={() => setActiveValue(index)}
                className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-300 border-2 ${
                  activeValue === index 
                    ? 'border-[#FF4500] shadow-lg transform -translate-y-1' 
                    : 'border-transparent shadow hover:shadow-md'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${
                  activeValue === index ? 'bg-[#FF4500]' : 'bg-[#FF4500]/10'
                }`}>
                  <value.icon className={`w-7 h-7 ${activeValue === index ? 'text-white' : 'text-[#FF4500]'}`} />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{value.title}</h3>
                <p className="text-slate-600 text-sm mb-3">{value.description}</p>
                <p className={`text-xs transition-all ${
                  activeValue === index ? 'text-[#FF4500] font-medium' : 'text-slate-500'
                }`}>
                  {value.details}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-bold text-2xl sm:text-3xl text-slate-900 mb-12 text-center">Ons verhaal in cijfers</h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[#FF4500]/20 hidden sm:block"></div>
            <div className="space-y-6 sm:space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-[#FF4500] rounded-full flex items-center justify-center text-white font-bold shadow-lg z-10 text-sm sm:text-base">
                    {item.year}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-lg p-4 sm:p-6 border border-slate-200">
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{item.event}</h3>
                    <p className="text-slate-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-bold text-2xl sm:text-3xl mb-12 text-center">SpoedDienst24 vandaag</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#FF4500]/20 rounded-full mb-4">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF4500]" />
              </div>
              <p className="font-black text-3xl sm:text-5xl text-[#FF4500] mb-2">10K+</p>
              <p className="text-slate-300 text-sm sm:text-base">Tevreden klanten</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-500/20 rounded-full mb-4">
                <Award className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
              </div>
              <p className="font-black text-3xl sm:text-5xl text-blue-400 mb-2">500+</p>
              <p className="text-slate-300 text-sm sm:text-base">Gescreende vakmannen</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-green-500/20 rounded-full mb-4">
                <Star className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" />
              </div>
              <p className="font-black text-3xl sm:text-5xl text-green-400 mb-2">4.7/5</p>
              <p className="text-slate-300 text-sm sm:text-base">Gemiddelde beoordeling</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-purple-500/20 rounded-full mb-4">
                <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400" />
              </div>
              <p className="font-black text-3xl sm:text-5xl text-purple-400 mb-2">15m</p>
              <p className="text-slate-300 text-sm sm:text-base">Gem. reactietijd</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bold text-2xl sm:text-3xl text-slate-900 mb-4">Het team achter SpoedDienst24</h2>
            <p className="text-slate-600">Gedreven om je elke dag de beste service te bieden</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#FF4500] to-[#CC3700] rounded-full mb-4 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">{member.name}</h3>
                <p className="text-sm text-[#FF4500] font-medium mb-3">{member.role}</p>
                <p className="text-slate-600 text-sm italic">"{member.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FF4500]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-bold text-3xl sm:text-4xl text-white mb-4">Hulp nodig? We staan voor je klaar.</h2>
          <p className="text-white/90 mb-8 text-base sm:text-lg">24/7 beschikbaar • Vaste prijzen • Tevredenheidsgarantie</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/diensten" className="bg-white text-[#FF4500] hover:bg-slate-100 px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all hover:shadow-xl flex items-center justify-center gap-2">
              Direct Boeken <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="tel:085 333 2847" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              Bel 085 333 2847
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-center">
        <Link to="/" className="text-white hover:text-[#FF4500] transition-colors inline-flex items-center gap-2">
          ← Terug naar home
        </Link>
        <p className="text-slate-500 text-sm mt-4">© 2024 SpoedDienst24.nl • KVK: 99210835</p>
      </footer>
    </div>
  );
}
