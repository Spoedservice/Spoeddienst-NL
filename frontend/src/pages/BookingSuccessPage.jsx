import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Zap, Home, Phone, CreditCard, FileText } from "lucide-react";

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border border-slate-200">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 mb-2">
            Boeking Ontvangen!
          </h1>
          <p className="text-slate-600 mb-6">
            Bedankt voor je boeking. We nemen zo snel mogelijk contact met je op om de afspraak te bevestigen.
          </p>
          
          <div className="bg-slate-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-medium text-slate-900 mb-3">Wat gebeurt er nu?</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#FF4500] mt-0.5 flex-shrink-0" />
                <span>We bellen je binnen 30 minuten om de afspraak te bevestigen</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Een vakman wordt aan je klus gekoppeld</span>
              </li>
              <li className="flex items-start gap-2">
                <CreditCard className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>Betalen:</strong> Direct bij de monteur (pin/contant)</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span><strong>Of:</strong> Factuur na telefonisch overleg</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#FF4500]/5 border border-[#FF4500]/20 p-4 rounded-lg mb-6">
            <p className="text-sm text-slate-700">
              <strong>Spoed?</strong> Bel ons direct voor snellere service:
            </p>
            <a href="tel:0853332847" className="font-heading font-bold text-xl text-[#FF4500] hover:underline">
              085 333 2847
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/">
              <Button className="w-full bg-[#FF4500] hover:bg-[#CC3700]" data-testid="home-btn">
                <Home className="w-4 h-4 mr-2" />
                Terug naar home
              </Button>
            </Link>
            <a href="tel:0853332847">
              <Button variant="outline" className="w-full">
                <Phone className="w-4 h-4 mr-2" />
                Bel ons: 085 333 2847
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
