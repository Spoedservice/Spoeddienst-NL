import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, DollarSign, MousePointer, Eye, 
  Target, MapPin, RefreshCw, AlertCircle, ArrowUpRight,
  BarChart3, PieChart, Lightbulb
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function GoogleAdsPerformance({ token }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState("LAST_30_DAYS");
  const [campaignData, setCampaignData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [keywordData, setKeywordData] = useState(null);
  const [accountSummary, setAccountSummary] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState(null);

  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const fetchData = async () => {
    try {
      setError(null);
      const [campaigns, geo, keywords, summary] = await Promise.all([
        fetch(`${API}/admin/google-ads/campaigns?date_range=${dateRange}`, { headers }).then(r => r.json()),
        fetch(`${API}/admin/google-ads/geographic?date_range=${dateRange}`, { headers }).then(r => r.json()),
        fetch(`${API}/admin/google-ads/keywords?date_range=${dateRange}`, { headers }).then(r => r.json()),
        fetch(`${API}/admin/google-ads/summary`, { headers }).then(r => r.json())
      ]);
      
      setCampaignData(campaigns);
      setGeoData(geo);
      setKeywordData(keywords);
      setAccountSummary(summary);
    } catch (err) {
      setError("Kon data niet laden. Probeer opnieuw.");
      console.error("Error fetching Google Ads data:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetch(`${API}/admin/google-ads/refresh`, { method: "POST", headers });
      await fetchData();
    } catch (err) {
      setError("Kon data niet vernieuwen.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const formatCurrency = (amount) => `€${amount.toLocaleString('nl-BE', { minimumFractionDigits: 2 })}`;
  const formatNumber = (num) => num.toLocaleString('nl-BE');
  const formatPercent = (num) => `${num.toFixed(2)}%`;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchData} className="mt-4">Opnieuw proberen</Button>
      </div>
    );
  }

  const summary = campaignData?.summary || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Google Ads Performance</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              MOCK DATA
            </Badge>
            <span className="text-sm text-slate-500">
              Wacht op Developer Token goedkeuring
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="LAST_7_DAYS">Afgelopen 7 dagen</option>
            <option value="LAST_30_DAYS">Afgelopen 30 dagen</option>
            <option value="LAST_90_DAYS">Afgelopen 90 dagen</option>
            <option value="THIS_MONTH">Deze maand</option>
            <option value="LAST_MONTH">Vorige maand</option>
          </select>
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Vernieuwen
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: "overview", label: "Overzicht", icon: BarChart3 },
          { id: "campaigns", label: "Campagnes", icon: Target },
          { id: "keywords", label: "Keywords", icon: MousePointer },
          { id: "geographic", label: "Locaties", icon: MapPin },
          { id: "recommendations", label: "Aanbevelingen", icon: Lightbulb }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 -mb-px transition-colors ${
              activeTab === tab.id 
                ? 'border-[#FF4500] text-[#FF4500]' 
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <Eye className="w-8 h-8 text-blue-500" />
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold mt-4">{formatNumber(summary.total_impressions || 0)}</p>
                <p className="text-sm text-slate-500">Impressies</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <MousePointer className="w-8 h-8 text-green-500" />
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold mt-4">{formatNumber(summary.total_clicks || 0)}</p>
                <p className="text-sm text-slate-500">Clicks ({formatPercent(summary.total_ctr || 0)} CTR)</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <Target className="w-8 h-8 text-orange-500" />
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold mt-4">{formatNumber(summary.total_conversions || 0)}</p>
                <p className="text-sm text-slate-500">Conversies ({formatPercent(summary.total_conversion_rate || 0)})</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <DollarSign className="w-8 h-8 text-purple-500" />
                  <span className="text-xs text-slate-500">Gem. CPC: {formatCurrency(summary.average_cpc || 0)}</span>
                </div>
                <p className="text-2xl font-bold mt-4">{formatCurrency(summary.total_cost || 0)}</p>
                <p className="text-sm text-slate-500">Totale kosten</p>
              </CardContent>
            </Card>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Campagne Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      Actieve campagnes
                    </span>
                    <span className="font-bold">{summary.active_campaigns || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      Gepauzeerde campagnes
                    </span>
                    <span className="font-bold">{summary.paused_campaigns || 0}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="font-medium">Totaal</span>
                    <span className="font-bold">{summary.total_campaigns || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Kosten per Conversie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-[#FF4500]">
                    {formatCurrency(summary.cost_per_conversion || 0)}
                  </p>
                  <p className="text-slate-500 mt-2">per boeking</p>
                  <div className="flex justify-center gap-4 mt-4 text-sm">
                    <span className="text-green-600">
                      {summary.total_conversions || 0} boekingen
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-blue-600">
                      {formatCurrency(summary.total_cost || 0)} uitgegeven
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === "campaigns" && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 font-semibold">Campagne</th>
                  <th className="text-right p-4 font-semibold">Status</th>
                  <th className="text-right p-4 font-semibold">Impressies</th>
                  <th className="text-right p-4 font-semibold">Clicks</th>
                  <th className="text-right p-4 font-semibold">CTR</th>
                  <th className="text-right p-4 font-semibold">Conversies</th>
                  <th className="text-right p-4 font-semibold">Kosten</th>
                </tr>
              </thead>
              <tbody>
                {campaignData?.results?.map((campaign, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-xs text-slate-500">{campaign.campaign_type}</p>
                    </td>
                    <td className="p-4 text-right">
                      <Badge className={campaign.status === "ENABLED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                        {campaign.status === "ENABLED" ? "Actief" : "Gepauzeerd"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">{formatNumber(campaign.metrics.impressions)}</td>
                    <td className="p-4 text-right">{formatNumber(campaign.metrics.clicks)}</td>
                    <td className="p-4 text-right">{formatPercent(campaign.metrics.ctr)}</td>
                    <td className="p-4 text-right font-medium text-green-600">{campaign.metrics.conversions}</td>
                    <td className="p-4 text-right">{formatCurrency(campaign.metrics.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Keywords Tab */}
      {activeTab === "keywords" && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 font-semibold">Keyword</th>
                  <th className="text-left p-4 font-semibold">Match Type</th>
                  <th className="text-right p-4 font-semibold">QS</th>
                  <th className="text-right p-4 font-semibold">Clicks</th>
                  <th className="text-right p-4 font-semibold">CTR</th>
                  <th className="text-right p-4 font-semibold">Conv.</th>
                  <th className="text-right p-4 font-semibold">CPC</th>
                </tr>
              </thead>
              <tbody>
                {keywordData?.results?.slice(0, 15).map((kw, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-medium">{kw.keyword}</td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs">{kw.match_type}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-medium ${kw.quality_score >= 8 ? 'text-green-600' : kw.quality_score >= 6 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {kw.quality_score}/10
                      </span>
                    </td>
                    <td className="p-4 text-right">{formatNumber(kw.metrics.clicks)}</td>
                    <td className="p-4 text-right">{formatPercent(kw.metrics.ctr)}</td>
                    <td className="p-4 text-right font-medium text-green-600">{kw.metrics.conversions}</td>
                    <td className="p-4 text-right">{formatCurrency(kw.metrics.average_cpc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Geographic Tab */}
      {activeTab === "geographic" && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 font-semibold">Locatie</th>
                  <th className="text-left p-4 font-semibold">Provincie</th>
                  <th className="text-right p-4 font-semibold">Impressies</th>
                  <th className="text-right p-4 font-semibold">Clicks</th>
                  <th className="text-right p-4 font-semibold">Conv.</th>
                  <th className="text-right p-4 font-semibold">Conv. Rate</th>
                  <th className="text-right p-4 font-semibold">Kosten</th>
                </tr>
              </thead>
              <tbody>
                {geoData?.results?.map((loc, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="p-4">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{loc.location.city}</span>
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{loc.location.province}</td>
                    <td className="p-4 text-right">{formatNumber(loc.metrics.impressions)}</td>
                    <td className="p-4 text-right">{formatNumber(loc.metrics.clicks)}</td>
                    <td className="p-4 text-right font-medium text-green-600">{loc.metrics.conversions}</td>
                    <td className="p-4 text-right">{formatPercent(loc.metrics.conversion_rate)}</td>
                    <td className="p-4 text-right">{formatCurrency(loc.metrics.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && accountSummary?.recommendations && (
        <div className="space-y-4">
          {accountSummary.recommendations.map((rec, idx) => (
            <Card key={idx} className="border-l-4 border-l-[#FF4500]">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    rec.type === "BUDGET" ? "bg-green-100" :
                    rec.type === "KEYWORD" ? "bg-blue-100" :
                    "bg-purple-100"
                  }`}>
                    <Lightbulb className={`w-5 h-5 ${
                      rec.type === "BUDGET" ? "text-green-600" :
                      rec.type === "KEYWORD" ? "text-blue-600" :
                      "text-purple-600"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{rec.type}</Badge>
                    </div>
                    <p className="text-slate-900 font-medium">{rec.message}</p>
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <ArrowUpRight className="w-4 h-4" />
                      Potentiële impact: {rec.potential_impact}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              <strong>Let op:</strong> Dit zijn mock aanbevelingen. Zodra de Developer Token is goedgekeurd, 
              worden hier echte aanbevelingen van Google Ads weergegeven.
            </p>
          </div>
        </div>
      )}

      {/* Footer Note */}
      <div className="text-center text-sm text-slate-500 py-4 border-t">
        <p>
          Data laatst bijgewerkt: {campaignData?.generated_at ? new Date(campaignData.generated_at).toLocaleString('nl-BE') : 'N/A'}
        </p>
        <p className="text-amber-600 mt-1">
          Dit is mock data ter voorbereiding op de echte Google Ads API integratie
        </p>
      </div>
    </div>
  );
}
