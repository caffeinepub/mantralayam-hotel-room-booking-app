# Specification

## Summary
**Goal:** Make navigation feel smoother with consistent page transition animations, and reposition the Home page “Report an Issue” button to the bottom of the page content.

**Planned changes:**
- Add consistent route/page transition animations (e.g., fade/slide) for navigation across the app, with animations reduced/disabled when the user has `prefers-reduced-motion` enabled.
- Implement transitions in editable layout/routing components and/or global CSS utilities (without changing immutable hook files).
- Move the existing “Report an Issue” trigger on the Home page to the bottom of the Home page content (above the global footer) while keeping the same dialog behavior and English label text.

**User-visible outcome:** Navigating between pages shows a smooth animated transition (or minimal motion when reduced-motion is enabled), and the “Report an Issue” button appears near the bottom of the Home page and still opens/submits the same issue report dialog as before.
