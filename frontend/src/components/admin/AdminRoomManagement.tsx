import React, { useState, useEffect } from 'react';
import { useActor } from '../../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { addRoom, updateRoom, deleteRoom, getRooms, clearPartnerCachedData, clearPartnerAuthCache, syncPartnerToStorage } from '../../lib/roomStorage';
import type { Room } from '../../lib/roomStorage';
import { Variant_admin_partner, RoomType } from '../../backend';
import type { HomeStay, PartnerProfile } from '../../backend';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface RoomFormData {
  id: string;
  name: string;
  description: string;
  amenities: string;
  minPrice: string;
  maxPrice: string;
  photos: string;
  availability: boolean;
  ownerType: 'admin' | 'partner';
  partnerId: string;
  partnerName: string;
  partnerPhone: string;
  password: string;
  hotelId: string;
  roomType: string;
  googleMapsLink: string;
  distanceFromTemple: string;
  ownerMessage: string;
  videoUrls: string;
}

const defaultForm: RoomFormData = {
  id: '',
  name: '',
  description: '',
  amenities: '',
  minPrice: '',
  maxPrice: '',
  photos: '',
  availability: true,
  ownerType: 'admin',
  partnerId: '',
  partnerName: '',
  partnerPhone: '',
  password: '',
  hotelId: '',
  roomType: 'single',
  googleMapsLink: '',
  distanceFromTemple: '',
  ownerMessage: '',
  videoUrls: '',
};

function toRoomType(roomTypeStr: string): RoomType {
  if (roomTypeStr === 'double') return RoomType.double_;
  if (roomTypeStr === 'suite') return RoomType.suite;
  return RoomType.single;
}

