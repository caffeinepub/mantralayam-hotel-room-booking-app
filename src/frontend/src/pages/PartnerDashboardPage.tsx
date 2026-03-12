import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Check,
  DollarSign,
  Edit,
  Home,
  Loader2,
  LogOut,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import type { HomeStay } from "../backend";
import {
  useGetAuthenticatedPartnerId,
  useGetPartnerProfile,
  useGetPartnerRooms,
  useLogoutPartner,
  useUpdatePartnerRoomDetails,
} from "../hooks/useQueries";

function isSessionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /unauthorized|session|expired|authentication/i.test(msg);
}

function RoomEditCard({
  room,
  onSave,
  isSaving,
}: {
  room: HomeStay;
  onSave: (
    roomId: string,
    price: number,
    availability: boolean,
  ) => Promise<void>;
  isSaving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(room.price));
  const [availability, setAvailability] = useState(room.availability);

  useEffect(() => {
    setPrice(String(room.price));
    setAvailability(room.availability);
  }, [room.price, room.availability]);

  const handleSave = async () => {
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price.");
      return;
    }
    await onSave(room.id, priceNum, availability);
    setEditing(false);
  };

  const photoUrl =
    room.photoUrls?.[0] ||
    (room.photos?.[0] ? room.photos[0].getDirectURL() : null) ||
    "/assets/generated/standard-room.dim_800x600.jpg";

  return (
    <Card className="overflow-hidden border-border shadow-saffron">
      <div className="relative">
        <img
          src={photoUrl}
          alt={room.partnerName || "Room"}
          className="w-full h-40 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/generated/standard-room.dim_800x600.jpg";
          }}
        />
        <div className="absolute top-3 right-3">
          <Badge
            variant={room.availability ? "default" : "secondary"}
            className={
              room.availability ? "bg-primary text-primary-foreground" : ""
            }
          >
            {room.availability ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground">
            {room.partnerName || "My Room"}
          </h3>
          <p className="text-sm text-muted-foreground capitalize">
            {room.roomType} room
          </p>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label
                htmlFor="partner-price"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Price per night (₹)
              </label>
              <Input
                id="partner-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAvailability((a) => !a)}
                className="flex items-center gap-2 text-sm"
              >
                {availability ? (
                  <ToggleRight className="w-6 h-6 text-primary" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                )}
                <span>{availability ? "Available" : "Unavailable"}</span>
              </button>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-primary text-primary-foreground"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setPrice(String(room.price));
                  setAvailability(room.availability);
                }}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-primary">
                ₹{Number(room.price).toLocaleString()}
              </span>
              <span className="text-muted-foreground text-sm">/night</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
              className="gap-1"
            >
              <Edit className="w-3.5 h-3.5" /> Edit
            </Button>
          </div>
        )}

        {room.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {room.amenities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
              >
                {a}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{room.amenities.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PartnerDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: partnerId,
    isLoading: partnerIdLoading,
    isError: partnerIdError,
  } = useGetAuthenticatedPartnerId();

  const { data: partnerProfile, isLoading: profileLoading } =
    useGetPartnerProfile(partnerId ?? "");

  const {
    data: rooms = [],
    isLoading: roomsLoading,
    refetch: refetchRooms,
    isFetching: roomsFetching,
  } = useGetPartnerRooms(partnerId ?? "");

  const updateRoomMutation = useUpdatePartnerRoomDetails();
  const logoutMutation = useLogoutPartner();

  // Redirect if not authenticated
  useEffect(() => {
    if (!partnerIdLoading && (partnerIdError || partnerId === null)) {
      navigate({ to: "/partner-login" });
    }
  }, [partnerIdLoading, partnerIdError, partnerId, navigate]);

  const handleSaveRoom = async (
    roomId: string,
    price: number,
    availability: boolean,
  ) => {
    if (!partnerId) return;
    try {
      await updateRoomMutation.mutateAsync({
        roomId,
        price: BigInt(Math.round(price)),
        availability,
      });
      // Invalidate all relevant queries so BrowseRoomsPage and RoomDetailPage update immediately
      queryClient.invalidateQueries({ queryKey: ["partnerRooms"] });
      queryClient.invalidateQueries({ queryKey: ["homestays"] });
      queryClient.invalidateQueries({ queryKey: ["homestayDetails", roomId] });
      queryClient.invalidateQueries({ queryKey: ["homestayDetails"] });
    } catch (err) {
      if (isSessionError(err)) {
        toast.error(
          "Your session has expired. Please log out and log back in.",
        );
        setTimeout(() => navigate({ to: "/partner-login" }), 2000);
      } else {
        toast.error("Failed to update room. Please try again.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      localStorage.removeItem("partnerAuth");
      navigate({ to: "/partner-login" });
    } catch {
      // Still navigate even if logout call fails
      localStorage.removeItem("partnerAuth");
      navigate({ to: "/partner-login" });
    }
  };

  const isLoading = partnerIdLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!partnerId) return null;

  return (
    <main className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">
                {partnerProfile?.name || "Partner Dashboard"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {rooms.length} room{rooms.length !== 1 ? "s" : ""} managed
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="gap-1"
          >
            {logoutMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Logout
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-muted-foreground font-normal">
                Total Rooms
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-foreground">
                {rooms.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-muted-foreground font-normal">
                Available
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-primary">
                {rooms.filter((r) => r.availability).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border col-span-2 sm:col-span-1">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Avg. Price
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold text-foreground">
                {rooms.length > 0
                  ? `₹${Math.round(
                      rooms.reduce((sum, r) => sum + Number(r.price), 0) /
                        rooms.length,
                    ).toLocaleString()}`
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rooms */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">My Rooms</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchRooms()}
            disabled={roomsFetching}
            className="text-xs gap-1"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${roomsFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {roomsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Home className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No rooms assigned to your account yet.</p>
            <p className="text-sm mt-1">Contact the admin to add your rooms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <RoomEditCard
                key={room.id}
                room={room}
                onSave={handleSaveRoom}
                isSaving={updateRoomMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
