import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Star, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCustomerSession } from "../lib/dataStorage";
import {
  type Review,
  addReview,
  canUserReview,
  deleteReview,
  getAverageRating,
  getHomeStayReviews,
} from "../lib/reviewStorage";

interface ReviewSectionProps {
  homeStayId: string;
  bookingId?: string;
  isAdmin?: boolean;
}

export default function ReviewSection({
  homeStayId,
  bookingId,
  isAdmin = false,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [canReview, setCanReview] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: homeStayId triggers reload intentionally
  useEffect(() => {
    loadReviews();

    const handleUpdate = () => loadReviews();
    window.addEventListener("reviewsUpdated", handleUpdate);
    return () => window.removeEventListener("reviewsUpdated", handleUpdate);
  }, [homeStayId]);

  useEffect(() => {
    if (bookingId) {
      setCanReview(canUserReview(bookingId));
    }
  }, [bookingId]);

  const loadReviews = () => {
    const homeStayReviews = getHomeStayReviews(homeStayId);
    setReviews(homeStayReviews);
    setAverageRating(getAverageRating(homeStayId));
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    const session = getCustomerSession();
    if (!session || !bookingId) {
      toast.error("Unable to submit review");
      return;
    }

    addReview({
      homeStayId,
      customerName: session.name,
      customerPhone: session.phone,
      rating,
      comment: comment.trim(),
      verified: true,
      bookingId,
    });

    toast.success("Review submitted successfully!");
    setRating(0);
    setComment("");
    setCanReview(false);
    loadReviews();
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      deleteReview(reviewId);
      toast.success("Review deleted");
      loadReviews();
    }
  };

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= (interactive ? hoverRating || rating : count)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Average Rating Display */}
      {reviews.length > 0 && (
        <Card className="glass-card shadow-saffron">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {averageRating}
                </p>
                <div className="flex gap-1 mt-2">
                  {renderStars(Math.round(averageRating))}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold">Guest Reviews</p>
                <p className="text-sm text-muted-foreground">
                  {reviews.length} verified reviews
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Form */}
      {canReview && bookingId && (
        <Card className="glass-card shadow-saffron">
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="review-rating"
                className="text-sm font-medium mb-2 block"
              >
                Your Rating
              </label>
              {renderStars(rating, true)}
            </div>
            <div>
              <label
                htmlFor="review-comment"
                className="text-sm font-medium mb-2 block"
              >
                Your Review
              </label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this HomeStay..."
                rows={4}
                className="glass-card"
              />
            </div>
            <Button
              onClick={handleSubmitReview}
              className="gradient-saffron-gold text-white w-full"
            >
              Submit Review
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card className="glass-card shadow-saffron">
        <CardHeader>
          <CardTitle>Customer Reviews ({reviews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="py-12 text-center">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No reviews yet. Be the first to review!
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-lg border glass-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">
                              {review.customerName}
                            </p>
                            {review.verified && (
                              <Badge className="gap-1 bg-green-500 text-white border-0 text-xs">
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.timestamp).toLocaleDateString(
                              "en-IN",
                              {
                                dateStyle: "medium",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                      {isAdmin && (
                        <Button
                          onClick={() => handleDeleteReview(review.id)}
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="mb-2">{renderStars(review.rating)}</div>
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
