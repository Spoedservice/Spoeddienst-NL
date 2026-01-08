import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Smartphone, Download, Star, Bell, CreditCard, MapPin, Clock } from "lucide-react";

export default function VakmanAppPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">SpoedDienst24</span>
          </Link>
          <Link to="/vakman/register">
            <Button className="bg-[#FF4500] hover:bg-[#CC3700]">
              Word Vakman
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-20 h-20 bg-[#FF4500] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-heading font-black text-4xl sm:text-5xl mb-6">
            SpoedDienst24 <span className="text-[#FF4500]">Vakman App</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Download de app en ontvang direct klussen in jouw buurt. 
            Beschikbaar voor iOS en Android.
          </p>
          
          {/* App Store Badges */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a 
              href="https://apps.apple.com/nl/app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl transition-colors"
            >
              <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs">Download in de</div>
                <div className="text-lg font-semibold">App Store</div>
              </div>
            </a>
            <a 
              href="https://play.google.com/store/apps/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-black hover:bg-gray-900 text-white px-6 py-3 rounded-xl transition-colors"
            >
              <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs">Download in de</div>
                <div className="text-lg font-semibold">Google Play</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* App Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-12 text-center">
            Wat kan je met de app?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Bell, title: "Push notificaties", desc: "Ontvang direct bericht bij nieuwe klussen in jouw buurt" },
              { icon: MapPin, title: "Klussen in de buurt", desc: "Zie alle beschikbare klussen op de kaart in jouw regio" },
              { icon: CreditCard, title: "Eenvoudig factureren", desc: "Maak facturen en laat klanten betalen via QR-code" },
              { icon: Clock, title: "Planning beheren", desc: "Beheer je agenda en beschikbaarheid in één overzicht" },
              { icon: Star, title: "Reviews verzamelen", desc: "Bouw je reputatie op met klantbeoordelingen" },
              { icon: Download, title: "Offline toegang", desc: "Bekijk je geplande klussen ook zonder internet" }
            ].map((item, idx) => (
              <Card key={idx} className="border border-slate-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[#FF4500]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-[#FF4500]" />
                  </div>
                  <h3 className="font-heading font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">
            Nog geen vakman bij SpoedDienst24?
          </h2>
          <p className="text-slate-600 mb-8">
            Meld je eerst aan als vakman, daarna kun je de app downloaden en direct starten
          </p>
          <Link to="/vakman/register">
            <Button className="bg-[#FF4500] hover:bg-[#CC3700] h-12 px-8 font-bold">
              Aanmelden als vakman
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-900 text-center">
        <Link to="/" className="text-white hover:text-[#FF4500]">← Terug naar home</Link>
        <p className="text-slate-500 text-sm mt-4">© 2024 SpoedDienst24.nl - Vakman App</p>
      </footer>
    </div>
  );
}
