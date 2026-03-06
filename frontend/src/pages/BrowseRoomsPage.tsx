import React, { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, MapPin, Star, Wifi, Car, Coffee, Utensils, Wind, Tv, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import CustomerInfoModal from '../components/CustomerInfoModal';
import { useGetAvailableHomeStays } from '../hooks/useQueries';
import type { HomeStay } from '../backend';
import { setCustomerSession } from '../lib/dataStorage';

const amenityIcons: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-3 h-3" />,
  Parking: <Car className="w-3 h-3" />,
  Breakfast: <Coffee className="w-3 h-3" />,
  Restaurant: <Utensils className="w-3 h-3" />,
  AC: <Wind className="w-3 h-3" />,
  TV: <Tv className="w-3 h-3" />,
};

function RoomCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-saffron border border-border">
      <Skeleton className="w-full h-52" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  );
}

function RoomCard({ room, onBook }: { room: HomeStay; onBook: (room: HomeStay) => void }) {
  const navigate = useNavigate();
  const price = Number(room.price);
  const avgRating =
    room.ratings.length > 0
      ? (room.ratings.reduce((a, b) => a + Number(b), 0) / room.ratings.length).toFixed(1)
      : null;

  const photoUrl =
    room.photoUrls?.[0] ||
    (room.photos?.[0] ? room.photos[0].getDirectURL() : null) ||
    '/assets/generated/standard-room.dim_800x600.jpg';

  const handleImageClick = () => {
    navigate({ to: '/room/$roomId', params: { roomId: room.id } });
  };

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-saffron border border-border hover:shadow-saffron-lg transition-all duration-300 group">
      <div className="relative overflow-hidden cursor-pointer" onClick={handleImageClick}>
        <img
          src={photoUrl}
          alt={room.partnerName || 'Room'}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/generated/standard-room.dim_800x600.jpg';
          }}
        />
        <div className="absolute top-3 left-3">
          <Badge
            variant={room.availability ? 'default' : 'secondary'}
            className={room.availability ? 'bg-primary text-primary-foreground' : ''}
          >
            {room.availability ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
        {avgRating && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {avgRating}
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1">
          {room.partnerName || 'Homestay'}
        </h3>
        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{room.description}</p>

        {room.distanceFromTemple != null && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="w-3 h-3 text-primary" />
            <span>{Number(room.distanceFromTemple)} m from temple</span>
          </div>
        )}

        {room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {room.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
              >
                {amenityIcons[amenity] || null}
                {amenity}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="text-xs text-muted-foreground px-2 py-0.5">
                +{room.amenities.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <span className="text-2xl font-bold text-primary">₹{price.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm">/night</span>
          </div>
          <Button
            size="sm"
            onClick={() => onBook(room)}
            disabled={!room.availability}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BrowseRoomsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<HomeStay | null>(null);

  const { data: homestays = [], isLoading, isError, refetch, isFetching } = useGetAvailableHomeStays();

  const filteredRooms = homestays.filter((room) => {
    const matchesSearch =
      !searchQuery ||
      room.partnerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.amenities.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      selectedRoomType === 'all' ||
      (selectedRoomType === 'single' && room.roomType === 'single') ||
      (selectedRoomType === 'double' && room.roomType === 'double') ||
      (selectedRoomType === 'suite' && room.roomType === 'suite');

    return matchesSearch && matchesType;
  });

  const handleBookRoom = useCallback((room: HomeStay) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  }, []);

  const handleModalSubmit = useCallback(
    (name: string, phone: string) => {
      setCustomerSession(name, phone);
      setIsModalOpen(false);
      if (selectedRoom) {
        navigate({ to: '/booking/$roomId', params: { roomId: selectedRoom.id } });
      }
    },
    [selectedRoom, navigate]
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-3">Browse Homestays</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Find comfortable stays near Mantralayam Temple
          </p>

          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by name, amenities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full border-border bg-card shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3 overflow-x-auto">
          {['all', 'single', 'double', 'suite'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedRoomType(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedRoomType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {type === 'all' ? 'All Rooms' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2 shrink-0">
            {isFetching && !isLoading && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Updating…
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-xs">
              <RefreshCw className="w-3 h-3 mr-1" /> Refresh
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <RoomCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-destructive text-lg mb-4">Failed to load rooms. Please try again.</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry
            </Button>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {searchQuery || selectedRoomType !== 'all'
                ? 'No rooms match your search. Try different filters.'
                : 'No rooms available at the moment. Please check back soon.'}
            </p>
            {(searchQuery || selectedRoomType !== 'all') && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedRoomType('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="text-muted-foreground text-sm mb-6">
              {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} onBook={handleBookRoom} />
              ))}
            </div>
          </>
        )}
      </section>

      <CustomerInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </main>
  );
}
