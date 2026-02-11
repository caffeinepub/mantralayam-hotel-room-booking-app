import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, MapPin, CheckCircle, Key, Video, User, Phone, DollarSign } from 'lucide-react';
import { getRooms, saveRoom, deleteRoom, Room, getRoomDisplayPrice } from '../../lib/roomStorage';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminRoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    minPrice: '',
    maxPrice: '',
    fixedPrice: '',
    location: '',
    latitude: '',
    longitude: '',
    photos: '',
    videos: '',
    ownerName: '',
    ownerContact: '',
    description: '',
    availability: true,
    passcode: '',
    googleMapsLink: '',
    amenities: '',
  });

  useEffect(() => {
    loadRooms();
    
    const handleRoomsUpdated = () => {
      loadRooms();
    };
    
    window.addEventListener('roomsUpdated', handleRoomsUpdated);
    return () => window.removeEventListener('roomsUpdated', handleRoomsUpdated);
  }, []);

  const loadRooms = () => {
    const allRooms = getRooms();
    setRooms(allRooms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a room name');
      return;
    }

    if (!formData.passcode.trim()) {
      toast.error('Passcode is mandatory');
      return;
    }

    if (!formData.ownerName.trim()) {
      toast.error('Please enter room owner name');
      return;
    }

    if (!formData.ownerContact.trim()) {
      toast.error('Please enter room owner contact number');
      return;
    }

    // Validate phone number format (basic validation for 10 digits)
    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (!phoneRegex.test(formData.ownerContact.trim())) {
      toast.error('Please enter a valid phone number (10-15 digits)');
      return;
    }

    // Validate fixed price if provided
    const fixedPriceValue = formData.fixedPrice.trim() ? Number(formData.fixedPrice) : undefined;
    if (fixedPriceValue !== undefined && (isNaN(fixedPriceValue) || fixedPriceValue <= 0)) {
      toast.error('Fixed price must be a positive number');
      return;
    }

    const room: Room = {
      id: editingRoom?.id || `room-${Date.now()}`,
      name: formData.name,
      minPrice: Number(formData.minPrice) || 0,
      maxPrice: Number(formData.maxPrice) || 0,
      fixedPrice: fixedPriceValue,
      location: formData.location,
      photos: formData.photos.split(',').map(p => p.trim()).filter(Boolean),
      videos: formData.videos.split(',').map(v => v.trim()).filter(Boolean),
      ownerName: formData.ownerName.trim(),
      ownerContact: formData.ownerContact.trim(),
      description: formData.description,
      availability: formData.availability,
      passcode: formData.passcode.trim(),
      amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
    };

    try {
      saveRoom(room);
      toast.success(editingRoom ? 'Room updated successfully!' : 'Room added successfully!');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Room operation error:', error);
      toast.error('Failed to save room');
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      minPrice: room.minPrice.toString(),
      maxPrice: room.maxPrice.toString(),
      fixedPrice: room.fixedPrice?.toString() || '',
      location: room.location,
      latitude: '0',
      longitude: '0',
      photos: room.photos.join(', '),
      videos: room.videos.join(', '),
      ownerName: room.ownerName || '',
      ownerContact: room.ownerContact || '',
      description: room.description,
      availability: room.availability,
      passcode: room.passcode || '',
      googleMapsLink: '',
      amenities: room.amenities?.join(', ') || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (roomId: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      try {
        deleteRoom(roomId);
        toast.success('Room deleted successfully');
      } catch (error) {
        console.error('Delete room error:', error);
        toast.error('Failed to delete room');
      }
    }
  };

  const resetForm = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      minPrice: '',
      maxPrice: '',
      fixedPrice: '',
      location: '',
      latitude: '',
      longitude: '',
      photos: '',
      videos: '',
      ownerName: '',
      ownerContact: '',
      description: '',
      availability: true,
      passcode: '',
      googleMapsLink: '',
      amenities: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-100">Room Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-100">{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">Room Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-slate-300 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pricing Options
                </Label>
                
                <div className="space-y-2">
                  <Label htmlFor="fixedPrice" className="text-slate-300 text-sm">Fixed Price (₹) - Optional</Label>
                  <Input
                    id="fixedPrice"
                    type="number"
                    value={formData.fixedPrice}
                    onChange={(e) => setFormData({ ...formData, fixedPrice: e.target.value })}
                    placeholder="Enter fixed price (overrides price range)"
                    className="bg-slate-900 border-slate-700 text-slate-100"
                  />
                  <p className="text-xs text-slate-500">
                    If set, this fixed price will be displayed instead of the price range
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPrice" className="text-slate-300 text-sm">Min Price (₹) *</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={formData.minPrice}
                      onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                      required
                      className="bg-slate-900 border-slate-700 text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxPrice" className="text-slate-300 text-sm">Max Price (₹) *</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={formData.maxPrice}
                      onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                      required
                      className="bg-slate-900 border-slate-700 text-slate-100"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Price range is used when fixed price is not set
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-slate-300">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photos" className="text-slate-300">Photo URLs (comma-separated) *</Label>
                <Input
                  id="photos"
                  value={formData.photos}
                  onChange={(e) => setFormData({ ...formData, photos: e.target.value })}
                  placeholder="/assets/image1.jpg, /assets/image2.jpg, /assets/image3.jpg"
                  required
                  className="bg-slate-900 border-slate-700 text-slate-100"
                />
                <p className="text-xs text-slate-500">
                  Enter local file paths or URLs for room photos
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videos" className="text-slate-300 flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video URLs (comma-separated, Optional)
                </Label>
                <Input
                  id="videos"
                  value={formData.videos}
                  onChange={(e) => setFormData({ ...formData, videos: e.target.value })}
                  placeholder="/assets/room-tour.mp4"
                  className="bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName" className="text-slate-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Room Owner Name *
                </Label>
                <Input
                  id="ownerName"
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  required
                  placeholder="Enter room owner's full name"
                  className="bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerContact" className="text-slate-300 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Room Owner Contact Number *
                </Label>
                <Input
                  id="ownerContact"
                  type="tel"
                  value={formData.ownerContact}
                  onChange={(e) => setFormData({ ...formData, ownerContact: e.target.value })}
                  required
                  placeholder="+91 98765 43210"
                  className="bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities" className="text-slate-300">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="WiFi, AC, TV, Mini Bar"
                  className="bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passcode" className="text-slate-300 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Room Passcode *
                </Label>
                <Input
                  id="passcode"
                  type="text"
                  value={formData.passcode}
                  onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                  required
                  placeholder="Enter unique passcode"
                  className="bg-slate-900 border-slate-700 text-slate-100"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="availability"
                  checked={formData.availability}
                  onCheckedChange={(checked) => setFormData({ ...formData, availability: checked })}
                />
                <Label htmlFor="availability" className="text-slate-300">Available for booking</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-slate-900 border-slate-700 text-slate-300">
                  Cancel
                </Button>
                <Button type="submit">
                  Save Room
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {showSuccessMessage && (
        <Alert className="bg-green-950 border-green-800">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">
            Room saved successfully! Changes are immediately visible in Browse Rooms.
          </AlertDescription>
        </Alert>
      )}

      {rooms.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="py-12 text-center">
            <p className="text-slate-400">No rooms available. Add your first room to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rooms.map((room) => (
            <Card key={room.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-slate-100">{room.name}</CardTitle>
                    <p className="text-sm text-slate-400 mt-1">{room.location}</p>
                    {(room.ownerName || room.ownerContact) && (
                      <div className="mt-2 space-y-1">
                        {room.ownerName && (
                          <p className="text-sm text-slate-400 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Owner: <span className="text-slate-300">{room.ownerName}</span>
                          </p>
                        )}
                        {room.ownerContact && (
                          <p className="text-sm text-slate-400 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            Contact: <span className="text-slate-300">{room.ownerContact}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(room)} className="bg-slate-900 border-slate-700 text-slate-300">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(room.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3 text-slate-300">{room.description}</p>
                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {room.amenities.map((amenity, idx) => (
                      <Badge key={idx} variant="secondary">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mb-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    Passcode: <span className="font-mono text-slate-300">{room.passcode}</span>
                  </span>
                  {room.videos && room.videos.length > 0 && (
                    <span className="flex items-center gap-1 text-primary">
                      <Video className="h-3 w-3" />
                      Video available
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-100">
                      {getRoomDisplayPrice(room)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {room.fixedPrice ? 'Fixed price' : 'per night'}
                    </p>
                  </div>
                  <Badge variant={room.availability ? 'default' : 'destructive'}>
                    {room.availability ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
