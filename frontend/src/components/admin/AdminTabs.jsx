/**
 * Admin Dashboard - Tabs Navigation Component
 */
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Star, BarChart3, DollarSign, Megaphone } from "lucide-react";

const tabs = [
  { id: "overview", label: "Overzicht", icon: BarChart3 },
  { id: "bookings", label: "Boekingen", icon: Calendar },
  { id: "vakmannen", label: "Vakmannen", icon: Users },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "financial", label: "Financieel", icon: DollarSign },
  { id: "marketing", label: "Marketing", icon: Megaphone }
];

export function AdminTabs({ activeTab, setActiveTab, pendingCounts }) {
  return (
    <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
          data-testid={`tab-${tab.id}`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
          {pendingCounts[tab.id] > 0 && (
            <Badge className="bg-red-500 text-white text-xs ml-1">
              {pendingCounts[tab.id]}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}
