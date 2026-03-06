import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import {
  MapPin,
  Star,
  Phone,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Wind,
  Tv,
  RefreshCw,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetHomeStayDetails } from '../hooks/useQueries';

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-4 h-4" />,
  Parking: <Car className="w-4 h-4" />,
  Breakfast: <Coffee className="w-4 h-4" />,
  Restaurant: <Utensils className="w-4 h-4" />,
  AC: <Wind className="w-4 h-4" />,
  TV: <Tv className="w-4 h-4" />,
};

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="w-full h-80 rounded-2xl" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export default function RoomDetailPage() {
  const { roomId } = useParams({ from: '/room/$roomId' });
  const navigate = useNavigate();
  const [photoIndex, setPhotoIndex] = useState(0);

  const { data: room, isLoading, isError, refetch } = useGetHomeStayDetails(roomId);

  const photos: string[] = [
    ...(room?.photoUrls ?? []),
    ...(room?.photos?.map((p) => p.getDirectURL()) ?? []),
  ].filter(Boolean);

  if (photos.length === 0) {
    photos.push('/assets/generated/standard-room.dim_800x600.jpg');
  }

  const prevPhoto = () => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
  const nextPhoto = () => setPhotoIndex((i) => (i + 1) % photos.length);

  const avgRating =
    room && room.ratings.length > 0
      ? (room.ratings.reduce((a, b) => a + Number(b), 0) / room.ratings.length).toFixed(1)
      : null;

  if (isLoading) return <DetailSkeleton />;

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-destructive text-lg">Failed to load room details.</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
        <Button variant="ghost" onClick={() => navigate({ to: '/browse-rooms' })}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Browse
        </Button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <Home className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold text-foreground">Room Not Found</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          This room may have been removed or is no longer available.
        </p>
        <Button onClick={() => navigate({ to: '/browse-rooms' })}>Browse All Rooms</Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Back button */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/browse-rooms' })}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Browse
        </Button>
      </div>

      {/* Photo carousel */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden bg-muted">
          <img
            src={photos[photoIndex]}
            alt={`Room photo ${photoIndex + 1}`}
            className="w-full h-80 md:h-[420px] object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                '/assets/generated/standard-room.dim_800x600.jpg';
            }}
          />
          {photos.length > 1 && (
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
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === photoIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute top-4 left-4">
            <Badge
              variant={room.availability ? 'default' : 'secondary'}
              className={room.availability ? 'bg-primary text-primary-foreground' : ''}
            >
              {room.availability ? 'Available' : 'Unavailable'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="max-w-4xl mx-auto px-4 mt-6 grid md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 space-y-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-3xl font-bold text-foreground">{room.partnerName || 'Homestay'}</h1>
              {avgRating && (
                <div className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full shrink-0">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-sm">{avgRating}</span>
                  <span className="text-xs text-muted-foreground">({room.ratings.length})</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="capitalize">
                {room.roomType}
              </Badge>
              {room.distanceFromTemple != null && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {Number(room.distanceFromTemple)} m from temple
                </span>
              )}
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">{room.description}</p>

          {room.ownerMessage && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-sm font-medium text-primary mb-1">Message from Owner</p>
              <p className="text-sm text-foreground">{room.ownerMessage}</p>
            </div>
          )}

          {/* Amenities */}
          {room.amenities.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground mb-3">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {room.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="text-primary">{amenityIcons[amenity] || null}</span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Maps */}
          {room.googleMapsLink && (
            <div>
              <h2 className="font-semibold text-foreground mb-2">Location</h2>
              <a
                href={room.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <MapPin className="w-4 h-4" /> View on Google Maps
              </a>
            </div>
          )}
        </div>

        {/* Booking card */}
        <div className="md:col-span-1">
          <div className="sticky top-24 bg-card border border-border rounded-2xl p-5 shadow-saffron space-y-4">
            <div>
              <span className="text-3xl font-bold text-primary">
                ₹{Number(room.price).toLocaleString()}
              </span>
              <span className="text-muted-foreground text-sm">/night</span>
            </div>

            {room.partnerPhoneNumber && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>{room.partnerPhoneNumber}</span>
              </div>
            )}

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!room.availability}
              onClick={() =>
                navigate({ to: '/booking/$roomId', params: { roomId: room.id } })
              }
            >
              {room.availability ? 'Book Now' : 'Not Available'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              No payment required upfront
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
