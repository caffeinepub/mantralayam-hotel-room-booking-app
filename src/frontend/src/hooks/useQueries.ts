import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  Booking,
  GuestProfile,
  HomeStay,
  Hotel,
  Notification,
  PartnerProfile,
  PartnerRoomUpdate,
  RoomPasscodeConfig,
  StripeConfiguration,
  TempleSpecial,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";

// ─── Session error helper ────────────────────────────────────────────────────
function isSessionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /unauthorized|session|expired|authentication|not authenticated/i.test(
    msg,
  );
}

function handleMutationError(
  err: unknown,
  fallbackMsg = "An error occurred. Please try again.",
) {
  if (isSessionError(err)) {
    toast.error(
      "Your session has expired. Please log out and log back in to continue.",
    );
  } else {
    const msg = err instanceof Error ? err.message : String(err);
    // Don't expose raw "Unauthorized" strings
    if (/^unauthorized/i.test(msg)) {
      toast.error(
        "Your session has expired. Please log out and log back in to continue.",
      );
    } else {
      toast.error(fallbackMsg);
    }
  }
}

// ─── Customer first-login ────────────────────────────────────────────────────
export function useRecordCustomerFirstLogin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerName: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.recordCustomerFirstLogin(customerName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerFirstLogin"] });
    },
    onError: (err) => handleMutationError(err, "Failed to record login."),
  });
}

export function useHasCustomerLoggedInBefore() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["customerFirstLogin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasCustomerLoggedInBefore();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60_000,
  });
}

// ─── User Profile ────────────────────────────────────────────────────────────
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 60_000,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
    onError: (err) => handleMutationError(err, "Failed to save profile."),
  });
}

// ─── Admin Auth ──────────────────────────────────────────────────────────────
export function useAuthenticateAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      key,
      password,
    }: { key: string; password: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.authenticateAdmin(key, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAuth"] });
    },
    onError: (err) =>
      handleMutationError(
        err,
        "Authentication failed. Check your credentials.",
      ),
  });
}

export function useCheckAdminAuthentication() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["adminAuth"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.checkAdminAuthentication();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
  });
}

export function useLogoutAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.logoutAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAuth"] });
    },
  });
}

export function useInitializeAccessControl() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.initializeAccessControl();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminAuth"] });
    },
    onError: (err) =>
      handleMutationError(err, "Failed to initialize access control."),
  });
}

// ─── Hotels ──────────────────────────────────────────────────────────────────
export function useGetAvailableHotels() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Hotel[]>({
    queryKey: ["hotels"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableHotels();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useGetAdminHotels() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Hotel[]>({
    queryKey: ["adminHotels"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHotels();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useAddHotel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hotel: Hotel) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addHotel(hotel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
      queryClient.invalidateQueries({ queryKey: ["adminHotels"] });
      toast.success("Hotel added successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to add hotel."),
  });
}

export function useUpdateHotel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hotel: Hotel) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateHotel(hotel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
      queryClient.invalidateQueries({ queryKey: ["adminHotels"] });
      toast.success("Hotel updated successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to update hotel."),
  });
}

export function useDeleteHotel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hotelId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteHotel(hotelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotels"] });
      queryClient.invalidateQueries({ queryKey: ["adminHotels"] });
      toast.success("Hotel deleted successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to delete hotel."),
  });
}

