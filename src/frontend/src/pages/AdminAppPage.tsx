import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  Calendar,
  DollarSign,
  Eye,
  Home as HomeIcon,
  Hotel,
  Key,
  Layers,
  Loader2,
  LogOut,
  Moon,
  Settings,
  Sparkles,
  Sun,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import BookingManagement from "../components/admin/BookingManagement";
import HomeStayManagement from "../components/admin/HomeStayManagement";
import HotelManagement from "../components/admin/HotelManagement";
import NotificationPanel from "../components/admin/NotificationPanel";
import PasscodeManagement from "../components/admin/PasscodeManagement";
import TempleSpecialsManagement from "../components/admin/TempleSpecialsManagement";
import { useActor } from "../hooks/useActor";
import {
  useGetAdminHotels,
  useGetAllBookings,
  useGetAvailableHomeStays,
  useGetNotifications,
} from "../hooks/useQueries";
import { type AnalyticsData, getAnalytics } from "../lib/analytics";

const ADMIN_PASSWORD = "VBGRA@1733s";
const ADMIN_KEY = "default-admin";
const BACKEND_SESSION_KEY = "adminBackendSessionTime";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export default function AdminAppPage() {
  const { theme, setTheme } = useTheme();
  const { actor } = useActor();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData>(getAnalytics());
  const [activeTab, setActiveTab] = useState("overview");

  const { data: homeStays = [] } = useGetAvailableHomeStays();
  const { data: hotels = [] } = useGetAdminHotels();
  const { data: allBookings = [] } = useGetAllBookings();
  const { data: notifications = [] } = useGetNotifications();

  const establishBackendSession = useCallback(async () => {
    if (!actor) return false;
    try {
      const ok = await actor.authenticateAdmin(ADMIN_KEY, ADMIN_PASSWORD);
      if (ok) localStorage.setItem(BACKEND_SESSION_KEY, String(Date.now()));
      return ok;
    } catch {
      return false;
    }
  }, [actor]);

  useEffect(() => {
    const wasAuth = localStorage.getItem("adminAuthenticated") === "true";
    setIsAuthenticated(wasAuth);
    if (wasAuth && actor) {
      const last = Number(localStorage.getItem(BACKEND_SESSION_KEY) ?? 0);
      if (Date.now() - last > SESSION_TTL_MS) {
        establishBackendSession();
      }
    }
  }, [actor, establishBackendSession]);

  useEffect(() => {
    const id = setInterval(() => setAnalytics(getAnalytics()), 30_000);
    return () => clearInterval(id);
  }, []);

  const handleLogin = async () => {
    // Primary gate: frontend password check
    if (password !== ADMIN_PASSWORD) {
      toast.error("Invalid password");
      return;
    }
    setIsLoggingIn(true);
    // Backend session is best-effort — never block login if it fails
    if (actor) {
      try {
        let ok = await actor.authenticateAdmin(ADMIN_KEY, ADMIN_PASSWORD);
        if (!ok) {
          try {
            await actor.initializeAccessControl();
          } catch {
            /* ignore */
          }
          try {
            ok = await actor.authenticateAdmin(ADMIN_KEY, ADMIN_PASSWORD);
          } catch {
            /* ignore */
          }
        }
        if (ok) localStorage.setItem(BACKEND_SESSION_KEY, String(Date.now()));
      } catch {
        // Backend session failed — still allow login based on password
      }
    }
    setIsAuthenticated(true);
    localStorage.setItem("adminAuthenticated", "true");
    setIsLoggingIn(false);
    toast.success("Admin login successful");
  };

  const handleLogout = async () => {
    if (actor) {
      try {
        await actor.logoutAdmin();
      } catch {
        /* ignore */
      }
    }
    setIsAuthenticated(false);
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem(BACKEND_SESSION_KEY);
    toast.success("Logged out successfully");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <Card className="w-full max-w-md glass-card shadow-saffron-lg border-slate-700 animate-fade-in">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full gradient-saffron-gold flex items-center justify-center shadow-saffron">
              <Key className="h-10 w-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-slate-100">
                Admin Portal
              </CardTitle>
              <p className="text-slate-400 mt-2">
                Enter your credentials to access the dashboard
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ap-password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="ap-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !isLoggingIn && handleLogin()
                }
                placeholder="Enter admin password"
                className="glass-card bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                autoFocus
                disabled={isLoggingIn}
                data-ocid="admin.input"
              />
            </div>
            <Button
              onClick={handleLogin}
              disabled={isLoggingIn || !password.trim()}
              className="w-full gradient-saffron-gold text-white border-0 hover:opacity-90 h-11 text-base font-semibold"
              data-ocid="admin.submit_button"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalRevenue = allBookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + Number(b.totalPrice ?? 0), 0);
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-saffron-gold flex items-center justify-center shadow-saffron">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                  Admin Dashboard{" "}
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                </h1>
                <p className="text-sm text-slate-400">
                  Mantralayam HomeStay Management System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                variant="outline"
                size="icon"
                className="rounded-full border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                data-ocid="admin.secondary_button"
              >
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <div className="glass-card bg-slate-900/60 border-slate-800 p-1.5 rounded-2xl shadow-saffron-lg overflow-x-auto">
            <TabsList className="flex w-full min-w-max gap-1.5 bg-transparent p-0">
              {[
                { v: "overview", I: HomeIcon, l: "Overview" },
                { v: "analytics", I: BarChart3, l: "Analytics" },
                { v: "hotels-homestays", I: Layers, l: "HomeStays & Hotels" },
                { v: "bookings", I: Calendar, l: "Bookings" },
                { v: "temple-specials", I: Sparkles, l: "Temple Specials" },
                {
                  v: "notifications",
                  I: Bell,
                  l: "Notifications",
                  badge: unreadCount,
                },
                { v: "partners", I: Users, l: "Partners" },
                { v: "settings", I: Settings, l: "Settings" },
              ].map(({ v, I, l, badge }) => (
                <TabsTrigger
                  key={v}
                  value={v}
                  className="data-[state=active]:gradient-saffron-gold data-[state=active]:text-white gap-2 rounded-xl transition-all duration-300 py-3 px-4 relative whitespace-nowrap"
                  data-ocid={`admin.${v}.tab`}
                >
                  <I className="h-4 w-4" />
                  <span className="font-medium">{l}</span>
                  {badge != null && badge > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                      {badge}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-8 animate-fade-in">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="glass-card border-blue-500/20 shadow-lg hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">
                        Total Hotels
                      </p>
                      <p className="text-4xl font-bold text-slate-100 mt-2">
                        {hotels.length}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Active properties
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-xl gradient-saffron-gold flex items-center justify-center shadow-lg">
                      <Hotel className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card border-purple-500/20 shadow-lg hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">
                        Total HomeStays
                      </p>
                      <p className="text-4xl font-bold text-slate-100 mt-2">
                        {homeStays.length}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Available listings
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-xl gradient-saffron-gold flex items-center justify-center shadow-lg">
                      <HomeIcon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card border-green-500/20 shadow-lg hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">
                        Total Bookings
                      </p>
                      <p className="text-4xl font-bold text-slate-100 mt-2">
                        {allBookings.length}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        All time reservations
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-xl gradient-saffron-gold flex items-center justify-center shadow-lg">
                      <Calendar className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card border-amber-500/20 shadow-lg hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">
                        Total Revenue
                      </p>
                      <p className="text-4xl font-bold text-slate-100 mt-2">
                        &#8377;{(totalRevenue / 1000).toFixed(1)}k
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Confirmed bookings
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-xl gradient-saffron-gold flex items-center justify-center shadow-lg">
                      <DollarSign className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="glass-card border-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-100">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button
                    onClick={() => setActiveTab("hotels-homestays")}
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Layers className="h-6 w-6" />
                    <span>Manage Properties</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("bookings")}
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Calendar className="h-6 w-6" />
                    <span>View Bookings</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("notifications")}
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Bell className="h-6 w-6" />
                    <span>View Notifications</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6 animate-fade-in">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="glass-card border-blue-500/20 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">
                        Total Visitors
                      </p>
                      <p className="text-3xl font-bold text-slate-100 mt-2">
                        {analytics.visitors}
                      </p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card border-green-500/20 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">
                        Total Bookings
                      </p>
                      <p className="text-3xl font-bold text-slate-100 mt-2">
                        {allBookings.length}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card border-amber-500/20 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">
                        Revenue
                      </p>
                      <p className="text-3xl font-bold text-slate-100 mt-2">
                        &#8377;{(totalRevenue / 1000).toFixed(1)}k
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-amber-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="glass-card border-purple-500/20 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">
                        Customer Logins
                      </p>
                      <p className="text-3xl font-bold text-slate-100 mt-2">
                        {analytics.customerLogins}
                      </p>
                    </div>
                    <UserCheck className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="glass-card border-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-100">
                  Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      label: "Partner Edits",
                      value: analytics.partnerEdits,
                      Icon: Activity,
                    },
                    {
                      label: "HomeStay Views",
                      value: analytics.homeStayViews,
                      Icon: Eye,
                    },
                    {
                      label: "Payments Processed",
                      value: analytics.payments,
                      Icon: DollarSign,
                    },
                  ].map(({ label, value, Icon }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-slate-300">{label}</span>
                      </div>
                      <span className="text-2xl font-bold text-slate-100">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="hotels-homestays"
            className="space-y-6 animate-fade-in"
          >
            <Tabs defaultValue="homestays" className="space-y-6">
              <TabsList className="glass-card bg-slate-900/60 border-slate-800">
                <TabsTrigger value="hotels">Hotels</TabsTrigger>
                <TabsTrigger value="homestays">HomeStays</TabsTrigger>
              </TabsList>
              <TabsContent value="hotels">
                <HotelManagement />
              </TabsContent>
              <TabsContent value="homestays">
                <HomeStayManagement />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6 animate-fade-in">
            <BookingManagement />
          </TabsContent>

          <TabsContent
            value="temple-specials"
            className="space-y-6 animate-fade-in"
          >
            <TempleSpecialsManagement />
          </TabsContent>

          <TabsContent
            value="notifications"
            className="space-y-6 animate-fade-in"
          >
            <NotificationPanel />
          </TabsContent>

          <TabsContent value="partners" className="space-y-6 animate-fade-in">
            <PasscodeManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 animate-fade-in">
            <Card className="glass-card border-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-100">Admin Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Manage admin credentials and partner access here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
