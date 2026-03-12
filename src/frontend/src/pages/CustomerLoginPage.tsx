import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useRecordCustomerFirstLogin } from "../hooks/useQueries";
import { updateAnalytics } from "../lib/dataStorage";

export default function CustomerLoginPage() {
  const navigate = useNavigate();
  const { login, identity, loginStatus } = useInternetIdentity();
  const recordFirstLogin = useRecordCustomerFirstLogin();
  const [customerName, setCustomerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (identity) {
      setShowNameInput(true);
    }
  }, [identity]);

  const handleLogin = async () => {
    try {
      setIsProcessing(true);
      await login();
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      setIsProcessing(true);
      const isFirstLogin = await recordFirstLogin.mutateAsync(
        customerName.trim(),
      );

      if (isFirstLogin) {
        updateAnalytics("customerLogins");
        toast.success(
          `Welcome, ${customerName}! Your account has been created.`,
        );
      } else {
        toast.success(`Welcome back, ${customerName}!`);
      }

      navigate({ to: "/browse-rooms" });
    } catch (error: any) {
      console.error("Name submission error:", error);
      toast.error("Failed to complete login. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (showNameInput && identity) {
    return (
      <div className="container py-16 max-w-md animate-fade-in">
        <Card className="glass-card shadow-saffron-lg">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full gradient-saffron-gold flex items-center justify-center mb-4 shadow-saffron">
              <User className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-center">
              Complete Your Profile
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Please enter your name to continue
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                placeholder="Enter your full name"
                className="glass-card"
                autoFocus
              />
            </div>
            <Button
              onClick={handleNameSubmit}
              disabled={isProcessing}
              className="w-full gradient-saffron-gold text-white border-0 hover:opacity-90 gap-2"
            >
              {isProcessing ? "Processing..." : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-16 max-w-md animate-fade-in">
      <Card className="glass-card shadow-saffron-lg">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full gradient-saffron-gold flex items-center justify-center mb-4 shadow-saffron">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-center">Customer Login</CardTitle>
          <p className="text-center text-muted-foreground">
            Login to book rooms and manage your reservations
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleLogin}
            disabled={isProcessing || loginStatus === "logging-in"}
            className="w-full gradient-saffron-gold text-white border-0 hover:opacity-90 gap-2"
            size="lg"
          >
            {loginStatus === "logging-in"
              ? "Logging in..."
              : "Login with Internet Identity"}
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Secure authentication powered by Internet Computer
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