// ─── HomeStays ───────────────────────────────────────────────────────────────
export function useGetAvailableHomeStays() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<HomeStay[]>({
    queryKey: ["homestays"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableHomeStays();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useGetHomeStayDetails(homeStayId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<HomeStay | null>({
    queryKey: ["homestayDetails", homeStayId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getHomeStayDetails(homeStayId);
    },
    enabled: !!actor && !actorFetching && !!homeStayId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useCreateHomeStay() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      homeStay,
      passcode,
    }: { homeStay: HomeStay; passcode?: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addHomeStayWithOptionalPasscode(homeStay, passcode ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homestays"] });
      queryClient.invalidateQueries({ queryKey: ["homestayDetails"] });
      queryClient.invalidateQueries({ queryKey: ["partnerRooms"] });
      toast.success("Room created successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to create room."),
  });
}

export function useAddHomeStayWithOptionalPasscode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      homeStay,
      passcode,
    }: { homeStay: HomeStay; passcode?: string | null }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addHomeStayWithOptionalPasscode(homeStay, passcode ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homestays"] });
      queryClient.invalidateQueries({ queryKey: ["homestayDetails"] });
      queryClient.invalidateQueries({ queryKey: ["partnerRooms"] });
      toast.success("Room created successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to create room."),
  });
}

export function useUpdateHomeStay() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (homestay: HomeStay) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateHomeStay(homestay);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["homestays"] });
      queryClient.invalidateQueries({
        queryKey: ["homestayDetails", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["homestayDetails"] });
      queryClient.invalidateQueries({ queryKey: ["partnerRooms"] });
      toast.success("Room updated successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to update room."),
  });
}

export function useDeleteHomeStay() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (homestayId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteHomeStay(homestayId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homestays"] });
      queryClient.invalidateQueries({ queryKey: ["homestayDetails"] });
      queryClient.invalidateQueries({ queryKey: ["partnerRooms"] });
      toast.success("Room deleted successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to delete room."),
  });
}

// ─── Bookings ────────────────────────────────────────────────────────────────
export function useGetAllBookings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ["allBookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useGetMyBookings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ["myBookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyBookings();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: Booking) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createBooking(booking);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
    },
    onError: (err) => {
      if (isSessionError(err)) {
        toast.error(
          "Your session has expired. Please log out and log back in to complete your booking.",
        );
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        if (/^unauthorized/i.test(msg)) {
          toast.error(
            "Your session has expired. Please log out and log back in to complete your booking.",
          );
        } else {
          toast.error("Failed to create booking. Please try again.");
        }
      }
    },
  });
}

export function useConfirmBookingPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.confirmBookingPayment(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
    },
    onError: (err) => handleMutationError(err, "Failed to confirm payment."),
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.cancelBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
      toast.success("Booking cancelled successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to cancel booking."),
  });
}

export function useUpdateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: Booking) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateBooking(booking);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allBookings"] });
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
      toast.success("Booking updated successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to update booking."),
  });
}

// ─── Notifications ───────────────────────────────────────────────────────────
export function useGetNotifications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) =>
      handleMutationError(err, "Failed to mark notification as read."),
  });
}

export function useDeleteNotification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteNotification(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) =>
      handleMutationError(err, "Failed to delete notification."),
  });
}

// ─── Partner Auth ────────────────────────────────────────────────────────────
export function useAuthenticatePartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.authenticatePartnerWithPassword(password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerAuth"] });
      queryClient.invalidateQueries({ queryKey: ["partnerRooms"] });
    },
    onError: (err) =>
      handleMutationError(err, "Invalid password. Please try again."),
  });
}

export function useCheckPartnerAuthentication() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["partnerAuth"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.checkPartnerAuthentication();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
  });
}

export function useGetAuthenticatedPartnerId() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ["authenticatedPartnerId"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAuthenticatedPartnerId();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
  });
}

export function useLogoutPartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.logoutPartner();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerAuth"] });
      queryClient.invalidateQueries({ queryKey: ["partnerRooms"] });
      queryClient.invalidateQueries({ queryKey: ["authenticatedPartnerId"] });
    },
  });
}

// ─── Partner Profiles ────────────────────────────────────────────────────────
export function useGetAllPartnerProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PartnerProfile[]>({
    queryKey: ["partnerProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPartnerProfiles();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useGetPartnerProfile(partnerId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PartnerProfile | null>({
    queryKey: ["partnerProfile", partnerId],
    queryFn: async () => {
      if (!actor || !partnerId) return null;
      return actor.getPartnerProfile(partnerId);
    },
    enabled: !!actor && !actorFetching && !!partnerId,
    staleTime: 30_000,
  });
}

