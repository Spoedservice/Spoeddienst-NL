import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Star, Search, CheckCircle, XCircle, RefreshCw, Clock, MessageSquare
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SERVICE_NAMES = {
  loodgieter: "Loodgieter",
  slotenmaker: "Slotenmaker",
  elektricien: "Elektricien"
};

export default function ReviewsManagement({ 
  reviews, 
  onRefresh, 
  token 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterApproved, setFilterApproved] = useState("all");

  const headers = { Authorization: `Bearer ${token}` };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.vakman_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesApproved = 
      filterApproved === "all" || 
      (filterApproved === "approved" && review.approved) ||
      (filterApproved === "pending" && !review.approved);
    
    return matchesSearch && matchesApproved;
  });

  const approveReview = async (reviewId) => {
    try {
      await axios.post(
        `${API}/admin/review/${reviewId}/approve`,
        {},
        { headers }
      );
      toast.success("Review goedgekeurd");
      onRefresh();
    } catch (error) {
      toast.error("Fout bij goedkeuren review");
    }
  };

  const rejectReview = async (reviewId) => {
    if (!confirm("Weet je zeker dat je deze review wilt afwijzen?")) return;
    try {
      await axios.post(
        `${API}/admin/review/${reviewId}/reject`,
        {},
        { headers }
      );
      toast.success("Review afgewezen");
      onRefresh();
    } catch (error) {
      toast.error("Fout bij afwijzen review");
    }
  };

  const pendingCount = reviews.filter(r => !r.approved).length;
  const approvedCount = reviews.filter(r => r.approved).length;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
      />
    ));
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <CardTitle className="text-lg">Reviews Beheer</CardTitle>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-sm text-slate-500">
                {approvedCount} goedgekeurd • {pendingCount} in afwachting
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{averageRating}</span>
                <span className="text-sm text-slate-500">gemiddeld</span>
              </div>
            </div>
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
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div 
              key={review.id} 
              className={`p-4 border rounded-lg ${review.approved ? 'bg-white' : 'bg-yellow-50 border-yellow-200'}`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{review.customer_name}</h3>
                        <Badge className={review.approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                          {review.approved ? "Goedgekeurd" : "In afwachting"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        Review voor <span className="font-medium">{review.vakman_name}</span>
                        {review.service_type && (
                          <span> • {SERVICE_NAMES[review.service_type] || review.service_type}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                      <p className="text-sm text-slate-600">{review.comment || "Geen commentaar"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(review.created_at).toLocaleDateString('nl-NL')}</span>
                    </div>
                    {review.booking_id && (
                      <span>Boeking: {review.booking_id.substring(0, 8)}...</span>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 justify-end">
                  {!review.approved && (
                    <>
                      <Button 
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => approveReview(review.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Goedkeuren
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => rejectReview(review.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Afwijzen
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredReviews.length === 0 && (
            <p className="text-center text-slate-500 py-8">Geen reviews gevonden</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
