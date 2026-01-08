import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, CheckCircle, Loader2, XCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PremiumSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('loading');
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

    if (attempts >= maxAttempts) {
      setStatus('timeout');
      return;
    }

    try {
      const response = await axios.get(`${API}/premium/status/${sessionId}`);
      
      if (response.data.payment_status === 'paid') {
        setStatus('success');
        return;
      }

      setTimeout(() => {
        setAttempts(prev => prev + 1);
        pollPaymentStatus();
      }, 2000);
    } catch (error) {
      console.error('Error checking status:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border border-slate-200">
        <CardContent className="pt-8 pb-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
              </div>
              <h1 className="font-heading font-bold text-2xl text-slate-900 mb-2">
                Betaling verwerken...
              </h1>
              <p className="text-slate-600">Even geduld terwijl we je betaling controleren.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-8 h-8 text-yellow-500" />
              </div>
              <h1 className="font-heading font-bold text-2xl text-slate-900 mb-2">
                Welkom bij Premium!
              </h1>
              <p className="text-slate-600 mb-6">
                Je Premium lidmaatschap is nu actief. Geniet van alle voordelen!
              </p>
              <div className="bg-slate-50 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-medium text-slate-900 mb-2">Je voordelen:</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-500" />
                    10% korting op alle klussen
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-500" />
                    Voorrang bij spoed
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-500" />
                    12 maanden garantie
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-500" />
                    Gratis jaarlijkse check-up
                  </li>
                </ul>
              </div>
              <Link to="/">
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
                  Start met boeken
                </Button>
              </Link>
            </>
          )}

          {(status === 'error' || status === 'timeout') && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="font-heading font-bold text-2xl text-slate-900 mb-2">
                Er is iets misgegaan
              </h1>
              <p className="text-slate-600 mb-6">
                We konden je betaling niet verifiëren. Neem contact met ons op.
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/premium">
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600">Opnieuw proberen</Button>
                </Link>
                <a href="tel:085 333 2847">
                  <Button variant="outline" className="w-full">Bel 085 333 2847</Button>
                </a>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
