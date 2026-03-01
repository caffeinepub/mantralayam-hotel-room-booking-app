import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Home, Loader2, MapPin, Phone, User, Star, Video, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useActor } from '@/hooks/useActor';
import { HomeStay, RoomType, Variant_admin_partner, ExternalBlob } from '@/backend';
import { useGetAvailableHomeStays } from '@/hooks/useQueries';
import { syncPartnerToStorage, clearPartnerAuthCache } from '@/lib/roomStorage';

interface HomeStayFormData {
  id: string;
  hotelId: string;
  roomType: RoomType;
  price: string;
  amenities: string;
  description: string;
  availability: boolean;
  ownerType: 'admin' | 'partner';
  partnerId: string;
  partnerName: string;
  partnerPhoneNumber: string;
  partnerPassword: string;
  googleMapsLink: string;
  distanceFromTemple: string;
  photoUrls: string;
  videoUrls: string;
  ownerMessage: string;
  passcode: string;
}

const defaultForm: HomeStayFormData = {
  id: '',
  hotelId: 'default-hotel',
  roomType: RoomType.single,
  price: '',
  amenities: '',
  description: '',
  availability: true,
  ownerType: 'admin',
  partnerId: '',
  partnerName: '',
  partnerPhoneNumber: '',
  partnerPassword: '',
  googleMapsLink: '',
  distanceFromTemple: '',
  photoUrls: '',
  videoUrls: '',
  ownerMessage: '',
  passcode: '',
};

