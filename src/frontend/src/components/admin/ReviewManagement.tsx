import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Search, Star, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getHomeStays } from "../../lib/dataStorage";
import {
  type Review,
  deleteReview,
  getAverageRating,
  getReviews,
} from "../../lib/reviewStorage";

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    loadReviews();

    const handleUpdate = () => loadReviews();
    window.addEventListener("reviewsUpdated", handleUpdate);
    return () => window.removeEventListener("reviewsUpdated", handleUpdate);
  }, []);

  const loadReviews = () => {
    const allReviews = getReviews();
    setReviews(allReviews);
  };

  const handleDeleteReview = (reviewId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this review? This action cannot be undone.",
      )
    ) {
      deleteReview(reviewId);
      toast.success("Review deleted successfully");
      loadReviews();
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating =
      filterRating === null || review.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= count ? "fill-amber-400 text-amber-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getHomeStayName = (homeStayId: string): string => {
    const homeStays = getHomeStays();
    const homeStay = homeStays.find((h) => h.id === homeStayId);
    return homeStay?.name || "Unknown HomeStay";
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <Card className="glass-card bg-slate-900/60 border-slate-800 shadow-saffron-lg">
      <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-saffron-gold flex items-center justify-center shadow-saffron">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-100">
                Review Management
              </CardTitle>
              <p className="text-sm text-slate-400">
                Moderate customer reviews and ratings
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-100">{averageRating}</p>
            <p className="text-xs text-slate-400">Average Rating</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-sm text-slate-400">Total Reviews</p>
            <p className="text-2xl font-bold text-slate-100">
              {reviews.length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-sm text-slate-400">5 Star Reviews</p>
            <p className="text-2xl font-bold text-slate-100">
              {reviews.filter((r) => r.rating === 5).length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-sm text-slate-400">4 Star Reviews</p>
            <p className="text-2xl font-bold text-slate-100">
              {reviews.filter((r) => r.rating === 4).length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-sm text-slate-400">Verified Reviews</p>
            <p className="text-2xl font-bold text-slate-100">
              {reviews.filter((r) => r.verified).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reviews..."
                className="pl-10 glass-card bg-slate-800 border-slate-700 text-slate-100"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setFilterRating(null)}
              variant={filterRating === null ? "default" : "outline"}
              size="sm"
              className={
                filterRating === null ? "gradient-saffron-gold text-white" : ""
              }
            >
              All
            </Button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                onClick={() => setFilterRating(rating)}
                variant={filterRating === rating ? "default" : "outline"}
                size="sm"
                className={
                  filterRating === rating
                    ? "gradient-saffron-gold text-white"
                    : ""
                }
              >
                {rating}★
              </Button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="py-12 text-center">
            <Star className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No reviews found</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-lg border glass-card bg-slate-800/50 border-slate-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-100">
                            {review.customerName}
                          </p>
                          {review.verified && (
                            <Badge className="gap-1 bg-green-500 text-white border-0 text-xs">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {getHomeStayName(review.homeStayId)} •{" "}
                          {new Date(review.timestamp).toLocaleDateString(
                            "en-IN",
                            {
                              dateStyle: "medium",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteReview(review.id)}
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mb-2">{renderStars(review.rating)}</div>
                  <p className="text-sm text-slate-300">{review.comment}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