export default function AdminRoomManagement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<RoomFormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setRooms(getRooms());
    const handler = () => setRooms(getRooms());
    window.addEventListener('roomsUpdated', handler);
    return () => window.removeEventListener('roomsUpdated', handler);
  }, []);

  const openCreate = () => {
    setEditingRoom(null);
    setForm(defaultForm);
    setError('');
    setSuccessMsg('');
    setShowForm(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setForm({
      id: room.id,
      name: room.name,
      description: room.description,
      amenities: room.amenities.join(', '),
      minPrice: String(room.minPrice || ''),
      maxPrice: String(room.maxPrice || ''),
      photos: (room.photos || []).join('\n'),
      availability: room.availability,
      ownerType: room.partnerId ? 'partner' : 'admin',
      partnerId: room.partnerId || '',
      partnerName: room.partnerName || '',
      partnerPhone: room.partnerPhone || '',
      password: room.password || room.passcode || '',
      hotelId: room.hotelId || '',
      roomType: room.roomType || 'single',
      googleMapsLink: room.googleMapsLink || '',
      distanceFromTemple: room.distanceFromTemple ? String(room.distanceFromTemple) : '',
      ownerMessage: room.ownerMessage || '',
      videoUrls: (room.videoUrls || []).join('\n'),
    });
    setError('');
    setSuccessMsg('');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Room name is required');
      return;
    }
    if (form.ownerType === 'partner' && !form.partnerId.trim()) {
      setError('Partner ID is required for partner rooms');
      return;
    }
    if (form.ownerType === 'partner' && !form.password.trim()) {
      setError('Password is required for partner rooms');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const roomId = form.id || `room_${Date.now()}`;
      const photoList = form.photos.split('\n').map(p => p.trim()).filter(Boolean);
      const videoList = form.videoUrls.split('\n').map(v => v.trim()).filter(Boolean);
      const amenitiesList = form.amenities.split(',').map(a => a.trim()).filter(Boolean);
      const minPrice = parseInt(form.minPrice) || 0;
      const maxPrice = parseInt(form.maxPrice) || minPrice;

      const roomData: Room = {
        id: roomId,
        name: form.name.trim(),
        description: form.description.trim(),
        amenities: amenitiesList,
        minPrice,
        maxPrice,
        photos: photoList,
        availability: form.availability,
        partnerId: form.ownerType === 'partner' ? form.partnerId.trim() : undefined,
        partnerName: form.partnerName.trim() || undefined,
        partnerPhone: form.partnerPhone.trim() || undefined,
        password: form.ownerType === 'partner' ? form.password.trim() : undefined,
        passcode: form.ownerType === 'partner' ? form.password.trim() : undefined,
        hotelId: form.hotelId.trim() || undefined,
        roomType: form.roomType,
        googleMapsLink: form.googleMapsLink.trim() || undefined,
        distanceFromTemple: form.distanceFromTemple ? parseInt(form.distanceFromTemple) : undefined,
        ownerMessage: form.ownerMessage.trim() || undefined,
        videoUrls: videoList,
        ratings: editingRoom?.ratings || [],
      };

      // Save to localStorage first (always)
      if (editingRoom) {
        updateRoom(roomData);
      } else {
        addRoom(roomData);
      }

      // If partner room, also sync to backend
      if (form.ownerType === 'partner' && actor) {
        const partnerId = form.partnerId.trim();
        const password = form.password.trim();

        // Clear any stale auth cache for this partner
        clearPartnerAuthCache(partnerId);
        clearPartnerCachedData();

        // Build the HomeStay object for the backend
        const homeStay: HomeStay = {
          id: roomId,
          hotelId: form.hotelId.trim() || 'default',
          roomType: toRoomType(form.roomType),
          price: BigInt(minPrice),
          amenities: amenitiesList,
          photos: [],
          description: form.description.trim(),
          availability: form.availability,
          ownerType: Variant_admin_partner.partner,
          partnerId: partnerId,
          googleMapsLink: form.googleMapsLink.trim() || undefined,
          partnerName: form.partnerName.trim() || '',
          partnerPhoneNumber: form.partnerPhone.trim() || '',
          distanceFromTemple: form.distanceFromTemple ? BigInt(parseInt(form.distanceFromTemple)) : undefined,
          photoUrls: photoList,
          videoUrls: videoList,
          ratings: [],
          ownerMessage: form.ownerMessage.trim() || '',
        };

        if (editingRoom) {
          // Update existing homestay in backend
          try {
            await actor.updateHomeStay(homeStay);
          } catch (e) {
            // If update fails (room not in backend yet), try to add it
            console.warn('updateHomeStay failed, trying add:', e);
          }

          // Update partner profile password in backend
          try {
            const existingProfiles = await actor.getAllPartnerProfiles();
            const existingProfile = existingProfiles.find(p => p.id === partnerId);
            if (existingProfile) {
              // Update password via adminUpdatePartnerProfile
              await actor.adminUpdatePartnerProfile({
                ...existingProfile,
                password,
              });
            } else {
              // Partner profile doesn't exist yet, register it
              const newProfile: PartnerProfile = {
                id: partnerId,
                name: form.partnerName.trim() || partnerId,
                contact: form.partnerPhone.trim() || '',
                password,
                rooms: [roomId],
                registrationDate: BigInt(Date.now()) * BigInt(1_000_000),
              };
              await actor.registerPartnerProfile(newProfile);
              // Now add the homestay
              await actor.addHomeStayWithOptionalPasscode(homeStay, password);
            }
          } catch (profileErr) {
            console.warn('Partner profile update error:', profileErr);
            setError(`Warning: Room saved locally but backend sync had an issue: ${profileErr}`);
          }
        } else {
          // New partner room - register partner profile first, then add homestay
          try {
            const existingProfiles = await actor.getAllPartnerProfiles();
            const existingProfile = existingProfiles.find(p => p.id === partnerId);

            if (existingProfile) {
              // Partner exists, update their password
              await actor.adminUpdatePartnerProfile({
                ...existingProfile,
                password,
              });
              // Add the new room to backend
              await actor.addHomeStayWithOptionalPasscode(homeStay, password);
            } else {
              // New partner - register profile first
              const newProfile: PartnerProfile = {
                id: partnerId,
                name: form.partnerName.trim() || partnerId,
                contact: form.partnerPhone.trim() || '',
                password,
                rooms: [],
                registrationDate: BigInt(Date.now()) * BigInt(1_000_000),
              };
              await actor.registerPartnerProfile(newProfile);
              // Then add the homestay (backend will add room to partner's rooms list)
              await actor.addHomeStayWithOptionalPasscode(homeStay, password);
            }
          } catch (backendErr) {
            console.warn('Backend partner sync error:', backendErr);
            setError(`Warning: Room saved locally but backend sync had an issue: ${backendErr}`);
          }
        }

        // Sync partner data to localStorage
        syncPartnerToStorage(partnerId, password, roomId);

        // Invalidate React Query caches
        queryClient.invalidateQueries({ queryKey: ['allPartnerProfiles'] });
        queryClient.invalidateQueries({ queryKey: ['availableHomeStays'] });
        queryClient.invalidateQueries({ queryKey: ['partnerAuth'] });
      }

      setSuccessMsg(
        form.ownerType === 'partner'
          ? `✅ Room saved! Partner "${form.partnerId}" can now log in with password: "${form.password}"`
          : '✅ Room saved successfully!'
      );
      setShowForm(false);
      setRooms(getRooms());
    } catch (err: unknown) {
      setError(`Failed to save room: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (room: Room) => {
    if (!confirm(`Delete room "${room.name}"?`)) return;
    setDeletingId(room.id);
    try {
      deleteRoom(room.id);
      if (room.partnerId) {
        clearPartnerAuthCache(room.partnerId);
      }
      if (actor && room.partnerId) {
        try {
          await actor.deleteHomeStay(room.id);
        } catch (e) {
          console.warn('Backend delete failed:', e);
        }
      }
      queryClient.invalidateQueries({ queryKey: ['availableHomeStays'] });
      setRooms(getRooms());
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Room / Homestay Management</h2>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Room
        </Button>
      </div>

      {successMsg && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 text-sm">
          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Room List */}
      <div className="grid gap-3">
        {rooms.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No rooms added yet. Click "Add Room" to create your first room.
            </CardContent>
          </Card>
        ) : (
          rooms.map(room => (
            <Card key={room.id} className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground truncate">{room.name}</span>
                      <Badge variant={room.availability ? 'default' : 'secondary'}>
                        {room.availability ? 'Available' : 'Unavailable'}
                      </Badge>
                      {room.partnerId && (
                        <Badge variant="outline" className="text-xs">
                          Partner: {room.partnerId}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{room.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span>₹{room.minPrice}{room.maxPrice && room.maxPrice !== room.minPrice ? ` – ₹${room.maxPrice}` : ''}/night</span>
                      {room.partnerId && room.password && (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          🔑 Password set
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(room)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(room)}
                      disabled={deletingId === room.id}
                    >
                      {deletingId === room.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Room Name *</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Deluxe Room at Sri Mutt"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the room..."
                  rows={3}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min Price (₹/night)</Label>
                <Input
                  type="number"
                  value={form.minPrice}
                  onChange={e => setForm(f => ({ ...f, minPrice: e.target.value }))}
                  placeholder="500"
                />
              </div>
              <div>
                <Label>Max Price (₹/night)</Label>
                <Input
                  type="number"
                  value={form.maxPrice}
                  onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))}
                  placeholder="1500"
                />
              </div>
            </div>

            {/* Room Type & Hotel */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Room Type</Label>
                <Select value={form.roomType} onValueChange={v => setForm(f => ({ ...f, roomType: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="double">Double</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hotel ID (optional)</Label>
                <Input
                  value={form.hotelId}
                  onChange={e => setForm(f => ({ ...f, hotelId: e.target.value }))}
                  placeholder="hotel_123"
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <Label>Amenities (comma-separated)</Label>
              <Input
                value={form.amenities}
                onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))}
                placeholder="AC, WiFi, Hot Water, TV"
              />
            </div>

            {/* Photos & Videos */}
            <div>
              <Label>Photo URLs (one per line)</Label>
              <Textarea
                value={form.photos}
                onChange={e => setForm(f => ({ ...f, photos: e.target.value }))}
                placeholder="https://example.com/photo1.jpg"
                rows={3}
              />
            </div>
            <div>
              <Label>Video URLs (one per line, optional)</Label>
              <Textarea
                value={form.videoUrls}
                onChange={e => setForm(f => ({ ...f, videoUrls: e.target.value }))}
                placeholder="https://youtube.com/..."
                rows={2}
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Google Maps Link (optional)</Label>
                <Input
                  value={form.googleMapsLink}
                  onChange={e => setForm(f => ({ ...f, googleMapsLink: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <div>
                <Label>Distance from Temple (meters)</Label>
                <Input
                  type="number"
                  value={form.distanceFromTemple}
                  onChange={e => setForm(f => ({ ...f, distanceFromTemple: e.target.value }))}
                  placeholder="500"
                />
              </div>
            </div>

            {/* Owner Message */}
            <div>
              <Label>Owner Message (optional)</Label>
              <Textarea
                value={form.ownerMessage}
                onChange={e => setForm(f => ({ ...f, ownerMessage: e.target.value }))}
                placeholder="Special instructions for guests..."
                rows={2}
              />
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3">
              <Switch
                checked={form.availability}
                onCheckedChange={v => setForm(f => ({ ...f, availability: v }))}
              />
              <Label>Available for booking</Label>
            </div>

            {/* Owner Type */}
            <div>
              <Label>Owner Type</Label>
              <Select
                value={form.ownerType}
                onValueChange={v => setForm(f => ({ ...f, ownerType: v as 'admin' | 'partner' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin Managed</SelectItem>
                  <SelectItem value="partner">Partner / Landlord</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Partner Fields */}
            {form.ownerType === 'partner' && (
              <div className="space-y-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  🏠 Partner / Landlord Details
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  The partner will use the password below to log in to their dashboard.
                  This is stored in the backend and takes effect immediately.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Partner ID * (unique identifier)</Label>
                    <Input
                      value={form.partnerId}
                      onChange={e => setForm(f => ({ ...f, partnerId: e.target.value }))}
                      placeholder="e.g. partner_001"
                      disabled={!!editingRoom}
                    />
                    {editingRoom && (
                      <p className="text-xs text-muted-foreground mt-1">Partner ID cannot be changed after creation</p>
                    )}
                  </div>
                  <div>
                    <Label>Partner Name</Label>
                    <Input
                      value={form.partnerName}
                      onChange={e => setForm(f => ({ ...f, partnerName: e.target.value }))}
                      placeholder="e.g. Ravi Kumar"
                    />
                  </div>
                  <div>
                    <Label>Partner Phone</Label>
                    <Input
                      value={form.partnerPhone}
                      onChange={e => setForm(f => ({ ...f, partnerPhone: e.target.value }))}
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div>
                    <Label>Login Password *</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Set partner login password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(s => !s)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
