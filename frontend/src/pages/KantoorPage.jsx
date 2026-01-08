import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Droplets, Key, Building, CheckCircle, Phone, ArrowRight, Shield, Clock, Euro } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function KantoorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">SpoedDienst24</span>
          </Link>
          <a href="tel:0800-1234" className="flex items-center gap-2 bg-[#FF4500] text-white px-4 py-2 rounded-md font-medium hover:bg-[#CC3700]">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">0800-1234</span>
          </a>
        </div>
      </header>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-[#FF4500] text-white mb-4">Kantoor Klusservice</Badge>
              <h1 className="font-heading font-black text-4xl sm:text-5xl text-slate-900 mb-6 leading-tight">
                Kantoor Klusservice - <span className="text-[#FF4500]">Snel & Professioneel</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8">
                Uw kantoor draaiende houden is onze prioriteit. Van stroomstoringen tot lekkages - 
                SpoedDienst24 zorgt voor minimale verstoring van uw werkzaamheden.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => navigate('/boek/elektricien')} className="bg-[#FF4500] hover:bg-[#CC3700] h-12 px-6">
                  Direct een vakman boeken <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <a href="tel:0800-1234">
                  <Button variant="outline" className="h-12 px-6 w-full sm:w-auto">
                    <Phone className="w-4 h-4 mr-2" /> Bel 0800-1234
                  </Button>
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80"
                alt="Kantoor klusservice - SpoedDienst24 voor kantoorpanden"
                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Clock, title: "Snelle service", desc: "Minimale downtime" },
            { icon: Euro, title: "Factuur op bedrijfsnaam", desc: "Zakelijk betalen" },
            { icon: Shield, title: "Gescreende vakmannen", desc: "Betrouwbaar" },
            { icon: Building, title: "Kantoorspecialist", desc: "Kennis van kantoorpanden" }
          ].map((item, idx) => (
            <div key={idx} className="p-4">
              <item.icon className="w-10 h-10 text-[#FF4500] mx-auto mb-3" />
              <h3 className="font-heading font-bold text-slate-900">{item.title}</h3>
              <p className="text-slate-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8 text-center">Veelvoorkomende kantoorklussen</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Elektra storingen", "Verlichting installeren", "Lekkages oplossen",
              "Toegangscontrole", "Sloten vervangen", "Airco onderhoud",
              "Sanitair reparaties", "Netwerk bekabeling", "Brandbeveiliging"
            ].map((service, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-lg border border-slate-200">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-slate-700">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FF4500]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl text-white mb-4">Storing op kantoor?</h2>
          <p className="text-white/90 mb-8">We zijn er snel - minimale verstoring gegarandeerd</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:0800-1234" className="inline-flex items-center justify-center gap-2 bg-white text-[#FF4500] px-6 py-3 rounded-md font-bold hover:bg-slate-100">
              <Phone className="w-5 h-5" /> 0800-1234
            </a>
            <Button onClick={() => navigate('/boek/elektricien')} className="bg-slate-900 hover:bg-slate-800 px-6 py-3 h-auto font-bold">
              Direct Boeken
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-center">
        <Link to="/" className="text-white hover:text-[#FF4500]">← Terug naar home</Link>
        <p className="text-slate-500 text-sm mt-4">© 2024 SpoedDienst24.nl - Kantoor Klusservice</p>
      </footer>
    </div>
  );
}
