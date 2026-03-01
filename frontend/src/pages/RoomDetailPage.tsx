import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { HomeStay } from '../backend';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Phone, Star, ArrowLeft, ChevronLeft, ChevronRight, Wifi, Car, Coffee, Utensils, Wind, Tv, Bath, Shield } from 'lucide-react';

function useGetHomeStayDetails(homeStayId: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<HomeStay | null>({
    queryKey: ['homestayDetails', homeStayId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getHomeStayDetails(homeStayId);
    },
    enabled: !!actor && !actorFetching && !!homeStayId,
  });
}

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-4 h-4" />,
  'Parking': <Car className="w-4 h-4" />,
  'Breakfast': <Coffee className="w-4 h-4" />,
  'Restaurant': <Utensils className="w-4 h-4" />,
  'AC': <Wind className="w-4 h-4" />,
  'TV': <Tv className="w-4 h-4" />,
  'Bathroom': <Bath className="w-4 h-4" />,
  'Security': <Shield className="w-4 h-4" />,
};

export default function RoomDetailPage() {
  const params = useParams({ strict: false }) as { roomId?: string };
  const roomId = params.roomId || '';
  const navigate = useNavigate();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: homeStay, isLoading, error } = useGetHomeStayDetails(roomId);

  const allPhotos: string[] = [];
  if (homeStay) {
    if (homeStay.photoUrls && homeStay.photoUrls.length > 0) {
      allPhotos.push(...homeStay.photoUrls);
    }
    if (homeStay.photos && homeStay.photos.length > 0) {
      homeStay.photos.forEach(p => {
        const url = p.getDirectURL();
        if (url && !allPhotos.includes(url)) allPhotos.push(url);
      });
    }
  }

  const prevPhoto = () => setCurrentPhotoIndex(i => (i - 1 + allPhotos.length) % allPhotos.length);
  const nextPhoto = () => setCurrentPhotoIndex(i => (i + 1) % allPhotos.length);

  const avgRating = homeStay && homeStay.ratings && homeStay.ratings.length > 0
    ? homeStay.ratings.reduce((a, b) => a + Number(b), 0) / homeStay.ratings.length
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Skeleton className="h-64 w-full rounded-xl mb-6" />
          <Skeleton className="h-6 w-48 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !homeStay) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Room Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The homestay you're looking for doesn't exist or may have been removed.
          </p>
          <Button onClick={() => navigate({ to: '/browse-rooms' })} className="bg-primary text-primary-foreground">
            Browse Available Rooms
          </Button>
        </div>
      </div>
    );
  }

  const priceDisplay = Number(homeStay.price);
  const roomTypeLabel = String(homeStay.roomType) === 'single' ? 'Single Room'
    : String(homeStay.roomType) === 'double' ? 'Double Room'
    : String(homeStay.roomType) === 'suite' ? 'Suite'
    : String(homeStay.roomType);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate({ to: '/browse-rooms' })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </button>

        {/* Photo Carousel */}
        <div className="relative rounded-2xl overflow-hidden mb-8 bg-muted aspect-video">
          {allPhotos.length > 0 ? (
            <>
              <img
                src={allPhotos[currentPhotoIndex]}
                alt={`Photo ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {allPhotos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allPhotos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPhotoIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-5xl mb-2">🏠</div>
                <p>No photos available</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Section */}
        {homeStay.videoUrls && homeStay.videoUrls.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-3">Videos</h3>
            <div className="grid gap-4">
              {homeStay.videoUrls.map((url, i) => (
                <video key={i} src={url} controls className="w-full rounded-xl" />
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {homeStay.partnerName || 'Homestay'}
                </h1>
                <Badge variant={homeStay.availability ? 'default' : 'destructive'}>
                  {homeStay.availability ? 'Available' : 'Not Available'}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {roomTypeLabel}
                </span>
                {avgRating !== null && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {avgRating.toFixed(1)} ({homeStay.ratings.length} reviews)
                  </span>
                )}
                {homeStay.distanceFromTemple && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {Number(homeStay.distanceFromTemple)}m from temple
                  </span>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed">{homeStay.description}</p>
            </div>

            {/* Amenities */}
            {homeStay.amenities && homeStay.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {homeStay.amenities.map((amenity, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-sm"
                    >
                      {amenityIcons[amenity] || null}
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Owner Message */}
            {homeStay.ownerMessage && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-primary mb-1">Message from Owner</h3>
                <p className="text-muted-foreground text-sm">{homeStay.ownerMessage}</p>
              </div>
            )}

            {/* Google Maps */}
            {homeStay.googleMapsLink && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Location</h3>
                <a
                  href={homeStay.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <MapPin className="w-4 h-4" />
                  View on Google Maps
                </a>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="md:col-span-1">
            <div className="sticky top-6 bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-primary mb-1">
                ₹{priceDisplay.toLocaleString()}
              </div>
              <p className="text-muted-foreground text-sm mb-4">per night</p>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{homeStay.partnerPhoneNumber || 'Contact on booking'}</span>
                </div>
                {homeStay.partnerName && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Hosted by {homeStay.partnerName}</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!homeStay.availability}
                onClick={() => navigate({ to: '/booking/$roomId', params: { roomId: homeStay.id } })}
              >
                {homeStay.availability ? 'Book Now' : 'Not Available'}
              </Button>

              {!homeStay.availability && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  This room is currently not available for booking.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
