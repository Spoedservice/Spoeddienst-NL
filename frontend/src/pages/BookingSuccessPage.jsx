import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Loader2, XCircle, Zap, Home, Phone } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [status, setStatus] = useState('loading');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (sessionId) {
      pollPaymentStatus();
    } else {
      setStatus('success');
    }
  }, [sessionId]);

  const pollPaymentStatus = async () => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus('timeout');
      return;
    }

    try {
      const response = await axios.get(`${API}/payments/status/${sessionId}`);
      setPaymentStatus(response.data);
      
      if (response.data.payment_status === 'paid') {
        setStatus('success');
        return;
      } else if (response.data.status === 'expired') {
        setStatus('expired');
        return;
      }

      // Continue polling
      setTimeout(() => {
        setAttempts(prev => prev + 1);
        pollPaymentStatus();
      }, pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border border-slate-200">
        <CardContent className="pt-8 pb-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-[#FF4500] animate-spin" />
              </div>
              <h1 className="font-heading font-bold text-2xl text-slate-900 mb-2">
                Betaling verwerken...
              </h1>
              <p className="text-slate-600">
                Even geduld terwijl we je betaling controleren.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="font-heading font-bold text-2xl text-slate-900 mb-2">
                Boeking Bevestigd!
              </h1>
              <p className="text-slate-600 mb-6">
                Bedankt voor je boeking. Je ontvangt binnen enkele minuten een bevestiging per e-mail.
              </p>
              <div className="bg-slate-50 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-medium text-slate-900 mb-2">Wat gebeurt er nu?</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Een vakman wordt aan je klus gekoppeld</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Je ontvangt bevestiging met contactgegevens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>De vakman komt op het afgesproken tijdstip</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <Link to="/">
                  <Button className="w-full bg-[#FF4500] hover:bg-[#CC3700]" data-testid="home-btn">
                    <Home className="w-4 h-4 mr-2" />
                    Terug naar home
                  </Button>
                </Link>
                <a href="tel:0800-1234">
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Bel ons: 0800-1234
                  </Button>
                </a>
              </div>
            </>
          )}

          {(status === 'error' || status === 'expired' || status === 'timeout') && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="font-heading font-bold text-2xl text-slate-900 mb-2">
                {status === 'expired' ? 'Sessie verlopen' : 'Er is iets misgegaan'}
              </h1>
              <p className="text-slate-600 mb-6">
                {status === 'expired' 
                  ? 'De betaalsessie is verlopen. Probeer het opnieuw.'
                  : 'We konden je betaling niet verifiëren. Neem contact met ons op.'}
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/">
                  <Button className="w-full bg-[#FF4500] hover:bg-[#CC3700]">
                    Opnieuw proberen
                  </Button>
                </Link>
                <a href="tel:0800-1234">
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Bel ons: 0800-1234
                  </Button>
                </a>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
