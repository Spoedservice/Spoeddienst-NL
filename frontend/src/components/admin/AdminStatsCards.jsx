/**
 * Admin Dashboard - Stats Overview Component
 */
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, TrendingUp, Star } from "lucide-react";

export function AdminStatsCards({ stats }) {
  const statCards = [
    { 
      title: "Totaal Boekingen", 
      value: stats.total_bookings || 0, 
      icon: Calendar, 
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    { 
      title: "Actieve Vakmannen", 
      value: stats.active_vakmannen || 0, 
      icon: Users, 
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    { 
      title: "Geschatte Omzet", 
      value: `€${stats.total_revenue || 0}`, 
      icon: TrendingUp, 
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    { 
      title: "Reviews", 
      value: stats.total_reviews || 0, 
      icon: Star, 
      color: "text-yellow-500",
      bgColor: "bg-yellow-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, idx) => (
        <Card key={idx} className="bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AdminPendingAlerts({ vakmannen, reviews }) {
  const pendingVakmannen = vakmannen.filter(v => !v.is_approved);
  const pendingReviews = reviews.filter(r => r.status === 'pending');

  if (pendingVakmannen.length === 0 && pendingReviews.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {pendingVakmannen.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-yellow-800">{pendingVakmannen.length} vakman(nen) wachten op goedkeuring</p>
                <p className="text-sm text-yellow-600">Bekijk de Vakmannen tab</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {pendingReviews.length > 0 && (
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-800">{pendingReviews.length} review(s) wachten op moderatie</p>
                <p className="text-sm text-blue-600">Bekijk de Reviews tab</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
