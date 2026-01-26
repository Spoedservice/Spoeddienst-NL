import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Phone, Mail, MapPin, Search, CheckCircle, XCircle, 
  RefreshCw, Star, Clock, Briefcase, Shield
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SERVICE_NAMES = {
  loodgieter: "Loodgieter",
  slotenmaker: "Slotenmaker",
  elektricien: "Elektricien"
};

export default function VakmannenManagement({ 
  vakmannen, 
  onRefresh, 
  token 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterApproved, setFilterApproved] = useState("all");
  const [filterService, setFilterService] = useState("all");

  const headers = { Authorization: `Bearer ${token}` };

  const filteredVakmannen = vakmannen.filter(vakman => {
    const matchesSearch = 
      vakman.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vakman.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vakman.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesApproved = 
      filterApproved === "all" || 
      (filterApproved === "approved" && vakman.is_approved) ||
      (filterApproved === "pending" && !vakman.is_approved);
    
    const matchesService = 
      filterService === "all" || 
      vakman.service_type === filterService;
    
    return matchesSearch && matchesApproved && matchesService;
  });

  const approveVakman = async (vakmanId) => {
    try {
      await axios.post(
        `${API}/admin/vakman/${vakmanId}/approve`,
        {},
        { headers }
      );
      toast.success("Vakman goedgekeurd");
      onRefresh();
    } catch (error) {
      toast.error("Fout bij goedkeuren vakman");
    }
  };

  const rejectVakman = async (vakmanId) => {
    if (!confirm("Weet je zeker dat je deze vakman wilt afwijzen?")) return;
    try {
      await axios.post(
        `${API}/admin/vakman/${vakmanId}/reject`,
        {},
        { headers }
      );
      toast.success("Vakman afgewezen");
      onRefresh();
    } catch (error) {
      toast.error("Fout bij afwijzen vakman");
    }
  };

  const pendingCount = vakmannen.filter(v => !v.is_approved).length;
  const approvedCount = vakmannen.filter(v => v.is_approved).length;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <CardTitle className="text-lg">Vakmannen Beheer</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              {approvedCount} goedgekeurd • {pendingCount} in afwachting
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Zoeken..." 
                className="pl-9 w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="border rounded-md px-3 py-2 text-sm bg-white"
              value={filterApproved}
              onChange={(e) => setFilterApproved(e.target.value)}
            >
              <option value="all">Alle</option>
              <option value="pending">In afwachting</option>
              <option value="approved">Goedgekeurd</option>
            </select>
            <select 
              className="border rounded-md px-3 py-2 text-sm bg-white"
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
            >
              <option value="all">Alle diensten</option>
              <option value="loodgieter">Loodgieter</option>
              <option value="slotenmaker">Slotenmaker</option>
              <option value="elektricien">Elektricien</option>
            </select>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {filteredVakmannen.map((vakman) => (
            <div 
              key={vakman.id} 
              className={`p-4 border rounded-lg ${vakman.is_approved ? 'bg-white' : 'bg-yellow-50 border-yellow-200'}`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-xl">
                        {vakman.service_type === 'loodgieter' ? '🔧' : 
                         vakman.service_type === 'slotenmaker' ? '🔑' : '⚡'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{vakman.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge className={vakman.is_approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                          {vakman.is_approved ? "Goedgekeurd" : "In afwachting"}
                        </Badge>
                        <Badge variant="outline">{SERVICE_NAMES[vakman.service_type]}</Badge>
                        {vakman.is_premium && (
                          <Badge className="bg-purple-100 text-purple-700">
                            <Star className="w-3 h-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span>{vakman.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span>{vakman.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{vakman.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Briefcase className="w-4 h-4" />
                      <span>€{vakman.hourly_rate}/uur</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="font-medium">KVK:</span>
                      <span>{vakman.kvk_nummer}</span>
                    </div>
                    {vakman.btw_nummer && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="font-medium">BTW:</span>
                        <span>{vakman.btw_nummer}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <Shield className="w-4 h-4" />
                      <span>{vakman.verzekering ? "Verzekerd" : "Niet verzekerd"}</span>
                    </div>
                  </div>

                  {vakman.description && (
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                      {vakman.description}
                    </p>
                  )}
                </div>

                <div className="flex md:flex-col gap-2 justify-end">
                  {!vakman.is_approved ? (
                    <>
                      <Button 
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => approveVakman(vakman.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Goedkeuren
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => rejectVakman(vakman.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Afwijzen
                      </Button>
                    </>
                  ) : (
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Lid sinds {new Date(vakman.created_at).toLocaleDateString('nl-NL')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredVakmannen.length === 0 && (
            <p className="text-center text-slate-500 py-8">Geen vakmannen gevonden</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
