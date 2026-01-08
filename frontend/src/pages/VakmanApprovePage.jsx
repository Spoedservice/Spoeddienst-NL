import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { Zap, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function VakmanApprovePage() {
  const { vakmanId } = useParams();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');
  
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [resultAction, setResultAction] = useState('');

  useEffect(() => {
    processApproval();
  }, [vakmanId, action]);

  const processApproval = async () => {
    try {
      const response = await axios.get(`${API}/vakman/${vakmanId}/approve?action=${action}`);
      if (response.data.status === 'success') {
        setStatus('success');
        setMessage(response.data.message);
        setResultAction(response.data.action);
      } else {
        setStatus('error');
        setMessage(response.data.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Er is een fout opgetreden bij het verwerken van de aanvraag.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#FF4500] rounded-xl flex items-center justify-center">
            <Zap className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="font-heading font-bold text-xl text-slate-900 mb-2">SpoedDienst24</h1>
        <p className="text-slate-500 text-sm mb-8">Vakman Goedkeuring</p>

        {status === 'loading' && (
          <div className="py-8">
            <Loader2 className="w-12 h-12 text-[#FF4500] animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Bezig met verwerken...</p>
          </div>
        )}

        {status === 'success' && resultAction === 'approved' && (
          <div className="py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="font-heading font-bold text-xl text-green-600 mb-2">Goedgekeurd!</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <p className="text-slate-500 text-sm">De vakman kan nu inloggen en klussen ontvangen.</p>
          </div>
        )}

        {status === 'success' && resultAction === 'rejected' && (
          <div className="py-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="font-heading font-bold text-xl text-red-600 mb-2">Afgewezen</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <p className="text-slate-500 text-sm">De aanmelding is verwijderd uit het systeem.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="font-heading font-bold text-xl text-yellow-600 mb-2">Fout</h2>
            <p className="text-slate-600 mb-6">{message}</p>
          </div>
        )}

        <Link to="/">
          <Button className="bg-[#FF4500] hover:bg-[#CC3700]">
            Terug naar home
          </Button>
        </Link>
      </div>
    </div>
  );
}
