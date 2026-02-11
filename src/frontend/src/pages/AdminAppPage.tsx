import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { 
  Hotel, Building2, Home as HomeIcon, Bell, BarChart3, LogOut, Key, Users, 
  Settings, TrendingUp, DollarSign, UserCheck, Eye, Calendar,
  Layers, Activity, Sparkles, Moon, Sun
} from 'lucide-react';
import { 
  getHomeStays, getHotels, getBookings, getNotifications,
  type HomeStay, type Hotel as HotelType, type Notification
} from '../lib/dataStorage';
import { getAnalytics, type AnalyticsData } from '../lib/analytics';
import HotelManagement from '../components/admin/HotelManagement';
import HomeStayManagement from '../components/admin/HomeStayManagement';
import BookingManagement from '../components/admin/BookingManagement';
import PasscodeManagement from '../components/admin/PasscodeManagement';
import NotificationPanel from '../components/admin/NotificationPanel';
import TempleSpecialsManagement from '../components/admin/TempleSpecialsManagement';

const ADMIN_PASSWORD = 'VBGRA@1733s';

export default function AdminAppPage() {
  const { theme, setTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [homeStays, setHomeStays] = useState<HomeStay[]>([]);
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>(getAnalytics());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const auth = localStorage.getItem('adminAuthenticated') === 'true';
    setIsAuthenticated(auth);
    if (auth) {
      loadData();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const handleUpdate = () => loadData();
      window.addEventListener('homeStaysUpdated', handleUpdate);
      window.addEventListener('hotelsUpdated', handleUpdate);
      window.addEventListener('notificationsUpdated', handleUpdate);
      window.addEventListener('analyticsUpdated', handleUpdate);
      window.addEventListener('bookingsUpdated', handleUpdate);

      return () => {
        window.removeEventListener('homeStaysUpdated', handleUpdate);
        window.removeEventListener('hotelsUpdated', handleUpdate);
        window.removeEventListener('notificationsUpdated', handleUpdate);
        window.removeEventListener('analyticsUpdated', handleUpdate);
        window.removeEventListener('bookingsUpdated', handleUpdate);
      };
    }
  }, [isAuthenticated]);

  const loadData = () => {
    setHomeStays(getHomeStays());
    setHotels(getHotels());
    setNotifications(getNotifications());
    setAnalytics(getAnalytics());
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      toast.success('Admin login successful');
      loadData();
    } else {
      toast.error('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    toast.success('Logged out successfully');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
              <CardTitle className="text-3xl font-bold text-slate-100">Admin Portal</CardTitle>
              <p className="text-slate-400 mt-2">
                Enter your credentials to access the dashboard
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin password"
                className="glass-card bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                autoFocus
              />
            </div>
            <Button
              onClick={handleLogin}
              className="w-full gradient-saffron-gold text-white border-0 hover:opacity-90 h-11 text-base font-semibold"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bookings = getBookings();
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Modern Header with Gradient */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-saffron-gold flex items-center justify-center shadow-saffron">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                  Admin Dashboard
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                </h1>
                <p className="text-sm text-slate-400">Mantralayam HomeStay Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="icon"
                className="rounded-full border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button 
                onClick={handleLogout} 
                variant="outline"
                className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-smooth"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Modern Tab Navigation with Gradient Headers */}
          <div className="glass-card bg-slate-900/60 border-slate-800 p-1.5 rounded-2xl shadow-saffron-lg">
            <TabsList className="grid w-full grid-cols-8 gap-1.5 bg-transparent p-0">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-saffron gap-2 rounded-xl transition-all duration-300 py-3"
              >
                <HomeIcon className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-saffron gap-2 rounded-xl transition-all duration-300 py-3"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Analytics</span>
              </TabsTrigger>
              <TabsTrigger 
                value="hotels-homestays"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-saffron gap-2 rounded-xl transition-all duration-300 py-3"
              >
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">HomeStays & Hotels</span>
              </TabsTrigger>
              <TabsTrigger 
                value="bookings"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-saffron gap-2 rounded-xl transition-all duration-300 py-3"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Bookings</span>
              </TabsTrigger>
              <TabsTrigger 
                value="temple-specials"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-saffron gap-2 rounded-xl transition-all duration-300 py-3"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Temple Specials</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-saffron gap-2 rounded-xl transition-all duration-300 py-3 relative"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Notifications</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {notifications.filter(n => !n.read).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="partners"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-saffron gap-2 rounded-xl transition-all duration-300 py-3"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Partners</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-saffron gap-2 rounded-xl transition-all duration-300 py-3"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8 animate-fade-in">
            {/* Stats Cards with Gradient Backgrounds */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="glass-card bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 shadow-lg hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">Total Hotels</p>
                      <p className="text-4xl font-bold text-slate-100 mt-2 animate-count-up">{hotels.length}</p>
                      <p className="text-xs text-slate-500 mt-1">Active properties</p>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <Hotel className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 shadow-lg hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">Total HomeStays</p>
                      <p className="text-4xl font-bold text-slate-100 mt-2 animate-count-up">{homeStays.length}</p>
                      <p className="text-xs text-slate-500 mt-1">Available listings</p>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <HomeIcon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 shadow-lg hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">Total Bookings</p>
                      <p className="text-4xl font-bold text-slate-100 mt-2 animate-count-up">{bookings.length}</p>
                      <p className="text-xs text-slate-500 mt-1">All time reservations</p>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                      <Calendar className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20 shadow-lg hover-lift">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">Total Revenue</p>
                      <p className="text-4xl font-bold text-slate-100 mt-2 animate-count-up">₹{totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-slate-500 mt-1">Confirmed bookings</p>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                      <DollarSign className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Section */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="glass-card bg-slate-900/60 border-slate-800 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <span className="text-sm text-slate-300">Confirmed Bookings</span>
                      <Badge className="gradient-saffron-gold text-white border-0 shadow-sm">
                        {bookings.filter(b => b.status === 'confirmed').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <span className="text-sm text-slate-300">Pending Bookings</span>
                      <Badge variant="secondary" className="shadow-sm">
                        {bookings.filter(b => b.status === 'pending').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <span className="text-sm text-slate-300">Cancelled Bookings</span>
                      <Badge variant="destructive" className="shadow-sm">
                        {bookings.filter(b => b.status === 'cancelled').length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-slate-900/60 border-slate-800 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                    Visitor Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <span className="text-sm text-slate-300">Total Visitors</span>
                      <span className="text-lg font-bold text-slate-100">{analytics.visitors}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <span className="text-sm text-slate-300">Customer Logins</span>
                      <span className="text-lg font-bold text-slate-100">{analytics.customerLogins}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <span className="text-sm text-slate-300">HomeStay Views</span>
                      <span className="text-lg font-bold text-slate-100">{analytics.homeStayViews}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-slate-900/60 border-slate-800 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <UserCheck className="h-4 w-4 text-white" />
                    </div>
                    Partner Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <span className="text-sm text-slate-300">Partner HomeStays</span>
                      <span className="text-lg font-bold text-slate-100">
                        {homeStays.filter(h => h.ownerType === 'partner').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <span className="text-sm text-slate-300">Partner Edits</span>
                      <span className="text-lg font-bold text-slate-100">{analytics.partnerEdits}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <span className="text-sm text-slate-300">Active Partners</span>
                      <span className="text-lg font-bold text-slate-100">
                        {new Set(homeStays.filter(h => h.partnerId).map(h => h.partnerId)).size}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 animate-fade-in">
            <Card className="glass-card bg-slate-900/60 border-slate-800 shadow-saffron-lg">
              <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-saffron-gold flex items-center justify-center shadow-saffron">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-100">Analytics Dashboard</CardTitle>
                    <p className="text-sm text-slate-400">Comprehensive metrics and insights</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 hover-lift">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Total Visitors</p>
                        <p className="text-3xl font-bold text-slate-100">{analytics.visitors}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 hover-lift">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Total Bookings</p>
                        <p className="text-3xl font-bold text-slate-100">{analytics.bookings}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 hover-lift">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Total Payments</p>
                        <p className="text-3xl font-bold text-slate-100">{analytics.payments}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 hover-lift">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <UserCheck className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Customer Logins</p>
                        <p className="text-3xl font-bold text-slate-100">{analytics.customerLogins}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 rounded-xl bg-slate-800/50 border border-slate-700 shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Performance Metrics
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                      <p className="text-sm text-slate-400 mb-2 font-medium">HomeStay Views</p>
                      <p className="text-4xl font-bold text-slate-100">{analytics.homeStayViews}</p>
                      <p className="text-xs text-slate-500 mt-1">Total homestay page visits</p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50">
                      <p className="text-sm text-slate-400 mb-2 font-medium">Partner Edits</p>
                      <p className="text-4xl font-bold text-slate-100">{analytics.partnerEdits}</p>
                      <p className="text-xs text-slate-500 mt-1">HomeStay updates by partners</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hotels & HomeStays Tab */}
          <TabsContent value="hotels-homestays" className="space-y-6 animate-fade-in">
            <Tabs defaultValue="hotels" className="space-y-6">
              <div className="glass-card bg-slate-900/60 border-slate-800 p-1.5 rounded-xl">
                <TabsList className="bg-transparent gap-2">
                  <TabsTrigger 
                    value="hotels"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-saffron rounded-lg transition-all duration-300"
                  >
                    <Hotel className="h-4 w-4 mr-2" />
                    Hotels Management
                  </TabsTrigger>
                  <TabsTrigger 
                    value="homestays"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-saffron rounded-lg transition-all duration-300"
                  >
                    <HomeIcon className="h-4 w-4 mr-2" />
                    HomeStays Management
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="hotels">
                <HotelManagement />
              </TabsContent>

              <TabsContent value="homestays">
                <HomeStayManagement />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="animate-fade-in">
            <BookingManagement />
          </TabsContent>

          {/* Temple Specials Tab */}
          <TabsContent value="temple-specials" className="animate-fade-in">
            <TempleSpecialsManagement />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="animate-fade-in">
            <NotificationPanel />
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="animate-fade-in">
            <PasscodeManagement />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 animate-fade-in">
            <Card className="glass-card bg-slate-900/60 border-slate-800 shadow-saffron-lg">
              <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-primary/10 to-accent/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-saffron-gold flex items-center justify-center shadow-saffron">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-slate-100">System Settings</CardTitle>
                    <p className="text-sm text-slate-400">Configure administrative settings</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    Admin Password Management
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-slate-300 font-medium">Password Status</Label>
                      <div className="mt-2 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                        <p className="text-sm text-slate-300">Admin password is configured and secure</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Password management is active and secure
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    System Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                      <span className="text-sm text-slate-400">Version</span>
                      <span className="text-sm text-slate-100 font-medium">4.0.0</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                      <span className="text-sm text-slate-400">Last Login</span>
                      <span className="text-sm text-slate-100 font-medium">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                      <span className="text-sm text-slate-400">Storage Used</span>
                      <span className="text-sm text-slate-100 font-medium">
                        {((JSON.stringify(localStorage).length / 1024 / 1024).toFixed(2))} MB
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

