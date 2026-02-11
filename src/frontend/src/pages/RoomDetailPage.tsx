import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, Bed, Calendar, ArrowRight, Phone, MessageSquare, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { getHomeStays, getHotels, type HomeStay, getHomeStayDisplayPrice, getAverageRating, getCustomerSession, getHomeStayBookingStats } from '../lib/dataStorage';
import CustomerInfoModal from '../components/CustomerInfoModal';

export default function RoomDetailPage() {
  const navigate = useNavigate();
  const { roomId } = useParams({ from: '/room/$roomId' });
  const [homeStay, setHomeStay] = useState<HomeStay | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  useEffect(() => {
    const session = getCustomerSession();
    if (!session || !session.verified) {
      toast.error('Please provide your details first');
      navigate({ to: '/browse-rooms' });
      return;
    }

    const homeStays = getHomeStays();
    const found = homeStays.find(h => h.id === roomId);
    
    if (!found) {
      toast.error('Homestay not found');
      navigate({ to: '/browse-rooms' });
      return;
    }

    setHomeStay(found);
  }, [roomId, navigate]);

  const handleBookNow = () => {
    if (!homeStay) return;
    
    const stats = getHomeStayBookingStats(homeStay.id);
    if (stats.availableRooms === 0) {
      toast.error('No rooms available at the moment');
      return;
    }

    navigate({ to: '/booking/$roomId', params: { roomId: homeStay.id } });
  };

  if (!homeStay) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const stats = getHomeStayBookingStats(homeStay.id);
  const allMedia = [...homeStay.photoUrls, ...homeStay.videoUrls];
  const avgRating = getAverageRating(homeStay.ratings);

  return (
    <div className="container py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Media Carousel */}
        <div className="mb-8">
          <Carousel className="w-full">
            <CarouselContent>
              {allMedia.map((url, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    {url.includes('youtube.com') || url.includes('youtu.be') || url.endsWith('.mp4') ? (
                      <video
                        src={url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={url}
                        alt={`${homeStay.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {allMedia.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card shadow-saffron">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{homeStay.name}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{homeStay.distanceFromTemple} km from temple</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{avgRating}</span>
                      <span className="text-muted-foreground">({homeStay.ratings.length} reviews)</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-muted-foreground">{homeStay.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Bed className="h-5 w-5 text-primary" />
                    Room Availability
                  </h3>
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Available Rooms</span>
                      <Badge className={stats.availableRooms > 0 ? 'gradient-saffron-gold text-white border-0' : 'bg-destructive text-white'}>
                        {stats.availableRooms} / {stats.totalRooms}
                      </Badge>
                    </div>
                    {stats.availableRooms === 0 && (
                      <p className="text-sm text-muted-foreground">
                        All rooms are currently booked. Please check back later.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {homeStay.amenities.map((amenity, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                {homeStay.ownerMessage && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Message from Owner
                    </h3>
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <p className="text-muted-foreground italic">{homeStay.ownerMessage}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Partner:</span>
                      <span className="font-medium">{homeStay.partnerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Phone:</span>
                      <a href={`tel:${homeStay.partnerPhoneNumber}`} className="font-medium text-primary hover:underline">
                        {homeStay.partnerPhoneNumber}
                      </a>
                    </div>
                  </div>
                </div>

                {homeStay.googleMapsLink && (
                  <div>
                    <Button
                      onClick={() => window.open(homeStay.googleMapsLink, '_blank')}
                      variant="outline"
                      className="gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      View on Google Maps
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="glass-card shadow-saffron sticky top-24">
              <CardHeader>
                <CardTitle>Book Your Stay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">12-hour stay</p>
                  <p className="text-3xl font-bold text-primary">
                    {getHomeStayDisplayPrice(homeStay)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">per room</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span>{homeStay.roomCount} total rooms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>12-hour duration</span>
                  </div>
                </div>

                <Button
                  onClick={handleBookNow}
                  disabled={stats.availableRooms === 0}
                  className="w-full gradient-saffron-gold text-white border-0 hover:opacity-90 gap-2"
                  size="lg"
                >
                  {stats.availableRooms === 0 ? 'Fully Booked' : 'Book Now'}
                  {stats.availableRooms > 0 && <ArrowRight className="h-4 w-4" />}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Free cancellation up to 24 hours before check-in
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CustomerInfoModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSubmit={(name, phone) => {
          setShowCustomerModal(false);
        }}
      />
    </div>
  );
}
