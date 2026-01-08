import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Zap, Star, CheckCircle } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const services = [
  "Afvoer laten ontstoppen",
  "Kraan laten plaatsen of vervangen",
  "Lekkage verholpen",
  "Toilet reparatie",
  "Vlotter laten vervangen",
  "Quooker laten installeren",
  "Doucheset laten plaatsen",
  "Stroomstoring opgelost",
  "Stopcontact geplaatst",
  "Lamp opgehangen",
  "Meterkast vervangen",
  "Slot vervangen",
  "Deur geopend (buitengesloten)",
  "Inbraakschade hersteld",
  "Cilinderslot geplaatst",
  "Anders"
];

export default function ReviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    service: "",
    comment: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.service || !formData.comment) {
      toast.error("Vul alle verplichte velden in");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/reviews/public`, {
        customer_name: formData.name,
        city: formData.city,
        service: formData.service,
        rating: rating,
        comment: formData.comment
      });
      
      setSubmitted(true);
      toast.success("Bedankt voor je review!");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Er is iets misgegaan. Probeer het later opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-slate-200">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-slate-900 mb-2">
              Bedankt voor je review!
            </h1>
            <p className="text-slate-600 mb-6">
              Je review wordt na controle gepubliceerd op onze website.
            </p>
            <Link to="/">
              <Button className="bg-[#FF4500] hover:bg-[#CC3700]">
                Terug naar home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF4500] rounded-md flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg">SpoedDienst24</span>
          </Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="font-heading font-bold text-3xl text-slate-900 mb-2">
            Schrijf een review
          </h1>
          <p className="text-slate-600">
            Deel je ervaring met SpoedDienst24
          </p>
        </div>

        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <Label className="text-base font-medium mb-3 block">Hoe tevreden ben je? *</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-10 h-10 ${
                          star <= (hoverRating || rating) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-slate-200'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-slate-500">
                    {rating === 5 && "Uitstekend!"}
                    {rating === 4 && "Goed"}
                    {rating === 3 && "Redelijk"}
                    {rating === 2 && "Matig"}
                    {rating === 1 && "Slecht"}
                  </span>
                </div>
              </div>

              {/* Service */}
              <div>
                <Label htmlFor="service">Welke klus is uitgevoerd? *</Label>
                <select
                  id="service"
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  className="mt-1 w-full h-10 px-3 py-2 border border-slate-200 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent"
                  required
                >
                  <option value="">Selecteer een dienst</option>
                  {services.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              {/* Comment */}
              <div>
                <Label htmlFor="comment">Je ervaring *</Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  placeholder="Vertel over je ervaring met onze vakman..."
                  className="mt-1 h-32"
                  required
                />
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Je naam *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Je voornaam"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">Plaats (optioneel)</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="Amsterdam"
                    className="mt-1"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#FF4500] hover:bg-[#CC3700] h-12"
                disabled={loading}
              >
                {loading ? "Verzenden..." : "Review plaatsen"}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Door een review te plaatsen ga je akkoord met publicatie op onze website.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
