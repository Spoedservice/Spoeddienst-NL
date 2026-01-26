import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Mail, Send, Clock, Users, CheckCircle, XCircle, Settings, 
  RefreshCw, Play, Snowflake, Sun, Leaf, Flower2, Edit, Save,
  TrendingUp, AlertCircle, Eye, MailOpen, UserX
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const EMAIL_TYPE_ICONS = {
  welcome_customer: Users,
  welcome_vakman: Users,
  review_reminder: Mail,
  seasonal_winter: Snowflake,
  seasonal_spring: Flower2,
  seasonal_summer: Sun,
  seasonal_autumn: Leaf,
  reactivation: RefreshCw,
  manual: Send
};

const EMAIL_TYPE_COLORS = {
  welcome_customer: "bg-green-100 text-green-700",
  welcome_vakman: "bg-blue-100 text-blue-700",
  review_reminder: "bg-purple-100 text-purple-700",
  seasonal_winter: "bg-cyan-100 text-cyan-700",
  seasonal_spring: "bg-pink-100 text-pink-700",
  seasonal_summer: "bg-yellow-100 text-yellow-700",
  seasonal_autumn: "bg-orange-100 text-orange-700",
  reactivation: "bg-red-100 text-red-700",
  manual: "bg-slate-100 text-slate-700"
};

