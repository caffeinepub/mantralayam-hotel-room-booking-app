export interface Review {
  id: string;
  homeStayId: string;
  customerName: string;
  customerPhone: string;
  rating: number; // 1-5
  comment: string;
  timestamp: string;
  verified: boolean;
  bookingId: string;
}

const REVIEWS_KEY = "mantralayam_reviews";

export function getReviews(): Review[] {
  try {
    const data = localStorage.getItem(REVIEWS_KEY);
    if (!data) return [];
    const reviews = JSON.parse(data);
    return Array.isArray(reviews) ? reviews : [];
  } catch (error) {
    console.error("Error reading reviews:", error);
    return [];
  }
}

export function saveReviews(reviews: Review[]) {
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new Event("reviewsUpdated"));
  } catch (error) {
    console.error("Error saving reviews:", error);
  }
}

export function getHomeStayReviews(homeStayId: string): Review[] {
  const reviews = getReviews();
  return reviews.filter((r) => r.homeStayId === homeStayId);
}

export function addReview(review: Omit<Review, "id" | "timestamp">): Review {
  const newReview: Review = {
    ...review,
    id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  const reviews = getReviews();
  reviews.unshift(newReview);
  saveReviews(reviews);

  return newReview;
}

export function deleteReview(reviewId: string) {
  const reviews = getReviews();
  const filtered = reviews.filter((r) => r.id !== reviewId);
  saveReviews(filtered);
}

export function getAverageRating(homeStayId: string): number {
  const reviews = getHomeStayReviews(homeStayId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function canUserReview(bookingId: string): boolean {
  const reviews = getReviews();
  return !reviews.some((r) => r.bookingId === bookingId);
}
