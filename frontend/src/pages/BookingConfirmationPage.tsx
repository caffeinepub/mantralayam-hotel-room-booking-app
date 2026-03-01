import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Users, MapPin, Phone, Home, FileText } from 'lucide-react';
import { getBookings, type Booking } from '../lib/dataStorage';

export default function BookingConfirmationPage() {
  const navigate = useNavigate();
  const { bookingId } = useParams({ from: '/confirmation/$bookingId' });
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const bookings = getBookings();
    const foundBooking = bookings.find(b => b.id === bookingId);
    if (foundBooking) {
      setBooking(foundBooking);
    }
  }, [bookingId]);

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const calculateDuration = () => {
    if (!booking) return '';
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    const hours = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60));
    return `${hours} hours`;
  };

  if (!booking) {
    return (
      <div className="container py-8">
        <Card className="glass-card shadow-saffron">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Booking not found</p>
            <Button
              onClick={() => navigate({ to: '/' })}
              className="mt-4"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl animate-fade-in">
      <Card className="glass-card shadow-saffron-lg">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 rounded-full gradient-saffron-gold flex items-center justify-center mb-4 shadow-saffron">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl mb-2">Booking Confirmed!</CardTitle>
          <p className="text-muted-foreground">
            Your reservation has been successfully confirmed
          </p>
          <div className="mt-4">
            <Badge className="text-lg px-4 py-2 gradient-saffron-gold text-white border-0">
              Booking ID: {booking.id.split('-')[1]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Booking Details
            </h3>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Hotel</span>
                <span className="font-medium">{booking.hotelName}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">HomeStay</span>
                <span className="font-medium">{booking.homeStayName}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Check-in</span>
                <span className="font-medium">{formatDateTime(booking.checkInDate)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Check-out</span>
                <span className="font-medium">{formatDateTime(booking.checkOutDate)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{calculateDuration()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Guests</span>
                <span className="font-medium">{booking.guests}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="text-xl font-bold text-primary">₹{booking.totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Customer Details
            </h3>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{booking.customerName}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{booking.customerPhone}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Payment Status</h3>
            <Badge className="gradient-saffron-gold text-white border-0">
              Confirmed
            </Badge>
          </div>

          {/* Important Instructions */}
          <div className="space-y-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h3 className="font-semibold text-lg">Important Instructions</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Carry valid ID proof for verification at check-in</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Arrive at the property at your scheduled check-in time</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Contact the property directly for any special requests</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={() => navigate({ to: '/my-bookings' })}
              className="flex-1 gradient-saffron-gold text-white border-0 hover:opacity-90 transition-smooth gap-2"
            >
              <Calendar className="h-4 w-4" />
              View My Bookings
            </Button>
            <Button
              onClick={() => navigate({ to: '/' })}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