export default function EmailMarketing({ token }) {
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [statistics, setStatistics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [recentEmails, setRecentEmails] = useState([]);
  const [emailQueue, setEmailQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ subject: "", html_template: "" });
  const [manualEmail, setManualEmail] = useState({
    recipients: "",
    subject: "",
    content: ""
  });
  const [sendingManual, setSendingManual] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, campaignsRes, templatesRes, recentRes, queueRes] = await Promise.all([
        axios.get(`${API}/admin/email-marketing/statistics`, { headers }),
        axios.get(`${API}/admin/email-marketing/campaigns`, { headers }),
        axios.get(`${API}/admin/email-marketing/templates`, { headers }),
        axios.get(`${API}/admin/email-marketing/recent?limit=20`, { headers }),
        axios.get(`${API}/admin/email-marketing/queue`, { headers })
      ]);
      
      setStatistics(statsRes.data);
      setCampaigns(campaignsRes.data.campaigns || []);
      setTemplates(templatesRes.data.templates || []);
      setRecentEmails(recentRes.data.emails || []);
      setEmailQueue(queueRes.data.queue || []);
    } catch (error) {
      console.error("Error fetching email marketing data:", error);
      toast.error("Fout bij laden van email marketing data");
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaign = async (campaignType, currentActive) => {
    try {
      await axios.put(
        `${API}/admin/email-marketing/campaigns/${campaignType}`,
        { is_active: !currentActive },
        { headers }
      );
      toast.success(`Campagne ${!currentActive ? 'geactiveerd' : 'gedeactiveerd'}`);
      fetchData();
    } catch (error) {
      toast.error("Fout bij wijzigen campagne");
    }
  };

  const updateCampaignDelay = async (campaignType, delayDays) => {
    try {
      await axios.put(
        `${API}/admin/email-marketing/campaigns/${campaignType}`,
        { delay_days: parseInt(delayDays) },
        { headers }
      );
      toast.success("Vertraging bijgewerkt");
      fetchData();
    } catch (error) {
      toast.error("Fout bij bijwerken vertraging");
    }
  };

  const startEditTemplate = (template) => {
    setEditingTemplate(template.type);
    setTemplateForm({
      subject: template.subject,
      html_template: template.html_template
    });
  };

  const saveTemplate = async () => {
    try {
      await axios.put(
        `${API}/admin/email-marketing/templates/${editingTemplate}`,
        templateForm,
        { headers }
      );
      toast.success("Template opgeslagen");
      setEditingTemplate(null);
      fetchData();
    } catch (error) {
      toast.error("Fout bij opslaan template");
    }
  };

  const toggleTemplate = async (templateType, currentActive) => {
    try {
      await axios.put(
        `${API}/admin/email-marketing/templates/${templateType}`,
        { is_active: !currentActive },
        { headers }
      );
      toast.success(`Template ${!currentActive ? 'geactiveerd' : 'gedeactiveerd'}`);
      fetchData();
    } catch (error) {
      toast.error("Fout bij wijzigen template");
    }
  };

  const sendSeasonalCampaign = async (season) => {
    if (!confirm(`Weet je zeker dat je de ${season} campagne naar alle klanten wilt sturen?`)) return;
    
    try {
      const response = await axios.post(
        `${API}/admin/email-marketing/send-seasonal`,
        { season },
        { headers }
      );
      toast.success(response.data.message);
      fetchData();
    } catch (error) {
      toast.error("Fout bij versturen seizoenscampagne");
    }
  };

  const processQueue = async () => {
    try {
      await axios.post(`${API}/admin/email-marketing/process-queue`, {}, { headers });
      toast.success("Email wachtrij verwerkt");
      fetchData();
    } catch (error) {
      toast.error("Fout bij verwerken wachtrij");
    }
  };

  const sendManualEmail = async () => {
    if (!manualEmail.recipients || !manualEmail.subject || !manualEmail.content) {
      toast.error("Vul alle velden in");
      return;
    }

    const emails = manualEmail.recipients.split(",").map(e => e.trim()).filter(e => e);
    if (emails.length === 0) {
      toast.error("Voer minimaal één e-mailadres in");
      return;
    }

    setSendingManual(true);
    try {
      const response = await axios.post(
        `${API}/admin/email-marketing/send-manual`,
        {
          to_emails: emails,
          subject: manualEmail.subject,
          html_content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF4500 0%, #CC3700 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">⚡ SpoedDienst24</h1>
            </div>
            <div style="padding: 30px; background-color: #f8f9fa;">
              ${manualEmail.content.replace(/\n/g, '<br>')}
            </div>
          </div>`,
          email_type: "manual"
        },
        { headers }
      );
      toast.success(response.data.message);
      setManualEmail({ recipients: "", subject: "", content: "" });
      fetchData();
    } catch (error) {
      toast.error("Fout bij versturen emails");
    } finally {
      setSendingManual(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-[#FF4500] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: "overview", label: "Overzicht", icon: TrendingUp },
          { id: "campaigns", label: "Automatische Emails", icon: Clock },
          { id: "templates", label: "Templates", icon: Mail },
          { id: "manual", label: "Handmatig Versturen", icon: Send },
          { id: "history", label: "Verzendgeschiedenis", icon: MailOpen }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeSubTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveSubTab(tab.id)}
            className={activeSubTab === tab.id ? "bg-[#FF4500] hover:bg-[#CC3700]" : ""}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeSubTab === "overview" && statistics && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Send className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{statistics.total_sent}</p>
                    <p className="text-sm text-slate-500">Totaal verstuurd</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{statistics.sent_last_7_days}</p>
                    <p className="text-sm text-slate-500">Laatste 7 dagen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{statistics.success_rate}%</p>
                    <p className="text-sm text-slate-500">Succes rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{statistics.pending_in_queue}</p>
                    <p className="text-sm text-slate-500">In wachtrij</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emails per Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(statistics.by_type || {}).map(([type, count]) => {
                  const Icon = EMAIL_TYPE_ICONS[type] || Mail;
                  const colorClass = EMAIL_TYPE_COLORS[type] || "bg-slate-100 text-slate-700";
                  return (
                    <div key={type} className={`p-3 rounded-lg ${colorClass}`}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{count}</span>
                      </div>
                      <p className="text-xs mt-1 opacity-80">{type.replace(/_/g, ' ')}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Unsubscribed */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <UserX className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">{statistics.unsubscribed_count} uitgeschreven</p>
                  <p className="text-sm text-red-600">Deze personen ontvangen geen marketing emails meer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Queue Processing */}
          {statistics.pending_in_queue > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-800">{statistics.pending_in_queue} emails in wachtrij</p>
                      <p className="text-sm text-orange-600">Deze worden automatisch verstuurd op de geplande tijd</p>
                    </div>
                  </div>
                  <Button onClick={processQueue} variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                    <Play className="w-4 h-4 mr-2" />
                    Nu verwerken
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Campaigns Tab */}
      {activeSubTab === "campaigns" && (
        <div className="space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm text-blue-700">
                <strong>Automatische emails</strong> worden verstuurd op basis van triggers zoals registratie, voltooide klus, of inactiviteit.
                Pas hieronder de instellingen per type email aan.
              </p>
            </CardContent>
          </Card>

          {campaigns.map(campaign => (
            <Card key={campaign.type} className={!campaign.is_active ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${EMAIL_TYPE_COLORS[campaign.type] || "bg-slate-100"}`}>
                      {(() => {
                        const Icon = EMAIL_TYPE_ICONS[campaign.type] || Mail;
                        return <Icon className="w-5 h-5" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{campaign.name}</h3>
                      <p className="text-sm text-slate-500">
                        Trigger: {campaign.trigger} 
                        {campaign.delay_days > 0 && ` (na ${campaign.delay_days} dagen)`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {campaign.type === "review_reminder" && (
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-slate-500">Vertraging:</Label>
                        <Select 
                          value={campaign.delay_days?.toString()} 
                          onValueChange={(v) => updateCampaignDelay(campaign.type, v)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 dag</SelectItem>
                            <SelectItem value="2">2 dagen</SelectItem>
                            <SelectItem value="3">3 dagen</SelectItem>
                            <SelectItem value="5">5 dagen</SelectItem>
                            <SelectItem value="7">7 dagen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {campaign.type === "reactivation" && (
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-slate-500">Na:</Label>
                        <Select 
                          value={campaign.delay_days?.toString()} 
                          onValueChange={(v) => updateCampaignDelay(campaign.type, v)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 dagen</SelectItem>
                            <SelectItem value="60">60 dagen</SelectItem>
                            <SelectItem value="90">90 dagen</SelectItem>
                            <SelectItem value="180">180 dagen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={campaign.is_active} 
                        onCheckedChange={() => toggleCampaign(campaign.type, campaign.is_active)}
                      />
                      <span className="text-sm text-slate-500">{campaign.is_active ? "Actief" : "Inactief"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Seasonal Campaigns */}
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="text-lg">Seizoenscampagnes (Handmatig)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">
                Stuur seizoensgebonden tips naar alle klanten. Dit is een handmatige actie.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" onClick={() => sendSeasonalCampaign("winter")} className="flex-col h-auto py-4">
                  <Snowflake className="w-6 h-6 mb-2 text-cyan-500" />
                  <span>Winter</span>
                </Button>
                <Button variant="outline" onClick={() => sendSeasonalCampaign("spring")} className="flex-col h-auto py-4">
                  <Flower2 className="w-6 h-6 mb-2 text-pink-500" />
                  <span>Voorjaar</span>
                </Button>
                <Button variant="outline" onClick={() => sendSeasonalCampaign("summer")} className="flex-col h-auto py-4">
                  <Sun className="w-6 h-6 mb-2 text-yellow-500" />
                  <span>Zomer</span>
                </Button>
                <Button variant="outline" onClick={() => sendSeasonalCampaign("autumn")} className="flex-col h-auto py-4">
                  <Leaf className="w-6 h-6 mb-2 text-orange-500" />
                  <span>Herfst</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Tab */}
      {activeSubTab === "templates" && (
        <div className="space-y-4">
          {templates.map(template => (
            <Card key={template.type} className={!template.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={EMAIL_TYPE_COLORS[template.type] || "bg-slate-100"}>
                      {template.name}
                    </Badge>
                    {!template.is_active && <Badge variant="outline" className="text-red-500">Inactief</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={template.is_active} 
                      onCheckedChange={() => toggleTemplate(template.type, template.is_active)}
                    />
                    {editingTemplate !== template.type ? (
                      <Button variant="outline" size="sm" onClick={() => startEditTemplate(template)}>
                        <Edit className="w-4 h-4 mr-1" />
                        Bewerken
                      </Button>
                    ) : (
                      <Button size="sm" onClick={saveTemplate} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-1" />
                        Opslaan
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingTemplate === template.type ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Onderwerp</Label>
                      <Input 
                        value={templateForm.subject}
                        onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>HTML Template</Label>
                      <Textarea 
                        value={templateForm.html_template}
                        onChange={(e) => setTemplateForm({...templateForm, html_template: e.target.value})}
                        rows={15}
                        className="mt-1 font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Variabelen: {"{{customer_name}}"}, {"{{customer_email}}"}, {"{{frontend_url}}"}, {"{{vakman_name}}"}, {"{{service_type}}"}, {"{{booking_id}}"}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setEditingTemplate(null)}>Annuleren</Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-600 mb-2">
                      <strong>Onderwerp:</strong> {template.subject}
                    </p>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-700">Bekijk template code</summary>
                      <pre className="mt-2 p-3 bg-slate-50 rounded text-xs overflow-x-auto max-h-60">
                        {template.html_template?.substring(0, 500)}...
                      </pre>
                    </details>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Manual Send Tab */}
      {activeSubTab === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Send className="w-5 h-5" />
              Handmatig Email Versturen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Selector */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Label className="text-blue-700 font-medium">📋 Template Invoegen</Label>
              <p className="text-sm text-blue-600 mb-3">Selecteer een template om automatisch in te vullen</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {templates.filter(t => t.is_active).map(template => (
                  <Button
                    key={template.type}
                    variant="outline"
                    className="justify-start text-left h-auto py-2 px-3 hover:bg-blue-100 hover:border-blue-300"
                    onClick={() => {
                      // Strip HTML tags for plain text content, but keep structure
                      const plainText = template.html_template
                        ?.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                        .replace(/<[^>]+>/g, '\n')
                        .replace(/\n\s*\n/g, '\n\n')
                        .replace(/^\s+|\s+$/g, '')
                        .substring(0, 1000) || '';
                      
                      setManualEmail({
                        ...manualEmail,
                        subject: template.subject || '',
                        content: `[Template: ${template.name}]\n\n${plainText}`
                      });
                      toast.success(`Template "${template.name}" ingevoegd`);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon = EMAIL_TYPE_ICONS[template.type] || Mail;
                        return <Icon className="w-4 h-4 text-blue-600" />;
                      })()}
                      <span className="text-sm truncate">{template.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Ontvangers (komma-gescheiden)</Label>
              <Textarea 
                placeholder="email1@example.com, email2@example.com"
                value={manualEmail.recipients}
                onChange={(e) => setManualEmail({...manualEmail, recipients: e.target.value})}
                rows={2}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Onderwerp</Label>
              <Input 
                placeholder="Onderwerp van de email"
                value={manualEmail.subject}
                onChange={(e) => setManualEmail({...manualEmail, subject: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Inhoud (plain text, wordt automatisch gestyled)</Label>
              <Textarea 
                placeholder="Typ hier uw bericht..."
                value={manualEmail.content}
                onChange={(e) => setManualEmail({...manualEmail, content: e.target.value})}
                rows={10}
                className="mt-1"
              />
            </div>
            <Button 
              onClick={sendManualEmail} 
              disabled={sendingManual}
              className="bg-[#FF4500] hover:bg-[#CC3700]"
            >
              {sendingManual ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Versturen...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Versturen
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History Tab */}
      {activeSubTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MailOpen className="w-5 h-5" />
                Verzendgeschiedenis
              </span>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Vernieuwen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {recentEmails.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Nog geen emails verstuurd</p>
              ) : (
                recentEmails.map((email, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {email.status === "sent" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{email.subject}</p>
                        <p className="text-xs text-slate-500">{email.to_email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={EMAIL_TYPE_COLORS[email.email_type] || "bg-slate-100"}>
                        {email.email_type?.replace(/_/g, ' ')}
                      </Badge>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(email.sent_at).toLocaleString('nl-NL')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
