import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useGetAvailableHomeStays,
  useAddHomeStayWithOptionalPasscode,
  useUpdateHomeStay,
  useDeleteHomeStay,
  useGetAllPartnerProfiles,
  useRegisterPartnerProfile,
} from '../../hooks/useQueries';
import { useActor } from '../../hooks/useActor';
import type { HomeStay, RoomType, PartnerProfile } from '../../backend';
import { Variant_admin_partner } from '../../backend';
import { syncPartnerToStorage } from '../../lib/roomStorage';

type FormData = {
  id: string;
  hotelId: string;
  roomType: string;
  price: string;
  amenities: string;
  description: string;
  availability: boolean;
  ownerType: 'admin' | 'partner';
  partnerId: string;
  partnerName: string;
  partnerPhoneNumber: string;
  partnerPassword: string;
  passcode: string;
  googleMapsLink: string;
  distanceFromTemple: string;
  photoUrls: string;
  ownerMessage: string;
};

const defaultForm: FormData = {
  id: '',
  hotelId: '',
  roomType: 'single',
  price: '',
  amenities: '',
  description: '',
  availability: true,
  ownerType: 'admin',
  partnerId: '',
  partnerName: '',
  partnerPhoneNumber: '',
  partnerPassword: '',
  passcode: '',
  googleMapsLink: '',
  distanceFromTemple: '',
  photoUrls: '',
  ownerMessage: '',
};

function toRoomType(value: string): RoomType {
  if (value === 'double') return 'double' as RoomType;
  if (value === 'suite') return 'suite' as RoomType;
  return 'single' as RoomType;
}

function isSessionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /unauthorized|session|expired|authentication/i.test(msg);
}

