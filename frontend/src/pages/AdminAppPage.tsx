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
      window.addEventListener('customersUpdated', handleUpdate);

      return () => {
        window.removeEventListener('homeStaysUpdated', handleUpdate);
        window.removeEventListener('hotelsUpdated', handleUpdate);
        window.removeEventListener('notificationsUpdated', handleUpdate);
        window.removeEventListener('analyticsUpdated', handleUpdate);
        window.removeEventListener('bookingsUpdated', handleUpdate);
        window.removeEventListener('customersUpdated', handleUpdate);
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
                      <p className="text-4xl font-bold text-slate-100 mt-2 animate-count-up">
                        ₹{(totalRevenue / 1000).toFixed(1)}k
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Confirmed bookings</p>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                      <DollarSign className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="glass-card border-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-100">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button
                    onClick={() => setActiveTab('hotels-homestays')}
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Layers className="h-6 w-6" />
                    <span>Manage Properties</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab('bookings')}
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2 border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <Calendar className="h-6 w-6" />
                    <span>View Bookings & Customers</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab('notifications')}
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

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 animate-fade-in">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="glass-card bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">Total Visitors</p>
                      <p className="text-3xl font-bold text-slate-100 mt-2">{analytics.visitors}</p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">Total Bookings</p>
                      <p className="text-3xl font-bold text-slate-100 mt-2">{analytics.bookings}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">Revenue</p>
                      <p className="text-3xl font-bold text-slate-100 mt-2">₹{(analytics.revenue / 1000).toFixed(1)}k</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-amber-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">Customer Logins</p>
                      <p className="text-3xl font-bold text-slate-100 mt-2">{analytics.customerLogins}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card border-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-100">Activity Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-primary" />
                      <span className="text-slate-300">Partner Edits</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-100">{analytics.partnerEdits}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5 text-primary" />
                      <span className="text-slate-300">HomeStay Views</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-100">{analytics.homeStayViews}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="text-slate-300">Payments Processed</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-100">{analytics.payments}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hotels & HomeStays Tab */}
          <TabsContent value="hotels-homestays" className="space-y-6 animate-fade-in">
            <Tabs defaultValue="hotels" className="space-y-6">
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

          {/* Bookings Tab - Now includes integrated customer management */}
          <TabsContent value="bookings" className="space-y-6 animate-fade-in">
            <BookingManagement />
          </TabsContent>

          {/* Temple Specials Tab */}
          <TabsContent value="temple-specials" className="space-y-6 animate-fade-in">
            <TempleSpecialsManagement />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6 animate-fade-in">
            <NotificationPanel />
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners" className="space-y-6 animate-fade-in">
            <PasscodeManagement />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 animate-fade-in">
            <Card className="glass-card border-slate-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-100">Admin Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
