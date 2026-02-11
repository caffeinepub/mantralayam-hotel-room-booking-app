# Specification

## Summary
**Goal:** Let customers report booking issues that show up as clearly identifiable admin notifications, and make admin booking management include and highlight past/expired bookings.

**Planned changes:**
- Add a clearly visible "Report Issue" action on each booking card in the customer "My Bookings" page that opens the existing ReportIssueDialog.
- On issue submission, persist via existing issueStorage and create a permanent admin notification categorized as "issues" using existing addPermanentNotification flow.
- Update the admin NotificationPanel to group "issues" notifications under an "issues" category and render them with a distinct issue-specific color treatment.
- Update the admin Booking Management view to include past bookings in the list (no hiding/omitting).
- Detect expired bookings (checkOutDate earlier than current client time) and apply consistent distinct styling (e.g., muted/grey and/or "Expired" badge) without changing existing booking status badges or status-based counts.

**User-visible outcome:** Customers can report an issue for any booking and admins immediately see it in Notifications under an "issues" category with distinct styling; admins can also view past bookings and quickly spot expired bookings via different visual treatment.
