import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Home, DollarSign, Calendar, Users, LogOut, Bed, AlertCircle } from 'lucide-react';
import { getHomeStays, saveHomeStays, getBookings, getPartnerAuth, setPartnerAuth, type HomeStay, type Booking, getHomeStayBookingStats, normalizeHomeStay } from '../lib/dataStorage';
import ReportIssueDialog from '../components/ReportIssueDialog';

export default function PartnerDashboardPage() {
  const navigate = useNavigate();
  const [homeStay, setHomeStay] = useState<HomeStay | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState(0);

  useEffect(() => {
    const auth = getPartnerAuth();
    if (!auth.authenticated || !auth.partnerId) {
      toast.error('Please login as partner first');
      navigate({ to: '/partner-login' });
      return;
    }

    loadData(auth.partnerId);

    const handleUpdate = () => {
      if (auth.partnerId) loadData(auth.partnerId);
    };
    window.addEventListener('homeStaysUpdated', handleUpdate);
    window.addEventListener('bookingsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('homeStaysUpdated', handleUpdate);
      window.removeEventListener('bookingsUpdated', handleUpdate);
    };
  }, [navigate]);

  const loadData = (partnerId: string) => {
    const allHomeStays = getHomeStays();
    const partnerHomeStay = allHomeStays.find(h => h.partnerId === partnerId);
    
    if (partnerHomeStay) {
      const normalized = normalizeHomeStay(partnerHomeStay);
      setHomeStay(normalized);
      setNewPrice(normalized.fixedPrice || normalized.minPrice);

      const allBookings = getBookings();
      const homeStayBookings = allBookings.filter(b => b.homeStayId === normalized.id);
      setBookings(homeStayBookings);
    }
  };

  const handleLogout = () => {
    setPartnerAuth(false);
    toast.success('Logged out successfully');
    navigate({ to: '/partner-login' });
  };

  const handlePriceUpdate = () => {
    if (!homeStay) return;

    const allHomeStays = getHomeStays();
    const updated = allHomeStays.map(h =>
      h.id === homeStay.id ? { ...h, fixedPrice: newPrice, minPrice: newPrice, maxPrice: newPrice } : h
    );
    saveHomeStays(updated);
    setEditingPrice(false);
    toast.success('Price updated successfully');
  };

  const toggleRoomAvailability = (roomIndex: number) => {
    if (!homeStay) return;

    const roomAvailability = homeStay.roomAvailability || [];
    const updatedRoomAvailability = roomAvailability.map(r =>
      r.roomIndex === roomIndex ? { ...r, isAvailable: !r.isAvailable } : r
    );

    const allHomeStays = getHomeStays();
    const updated = allHomeStays.map(h =>
      h.id === homeStay.id ? { ...h, roomAvailability: updatedRoomAvailability } : h
    );
    saveHomeStays(updated);
    toast.success(`Room ${roomIndex} availability updated`);
  };

  if (!homeStay) {
    return (
      <div className="container py-8">
        <Card className="glass-card shadow-saffron">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading partner dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getHomeStayBookingStats(homeStay.id);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Partner Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your homestay: {homeStay.name}
          </p>
        </div>
        <div className="flex gap-3">
          <ReportIssueDialog
            homeStayId={homeStay.id}
            homeStayName={homeStay.name}
            contactName={homeStay.partnerName}
            contactPhone={homeStay.partnerPhoneNumber}
            trigger={
              <Button variant="outline" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                Report an Issue
              </Button>
            }
          />
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="glass-card shadow-saffron">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Room Occupancy</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bookedRooms} / {homeStay.roomCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.availableRooms} rooms available
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-saffron">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">
              {confirmedBookings.length} confirmed
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-saffron">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From confirmed bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-Room Availability Controls */}
      <Card className="glass-card shadow-saffron mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bed className="h-5 w-5" />
            Room Availability Controls
          </CardTitle>
          <p className="text-sm text-muted-foreground">Toggle availability for each room individually</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(homeStay.roomAvailability || []).map((room) => (
              <div key={room.roomIndex} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">Room {room.roomIndex}</h4>
                    <p className="text-xs text-muted-foreground">Capacity: {room.personCapacity} guests</p>
                  </div>
                  <Switch
                    checked={room.isAvailable}
                    onCheckedChange={() => toggleRoomAvailability(room.roomIndex)}
                  />
                </div>
                <Badge className={room.isAvailable ? 'gradient-saffron-gold text-white border-0' : 'bg-destructive text-white'}>
                  {room.isAvailable ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Management */}
      <Card className="glass-card shadow-saffron mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingPrice ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Price (₹)</Label>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                  className="max-w-xs"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handlePriceUpdate}
                  className="gradient-saffron-gold text-white border-0 hover:opacity-90"
                >
                  Save Price
                </Button>
                <Button
                  onClick={() => setEditingPrice(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold">₹{homeStay.fixedPrice || homeStay.minPrice}</p>
              </div>
              <Button
                onClick={() => setEditingPrice(true)}
                variant="outline"
              >
                Update Price
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card className="glass-card shadow-saffron">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 10).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold">{booking.customerName}</h4>
                      <Badge className={
                        booking.status === 'confirmed' ? 'gradient-saffron-gold text-white border-0' :
                        booking.status === 'cancelled' ? 'bg-destructive text-white' :
                        'bg-secondary'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{booking.customerPhone}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">₹{booking.totalPrice}</p>
                    <p className="text-xs text-muted-foreground">{booking.guests} guests</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
