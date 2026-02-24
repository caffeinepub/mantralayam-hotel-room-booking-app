import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Star, Bed } from 'lucide-react';
import { getHomeStays, getHotels, type HomeStay, type Hotel, getHomeStayDisplayPrice, getCustomerSession, setCustomerSession, updateAnalytics, getHomeStayBookingStats } from '../lib/dataStorage';
import { upsertCustomer } from '../lib/customerStorage';
import CustomerInfoModal from '../components/CustomerInfoModal';

export default function BrowseRoomsPage() {
  const navigate = useNavigate();
  const [homeStays, setHomeStays] = useState<HomeStay[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    updateAnalytics('homeStayViews');

    const handleUpdate = () => loadData();
    window.addEventListener('homeStaysUpdated', handleUpdate);
    window.addEventListener('hotelsUpdated', handleUpdate);
    window.addEventListener('bookingsUpdated', handleUpdate);

    // Refresh availability every 30 seconds
    const interval = setInterval(loadData, 30000);

    return () => {
      window.removeEventListener('homeStaysUpdated', handleUpdate);
      window.removeEventListener('hotelsUpdated', handleUpdate);
      window.removeEventListener('bookingsUpdated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const loadData = () => {
    const allHomeStays = getHomeStays();
    const availableHomeStays = allHomeStays.filter(h => h.availability);
    setHomeStays(availableHomeStays);
    setHotels(getHotels());
  };

  const handleRoomClick = (roomId: string) => {
    const session = getCustomerSession();
    if (!session || !session.verified) {
      setSelectedRoomId(roomId);
      setShowCustomerModal(true);
    } else {
      navigate({ to: '/room/$roomId', params: { roomId } });
    }
  };

  const handleCustomerInfoSubmit = (name: string, phone: string) => {
    // Save to session
    setCustomerSession(name, phone);
    
    // Save to permanent customer storage (idempotent)
    upsertCustomer(name, phone);
    
    setShowCustomerModal(false);
    
    if (selectedRoomId) {
      navigate({ to: '/room/$roomId', params: { roomId: selectedRoomId } });
    }
  };

  const getHotelName = (hotelId: string) => {
    const hotel = hotels.find(h => h.id === hotelId);
    return hotel?.name || 'Unknown Hotel';
  };

  const getAverageRating = (ratings: number[]) => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const filteredHomeStays = homeStays.filter(homeStay => {
    const query = searchQuery.toLowerCase();
    const hotelName = getHotelName(homeStay.hotelId).toLowerCase();
    return (
      homeStay.name.toLowerCase().includes(query) ||
      homeStay.description.toLowerCase().includes(query) ||
      hotelName.includes(query) ||
      homeStay.amenities.some(a => a.toLowerCase().includes(query))
    );
  });

  return (
    <div className="container py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Browse Homestays
        </h1>
        <p className="text-muted-foreground text-lg">
          Find your perfect accommodation near the temple
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, hotel, amenities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-card"
          />
        </div>
      </div>

      {/* Results */}
      {filteredHomeStays.length === 0 ? (
        <Card className="glass-card shadow-saffron">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No homestays found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search criteria' : 'No homestays available at the moment'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHomeStays.map((homeStay) => {
            const stats = getHomeStayBookingStats(homeStay.id);
            return (
              <Card
                key={homeStay.id}
                className="glass-card shadow-saffron hover:shadow-saffron-lg transition-all cursor-pointer group"
                onClick={() => handleRoomClick(homeStay.id)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={homeStay.photoUrls[0] || homeStay.photos[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'}
                    alt={homeStay.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className={`${stats.availableRooms > 0 ? 'gradient-saffron-gold text-white border-0' : 'bg-destructive text-white'}`}>
                      {stats.availableRooms}/{stats.totalRooms} Available
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{homeStay.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{getHotelName(homeStay.hotelId)}</p>
                    </div>
                  </div>
                  {homeStay.distanceFromTemple && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                      <MapPin className="h-4 w-4" />
                      <span>{homeStay.distanceFromTemple} km from temple</span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {homeStay.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">
                      {getAverageRating(homeStay.ratings)} ({homeStay.ratings.length} reviews)
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>{homeStay.roomCount} rooms</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {homeStay.amenities.slice(0, 3).map((amenity, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {homeStay.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{homeStay.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">12-hour stay</p>
                      <p className="text-lg font-bold text-primary">
                        {getHomeStayDisplayPrice(homeStay)}
                      </p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoomClick(homeStay.id);
                      }}
                      className="gradient-saffron-gold text-white border-0 hover:opacity-90"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CustomerInfoModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSubmit={handleCustomerInfoSubmit}
      />
    </div>
  );
}
