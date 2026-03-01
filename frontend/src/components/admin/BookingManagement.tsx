import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, User, Phone, MapPin, DollarSign, Clock, Users } from 'lucide-react';
import { getBookings, type Booking } from '../../lib/dataStorage';
import CustomerManagement from './CustomerManagement';

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    loadBookings();
    
    const handleBookingsUpdated = () => {
      loadBookings();
    };
    
    window.addEventListener('bookingsUpdated', handleBookingsUpdated);
    return () => window.removeEventListener('bookingsUpdated', handleBookingsUpdated);
  }, []);

  const loadBookings = () => {
    setBookings(getBookings());
  };

  const isExpired = (booking: Booking): boolean => {
    const checkOutTime = new Date(booking.checkOutDate).getTime();
    const now = Date.now();
    return checkOutTime < now;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="gradient-saffron-gold text-white border-0">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Bookings & Customer Management</h2>
        <p className="text-sm text-slate-400 mt-1">View all bookings and manage customer information in one place</p>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList className="glass-card bg-slate-900/60 border-slate-800">
          <TabsTrigger value="bookings" className="gap-2">
            <Calendar className="h-4 w-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="glass-card bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-400">Total Bookings</p>
                  <p className="text-3xl font-bold text-slate-100 mt-2">{bookings.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-400">Confirmed</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-slate-400">Pending</p>
                  <p className="text-3xl font-bold text-amber-400 mt-2">
                    {bookings.filter(b => b.status === 'pending').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {bookings.length === 0 ? (
            <Card className="glass-card bg-slate-900/50 border-slate-800">
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-slate-100">No Bookings Yet</h3>
                <p className="text-sm text-slate-400">
                  Bookings will appear here once customers make reservations
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">All Bookings ({bookings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {bookings.map((booking) => {
                      const expired = isExpired(booking);
                      return (
                        <div 
                          key={booking.id} 
                          className={`p-4 rounded-lg border ${
                            expired 
                              ? 'border-slate-700/50 bg-slate-800/30 opacity-70' 
                              : 'border-slate-700 bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                expired 
                                  ? 'bg-slate-700' 
                                  : 'bg-gradient-to-br from-primary to-accent'
                              }`}>
                                <User className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className={`font-semibold ${expired ? 'text-slate-400' : 'text-slate-100'}`}>
                                  {booking.customerName}
                                </p>
                                <p className="text-sm text-slate-400 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {booking.customerPhone}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {expired && (
                                <Badge className="bg-slate-600 text-slate-200 border-0">
                                  Expired
                                </Badge>
                              )}
                              {getStatusBadge(booking.status)}
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                                <div>
                                  <p className="text-slate-400">HomeStay & Hotel</p>
                                  <p className={`font-medium ${expired ? 'text-slate-400' : 'text-slate-100'}`}>
                                    {booking.homeStayName}
                                  </p>
                                  <p className={expired ? 'text-slate-500' : 'text-slate-300'}>
                                    {booking.hotelName}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                                <div>
                                  <p className="text-slate-400">Check-in</p>
                                  <p className={expired ? 'text-slate-400' : 'text-slate-100'}>
                                    {new Date(booking.checkInDate).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                                <div>
                                  <p className="text-slate-400">Check-out (12 hours)</p>
                                  <p className={expired ? 'text-slate-400' : 'text-slate-100'}>
                                    {new Date(booking.checkOutDate).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className={`h-4 w-4 ${expired ? 'text-slate-500' : 'text-primary'}`} />
                              <span className={`text-lg font-bold ${expired ? 'text-slate-500' : 'text-primary'}`}>
                                ₹{booking.totalPrice.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              Guests: {booking.guests} • ID: {booking.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="customers">
          <CustomerManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