export default function HomeStayManagement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: homeStays = [], isLoading } = useGetAvailableHomeStays();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HomeStayFormData>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEdit = (homeStay: HomeStay) => {
    setEditingId(homeStay.id);
    setForm({
      id: homeStay.id,
      hotelId: homeStay.hotelId,
      roomType: homeStay.roomType,
      price: homeStay.price.toString(),
      amenities: homeStay.amenities.join(', '),
      description: homeStay.description,
      availability: homeStay.availability,
      ownerType: homeStay.ownerType === Variant_admin_partner.partner ? 'partner' : 'admin',
      partnerId: homeStay.partnerId ?? '',
      partnerName: homeStay.partnerName,
      partnerPhoneNumber: homeStay.partnerPhoneNumber,
      partnerPassword: '',
      googleMapsLink: homeStay.googleMapsLink ?? '',
      distanceFromTemple: homeStay.distanceFromTemple?.toString() ?? '',
      photoUrls: homeStay.photoUrls.join('\n'),
      videoUrls: homeStay.videoUrls.join('\n'),
      ownerMessage: homeStay.ownerMessage,
      passcode: '',
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(defaultForm);
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    if (!actor) {
      setError('Backend connection not available. Please refresh and try again.');
      return;
    }

    if (!form.id.trim()) {
      setError('Homestay ID is required.');
      return;
    }
    if (!form.description.trim()) {
      setError('Description is required.');
      return;
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      setError('Please enter a valid price.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const photoUrlList = form.photoUrls
        .split('\n')
        .map(u => u.trim())
        .filter(Boolean);

      const videoUrlList = form.videoUrls
        .split('\n')
        .map(u => u.trim())
        .filter(Boolean);

      const amenitiesList = form.amenities
        .split(',')
        .map(a => a.trim())
        .filter(Boolean);

      const isPartner = form.ownerType === 'partner';
      const partnerId = form.partnerId.trim();
      const partnerPassword = form.partnerPassword.trim();
      const stayId = form.id.trim();

      // If partner room, register/update partner profile first
      if (isPartner && partnerId && partnerPassword) {
        try {
          const existingPartners = await actor.getAllPartnerProfiles();
          const existing = existingPartners.find(p => p.id === partnerId);

          if (existing) {
            await actor.adminUpdatePartnerProfile({
              ...existing,
              name: form.partnerName.trim() || existing.name,
              contact: form.partnerPhoneNumber.trim() || existing.contact,
              password: partnerPassword,
            });
          } else {
            await actor.registerPartnerProfile({
              id: partnerId,
              name: form.partnerName.trim() || partnerId,
              contact: form.partnerPhoneNumber.trim() || '',
              rooms: [],
              registrationDate: BigInt(Date.now()) * BigInt(1_000_000),
              password: partnerPassword,
            });
          }

          // Sync to localStorage using correct signature: (partnerId, password, roomId)
          syncPartnerToStorage(partnerId, partnerPassword, stayId);
          clearPartnerAuthCache(partnerId);
        } catch (partnerErr: any) {
          console.error('Partner profile setup error:', partnerErr);
          // Continue with homestay save even if partner profile update fails
        }
      }

      const homeStayData: HomeStay = {
        id: stayId,
        hotelId: form.hotelId.trim() || 'default-hotel',
        roomType: form.roomType,
        price: BigInt(Math.round(Number(form.price))),
        amenities: amenitiesList,
        photos: photoUrlList.map(url => ExternalBlob.fromURL(url)),
        description: form.description.trim(),
        availability: form.availability,
        ownerType: isPartner ? Variant_admin_partner.partner : Variant_admin_partner.admin,
        partnerId: isPartner && partnerId ? partnerId : undefined,
        googleMapsLink: form.googleMapsLink.trim() || undefined,
        partnerName: form.partnerName.trim(),
        partnerPhoneNumber: form.partnerPhoneNumber.trim(),
        distanceFromTemple: form.distanceFromTemple.trim()
          ? BigInt(Math.round(Number(form.distanceFromTemple)))
          : undefined,
        photoUrls: photoUrlList,
        videoUrls: videoUrlList,
        ratings: [],
        ownerMessage: form.ownerMessage.trim(),
      };

      if (editingId) {
        await actor.updateHomeStay(homeStayData);
        setSuccess('Homestay updated successfully!');
      } else {
        const passcode = form.passcode.trim() || null;
        await actor.addHomeStayWithOptionalPasscode(homeStayData, passcode);
        setSuccess('Homestay saved successfully!');
      }

      await queryClient.invalidateQueries({ queryKey: ['availableHomestays'] });
      await queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['allPartnerProfiles'] });

      setTimeout(() => {
        setShowForm(false);
        setEditingId(null);
        setForm(defaultForm);
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error('Save homestay error:', err);
      const msg: string = err?.message || String(err) || '';
      if (msg.includes('Partner profile not found')) {
        setError('Partner profile not found. Please ensure the partner ID is correct and the partner is registered.');
      } else if (msg.includes('Passcode already in use')) {
        setError('That passcode is already in use for another room. Please choose a different passcode.');
      } else if (msg.includes('Passcode cannot be empty')) {
        setError('Passcode cannot be empty. Please enter a valid passcode or leave it blank.');
      } else if (msg.includes('not available') || msg.includes('network') || msg.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else if (msg.includes('Unauthorized') || msg.includes('authentication')) {
        setError('Session expired. Please log out and log back in, then try again.');
      } else {
        setError(`Failed to save homestay: ${msg || 'Unknown error. Please try again.'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!actor) return;
    if (!window.confirm('Are you sure you want to delete this homestay? This action cannot be undone.')) return;

    setDeleting(id);
    setError(null);
    try {
      await actor.deleteHomeStay(id);
      await queryClient.invalidateQueries({ queryKey: ['availableHomestays'] });
      await queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    } catch (err: any) {
      console.error('Delete homestay error:', err);
      setError(`Failed to delete homestay: ${err?.message || 'Please try again.'}`);
    } finally {
      setDeleting(null);
    }
  };

  const updateForm = (field: keyof HomeStayFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading homestays...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Homestay Management</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {homeStays.length} homestay{homeStays.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        {!showForm && (
          <Button onClick={handleNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Homestay
          </Button>
        )}
      </div>

      {/* Error / Success Messages */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 rounded-lg px-4 py-3 text-sm">
          {success}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? 'Edit Homestay' : 'Add New Homestay'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ID */}
              <div className="space-y-1">
                <Label>Homestay ID *</Label>
                <Input
                  placeholder="e.g. room-001"
                  value={form.id}
                  onChange={e => updateForm('id', e.target.value)}
                  disabled={!!editingId}
                />
              </div>

              {/* Room Type */}
              <div className="space-y-1">
                <Label>Room Type</Label>
                <Select
                  value={form.roomType}
                  onValueChange={v => updateForm('roomType', v as RoomType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RoomType.single}>Single</SelectItem>
                    <SelectItem value={RoomType.double_}>Double</SelectItem>
                    <SelectItem value={RoomType.suite}>Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <Label>Price (₹ per night) *</Label>
                <Input
                  type="number"
                  placeholder="e.g. 1500"
                  value={form.price}
                  onChange={e => updateForm('price', e.target.value)}
                />
              </div>

              {/* Distance from Temple */}
              <div className="space-y-1">
                <Label>Distance from Temple (meters)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 500"
                  value={form.distanceFromTemple}
                  onChange={e => updateForm('distanceFromTemple', e.target.value)}
                />
              </div>

              {/* Owner Type */}
              <div className="space-y-1">
                <Label>Owner Type</Label>
                <Select
                  value={form.ownerType}
                  onValueChange={v => updateForm('ownerType', v as 'admin' | 'partner')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Availability */}
              <div className="space-y-1">
                <Label>Availability</Label>
                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={form.availability}
                    onCheckedChange={v => updateForm('availability', v)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {form.availability ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Partner Fields */}
            {form.ownerType === 'partner' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="col-span-full">
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Partner Details
                  </p>
                </div>
                <div className="space-y-1">
                  <Label>Partner ID *</Label>
                  <Input
                    placeholder="e.g. partner-001"
                    value={form.partnerId}
                    onChange={e => updateForm('partnerId', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Partner Name</Label>
                  <Input
                    placeholder="Partner's full name"
                    value={form.partnerName}
                    onChange={e => updateForm('partnerName', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Partner Phone</Label>
                  <Input
                    placeholder="+91 XXXXX XXXXX"
                    value={form.partnerPhoneNumber}
                    onChange={e => updateForm('partnerPhoneNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>
                    Partner Password{editingId ? ' (leave blank to keep current)' : ' *'}
                  </Label>
                  <Input
                    type="password"
                    placeholder="Partner login password"
                    value={form.partnerPassword}
                    onChange={e => updateForm('partnerPassword', e.target.value)}
                  />
                </div>
                {!editingId && (
                  <div className="space-y-1">
                    <Label>Room Passcode (optional)</Label>
                    <Input
                      placeholder="Passcode for partner login"
                      value={form.passcode}
                      onChange={e => updateForm('passcode', e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-1">
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe the homestay..."
                value={form.description}
                onChange={e => updateForm('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Owner Message */}
            <div className="space-y-1">
              <Label>Owner Message</Label>
              <Textarea
                placeholder="Message from the owner to guests..."
                value={form.ownerMessage}
                onChange={e => updateForm('ownerMessage', e.target.value)}
                rows={2}
              />
            </div>

            {/* Amenities */}
            <div className="space-y-1">
              <Label>Amenities (comma-separated)</Label>
              <Input
                placeholder="e.g. WiFi, AC, Hot Water, Parking"
                value={form.amenities}
                onChange={e => updateForm('amenities', e.target.value)}
              />
            </div>

            {/* Google Maps Link */}
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Google Maps Link
              </Label>
              <Input
                placeholder="https://maps.google.com/..."
                value={form.googleMapsLink}
                onChange={e => updateForm('googleMapsLink', e.target.value)}
              />
            </div>

            {/* Photo URLs */}
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <Image className="w-3 h-3" />
                Photo URLs (one per line)
              </Label>
              <Textarea
                placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
                value={form.photoUrls}
                onChange={e => updateForm('photoUrls', e.target.value)}
                rows={3}
              />
            </div>

            {/* Video URLs */}
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <Video className="w-3 h-3" />
                Video URLs (one per line)
              </Label>
              <Textarea
                placeholder="https://youtube.com/..."
                value={form.videoUrls}
                onChange={e => updateForm('videoUrls', e.target.value)}
                rows={2}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : editingId ? 'Update Homestay' : 'Save Homestay'}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Homestay List */}
      {homeStays.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Home className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No homestays yet</p>
          <p className="text-sm mt-1">Click "Add Homestay" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {homeStays.map(homeStay => (
            <Card key={homeStay.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {/* Photo */}
              {homeStay.photoUrls.length > 0 && (
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={homeStay.photoUrls[0]}
                    alt={homeStay.description}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{homeStay.id}</p>
                    <p className="text-xs text-muted-foreground truncate">{homeStay.description}</p>
                  </div>
                  <Badge
                    variant={homeStay.availability ? 'default' : 'secondary'}
                    className="shrink-0 text-xs"
                  >
                    {homeStay.availability ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {homeStay.roomType}
                  </span>
                  <span className="font-medium text-foreground">
                    ₹{homeStay.price.toString()}/night
                  </span>
                  {homeStay.ownerType === Variant_admin_partner.partner && (
                    <Badge variant="outline" className="text-xs">
                      Partner
                    </Badge>
                  )}
                </div>

                {homeStay.partnerName && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{homeStay.partnerName}</span>
                    {homeStay.partnerPhoneNumber && (
                      <>
                        <Phone className="w-3 h-3 ml-1" />
                        <span>{homeStay.partnerPhoneNumber}</span>
                      </>
                    )}
                  </div>
                )}

                {homeStay.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {homeStay.amenities.slice(0, 3).map(a => (
                      <Badge key={a} variant="secondary" className="text-xs px-1.5 py-0">
                        {a}
                      </Badge>
                    ))}
                    {homeStay.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        +{homeStay.amenities.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1"
                    onClick={() => handleEdit(homeStay)}
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 gap-1"
                    onClick={() => handleDelete(homeStay.id)}
                    disabled={deleting === homeStay.id}
                  >
                    {deleting === homeStay.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
