import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  HomeStay,
  Hotel,
  Booking,
  UserProfile,
  PartnerProfile,
  GuestProfile,
  Notification,
  RoomPasscodeConfig,
  PartnerRoomUpdate,
} from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
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
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Hotels ──────────────────────────────────────────────────────────────────

export function useGetAvailableHotels() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Hotel[]>({
    queryKey: ['availableHotels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableHotels();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetHotels() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Hotel[]>({
    queryKey: ['hotels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHotels();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddHotel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hotel: Hotel) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHotel(hotel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['availableHotels'] });
    },
  });
}

export function useUpdateHotel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hotel: Hotel) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHotel(hotel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['availableHotels'] });
    },
  });
}

export function useDeleteHotel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hotelId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteHotel(hotelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['availableHotels'] });
    },
  });
}

// ─── HomeStays ────────────────────────────────────────────────────────────────

export function useGetAvailableHomeStays() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<HomeStay[]>({
    queryKey: ['availableHomestays'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableHomeStays();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetHomeStayDetails(homeStayId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<HomeStay | null>({
    queryKey: ['homestayDetails', homeStayId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getHomeStayDetails(homeStayId);
    },
    enabled: !!actor && !actorFetching && !!homeStayId,
  });
}

export function useCreateHomeStay() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ homeStay, passcode }: { homeStay: HomeStay; passcode?: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addHomeStayWithOptionalPasscode(homeStay, passcode ?? null);
      return homeStay.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableHomestays'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}

export function useAddHomeStayWithOptionalPasscode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ homeStay, passcode }: { homeStay: HomeStay; passcode: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHomeStayWithOptionalPasscode(homeStay, passcode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableHomestays'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['allPartnerProfiles'] });
    },
  });
}

export function useUpdateHomeStay() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (homestay: HomeStay) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHomeStay(homestay);
    },
    onSuccess: (_, homestay) => {
      queryClient.invalidateQueries({ queryKey: ['availableHomestays'] });
      queryClient.invalidateQueries({ queryKey: ['homestayDetails', homestay.id] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}

export function useDeleteHomeStay() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (homestayId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteHomeStay(homestayId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableHomestays'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
    },
  });
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export function useGetMyBookings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['myBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyBookings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllBookings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['allBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: Booking) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBooking(booking);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useConfirmBookingPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.confirmBookingPayment(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

export function useUpdateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: Booking) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBooking(booking);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function useGetNotifications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useMarkNotificationAsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteNotification(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ─── Partner ──────────────────────────────────────────────────────────────────

export function useAuthenticatePartnerWithPassword() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.authenticatePartnerWithPassword(password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authenticatedPartnerId'] });
      queryClient.invalidateQueries({ queryKey: ['partnerRooms'] });
      queryClient.invalidateQueries({ queryKey: ['partnerProfile'] });
    },
  });
}

export function useCheckPartnerAuthentication() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['partnerAuth'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.checkPartnerAuthentication();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 0,
  });
}

export function useLogoutPartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.logoutPartner();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerAuth'] });
      queryClient.invalidateQueries({ queryKey: ['partnerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['partnerRooms'] });
      queryClient.invalidateQueries({ queryKey: ['authenticatedPartnerId'] });
    },
  });
}

export function useGetPartnerRooms(partnerId: string | null) {
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

export function useGetPartnerProfile(partnerId: string | null) {
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

export function useGetAllPartnerProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PartnerProfile[]>({
    queryKey: ['allPartnerProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPartnerProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useRegisterPartnerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: PartnerProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerPartnerProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPartnerProfiles'] });
    },
  });
}

export function useAdminUpdatePartnerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: PartnerProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminUpdatePartnerProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPartnerProfiles'] });
    },
  });
}

export function useDeletePartnerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (partnerId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePartnerProfile(partnerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPartnerProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['availableHomestays'] });
    },
  });
}

// ─── Passcodes ────────────────────────────────────────────────────────────────

export function useGetAllRoomPasscodes() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<RoomPasscodeConfig[]>({
    queryKey: ['roomPasscodes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRoomPasscodes();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetRoomPasscode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, passcode }: { roomId: string; passcode: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setRoomPasscode(roomId, passcode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomPasscodes'] });
    },
  });
}

export function useRemoveRoomPasscode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (passcode: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeRoomPasscode(passcode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roomPasscodes'] });
    },
  });
}

// ─── Guest Profile ────────────────────────────────────────────────────────────

export function useGetGuestProfile(guestId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GuestProfile | null>({
    queryKey: ['guestProfile', guestId],
    queryFn: async () => {
      if (!actor || !guestId) return null;
      return actor.getGuestProfile(guestId);
    },
    enabled: !!actor && !actorFetching && !!guestId,
  });
}

export function useCreateGuestProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: GuestProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createGuestProfile(profile);
    },
    onSuccess: (_, profile) => {
      queryClient.invalidateQueries({ queryKey: ['guestProfile', profile.id] });
    },
  });
}

export function useUpdateGuestProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: GuestProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateGuestProfile(profile);
    },
    onSuccess: (_, profile) => {
      queryClient.invalidateQueries({ queryKey: ['guestProfile', profile.id] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useCheckAdminAuthentication() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['adminAuth'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.checkAdminAuthentication();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAuthenticateAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, password }: { key: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.authenticateAdmin(key, password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAuth'] });
    },
  });
}

export function useLogoutAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.logoutAdmin();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAuth'] });
    },
  });
}

export function useGetAdminDashboardData() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAdminDashboardData();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdatePartnerRoomDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: PartnerRoomUpdate) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePartnerRoomDetails(update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerRooms'] });
      queryClient.invalidateQueries({ queryKey: ['availableHomestays'] });
    },
  });
}

// ─── Customer First Login ─────────────────────────────────────────────────────

export function useRecordCustomerFirstLogin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (customerName: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordCustomerFirstLogin(customerName);
    },
  });
}

export function useHasCustomerLoggedInBefore() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['customerLoggedInBefore'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasCustomerLoggedInBefore();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ─── Stripe ───────────────────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !actorFetching,
  });
}
