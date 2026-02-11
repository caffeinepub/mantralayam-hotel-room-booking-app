import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Edit, Hotel as HotelIcon, MapPin, Star, Phone, User, MessageSquare, DoorOpen } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { getHotels, saveHotels, getAverageRating, type Hotel as HotelType } from '../../lib/dataStorage';

export default function HotelManagement() {
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelType | null>(null);

  // Form state - Extended with all HomeStay fields
  const [hotelName, setHotelName] = useState('');
  const [hotelAddress, setHotelAddress] = useState('');
  const [hotelDescription, setHotelDescription] = useState('');
  const [hotelAmenities, setHotelAmenities] = useState('');
  const [hotelPhotos, setHotelPhotos] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [partnerPhoneNumber, setPartnerPhoneNumber] = useState('');
  const [distanceFromTemple, setDistanceFromTemple] = useState('');
  const [photoUrls, setPhotoUrls] = useState('');
  const [videoUrls, setVideoUrls] = useState('');
  const [ratings, setRatings] = useState('');
  const [ownerMessage, setOwnerMessage] = useState('');
  const [roomCount, setRoomCount] = useState('');
  const [adminOverride, setAdminOverride] = useState(false);

  useEffect(() => {
    loadHotels();
    
    const handleHotelsUpdated = () => {
      loadHotels();
    };
    
    window.addEventListener('hotelsUpdated', handleHotelsUpdated);
    return () => window.removeEventListener('hotelsUpdated', handleHotelsUpdated);
  }, []);

  const loadHotels = () => {
    setHotels(getHotels());
  };

  const resetForm = () => {
    setHotelName('');
    setHotelAddress('');
    setHotelDescription('');
    setHotelAmenities('');
    setHotelPhotos('');
    setGoogleMapsLink('');
    setPartnerName('');
    setPartnerPhoneNumber('');
    setDistanceFromTemple('');
    setPhotoUrls('');
    setVideoUrls('');
    setRatings('');
    setOwnerMessage('');
    setRoomCount('');
    setAdminOverride(false);
    setEditingHotel(null);
  };

  const handleOpenDialog = (hotel?: HotelType) => {
    if (hotel) {
      setEditingHotel(hotel);
      setHotelName(hotel.name);
      setHotelAddress(hotel.address);
      setHotelDescription(hotel.description);
      setHotelAmenities(hotel.amenities.join(', '));
      setHotelPhotos(hotel.photos.join('\n'));
      setGoogleMapsLink(hotel.googleMapsLink || '');
      setPartnerName(hotel.partnerName || '');
      setPartnerPhoneNumber(hotel.partnerPhoneNumber || '');
      setDistanceFromTemple(hotel.distanceFromTemple?.toString() || '');
      setPhotoUrls(hotel.photoUrls?.join('\n') || '');
      setVideoUrls(hotel.videoUrls?.join('\n') || '');
      setRatings(hotel.ratings?.join(', ') || '');
      setOwnerMessage(hotel.ownerMessage || '');
      setRoomCount(hotel.roomCount?.toString() || '');
      setAdminOverride(hotel.adminOverrideAvailability || false);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSaveHotel = () => {
    if (!hotelName.trim()) {
      toast.error('Hotel name is required');
      return;
    }
    if (!partnerName.trim()) {
      toast.error('Partner name is required');
      return;
    }
    if (!partnerPhoneNumber.trim()) {
      toast.error('Partner phone number is required');
      return;
    }
    if (!roomCount || parseInt(roomCount) < 1) {
      toast.error('Room count must be at least 1');
      return;
    }

    const parsedRatings = ratings
      .split(',')
      .map(r => parseInt(r.trim()))
      .filter(r => !isNaN(r) && r >= 1 && r <= 5);

    const hotelData: HotelType = {
      id: editingHotel?.id || `hotel-${Date.now()}`,
      name: hotelName,
      address: hotelAddress,
      description: hotelDescription,
      amenities: hotelAmenities.split(',').map(a => a.trim()).filter(Boolean),
      photos: hotelPhotos.split('\n').map(p => p.trim()).filter(Boolean),
      googleMapsLink: googleMapsLink.trim() || undefined,
      partnerName: partnerName.trim(),
      partnerPhoneNumber: partnerPhoneNumber.trim(),
      distanceFromTemple: distanceFromTemple ? parseFloat(distanceFromTemple) : undefined,
      photoUrls: photoUrls.split('\n').map(p => p.trim()).filter(Boolean),
      videoUrls: videoUrls.split('\n').map(v => v.trim()).filter(Boolean),
      ratings: parsedRatings.length > 0 ? parsedRatings : [4, 4, 5],
      ownerMessage: ownerMessage.trim() || 'Welcome to our hotel.',
      roomCount: parseInt(roomCount),
      adminOverrideAvailability: adminOverride ? adminOverride : undefined,
      ownerType: 'admin',
    };

    let updatedHotels: HotelType[];
    if (editingHotel) {
      updatedHotels = hotels.map(h => h.id === editingHotel.id ? hotelData : h);
      toast.success('Hotel updated successfully');
    } else {
      updatedHotels = [...hotels, hotelData];
      toast.success('Hotel added successfully');
    }

    saveHotels(updatedHotels);
    setHotels(updatedHotels);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteHotel = (hotelId: string) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    const updatedHotels = hotels.filter(h => h.id !== hotelId);
    saveHotels(updatedHotels);
    setHotels(updatedHotels);
    toast.success('Hotel deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Hotel Management</h2>
          <p className="text-sm text-slate-400 mt-1">Manage your hotel properties with complete details</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()}
              className="gradient-saffron-gold text-white border-0 hover:opacity-90 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-slate-100 text-xl">
                {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <HotelIcon className="h-5 w-5 text-primary" />
                  Basic Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="hotelName" className="text-slate-300">Hotel Name *</Label>
                    <Input
                      id="hotelName"
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                      placeholder="Enter hotel name"
                      className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hotelAddress" className="text-slate-300">Address</Label>
                    <Input
                      id="hotelAddress"
                      value={hotelAddress}
                      onChange={(e) => setHotelAddress(e.target.value)}
                      placeholder="Enter address"
                      className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotelDescription" className="text-slate-300">Description</Label>
                  <Textarea
                    id="hotelDescription"
                    value={hotelDescription}
                    onChange={(e) => setHotelDescription(e.target.value)}
                    placeholder="Enter hotel description"
                    className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                    rows={3}
                  />
                </div>
              </div>

              {/* Partner Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Partner Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="partnerName" className="text-slate-300">Partner Name *</Label>
                    <Input
                      id="partnerName"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Enter partner name"
                      className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerPhoneNumber" className="text-slate-300 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      Partner Phone Number *
                    </Label>
                    <Input
                      id="partnerPhoneNumber"
                      value={partnerPhoneNumber}
                      onChange={(e) => setPartnerPhoneNumber(e.target.value)}
                      placeholder="+91 9876543210"
                      className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location Details
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="googleMapsLink" className="text-slate-300">Google Maps Link</Label>
                    <Input
                      id="googleMapsLink"
                      value={googleMapsLink}
                      onChange={(e) => setGoogleMapsLink(e.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                      className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distanceFromTemple" className="text-slate-300">Distance from Temple (km)</Label>
                    <Input
                      id="distanceFromTemple"
                      type="number"
                      step="0.1"
                      value={distanceFromTemple}
                      onChange={(e) => setDistanceFromTemple(e.target.value)}
                      placeholder="0.5"
                      className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Room Management */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <DoorOpen className="h-5 w-5 text-primary" />
                  Room Management
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="roomCount" className="text-slate-300">Total Room Count *</Label>
                    <Input
                      id="roomCount"
                      type="number"
                      min="1"
                      value={roomCount}
                      onChange={(e) => setRoomCount(e.target.value)}
                      placeholder="10"
                      className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminOverride" className="text-slate-300">Admin Override Availability</Label>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <Switch
                        id="adminOverride"
                        checked={adminOverride}
                        onCheckedChange={setAdminOverride}
                      />
                      <span className="text-sm text-slate-400">
                        {adminOverride ? 'Manually controlled' : 'Auto-managed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities and Ratings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Amenities & Ratings
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="hotelAmenities" className="text-slate-300">Amenities (comma-separated)</Label>
                  <Input
                    id="hotelAmenities"
                    value={hotelAmenities}
                    onChange={(e) => setHotelAmenities(e.target.value)}
                    placeholder="WiFi, AC, Parking, etc."
                    className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ratings" className="text-slate-300">Ratings (comma-separated, 1-5)</Label>
                  <Input
                    id="ratings"
                    value={ratings}
                    onChange={(e) => setRatings(e.target.value)}
                    placeholder="5, 4, 5, 5, 4"
                    className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              {/* Media */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200">Media</h3>
                <div className="space-y-2">
                  <Label htmlFor="photoUrls" className="text-slate-300">Photo URLs (one per line)</Label>
                  <Textarea
                    id="photoUrls"
                    value={photoUrls}
                    onChange={(e) => setPhotoUrls(e.target.value)}
                    placeholder="https://example.com/photo1.jpg"
                    className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoUrls" className="text-slate-300">Video URLs (one per line)</Label>
                  <Textarea
                    id="videoUrls"
                    value={videoUrls}
                    onChange={(e) => setVideoUrls(e.target.value)}
                    placeholder="https://example.com/video1.mp4"
                    className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                    rows={2}
                  />
                </div>
              </div>

              {/* Owner Message */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Owner Message
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="ownerMessage" className="text-slate-300">Personal Message to Guests</Label>
                  <Textarea
                    id="ownerMessage"
                    value={ownerMessage}
                    onChange={(e) => setOwnerMessage(e.target.value)}
                    placeholder="Welcome message for guests..."
                    className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveHotel}
                className="gradient-saffron-gold text-white border-0 hover:opacity-90"
              >
                {editingHotel ? 'Update Hotel' : 'Add Hotel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {hotels.length === 0 ? (
        <Card className="glass-card bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <HotelIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-slate-100">No Hotels Yet</h3>
            <p className="text-slate-400 mb-4">Add your first hotel to get started</p>
            <Button 
              onClick={() => handleOpenDialog()}
              className="gradient-saffron-gold text-white border-0 hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Hotel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hotels.map((hotel) => (
            <Card key={hotel.id} className="glass-card bg-slate-900/50 border-slate-800 hover:shadow-saffron-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-slate-100 mb-2">{hotel.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <MapPin className="h-4 w-4" />
                      <span>{hotel.address}</span>
                    </div>
                    {hotel.distanceFromTemple && (
                      <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                        <span>{hotel.distanceFromTemple} km from temple</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleOpenDialog(hotel)}
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-slate-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteHotel(hotel.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-300 line-clamp-2">{hotel.description}</p>
                
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium text-slate-200">
                    {getAverageRating(hotel.ratings)} ({hotel.ratings.length} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <DoorOpen className="h-4 w-4" />
                  <span>{hotel.roomCount} rooms</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <User className="h-4 w-4" />
                  <span>{hotel.partnerName}</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs bg-slate-800 text-slate-300">
                      {amenity}
                    </Badge>
                  ))}
                  {hotel.amenities.length > 3 && (
                    <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-300">
                      +{hotel.amenities.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