export function useGetPartnerRooms(partnerId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<HomeStay[]>({
    queryKey: ["partnerRooms", partnerId],
    queryFn: async () => {
      if (!actor || !partnerId) return [];
      return actor.getPartnerRooms(partnerId);
    },
    enabled: !!actor && !actorFetching && !!partnerId,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useRegisterPartnerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: PartnerProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.registerPartnerProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerProfiles"] });
      toast.success("Partner registered successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to register partner."),
  });
}

export function useAdminUpdatePartnerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: PartnerProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.adminUpdatePartnerProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerProfiles"] });
      toast.success("Partner profile updated successfully.");
    },
    onError: (err) =>
      handleMutationError(err, "Failed to update partner profile."),
  });
}

export function useDeletePartnerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partnerId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deletePartnerProfile(partnerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partnerProfiles"] });
      queryClient.invalidateQueries({ queryKey: ["homestays"] });
      queryClient.invalidateQueries({ queryKey: ["partnerRooms"] });
      toast.success("Partner deleted successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to delete partner."),
  });
}

export function useUpdatePartnerRoomDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: PartnerRoomUpdate) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updatePartnerRoomDetails(update);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["partnerRooms"] });
      queryClient.invalidateQueries({ queryKey: ["homestays"] });
      queryClient.invalidateQueries({
        queryKey: ["homestayDetails", variables.roomId],
      });
      queryClient.invalidateQueries({ queryKey: ["homestayDetails"] });
      toast.success("Room details updated successfully.");
    },
    onError: (err) => {
      if (isSessionError(err)) {
        toast.error(
          "Your session has expired. Please log out and log back in.",
        );
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        if (/^unauthorized/i.test(msg)) {
          toast.error(
            "Your session has expired. Please log out and log back in.",
          );
        } else {
          toast.error("Failed to update room details. Please try again.");
        }
      }
    },
  });
}

// ─── Passcodes ───────────────────────────────────────────────────────────────
export function useGetAllRoomPasscodes() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<RoomPasscodeConfig[]>({
    queryKey: ["roomPasscodes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRoomPasscodes();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
  });
}

export function useSetRoomPasscode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      passcode,
    }: { roomId: string; passcode: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setRoomPasscode(roomId, passcode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomPasscodes"] });
      toast.success("Passcode set successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to set passcode."),
  });
}

export function useRemoveRoomPasscode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (passcode: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeRoomPasscode(passcode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roomPasscodes"] });
      toast.success("Passcode removed successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to remove passcode."),
  });
}

// ─── Guest Profiles ──────────────────────────────────────────────────────────
export function useCreateGuestProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: GuestProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createGuestProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guestProfile"] });
    },
    onError: (err) =>
      handleMutationError(err, "Failed to create guest profile."),
  });
}

export function useUpdateGuestProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: GuestProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateGuestProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guestProfile"] });
    },
    onError: (err) =>
      handleMutationError(err, "Failed to update guest profile."),
  });
}

// ─── Temple Specials ─────────────────────────────────────────────────────────
export function useGetTempleSpecials() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TempleSpecial[]>({
    queryKey: ["templeSpecials"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTempleSpecials();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export function useAddTempleSpecial() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (special: TempleSpecial) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addTempleSpecial(special);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templeSpecials"] });
      toast.success("Temple special added successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to add temple special."),
  });
}

// ─── Stripe ──────────────────────────────────────────────────────────────────
export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["stripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60_000,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stripeConfigured"] });
      toast.success("Stripe configured successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to configure Stripe."),
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (items: import("../backend").ShoppingItem[]) => {
      if (!actor) throw new Error("Actor not available");
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const result = await actor.createCheckoutSession(
        items,
        successUrl,
        cancelUrl,
      );
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) throw new Error("Stripe session missing url");
      return session;
    },
    onError: (err) =>
      handleMutationError(err, "Failed to create checkout session."),
  });
}

// ─── Admin credentials ───────────────────────────────────────────────────────
export function useUpdateAdminCredentials() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      newKey,
      newPassword,
    }: { newKey: string; newPassword: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateAdminCredentials(newKey, newPassword);
    },
    onSuccess: () => {
      toast.success("Admin credentials updated successfully.");
    },
    onError: (err) => handleMutationError(err, "Failed to update credentials."),
  });
}
