import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Target, MapPin, DollarSign, Tag, Lightbulb, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DUTCH_CITIES = [
  "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Tilburg", "Groningen",
  "Almere", "Breda", "Nijmegen", "Enschede", "Arnhem", "Haarlem", "Amersfoort",
  "Zaanstad", "Apeldoorn", "'s-Hertogenbosch", "Maastricht", "Leiden", "Dordrecht",
  "Zwolle", "Ede", "Zoetermeer", "Leeuwarden", "Alkmaar", "Delft", "Venlo",
  "Deventer", "Helmond", "Hengelo", "Gouda", "Hilversum", "Purmerend", "Vlaardingen",
  "Roosendaal", "Hoorn", "Assen", "Middelburg", "Emmen"
];

export default function CampaignPlanner({ token }) {
  const [campaigns, setCampaigns] = useState([]);
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [selectedServiceType, setSelectedServiceType] = useState("loodgieter");
  
  const [formData, setFormData] = useState({
    name: "",
    service_type: "loodgieter",
    cities: [],
    keywords: [],
    daily_budget: 50,
    status: "draft",
    notes: ""
  });

  const [newKeyword, setNewKeyword] = useState("");
  const [selectedCities, setSelectedCities] = useState([]);

  useEffect(() => {
    fetchCampaigns();
    fetchSuggestions();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API}/admin/campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${API}/admin/campaigns/suggestions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const campaignData = {
        ...formData,
        cities: selectedCities,
      };
      
      await axios.post(`${API}/admin/campaigns`, campaignData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Campagne aangemaakt!");
      setShowCreateDialog(false);
      resetForm();
      fetchCampaigns();
    } catch (error) {
      toast.error("Fout bij aanmaken campagne");
      console.error(error);
    }
  };

  const handleUpdateCampaign = async () => {
    try {
      await axios.put(`${API}/admin/campaigns/${editingCampaign.id}`, {
        ...formData,
        cities: selectedCities,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Campagne bijgewerkt!");
      setEditingCampaign(null);
      resetForm();
      fetchCampaigns();
    } catch (error) {
      toast.error("Fout bij bijwerken campagne");
      console.error(error);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm("Weet je zeker dat je deze campagne wilt verwijderen?")) return;
    
    try {
      await axios.delete(`${API}/admin/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Campagne verwijderd!");
      fetchCampaigns();
    } catch (error) {
      toast.error("Fout bij verwijderen campagne");
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      service_type: "loodgieter",
      cities: [],
      keywords: [],
      daily_budget: 50,
      status: "draft",
      notes: ""
    });
    setSelectedCities([]);
    setNewKeyword("");
  };

  const startEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      service_type: campaign.service_type,
      cities: campaign.cities,
      keywords: campaign.keywords,
      daily_budget: campaign.daily_budget,
      status: campaign.status,
      notes: campaign.notes || ""
    });
    setSelectedCities(campaign.cities);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData({ ...formData, keywords: [...formData.keywords, newKeyword.trim()] });
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword) => {
    setFormData({ ...formData, keywords: formData.keywords.filter(k => k !== keyword) });
  };

  const addSuggestedKeywords = () => {
    const serviceKeywords = suggestions[formData.service_type]?.keywords || [];
    const newKeywords = [...new Set([...formData.keywords, ...serviceKeywords])];
    setFormData({ ...formData, keywords: newKeywords });
    toast.success("Keywords toegevoegd!");
  };

  const toggleCity = (city) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter(c => c !== city));
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const selectAllCities = () => {
    setSelectedCities(DUTCH_CITIES);
  };

  const clearCities = () => {
    setSelectedCities([]);
  };

  const copyKeywordsToClipboard = () => {
    navigator.clipboard.writeText(formData.keywords.join(", "));
    toast.success("Keywords gekopieerd!");
  };

  const statusColors = {
    draft: "bg-slate-100 text-slate-700",
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    ended: "bg-red-100 text-red-700"
  };

  const serviceNames = {
    loodgieter: "Loodgieter",
    slotenmaker: "Slotenmaker",
    elektricien: "Elektricien"
  };

  const CampaignForm = () => (
    <div className="space-y-6">
      {/* Campaign Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Campagne naam</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="bijv. Spoed Loodgieter Amsterdam"
        />
      </div>

      {/* Service Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Service type</label>
        <Select value={formData.service_type} onValueChange={(v) => setFormData({ ...formData, service_type: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="loodgieter">Loodgieter</SelectItem>
            <SelectItem value="slotenmaker">Slotenmaker</SelectItem>
            <SelectItem value="elektricien">Elektricien</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cities */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700">Steden ({selectedCities.length} geselecteerd)</label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={selectAllCities}>Alles</Button>
            <Button type="button" variant="outline" size="sm" onClick={clearCities}>Wissen</Button>
          </div>
        </div>
        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
          <div className="flex flex-wrap gap-2">
            {DUTCH_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => toggleCity(city)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedCities.includes(city)
                    ? "bg-[#FF4500] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700">Keywords ({formData.keywords.length})</label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addSuggestedKeywords}>
              <Lightbulb className="w-4 h-4 mr-1" />
              Suggesties
            </Button>
            {formData.keywords.length > 0 && (
              <Button type="button" variant="outline" size="sm" onClick={copyKeywordsToClipboard}>
                <Copy className="w-4 h-4 mr-1" />
                Kopieer
              </Button>
            )}
          </div>
        </div>
        <div className="flex gap-2 mb-2">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Voeg keyword toe"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
          />
          <Button type="button" onClick={addKeyword} variant="outline">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {formData.keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-sm"
            >
              {keyword}
              <button type="button" onClick={() => removeKeyword(keyword)} className="text-slate-400 hover:text-red-500">
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Dagbudget (€)</label>
        <Input
          type="number"
          value={formData.daily_budget}
          onChange={(e) => setFormData({ ...formData, daily_budget: parseFloat(e.target.value) || 0 })}
          min="0"
          step="10"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
        <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Concept</SelectItem>
            <SelectItem value="active">Actief</SelectItem>
            <SelectItem value="paused">Gepauzeerd</SelectItem>
            <SelectItem value="ended">Beëindigd</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Notities</label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Extra notities over deze campagne..."
          rows={3}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-[#FF4500] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Google Ads Campagne Planner</h2>
          <p className="text-slate-500">Plan en beheer je Google Ads campagnes per stad en dienst</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF4500] hover:bg-[#CC3700]">
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Campagne
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nieuwe Campagne Aanmaken</DialogTitle>
            </DialogHeader>
            <CampaignForm />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm(); }}>
                Annuleren
              </Button>
              <Button onClick={handleCreateCampaign} className="bg-[#FF4500] hover:bg-[#CC3700]">
                Aanmaken
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Totaal campagnes</p>
                <p className="text-2xl font-bold">{campaigns.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Actieve campagnes</p>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.status === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Steden gedekt</p>
                <p className="text-2xl font-bold">
                  {[...new Set(campaigns.flatMap(c => c.cities))].length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Totaal dagbudget</p>
                <p className="text-2xl font-bold">
                  €{campaigns.filter(c => c.status === "active").reduce((sum, c) => sum + c.daily_budget, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Geen campagnes</h3>
            <p className="text-slate-500 mb-4">Maak je eerste Google Ads campagne aan</p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-[#FF4500] hover:bg-[#CC3700]">
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Campagne
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-slate-900">{campaign.name}</h3>
                      <Badge className={statusColors[campaign.status]}>
                        {campaign.status === "draft" && "Concept"}
                        {campaign.status === "active" && "Actief"}
                        {campaign.status === "paused" && "Gepauzeerd"}
                        {campaign.status === "ended" && "Beëindigd"}
                      </Badge>
                      <Badge variant="outline">{serviceNames[campaign.service_type]}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> Steden ({campaign.cities.length})
                        </p>
                        <p className="text-sm text-slate-700">
                          {campaign.cities.slice(0, 5).join(", ")}
                          {campaign.cities.length > 5 && ` +${campaign.cities.length - 5} meer`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                          <Tag className="w-4 h-4" /> Keywords ({campaign.keywords.length})
                        </p>
                        <p className="text-sm text-slate-700">
                          {campaign.keywords.slice(0, 3).join(", ")}
                          {campaign.keywords.length > 3 && ` +${campaign.keywords.length - 3} meer`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" /> Dagbudget
                        </p>
                        <p className="text-lg font-bold text-[#FF4500]">€{campaign.daily_budget}</p>
                      </div>
                    </div>

                    {campaign.notes && (
                      <p className="text-sm text-slate-500 mt-3 italic">"{campaign.notes}"</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(campaign)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingCampaign} onOpenChange={(open) => !open && (setEditingCampaign(null), resetForm())}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campagne Bewerken</DialogTitle>
          </DialogHeader>
          <CampaignForm />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setEditingCampaign(null); resetForm(); }}>
              Annuleren
            </Button>
            <Button onClick={handleUpdateCampaign} className="bg-[#FF4500] hover:bg-[#CC3700]">
              Opslaan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
