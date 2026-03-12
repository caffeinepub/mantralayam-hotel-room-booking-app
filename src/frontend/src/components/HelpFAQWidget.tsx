import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  HelpCircle,
  MessageCircle,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "booking-process",
    question: "How do I book a homestay?",
    answer:
      "To book: 1) Browse available rooms, 2) Select your preferred homestay, 3) Choose check-in date and time, 4) Enter guest details, 5) Complete payment via UPI. All bookings are for 12-hour stays.",
    keywords: ["book", "booking", "reserve", "how to book", "reservation"],
  },
  {
    id: "temple-timings",
    question: "What are the temple timings?",
    answer:
      "Sri Raghavendra Swamy Mutt conducts daily poojas. Morning Pooja starts at 7 AM and Evening Aarti at 7 PM. Special abhishekams are performed throughout the day.",
    keywords: ["temple", "timing", "pooja", "aarti", "darshan", "hours"],
  },
  {
    id: "payment-methods",
    question: "What payment methods are accepted?",
    answer:
      "We accept UPI payments for all bookings. After selecting your homestay and dates, you will receive a UPI QR code for secure payment with instant confirmation.",
    keywords: ["payment", "pay", "upi", "money", "transaction"],
  },
  {
    id: "cancellation",
    question: "How do I cancel my booking?",
    answer:
      'You can cancel bookings from the "My Bookings" page. Click on your booking and select "Cancel Booking". The room will be freed for other guests. For refund policies, contact the property owner.',
    keywords: ["cancel", "cancellation", "refund", "delete booking"],
  },
  {
    id: "room-types",
    question: "What types of rooms are available?",
    answer:
      "We offer various homestays: Budget rooms (₹800-1200), Standard rooms (₹1500-2000), Family rooms (₹2000-2500), and Luxury suites (₹3000-4000). All include modern amenities.",
    keywords: ["room", "types", "accommodation", "homestay", "price", "cost"],
  },
  {
    id: "amenities",
    question: "What amenities are provided?",
    answer:
      "Our homestays feature: WiFi, AC/Fan, Hot Water, TV, Room Service, and Parking. Premium suites include Mini Bar, Balcony, and Work Desk.",
    keywords: ["amenities", "facilities", "wifi", "ac", "parking", "services"],
  },
  {
    id: "location",
    question: "How far are the properties from the temple?",
    answer:
      "All properties are located near Sri Raghavendra Swamy Mutt, ranging from 0.3 km to 2 km distance. We provide Google Maps links for easy navigation.",
    keywords: ["location", "distance", "temple", "map", "directions", "where"],
  },
  {
    id: "check-in",
    question: "What is the check-in/check-out policy?",
    answer:
      "All bookings are for a fixed 12-hour duration from your selected check-in time. You can choose any check-in time that suits you.",
    keywords: [
      "check-in",
      "check-out",
      "checkout",
      "duration",
      "hours",
      "time",
    ],
  },
];

export default function HelpFAQWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFAQ, setSelectedFAQ] = useState<FAQItem | null>(null);
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>(FAQ_ITEMS);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Safely handle legacy chat history
    try {
      const legacyHistory = localStorage.getItem("mantralayam_chat_history");
      if (legacyHistory) {
        // Migrate or reset gracefully
        localStorage.removeItem("mantralayam_chat_history");
        console.log("Legacy chat history cleared for FAQ widget");
      }
    } catch (error) {
      console.error("Error handling legacy chat history:", error);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = FAQ_ITEMS.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.keywords.some((keyword) => keyword.toLowerCase().includes(query)),
      );
      setFilteredFAQs(filtered);
    } else {
      setFilteredFAQs(FAQ_ITEMS);
    }
  }, [searchQuery]);

  const handleFAQClick = (faq: FAQItem) => {
    setSelectedFAQ(faq);
  };

  const handleBack = () => {
    setSelectedFAQ(null);
    setSearchQuery("");
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full gradient-saffron-gold text-white shadow-saffron-lg hover:scale-110 transition-transform z-50"
        size="icon"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] glass-card shadow-saffron-lg z-50 flex flex-col animate-fade-in">
      <CardHeader className="border-b gradient-saffron-gold text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">Help & FAQ</CardTitle>
              <p className="text-xs text-white/80">
                Quick answers to common questions
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col">
        {!selectedFAQ ? (
          <>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help..."
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-2">
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq) => (
                    <button
                      type="button"
                      key={faq.id}
                      onClick={() => handleFAQClick(faq)}
                      className="w-full text-left p-3 rounded-lg border glass-card hover:border-primary/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">
                          {faq.question}
                        </p>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No results found
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try different keywords
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setSearchQuery("booking")}
                >
                  Booking
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setSearchQuery("temple")}
                >
                  Temple
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setSearchQuery("payment")}
                >
                  Payment
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setSearchQuery("cancel")}
                >
                  Cancel
                </Badge>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 border-b">
              <Button
                onClick={handleBack}
                variant="ghost"
                size="sm"
                className="gap-2 -ml-2"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                Back to FAQs
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {selectedFAQ.question}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedFAQ.answer}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs font-medium text-primary mb-1">
                    Need more help?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Contact admin or use the "Report an Issue" feature for
                    specific problems.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}