export default function HomeStayManagement() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  const { data: homestays = [], isLoading } = useGetAvailableHomeStays();
  const { data: partnerProfiles = [] } = useGetAllPartnerProfiles();

  const addMutation = useAddHomeStayWithOptionalPasscode();
  const updateMutation = useUpdateHomeStay();
  const deleteMutation = useDeleteHomeStay();
  const registerPartnerMutation = useRegisterPartnerProfile();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<HomeStay | null>(null);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (editingRoom) {
      setForm({
        id: editingRoom.id,
        hotelId: editingRoom.hotelId,
        roomType: editingRoom.roomType,
        price: String(editingRoom.price),
        amenities: editingRoom.amenities.join(', '),
        description: editingRoom.description,
        availability: editingRoom.availability,
        ownerType: editingRoom.ownerType === Variant_admin_partner.partner ? 'partner' : 'admin',
        partnerId: editingRoom.partnerId ?? '',
        partnerName: editingRoom.partnerName,
        partnerPhoneNumber: editingRoom.partnerPhoneNumber,
        partnerPassword: '',
        passcode: '',
        googleMapsLink: editingRoom.googleMapsLink ?? '',
        distanceFromTemple:
          editingRoom.distanceFromTemple != null ? String(editingRoom.distanceFromTemple) : '',
        photoUrls: editingRoom.photoUrls.join('\n'),
        ownerMessage: editingRoom.ownerMessage,
      });
    } else {
      setForm(defaultForm);
    }
  }, [editingRoom]);

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setForm(defaultForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (room: HomeStay) => {
    setEditingRoom(room);
    setIsFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.price || isNaN(Number(form.price))) {
      toast.error('Please enter a valid price.');
      return;
    }

    const amenitiesArr = form.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const photoUrlsArr = form.photoUrls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    const roomId = editingRoom?.id || `room_${Date.now()}`;

    // Handle partner registration/update
    if (form.ownerType === 'partner') {
      if (!form.partnerId) {
        toast.error('Partner ID is required for partner rooms.');
        return;
      }

      const existingPartner = partnerProfiles.find((p) => p.id === form.partnerId);

      if (!existingPartner && form.partnerPassword) {
        const newPartner: PartnerProfile = {
          id: form.partnerId,
          name: form.partnerName,
          contact: form.partnerPhoneNumber,
          rooms: [roomId],
          registrationDate: BigInt(Date.now()) * BigInt(1_000_000),
          password: form.partnerPassword,
        };
        try {
          await registerPartnerMutation.mutateAsync(newPartner);
          syncPartnerToStorage(form.partnerId, form.partnerPassword, roomId);
        } catch (err) {
          if (isSessionError(err)) {
            toast.error('Your session has expired. Please log out and log back in.');
          } else {
            toast.error('Failed to register partner.');
          }
          return;
        }
      } else if (existingPartner && form.partnerPassword && actor) {
        try {
          await actor.adminUpdatePartnerProfile({
            ...existingPartner,
            password: form.partnerPassword,
            name: form.partnerName,
            contact: form.partnerPhoneNumber,
          });
          syncPartnerToStorage(form.partnerId, form.partnerPassword, roomId);
          queryClient.invalidateQueries({ queryKey: ['partnerProfiles'] });
          toast.success('Partner password updated. Active immediately.');
        } catch (err) {
          if (isSessionError(err)) {
            toast.error('Your session has expired. Please log out and log back in.');
          } else {
            toast.error('Failed to update partner password.');
          }
          return;
        }
      }
    }

    const homeStay: HomeStay = {
      id: roomId,
      hotelId: form.hotelId,
      roomType: toRoomType(form.roomType),
      price: BigInt(Math.round(Number(form.price))),
      amenities: amenitiesArr,
      photos: [],
      description: form.description,
      availability: form.availability,
      ownerType:
        form.ownerType === 'partner'
          ? Variant_admin_partner.partner
          : Variant_admin_partner.admin,
      partnerId: form.ownerType === 'partner' ? form.partnerId : undefined,
      googleMapsLink: form.googleMapsLink || undefined,
      partnerName: form.partnerName,
      partnerPhoneNumber: form.partnerPhoneNumber,
      distanceFromTemple:
        form.distanceFromTemple ? BigInt(Math.round(Number(form.distanceFromTemple))) : undefined,
      photoUrls: photoUrlsArr,
      videoUrls: [],
      ratings: editingRoom?.ratings ?? [],
      ownerMessage: form.ownerMessage,
    };

    try {
      if (editingRoom) {
        await updateMutation.mutateAsync(homeStay);
      } else {
        await addMutation.mutateAsync({
          homeStay,
          passcode: form.passcode || null,
        });
      }
      // Invalidate all relevant queries for immediate propagation
      queryClient.invalidateQueries({ queryKey: ['homestays'] });
      queryClient.invalidateQueries({ queryKey: ['homestayDetails'] });
      queryClient.invalidateQueries({ queryKey: ['partnerRooms'] });
      setIsFormOpen(false);
      setEditingRoom(null);
    } catch (err) {
      if (isSessionError(err)) {
        toast.error('Your session has expired. Please log out and log back in.');
      } else {
        toast.error(editingRoom ? 'Failed to update homestay.' : 'Failed to create homestay.');
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteRoomId) return;
    try {
      await deleteMutation.mutateAsync(deleteRoomId);
      queryClient.invalidateQueries({ queryKey: ['homestays'] });
      queryClient.invalidateQueries({ queryKey: ['homestayDetails'] });
      queryClient.invalidateQueries({ queryKey: ['partnerRooms'] });
      setDeleteRoomId(null);
    } catch (err) {
      if (isSessionError(err)) {
        toast.error('Your session has expired. Please log out and log back in.');
      } else {
        toast.error('Failed to delete homestay.');
      }
    }
  };

  const isSaving = addMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Homestay Management</h2>
        <Button onClick={handleOpenCreate} size="sm" className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Add Homestay
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : homestays.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No homestays yet. Click "Add Homestay" to create one.
        </div>
      ) : (
        <div className="grid gap-3">
          {homestays.map((room) => (
            <div
              key={room.id}
              className="flex items-center justify-between bg-card border border-border rounded-xl p-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground truncate">
                    {room.partnerName || room.id}
                  </span>
                  <Badge variant="outline" className="capitalize text-xs">
                    {room.roomType}
                  </Badge>
                  <Badge
                    variant={room.availability ? 'default' : 'secondary'}
                    className={`text-xs ${room.availability ? 'bg-primary/20 text-primary border-primary/30' : ''}`}
                  >
                    {room.availability ? 'Available' : 'Unavailable'}
                  </Badge>
                  {room.ownerType === Variant_admin_partner.partner && (
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                      Partner
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  ₹{Number(room.price).toLocaleString()}/night
                  {room.distanceFromTemple != null &&
                    ` · ${Number(room.distanceFromTemple)}m from temple`}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(room)}
                  className="h-8 w-8"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteRoomId(room.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setEditingRoom(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Homestay' : 'Add New Homestay'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>Owner / Partner Name</Label>
              <Input
                value={form.partnerName}
                onChange={(e) => setForm((f) => ({ ...f, partnerName: e.target.value }))}
                placeholder="e.g. Ravi Kumar"
              />
            </div>

            <div className="space-y-1">
              <Label>Phone Number</Label>
              <Input
                value={form.partnerPhoneNumber}
                onChange={(e) => setForm((f) => ({ ...f, partnerPhoneNumber: e.target.value }))}
                placeholder="+91 9876543210"
              />
            </div>

            <div className="space-y-1">
              <Label>Room Type</Label>
              <Select
                value={form.roomType}
                onValueChange={(v) => setForm((f) => ({ ...f, roomType: v }))}
              >
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

            <div className="space-y-1">
              <Label>Price per Night (₹)</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="500"
              />
            </div>

            <div className="space-y-1">
              <Label>Owner Type</Label>
              <Select
                value={form.ownerType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, ownerType: v as 'admin' | 'partner' }))
                }
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

            {form.ownerType === 'partner' && (
              <>
                <div className="space-y-1">
                  <Label>Partner ID</Label>
                  <Input
                    value={form.partnerId}
                    onChange={(e) => setForm((f) => ({ ...f, partnerId: e.target.value }))}
                    placeholder="partner_001"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Partner Password {editingRoom ? '(leave blank to keep)' : ''}</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={form.partnerPassword}
                      onChange={(e) => setForm((f) => ({ ...f, partnerPassword: e.target.value }))}
                      placeholder="Set login password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {!editingRoom && (
                  <div className="space-y-1">
                    <Label>Room Passcode (optional)</Label>
                    <Input
                      value={form.passcode}
                      onChange={(e) => setForm((f) => ({ ...f, passcode: e.target.value }))}
                      placeholder="e.g. ROOM123"
                    />
                  </div>
                )}
              </>
            )}

            <div className="space-y-1">
              <Label>Distance from Temple (meters)</Label>
              <Input
                type="number"
                value={form.distanceFromTemple}
                onChange={(e) => setForm((f) => ({ ...f, distanceFromTemple: e.target.value }))}
                placeholder="500"
              />
            </div>

            <div className="space-y-1">
              <Label>Hotel ID (optional)</Label>
              <Input
                value={form.hotelId}
                onChange={(e) => setForm((f) => ({ ...f, hotelId: e.target.value }))}
                placeholder="hotel_001"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe the homestay..."
                rows={3}
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label>Amenities (comma-separated)</Label>
              <Input
                value={form.amenities}
                onChange={(e) => setForm((f) => ({ ...f, amenities: e.target.value }))}
                placeholder="WiFi, AC, TV, Parking"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label>Photo URLs (one per line)</Label>
              <Textarea
                value={form.photoUrls}
                onChange={(e) => setForm((f) => ({ ...f, photoUrls: e.target.value }))}
                placeholder="https://example.com/photo1.jpg"
                rows={3}
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label>Google Maps Link (optional)</Label>
              <Input
                value={form.googleMapsLink}
                onChange={(e) => setForm((f) => ({ ...f, googleMapsLink: e.target.value }))}
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label>Owner Message (optional)</Label>
              <Textarea
                value={form.ownerMessage}
                onChange={(e) => setForm((f) => ({ ...f, ownerMessage: e.target.value }))}
                placeholder="A personal message from the owner..."
                rows={2}
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <Switch
                checked={form.availability}
                onCheckedChange={(v) => setForm((f) => ({ ...f, availability: v }))}
              />
              <Label>Available for booking</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsFormOpen(false);
                setEditingRoom(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
              className="bg-primary text-primary-foreground"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : editingRoom ? (
                'Save Changes'
              ) : (
                'Create Homestay'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteRoomId}
        onOpenChange={(open) => {
          if (!open) setDeleteRoomId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Homestay</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this homestay? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
