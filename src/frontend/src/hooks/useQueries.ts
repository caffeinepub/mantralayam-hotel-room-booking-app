import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { 
  Hotel, 
  HomeStay,
  Booking, 
  GuestProfile, 
  PartnerProfile,
  RoomPasscodeConfig,
  PartnerRoomUpdate,
  StripeConfiguration,
  ShoppingItem,
  Notification,
  UserProfile
} from '../backend';

// Hotels
export function useGetAvailableHotels() {
  const { actor, isFetching } = useActor();
  return useQuery<Hotel[]>({
    queryKey: ['availableHotels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableHotels();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetHotels() {
  const { actor, isFetching } = useActor();
  return useQuery<Hotel[]>({
    queryKey: ['hotels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHotels();
    },
    enabled: !!actor && !isFetching,
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

// HomeStays
export function useGetAvailableHomeStays() {
  const { actor, isFetching } = useActor();
  return useQuery<HomeStay[]>({
    queryKey: ['availableHomeStays'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableHomeStays();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetHomeStayDetails(homeStayId: string) {
  const { actor, isFetching } = useActor();
  return useQuery<HomeStay | null>({
    queryKey: ['homeStayDetails', homeStayId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getHomeStayDetails(homeStayId);
    },
    enabled: !!actor && !isFetching && !!homeStayId,
  });
}

export function useAddHomeStay() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ homeStay, passcode }: { homeStay: HomeStay; passcode: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHomeStayWithOptionalPasscode(homeStay, passcode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableHomeStays'] });
      queryClient.invalidateQueries({ queryKey: ['roomPasscodes'] });
    },
  });
}

export function useUpdateHomeStay() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (homeStay: HomeStay) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHomeStay(homeStay);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableHomeStays'] });
    },
  });
}

export function useDeleteHomeStay() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (homeStayId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteHomeStay(homeStayId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableHomeStays'] });
      queryClient.invalidateQueries({ queryKey: ['roomPasscodes'] });
    },
  });
}

// Bookings
export function useGetMyBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ['myBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ['allBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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

// Stripe
export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({ items, successUrl, cancelUrl }: { items: ShoppingItem[]; successUrl: string; cancelUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCheckoutSession(items, successUrl, cancelUrl);
    },
  });
}

// Notifications
export function useGetNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUnreadNotifications() {
  const { actor, isFetching } = useActor();
  return useQuery<Notification[]>({
    queryKey: ['unreadNotifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUnreadNotifications();
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
    },
  });
}

// Partner
export function useAuthenticatePartnerWithPasscode() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (passcode: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.authenticatePartnerWithPasscode(passcode);
    },
  });
}

export function useCheckPartnerAuthentication() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['partnerAuthentication'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.checkPartnerAuthentication();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPartnerAuthenticatedRoomId() {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ['partnerAuthenticatedRoomId'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPartnerAuthenticatedRoomId();
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['availableHomeStays'] });
      queryClient.invalidateQueries({ queryKey: ['partnerAuthenticatedRoomId'] });
    },
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
      queryClient.invalidateQueries({ queryKey: ['partnerAuthentication'] });
      queryClient.invalidateQueries({ queryKey: ['partnerAuthenticatedRoomId'] });
    },
  });
}

// Passcodes
export function useGetAllRoomPasscodes() {
  const { actor, isFetching } = useActor();
  return useQuery<RoomPasscodeConfig[]>({
    queryKey: ['roomPasscodes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRoomPasscodes();
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// User Profile
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

// Customer First Login
export function useRecordCustomerFirstLogin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customerName: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.recordCustomerFirstLogin(customerName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotifications'] });
    },
  });
}
