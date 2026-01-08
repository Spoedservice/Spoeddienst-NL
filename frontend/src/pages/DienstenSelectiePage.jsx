import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Droplets, Key, ArrowLeft, ArrowRight, Phone } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = {
  Zap: Zap,
  Droplets: Droplets,
  Key: Key
};

export default function DienstenSelectiePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const isEmergency = searchParams.get('emergency') === 'true';

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const ServiceIcon = ({ name }) => {
    const Icon = iconMap[name] || Zap;
    return <Icon className="w-8 h-8" />;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Terug</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">SpoedDienst24</span>
          </div>
          <a href="tel:085 333 2847" className="flex items-center gap-1 text-[#FF4500] font-medium text-sm">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">085 333 2847</span>
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 mb-2">
            Welke vakman zoekt u?
          </h1>
          <p className="text-slate-600">
            Kies een dienst om direct te boeken
          </p>
          {isEmergency && (
            <Badge className="bg-[#FF4500] text-white mt-3">
              🚨 Spoed aanvraag - Wij zijn 24/7 bereikbaar
            </Badge>
          )}
        </div>

        {/* Services Grid */}
        <div className="grid gap-4 sm:gap-6">
          {services.map((service) => (
            <Card 
              key={service.id}
              className="border border-slate-200 hover:border-[#FF4500] hover:shadow-lg cursor-pointer transition-all"
              onClick={() => navigate(`/boek/${service.slug}?emergency=${isEmergency}`)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FF4500]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ServiceIcon name={service.icon} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 mb-1">
                      {service.name}
                    </h2>
                    <p className="text-slate-600 text-sm mb-2 line-clamp-2">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500">Vanaf <strong className="text-slate-900">€{service.base_price},-</strong></span>
                      {isEmergency && (
                        <span className="text-[#FF4500] font-medium">Spoed €{service.emergency_price},-</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <ArrowRight className="w-6 h-6 text-[#FF4500]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-8 bg-slate-900 rounded-xl p-6 text-center">
          <p className="text-white font-medium mb-2">Weet u niet zeker welke vakman u nodig heeft?</p>
          <p className="text-slate-400 text-sm mb-4">Bel ons en wij helpen u verder</p>
          <a 
            href="tel:085 333 2847" 
            className="inline-flex items-center gap-2 bg-[#FF4500] text-white px-6 py-3 rounded-md font-medium hover:bg-[#CC3700] transition-colors"
          >
            <Phone className="w-5 h-5" />
            085 333 2847
          </a>
        </div>
      </div>
    </div>
  );
}
