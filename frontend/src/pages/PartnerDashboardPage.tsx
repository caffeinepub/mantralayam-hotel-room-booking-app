import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { HomeStay, PartnerProfile } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut, Home, Phone, Edit2, Check, X, RefreshCw } from 'lucide-react';

function useAuthenticatedPartnerId() {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ['authenticatedPartnerId'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAuthenticatedPartnerId();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

function usePartnerProfile(partnerId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<PartnerProfile | null>({
    queryKey: ['partnerProfile', partnerId],
    queryFn: async () => {
      if (!actor || !partnerId) return null;
      return actor.getPartnerProfile(partnerId);
    },
    enabled: !!actor && !actorFetching && !!partnerId,
    retry: false,
  });
}

function usePartnerRooms(partnerId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<HomeStay[]>({
    queryKey: ['partnerRooms', partnerId],
    queryFn: async () => {
      if (!actor || !partnerId) return [];
      return actor.getPartnerRooms(partnerId);
    },
    enabled: !!actor && !actorFetching && !!partnerId,
    retry: false,
  });
}

export default function PartnerDashboardPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const { data: partnerId, isLoading: partnerIdLoading, isFetched: partnerIdFetched } = useAuthenticatedPartnerId();
  const { data: partnerProfile, isLoading: profileLoading } = usePartnerProfile(partnerId ?? null);
  const { data: rooms = [], isLoading: roomsLoading, refetch: refetchRooms } = usePartnerRooms(partnerId ?? null);

  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editAvailability, setEditAvailability] = useState(true);

  const isLoading = partnerIdLoading || profileLoading || roomsLoading;

  // If partner ID fetch is done and there's no partner ID, redirect to login
  useEffect(() => {
    if (partnerIdFetched && !partnerId) {
      navigate({ to: '/partner-login' });
    }
  }, [partnerIdFetched, partnerId, navigate]);

  const updateRoomMutation = useMutation({
    mutationFn: async ({ roomId, price, availability }: { roomId: string; price: number; availability: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updatePartnerRoomDetails({
        roomId,
        price: BigInt(price),
        availability,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerRooms', partnerId] });
      queryClient.invalidateQueries({ queryKey: ['availableHomestays'] });
      setEditingRoom(null);
    },
  });

  const handleLogout = async () => {
    if (actor) {
      try {
        await actor.logoutPartner();
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('partnerSession');
    queryClient.invalidateQueries({ queryKey: ['authenticatedPartnerId'] });
    queryClient.invalidateQueries({ queryKey: ['partnerRooms'] });
    queryClient.invalidateQueries({ queryKey: ['partnerProfile'] });
    navigate({ to: '/partner-login' });
  };

  const startEdit = (room: HomeStay) => {
    setEditingRoom(room.id);
    setEditPrice(String(Number(room.price)));
    setEditAvailability(room.availability);
  };

  const cancelEdit = () => {
    setEditingRoom(null);
  };

  const saveEdit = (roomId: string) => {
    const price = parseInt(editPrice, 10);
    if (isNaN(price) || price < 0) return;
    updateRoomMutation.mutate({ roomId, price, availability: editAvailability });
  };

  // Show loading while checking authentication
  if (partnerIdLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    );
  }

  // If no partner ID after loading, show redirect message
  if (!partnerId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Session expired. Redirecting to login...</p>
          <Button onClick={() => navigate({ to: '/partner-login' })}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Partner Dashboard</h1>
            {partnerProfile && (
              <p className="text-muted-foreground mt-1">
                Welcome back, <span className="text-foreground font-medium">{partnerProfile.name}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchRooms()}
              disabled={roomsLoading}
            >
              <RefreshCw className={`w-4 h-4 ${roomsLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>

        {/* Partner Profile Card */}
        {partnerProfile && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Your Profile
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium text-foreground">{partnerProfile.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="text-sm font-medium text-foreground">{partnerProfile.contact}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rooms Section */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Your Rooms
            {rooms.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({rooms.length} {rooms.length === 1 ? 'room' : 'rooms'})
              </span>
            )}
          </h2>

          {roomsLoading && (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-card border border-border rounded-2xl p-5">
                  <Skeleton className="h-5 w-1/3 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          )}

          {!roomsLoading && rooms.length === 0 && (
            <div className="text-center py-12 bg-card border border-border rounded-2xl">
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No Rooms Assigned</h3>
              <p className="text-muted-foreground text-sm">
                Contact the admin to have rooms assigned to your account.
              </p>
            </div>
          )}

          {!roomsLoading && rooms.length > 0 && (
            <div className="space-y-4">
              {rooms.map(room => {
                const isEditing = editingRoom === room.id;
                const photoUrl = room.photoUrls?.[0] || room.photos?.[0]?.getDirectURL();
                const roomTypeLabel = room.roomType === 'single' ? 'Single'
                  : room.roomType === 'double' ? 'Double'
                  : room.roomType === 'suite' ? 'Suite'
                  : String(room.roomType);

                return (
                  <div key={room.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="flex gap-4 p-5">
                      {/* Photo */}
                      {photoUrl && (
                        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-muted">
                          <img src={photoUrl} alt={room.partnerName} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {room.partnerName || 'Homestay'}
                          </h3>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={room.availability ? 'default' : 'secondary'}>
                              {room.availability ? 'Available' : 'Unavailable'}
                            </Badge>
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                              {roomTypeLabel}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {room.description}
                        </p>

                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <Label className="text-xs text-muted-foreground mb-1 block">Price per night (₹)</Label>
                                <Input
                                  type="number"
                                  value={editPrice}
                                  onChange={e => setEditPrice(e.target.value)}
                                  className="h-8 text-sm"
                                  min="0"
                                />
                              </div>
                              <div className="flex items-center gap-2 pt-5">
                                <Switch
                                  checked={editAvailability}
                                  onCheckedChange={setEditAvailability}
                                />
                                <span className="text-sm text-muted-foreground">Available</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => saveEdit(room.id)}
                                disabled={updateRoomMutation.isPending}
                                className="bg-primary text-primary-foreground"
                              >
                                {updateRoomMutation.isPending ? (
                                  <span className="w-3 h-3 border border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="w-3 h-3" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              ₹{Number(room.price).toLocaleString()}/night
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEdit(room)}
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
