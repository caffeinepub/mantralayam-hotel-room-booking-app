import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createIssue } from "../lib/issueStorage";
import { addPermanentNotification } from "../lib/notificationStorage";

interface TimeoutReviewPromptDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function TimeoutReviewPromptDialog({
  open,
  onClose,
}: TimeoutReviewPromptDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save feedback as an issue with special category
      const feedbackText = `Rating: ${rating}/5${feedback.trim() ? `\n\nFeedback: ${feedback.trim()}` : ""}`;

      createIssue({
        category: "service",
        description: `[Timeout Review] ${feedbackText}`,
        contactName: "Anonymous User",
        contactPhone: "N/A",
      });

      // Create notification using 'issues' category
      addPermanentNotification(
        `User feedback received: ${rating}/5 stars${feedback.trim() ? " with comments" : ""}`,
        "issues",
        "service",
      );

      toast.success("Thank you for your feedback!");
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            We Value Your Feedback
          </DialogTitle>
          <DialogDescription>
            Your session has timed out due to inactivity. Before you go, would
            you mind sharing your experience?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>How would you rate your experience?</Label>
            <div className="flex gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {rating === 5 && "Excellent!"}
                {rating === 4 && "Very Good!"}
                {rating === 3 && "Good"}
                {rating === 2 && "Fair"}
                {rating === 1 && "Needs Improvement"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">
              Any suggestions or complaints? (Optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts, suggestions, or any issues you encountered..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground">
              Your feedback helps us improve our service. Thank you for taking
              the time to share your thoughts!
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="gradient-saffron-gold text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
