import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createIssue } from "../lib/issueStorage";
import { addPermanentNotification } from "../lib/notificationStorage";

interface ReportIssueDialogProps {
  bookingReference?: string;
  contactName?: string;
  contactPhone?: string;
  homeStayId?: string;
  homeStayName?: string;
  partnerId?: string;
  trigger?: React.ReactNode;
}

export default function ReportIssueDialog({
  bookingReference,
  contactName: initialName,
  contactPhone: initialPhone,
  homeStayId,
  homeStayName,
  partnerId,
  trigger,
}: ReportIssueDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<
    "booking" | "payment" | "property" | "service" | "other"
  >("booking");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState(initialName || "");
  const [contactPhone, setContactPhone] = useState(initialPhone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    if (!contactName.trim() || !contactPhone.trim()) {
      toast.error("Please provide your contact information");
      return;
    }

    setIsSubmitting(true);

    try {
      const _issue = createIssue({
        bookingReference,
        category,
        description: description.trim(),
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        homeStayId,
        homeStayName,
        partnerId,
      });

      // Create notification
      const notificationMessage = `New issue reported: ${category} - ${contactName} (${contactPhone})${bookingReference ? ` - Booking: ${bookingReference}` : ""}`;
      addPermanentNotification(notificationMessage, "issues", "issue");

      toast.success(
        "Issue reported successfully. Admin will review it shortly.",
      );

      // Reset form
      setDescription("");
      setCategory("booking");
      setOpen(false);
    } catch (error) {
      console.error("Error reporting issue:", error);
      toast.error("Failed to report issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Report an Issue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-card sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Describe the issue you're experiencing. Our team will review and
            respond as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {bookingReference && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium text-primary">
                Booking Reference: {bookingReference}
              </p>
              {homeStayName && (
                <p className="text-xs text-muted-foreground mt-1">
                  {homeStayName}
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="category">Issue Category</Label>
            <Select
              value={category}
              onValueChange={(value: any) => setCategory(value)}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="booking">Booking Issue</SelectItem>
                <SelectItem value="payment">Payment Issue</SelectItem>
                <SelectItem value="property">Property Issue</SelectItem>
                <SelectItem value="service">Service Issue</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">Your Name *</Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone Number *</Label>
              <Input
                id="contactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 XXXXXXXXXX"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gradient-saffron-gold text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
