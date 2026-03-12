import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Home, LogIn } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

export default function PartnerLoginPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      setError("System not ready. Please try again.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Authenticate with backend - this sets up the partner session on the canister
      const success = await actor.authenticatePartnerWithPassword(
        password.trim(),
      );

      if (success) {
        // Get the authenticated partner ID from the backend
        const partnerId = await actor.getAuthenticatedPartnerId();

        if (!partnerId) {
          setError(
            "Authentication succeeded but partner ID could not be retrieved. Please try again.",
          );
          setIsLoading(false);
          return;
        }

        // Store minimal session info in localStorage
        localStorage.setItem(
          "partnerSession",
          JSON.stringify({
            partnerId,
            loginTime: Date.now(),
          }),
        );

        // Invalidate all partner-related queries so fresh data is fetched
        await queryClient.invalidateQueries({ queryKey: ["partnerRooms"] });
        await queryClient.invalidateQueries({ queryKey: ["partnerProfile"] });
        await queryClient.invalidateQueries({
          queryKey: ["authenticatedPartnerId"],
        });

        navigate({ to: "/partner-dashboard" });
      } else {
        setError(
          "Invalid password. Please check your credentials and try again.",
        );
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("Invalid password") || msg.includes("not found")) {
        setError(
          "Invalid password. Please check your credentials and try again.",
        );
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Home className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Partner Login</h1>
          <p className="text-muted-foreground mt-1">
            Enter your password to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your partner password"
                  className="pr-10"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </span>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Contact the admin if you've forgotten your password.
        </p>
      </div>
    </div>
  );
}
