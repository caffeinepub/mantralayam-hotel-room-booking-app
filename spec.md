# Specification

## Summary
**Goal:** Fix the unauthorized error that prevents authenticated non-admin users (e.g., partners) from saving homestay listings.

**Planned changes:**
- Remove the admin-only authorization guard on the `addHomeStay` backend function, allowing any authenticated user to create homestay listings while still blocking unauthenticated callers.
- Remove any client-side admin-only guard in the `HomeStayManagement` frontend component that blocks non-admin authenticated users from submitting the add-homestay form.
- Ensure success and error messages on the frontend no longer reference "admin only" restrictions.

**User-visible outcome:** Authenticated partner/non-admin users can successfully fill out and submit the Add Homestay form without receiving an "Unauthorized" error, and the new homestay appears in the listing upon success.
