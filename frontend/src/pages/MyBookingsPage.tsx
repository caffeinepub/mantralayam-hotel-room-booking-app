import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Phone, Clock, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getBookings, saveBookings, addNotification, type Booking } from '../lib/dataStorage';
import { addPermanentNotification } from '../lib/notificationStorage';
import ReportIssueDialog from '../components/ReportIssueDialog';
import { printInvoice } from '../lib/invoicePrint';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  useEffect(() => {
    loadBookings();

    const handleUpdate = () => loadBookings();
    window.addEventListener('bookingsUpdated', handleUpdate);

    return () => window.removeEventListener('bookingsUpdated', handleUpdate);
  }, []);

  const loadBookings = () => {
    const allBookings = getBookings();
    // Sort by booking date, most recent first
    const sorted = allBookings.sort((a, b) => 
      new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    );
    setBookings(sorted);
  };

  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const confirmCancelBooking = () => {
    if (!bookingToCancel) return;

    const updatedBookings = bookings.map(b =>
      b.id === bookingToCancel.id ? { ...b, status: 'cancelled' as const } : b
    );
    saveBookings(updatedBookings);
    
    addNotification(
      `Booking cancelled: ${bookingToCancel.homeStayName} by ${bookingToCancel.customerName} (Booking ID: ${bookingToCancel.id})`,
      'booking'
    );
    addPermanentNotification(
      `Booking cancelled: ${bookingToCancel.homeStayName} by ${bookingToCancel.customerName} (Booking ID: ${bookingToCancel.id})`,
      'bookings',
      'booking'
    );
    
    toast.success('Booking cancelled successfully');
    setCancelDialogOpen(false);
    setBookingToCancel(null);
    loadBookings();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="gradient-saffron-gold text-white border-0">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-destructive text-white">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDuration = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    return `${hours} hours`;
  };

  if (bookings.length === 0) {
    return (
      <div className="container py-16 animate-fade-in">
        <Card className="glass-card shadow-saffron max-w-2xl mx-auto">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Bookings Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring our homestays and make your first booking
            </p>
            <Button
              onClick={() => navigate({ to: '/browse-rooms' })}
              className="gradient-saffron-gold text-white border-0 hover:opacity-90"
            >
              Browse Homestays
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          My Bookings
        </h1>
        <p className="text-muted-foreground text-lg">
          View and manage your reservations
        </p>
      </div>

      <div className="grid gap-6">
        {bookings.map((booking) => (
          <Card key={booking.id} className="glass-card shadow-saffron">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{booking.homeStayName}</CardTitle>
                    {getStatusBadge(booking.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{booking.hotelName}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Booking ID: {booking.id}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Check-in</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.checkInDate).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Check-out</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.checkOutDate).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(booking.checkInDate, booking.checkOutDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Guests</p>
                      <p className="text-sm text-muted-foreground">{booking.guests} guests</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Contact</p>
                      <p className="text-sm text-muted-foreground">{booking.customerPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 flex items-center justify-center text-primary mt-0.5">
                      ₹
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Amount</p>
                      <p className="text-lg font-bold text-primary">₹{booking.totalPrice}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  onClick={() => navigate({ to: '/confirmation/$bookingId', params: { bookingId: booking.id } })}
                  variant="outline"
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View Confirmation
                </Button>
                <Button
                  onClick={() => printInvoice(booking)}
                  variant="outline"
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Print Invoice
                </Button>
                <ReportIssueDialog
                  bookingReference={booking.id}
                  contactName={booking.customerName}
                  contactPhone={booking.customerPhone}
                  homeStayId={booking.homeStayId}
                  homeStayName={booking.homeStayName}
                  trigger={
                    <Button 
                      variant="outline" 
                      className="gap-2 border-red-500/50 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Report an Issue
                    </Button>
                  }
                />
                {booking.status !== 'cancelled' && (
                  <Button
                    onClick={() => handleCancelBooking(booking)}
                    variant="destructive"
                    className="gap-2"
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelBooking}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
