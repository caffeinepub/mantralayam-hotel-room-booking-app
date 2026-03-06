# Specification

## Summary
**Goal:** Rebuild the Motoko backend integration so all room, homestay, hotel, and booking data is stored in and retrieved from the canister, with real-time React Query cache invalidation on admin updates and proper session error handling.

**Planned changes:**
- Migrate all CRUD operations for rooms, homestays, hotels, and bookings to use Motoko backend actor calls instead of localStorage
- Declare all primary state maps (hotels, homestays, bookings, notifications, partner sessions) as stable variables in `main.mo` so data persists across canister upgrades
- Implement React Query cache invalidation on every successful create, update, and delete mutation in admin components (AdminRoomManagement, HomeStayManagement) so BrowseRoomsPage, RoomDetailPage, and PartnerDashboardPage update automatically without a full page reload
- Configure React Query with a short stale time (e.g., 30 seconds) for room and homestay queries to encourage frequent background refetches
- Check Internet Identity auth state before every backend actor call; display a user-friendly toast or modal prompting re-login if the session is expired or invalid, instead of showing raw error strings

**User-visible outcome:** Admin room/homestay edits are reflected across all pages within seconds without a manual reload, data is shared across devices and sessions, and users see clear re-login prompts instead of raw error messages when their session expires.
