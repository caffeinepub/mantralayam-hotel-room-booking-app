import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { HomeStay } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Star, Wifi, Car, Coffee, Wind, Phone, Filter } from 'lucide-react';
import CustomerInfoModal from '../components/CustomerInfoModal';
import { getCustomerSession, setCustomerSession } from '../lib/dataStorage';
import { upsertCustomer } from '../lib/customerStorage';

function useGetAvailableHomeStays() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<HomeStay[]>({
    queryKey: ['availableHomestays'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableHomeStays();
    },
    enabled: !!actor && !actorFetching,
  });
}

const amenityIcons: Record<string, React.ReactNode> = {
  'WiFi': <Wifi className="w-3.5 h-3.5" />,
  'Parking': <Car className="w-3.5 h-3.5" />,
  'Breakfast': <Coffee className="w-3.5 h-3.5" />,
  'AC': <Wind className="w-3.5 h-3.5" />,
};

export default function BrowseRoomsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);

  const { data: homeStays = [], isLoading } = useGetAvailableHomeStays();

  const filteredRooms = homeStays.filter(room => {
    const matchesSearch = !searchQuery ||
      room.partnerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.amenities?.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || String(room.roomType) === selectedType;

    return matchesSearch && matchesType;
  });

  const handleRoomClick = (roomId: string) => {
    navigate({ to: '/room/$roomId', params: { roomId } });
  };

  const handleBookNow = (roomId: string) => {
    const session = getCustomerSession();
    if (!session) {
      setPendingRoomId(roomId);
      setShowCustomerModal(true);
    } else {
      navigate({ to: '/booking/$roomId', params: { roomId } });
    }
  };

  const handleCustomerInfoSubmit = (name: string, phone: string) => {
    setCustomerSession(name, phone);
    upsertCustomer(name, phone);
    setShowCustomerModal(false);
    if (pendingRoomId) {
      navigate({ to: '/booking/$roomId', params: { roomId: pendingRoomId } });
      setPendingRoomId(null);
    }
  };

  const getRoomTypeLabel = (type: string) => {
    if (type === 'single') return 'Single';
    if (type === 'double') return 'Double';
    if (type === 'suite') return 'Suite';
    return type;
  };

  const getAvgRating = (ratings: bigint[]) => {
    if (!ratings || ratings.length === 0) return null;
    return ratings.reduce((a, b) => a + Number(b), 0) / ratings.length;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Browse Homestays
          </h1>
          <p className="text-muted-foreground mb-8">
            Find comfortable accommodations near Mantralayam Temple
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, amenities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {['all', 'single', 'double', 'suite'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {type === 'all' ? 'All Types' : getRoomTypeLabel(type)}
            </button>
          ))}
          <span className="ml-auto text-sm text-muted-foreground">
            {filteredRooms.length} {filteredRooms.length === 1 ? 'room' : 'rooms'} found
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredRooms.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Rooms Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedType !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'No homestays are currently available.'}
            </p>
          </div>
        )}

        {/* Room Cards */}
        {!isLoading && filteredRooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => {
              const avgRating = getAvgRating(room.ratings);
              const photoUrl = room.photoUrls?.[0] || room.photos?.[0]?.getDirectURL();

              return (
                <div
                  key={room.id}
                  className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow group"
                >
                  {/* Photo */}
                  <div
                    className="relative h-48 bg-muted cursor-pointer overflow-hidden"
                    onClick={() => handleRoomClick(room.id)}
                  >
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={room.partnerName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <div className="text-4xl mb-1">🏠</div>
                          <p className="text-xs">No photo</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant={room.availability ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {room.availability ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        {getRoomTypeLabel(String(room.roomType))}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors line-clamp-1"
                        onClick={() => handleRoomClick(room.id)}
                      >
                        {room.partnerName || 'Homestay'}
                      </h3>
                      {avgRating !== null && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {room.description || 'Comfortable homestay near Mantralayam Temple.'}
                    </p>

                    {/* Amenities */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {room.amenities.slice(0, 4).map((amenity, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1 bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full"
                          >
                            {amenityIcons[amenity] || null}
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 4 && (
                          <span className="text-xs text-muted-foreground">+{room.amenities.length - 4} more</span>
                        )}
                      </div>
                    )}

                    {/* Distance & Contact */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                      {room.distanceFromTemple && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {Number(room.distanceFromTemple)}m from temple
                        </span>
                      )}
                      {room.partnerPhoneNumber && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {room.partnerPhoneNumber}
                        </span>
                      )}
                    </div>

                    {/* Price & Book */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-primary">
                          ₹{Number(room.price).toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">/night</span>
                      </div>
                      <Button
                        size="sm"
                        disabled={!room.availability}
                        onClick={() => handleBookNow(room.id)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Customer Info Modal */}
      <CustomerInfoModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSubmit={handleCustomerInfoSubmit}
      />
    </div>
  );
}
