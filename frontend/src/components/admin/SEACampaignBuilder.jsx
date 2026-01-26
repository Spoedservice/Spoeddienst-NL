import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  Download, Zap, MapPin, Search, Target, FileText, 
  CheckCircle, AlertTriangle, Sparkles
} from "lucide-react";
import { 
  generateElektricienSEACSV, 
  downloadSEACSV, 
  getNegativeKeywords,
  ELEKTRICIEN_AD_GROUPS,
  CITIES 
} from "@/utils/seaCampaignGenerator";

export default function SEACampaignBuilder() {
  const [options, setOptions] = useState({
    campaignName: "Elektricien",
    dailyBudget: 50,
    maxCpc: 2.00,
    includeLocations: true,
    includeTypos: true,
    includeVoiceSearch: true
  });
  
  const [preview, setPreview] = useState(null);

  const handlePreview = () => {
    const result = generateElektricienSEACSV(options);
    setPreview(result);
    toast.success(`${result.keywordCount} zoekwoorden gegenereerd!`);
  };

  const handleDownload = () => {
    const result = downloadSEACSV(`${options.campaignName.toLowerCase()}_sea_campaign.csv`);
    toast.success(`CSV gedownload met ${result.keywordCount} zoekwoorden`);
  };

  const negativeKeywords = getNegativeKeywords();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Professionele SEA Campagne Builder</h2>
              <p className="text-sm text-slate-600">Genereer 1000+ zoekwoorden met thematische advertentiegroepen</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-2xl font-bold text-orange-600">{Object.keys(ELEKTRICIEN_AD_GROUPS).length}</p>
              <p className="text-xs text-slate-500">Thema Ad Groups</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-2xl font-bold text-blue-600">{CITIES.length}</p>
              <p className="text-xs text-slate-500">Steden</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-2xl font-bold text-green-600">3</p>
              <p className="text-xs text-slate-500">Match Types</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-2xl font-bold text-purple-600">{negativeKeywords.length}</p>
              <p className="text-xs text-slate-500">Negatieve Keywords</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ad Groups Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Thematische Advertentiegroepen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(ELEKTRICIEN_AD_GROUPS).map(([key, adGroup]) => (
              <div key={key} className="p-3 bg-slate-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium text-sm">{adGroup.name}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Badge variant="outline" className="text-xs px-1">Exact</Badge>
                    <span>{adGroup.keywords.exact?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Badge variant="outline" className="text-xs px-1">Phrase</Badge>
                    <span>{adGroup.keywords.phrase?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Badge variant="outline" className="text-xs px-1">Broad+</Badge>
                    <span>{adGroup.keywords.broad_modifier?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Campagne Configuratie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Campagne Naam</Label>
              <Input 
                value={options.campaignName}
                onChange={(e) => setOptions({...options, campaignName: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Dagbudget (€)</Label>
              <Input 
                type="number"
                value={options.dailyBudget}
                onChange={(e) => setOptions({...options, dailyBudget: parseFloat(e.target.value)})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Max CPC (€)</Label>
              <Input 
                type="number"
                step="0.10"
                value={options.maxCpc}
                onChange={(e) => setOptions({...options, maxCpc: parseFloat(e.target.value)})}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Switch 
                checked={options.includeLocations}
                onCheckedChange={(v) => setOptions({...options, includeLocations: v})}
              />
              <Label className="text-sm">
                <MapPin className="w-4 h-4 inline mr-1" />
                Inclusief {CITIES.length} steden
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={options.includeTypos}
                onCheckedChange={(v) => setOptions({...options, includeTypos: v})}
              />
              <Label className="text-sm">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Inclusief typos
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={options.includeVoiceSearch}
                onCheckedChange={(v) => setOptions({...options, includeVoiceSearch: v})}
              />
              <Label className="text-sm">
                <Search className="w-4 h-4 inline mr-1" />
                Inclusief voice search
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Negative Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Negatieve Zoekwoorden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-3">
            Deze worden uitgesloten om alleen koopgerichte zoekers te bereiken:
          </p>
          <div className="flex flex-wrap gap-2">
            {negativeKeywords.map((keyword, idx) => (
              <Badge key={idx} variant="destructive" className="bg-red-100 text-red-700">
                -{keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview & Download */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Genereer CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePreview}>
              <FileText className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleDownload} className="bg-orange-500 hover:bg-orange-600">
              <Download className="w-4 h-4 mr-2" />
              Download SEA Campagne CSV
            </Button>
          </div>

          {preview && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">CSV Gegenereerd!</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Zoekwoorden:</span>
                  <span className="ml-2 font-bold text-green-700">{preview.keywordCount}</span>
                </div>
                <div>
                  <span className="text-slate-500">Advertentiegroepen:</span>
                  <span className="ml-2 font-bold text-green-700">{preview.adGroupCount}</span>
                </div>
              </div>
              
              {/* Sample rows */}
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Voorbeeld regels:</p>
                <pre className="text-xs bg-white p-2 rounded border overflow-x-auto max-h-40">
                  {preview.csv.split('\n').slice(0, 6).join('\n')}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSV Structure Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-800 mb-2">📋 CSV Structuur</h4>
          <p className="text-sm text-blue-700">
            De CSV bevat de volgende kolommen conform uw specificatie:
          </p>
          <code className="text-xs bg-white p-2 rounded block mt-2 text-blue-800">
            Zoekwoord, Matchtype, Advertentiegroep, Campagne, Locatie, Headline1, Headline2, Headline3, Description1, Description2, ZichtbareURL
          </code>
          <ul className="text-xs text-blue-600 mt-3 space-y-1">
            <li>• <strong>Exact match:</strong> [zoekwoord] - meeste controle</li>
            <li>• <strong>Phrase match:</strong> "zoekwoord" - gerelateerde variaties</li>
            <li>• <strong>Broad modifier:</strong> +zoekwoord - alle relevante variaties</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
