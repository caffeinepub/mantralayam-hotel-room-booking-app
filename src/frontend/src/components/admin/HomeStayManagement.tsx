import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Home, Plus, Edit, Trash2, Save, X, Bed } from 'lucide-react';
import { getHomeStays, saveHomeStays, getHotels, type HomeStay, type Hotel, type RoomAvailability, getHomeStayBookingStats, normalizeHomeStay } from '../../lib/dataStorage';

export default function HomeStayManagement() {
  const [homeStays, setHomeStays] = useState<HomeStay[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [editingHomeStay, setEditingHomeStay] = useState<HomeStay | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('homeStaysUpdated', handleUpdate);
    window.addEventListener('hotelsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('homeStaysUpdated', handleUpdate);
      window.removeEventListener('hotelsUpdated', handleUpdate);
    };
  }, []);

  const loadData = () => {
    setHomeStays(getHomeStays());
    setHotels(getHotels());
  };

  const handleAdd = () => {
    const newHomeStay: HomeStay = {
      id: `homestay-${Date.now()}`,
      hotelId: hotels[0]?.id || '',
      name: '',
      description: '',
      minPrice: 1000,
      maxPrice: 2000,
      amenities: [],
      photos: [],
      availability: true,
      ownerType: 'admin',
      partnerName: 'Admin',
      partnerPhoneNumber: '',
      photoUrls: [],
      videoUrls: [],
      ratings: [],
      ownerMessage: '',
      roomCount: 1,
      roomAvailability: [
        { roomIndex: 1, isAvailable: true, unavailableDateRanges: [], personCapacity: 2 }
      ],
    };
    setEditingHomeStay(newHomeStay);
    setIsAdding(true);
  };

  const handleEdit = (homeStay: HomeStay) => {
    const normalized = normalizeHomeStay(homeStay);
    setEditingHomeStay(normalized);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!editingHomeStay) return;

    if (!editingHomeStay.name || !editingHomeStay.hotelId) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Ensure roomAvailability matches roomCount
    const roomCount = editingHomeStay.roomCount || 1;
    const roomAvailability = editingHomeStay.roomAvailability || [];
    
    // Adjust roomAvailability to match roomCount
    const updatedRoomAvailability: RoomAvailability[] = [];
    for (let i = 1; i <= roomCount; i++) {
      const existing = roomAvailability.find(r => r.roomIndex === i);
      if (existing) {
        updatedRoomAvailability.push(existing);
      } else {
        updatedRoomAvailability.push({
          roomIndex: i,
          isAvailable: true,
          unavailableDateRanges: [],
          personCapacity: 2,
        });
      }
    }

    const updatedHomeStay = {
      ...editingHomeStay,
      roomAvailability: updatedRoomAvailability,
    };

    const allHomeStays = getHomeStays();
    if (isAdding) {
      allHomeStays.push(updatedHomeStay);
    } else {
      const index = allHomeStays.findIndex(h => h.id === updatedHomeStay.id);
      if (index !== -1) {
        allHomeStays[index] = updatedHomeStay;
      }
    }

    saveHomeStays(allHomeStays);
    setEditingHomeStay(null);
    setIsAdding(false);
    toast.success(isAdding ? 'HomeStay added successfully' : 'HomeStay updated successfully');
  };

  const handleDelete = (id: string) => {
    const allHomeStays = getHomeStays();
    const filtered = allHomeStays.filter(h => h.id !== id);
    saveHomeStays(filtered);
    toast.success('HomeStay deleted successfully');
  };

  const handleCancel = () => {
    setEditingHomeStay(null);
    setIsAdding(false);
  };

  const updateRoomCapacity = (roomIndex: number, capacity: number) => {
    if (!editingHomeStay) return;
    
    const roomAvailability = editingHomeStay.roomAvailability || [];
    const updatedRoomAvailability = roomAvailability.map(r =>
      r.roomIndex === roomIndex ? { ...r, personCapacity: Math.max(1, capacity) } : r
    );
    
    setEditingHomeStay({
      ...editingHomeStay,
      roomAvailability: updatedRoomAvailability,
    });
  };

  return (
    <Card className="glass-card bg-slate-900/60 border-slate-800 shadow-saffron-lg">
      <CardHeader className="border-b border-slate-800 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-saffron-gold flex items-center justify-center shadow-saffron">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-100">HomeStay Management</CardTitle>
              <p className="text-sm text-slate-400">Manage all homestay properties</p>
            </div>
          </div>
          {!editingHomeStay && (
            <Button
              onClick={handleAdd}
              className="gradient-saffron-gold text-white border-0 hover:opacity-90 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add HomeStay
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {editingHomeStay ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Name *</Label>
                <Input
                  value={editingHomeStay.name}
                  onChange={(e) => setEditingHomeStay({ ...editingHomeStay, name: e.target.value })}
                  className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                  placeholder="Enter homestay name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Hotel *</Label>
                <Select
                  value={editingHomeStay.hotelId}
                  onValueChange={(value) => setEditingHomeStay({ ...editingHomeStay, hotelId: value })}
                >
                  <SelectTrigger className="glass-card bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Description</Label>
              <Textarea
                value={editingHomeStay.description}
                onChange={(e) => setEditingHomeStay({ ...editingHomeStay, description: e.target.value })}
                className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                rows={3}
                placeholder="Enter description"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-slate-300">Min Price (₹)</Label>
                <Input
                  type="number"
                  value={editingHomeStay.minPrice}
                  onChange={(e) => setEditingHomeStay({ ...editingHomeStay, minPrice: parseInt(e.target.value) || 0 })}
                  className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Max Price (₹)</Label>
                <Input
                  type="number"
                  value={editingHomeStay.maxPrice}
                  onChange={(e) => setEditingHomeStay({ ...editingHomeStay, maxPrice: parseInt(e.target.value) || 0 })}
                  className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Fixed Price (₹)</Label>
                <Input
                  type="number"
                  value={editingHomeStay.fixedPrice || ''}
                  onChange={(e) => setEditingHomeStay({ ...editingHomeStay, fixedPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Room Count</Label>
                <Input
                  type="number"
                  min="1"
                  value={editingHomeStay.roomCount}
                  onChange={(e) => {
                    const newCount = Math.max(1, parseInt(e.target.value) || 1);
                    setEditingHomeStay({ ...editingHomeStay, roomCount: newCount });
                  }}
                  className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Distance from Temple (km)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={editingHomeStay.distanceFromTemple || ''}
                  onChange={(e) => setEditingHomeStay({ ...editingHomeStay, distanceFromTemple: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Per-Room Capacity Configuration */}
            <div className="space-y-3">
              <Label className="text-slate-300 flex items-center gap-2">
                <Bed className="h-4 w-4" />
                Room Capacity Configuration
              </Label>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: editingHomeStay.roomCount || 1 }, (_, i) => i + 1).map((roomIndex) => {
                  const roomData = editingHomeStay.roomAvailability?.find(r => r.roomIndex === roomIndex);
                  const capacity = roomData?.personCapacity || 2;
                  
                  return (
                    <div key={roomIndex} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <Label className="text-xs text-slate-400 mb-2 block">Room {roomIndex}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={capacity}
                          onChange={(e) => updateRoomCapacity(roomIndex, parseInt(e.target.value) || 1)}
                          className="glass-card bg-slate-800 border-slate-700 text-slate-100 text-sm"
                        />
                        <span className="text-xs text-slate-400 whitespace-nowrap">guests</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Partner Name</Label>
                <Input
                  value={editingHomeStay.partnerName}
                  onChange={(e) => setEditingHomeStay({ ...editingHomeStay, partnerName: e.target.value })}
                  className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Partner Phone</Label>
                <Input
                  value={editingHomeStay.partnerPhoneNumber}
                  onChange={(e) => setEditingHomeStay({ ...editingHomeStay, partnerPhoneNumber: e.target.value })}
                  className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Google Maps Link</Label>
              <Input
                value={editingHomeStay.googleMapsLink || ''}
                onChange={(e) => setEditingHomeStay({ ...editingHomeStay, googleMapsLink: e.target.value })}
                className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                placeholder="https://maps.app.goo.gl/..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Owner Message</Label>
              <Textarea
                value={editingHomeStay.ownerMessage}
                onChange={(e) => setEditingHomeStay({ ...editingHomeStay, ownerMessage: e.target.value })}
                className="glass-card bg-slate-800 border-slate-700 text-slate-100"
                rows={2}
                placeholder="Welcome message from owner"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="space-y-1">
                <Label className="text-slate-300">Admin Override Availability</Label>
                <p className="text-xs text-slate-400">Manually control availability regardless of bookings</p>
              </div>
              <Switch
                checked={editingHomeStay.adminOverrideAvailability !== false}
                onCheckedChange={(checked) => setEditingHomeStay({ ...editingHomeStay, adminOverrideAvailability: checked })}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <Button
                onClick={handleSave}
                className="flex-1 gradient-saffron-gold text-white border-0 hover:opacity-90 gap-2"
              >
                <Save className="h-4 w-4" />
                Save HomeStay
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {homeStays.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No homestays yet. Click "Add HomeStay" to create one.</p>
              </div>
            ) : (
              homeStays.map((homeStay) => {
                const hotel = hotels.find(h => h.id === homeStay.hotelId);
                const stats = getHomeStayBookingStats(homeStay.id);
                
                return (
                  <Card key={homeStay.id} className="glass-card bg-slate-800/40 border-slate-700 hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-100">{homeStay.name}</h3>
                            <Badge className="gradient-saffron-gold text-white border-0">
                              {hotel?.name || 'Unknown Hotel'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mb-3">{homeStay.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                            <span>Price: ₹{homeStay.fixedPrice || `${homeStay.minPrice}-${homeStay.maxPrice}`}</span>
                            <span>Rooms: {homeStay.roomCount}</span>
                            <span className="flex items-center gap-1">
                              <Bed className="h-3 w-3" />
                              Available: {stats.availableRooms} / {homeStay.roomCount}
                            </span>
                            {homeStay.distanceFromTemple && (
                              <span>{homeStay.distanceFromTemple} km from temple</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => handleEdit(homeStay)}
                            variant="outline"
                            size="sm"
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(homeStay.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-900 text-red-400 hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
