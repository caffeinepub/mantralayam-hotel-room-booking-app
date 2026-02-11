import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, Users, CreditCard, ArrowRight, AlertCircle, Clock, Bed } from 'lucide-react';
import { 
  getHomeStays, getHotels, getBookings, saveBookings, addNotification, 
  updateAnalytics, type HomeStay, type Hotel, getHomeStayDisplayPrice, getCustomerSession,
  getAvailableRoomsCount, getTotalCapacityForRooms
} from '../lib/dataStorage';
import { addPermanentNotification } from '../lib/notificationStorage';

export default function BookingPage() {
  const navigate = useNavigate();
  const { roomId } = useParams({ from: '/booking/$roomId' });
  const [homeStay, setHomeStay] = useState<HomeStay | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [guests, setGuests] = useState('2');
  const [roomQuantity, setRoomQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [availableRooms, setAvailableRooms] = useState(0);
  const [maxGuests, setMaxGuests] = useState(0);

  useEffect(() => {
    // Check customer session
    const session = getCustomerSession();
    if (!session || !session.verified) {
      toast.error('Please provide your details first');
      navigate({ to: '/browse-rooms' });
      return;
    }

    setCustomerName(session.name);
    setCustomerPhone(session.phone);

    const homeStays = getHomeStays();
    const foundHomeStay = homeStays.find(h => h.id === roomId);
    
    if (!foundHomeStay) {
      toast.error('HomeStay not found');
      navigate({ to: '/browse-rooms' });
      return;
    }

    setHomeStay(foundHomeStay);

    const hotels = getHotels();
    const foundHotel = hotels.find(h => h.id === foundHomeStay.hotelId);
    setHotel(foundHotel || null);

    // Set default check-in date to today
    const today = new Date();
    setCheckInDate(today.toISOString().split('T')[0]);
  }, [roomId, navigate]);

  useEffect(() => {
    if (homeStay) {
      const available = getAvailableRoomsCount(homeStay.id);
      setAvailableRooms(available);
      
      // Reset room quantity if it exceeds available rooms
      if (roomQuantity > available) {
        setRoomQuantity(Math.max(1, available));
      }
    }
  }, [homeStay]);

  useEffect(() => {
    if (homeStay && roomQuantity > 0) {
      const maxAllowed = getTotalCapacityForRooms(homeStay.id, roomQuantity);
      setMaxGuests(maxAllowed);
      
      // Adjust guests if exceeds capacity
      const currentGuests = parseInt(guests) || 1;
      if (currentGuests > maxAllowed) {
        setGuests(maxAllowed.toString());
      }
    }
  }, [homeStay, roomQuantity]);

  const calculateCheckOutDateTime = () => {
    if (!checkInDate || !checkInTime) return '';
    const checkIn = new Date(`${checkInDate}T${checkInTime}`);
    const checkOut = new Date(checkIn.getTime() + 12 * 60 * 60 * 1000); // Add 12 hours
    return checkOut.toISOString();
  };

  const calculateTotalPrice = () => {
    if (!homeStay) return 0;
    // Fixed 12-hour rate per room
    const pricePerRoom = homeStay.fixedPrice || homeStay.minPrice;
    return pricePerRoom * roomQuantity;
  };

  const handleBooking = async () => {
    if (!homeStay || !hotel) return;

    if (!checkInDate || !checkInTime) {
      toast.error('Please select check-in date and time');
      return;
    }

    const checkInDateTime = `${checkInDate}T${checkInTime}`;
    
    // Check availability
    const available = getAvailableRoomsCount(homeStay.id);
    if (available < roomQuantity) {
      toast.error(`Sorry, only ${available} room(s) available. Please adjust your selection.`);
      return;
    }

    // Validate guest count against capacity
    const guestCount = parseInt(guests) || 1;
    const maxAllowed = getTotalCapacityForRooms(homeStay.id, roomQuantity);
    if (guestCount > maxAllowed) {
      toast.error(`Maximum ${maxAllowed} guests allowed for ${roomQuantity} room(s). Please book another room or reduce guest count.`);
      return;
    }

    setIsProcessing(true);

    try {
      const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const totalPrice = calculateTotalPrice();
      const checkOutDateTime = calculateCheckOutDateTime();

      const newBooking = {
        id: bookingId,
        userId: 'customer-session', // Session-based user
        customerName,
        customerPhone,
        hotelId: hotel.id,
        hotelName: hotel.name,
        homeStayId: homeStay.id,
        homeStayName: homeStay.name,
        checkInDate: checkInDateTime,
        checkOutDate: checkOutDateTime,
        guests: guestCount,
        totalPrice,
        status: 'pending' as const,
        bookingDate: new Date().toISOString(),
        paymentMethod: 'upi' as const,
        roomQuantity,
      };

      const bookings = getBookings();
      bookings.push(newBooking);
      saveBookings(bookings);

      addNotification(`New booking: ${homeStay.name} by ${customerName} (${customerPhone}) - ${roomQuantity} room(s), 12-hour stay`, 'booking');
      addPermanentNotification(
        `New booking: ${homeStay.name} by ${customerName} (${customerPhone}) - ${roomQuantity} room(s), 12-hour stay`,
        'bookings',
        'booking'
      );
      updateAnalytics('bookings');

      toast.success('Booking created! Proceeding to payment...');
      
      // Simulate payment processing
      setTimeout(() => {
        navigate({ to: '/confirmation/$bookingId', params: { bookingId } });
      }, 1000);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!homeStay || !hotel) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const checkOutDateTime = calculateCheckOutDateTime();

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Complete Your Booking
          </h1>
          <p className="text-muted-foreground text-lg">
            Fill in your details to confirm your 12-hour reservation
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card shadow-saffron">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={customerName}
                    disabled
                    className="glass-card bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={customerPhone}
                    disabled
                    className="glass-card bg-muted"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-saffron">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkInDate">Check-in Date</Label>
                    <Input
                      id="checkInDate"
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="glass-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkInTime">Check-in Time</Label>
                    <Input
                      id="checkInTime"
                      type="time"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="glass-card"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">12-hour stay duration</span>
                  </div>
                  {checkOutDateTime && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Check-out: {new Date(checkOutDateTime).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="roomQuantity">Number of Rooms</Label>
                    <Input
                      id="roomQuantity"
                      type="number"
                      min="1"
                      max={availableRooms}
                      value={roomQuantity}
                      onChange={(e) => setRoomQuantity(Math.max(1, Math.min(availableRooms, parseInt(e.target.value) || 1)))}
                      className="glass-card"
                    />
                    <p className="text-xs text-muted-foreground">
                      {availableRooms} room(s) available
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guests">Number of Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max={maxGuests}
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="glass-card"
                    />
                    <p className="text-xs text-muted-foreground">
                      Max {maxGuests} guests for {roomQuantity} room(s)
                    </p>
                  </div>
                </div>

                {parseInt(guests) > maxGuests && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-destructive">Guest limit exceeded</p>
                        <p className="text-muted-foreground mt-1">
                          Maximum {maxGuests} guests allowed for {roomQuantity} room(s). Please book another room or reduce guest count.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="glass-card shadow-saffron sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{homeStay.name}</h3>
                  <p className="text-sm text-muted-foreground">{hotel.name}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Room(s)</span>
                    <span className="font-medium">{roomQuantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guests</span>
                    <span className="font-medium">{guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">12 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per room</span>
                    <span className="font-medium">₹{homeStay.fixedPrice || homeStay.minPrice}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">₹{totalPrice}</span>
                  </div>
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={isProcessing || !checkInDate || !checkInTime || parseInt(guests) > maxGuests || availableRooms < roomQuantity}
                  className="w-full gradient-saffron-gold text-white border-0 hover:opacity-90 gap-2"
                  size="lg"
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By proceeding, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
