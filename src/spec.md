# Specification

## Summary
**Goal:** Remove the authenticated-only "Upload" button from the app header navigation without changing upload access or routing.

**Planned changes:**
- Remove the second `<button>` in the header `<nav>` (the authenticated "Upload" button) so it no longer renders.
- Keep the existing "Gallery" button and Login/Logout control behavior unchanged for both authenticated and unauthenticated users.

**User-visible outcome:** When signed in, the header no longer shows an "Upload" button, while the rest of the navigation and login/logout behavior remains the same and the Upload view is still accessible through existing routes.
