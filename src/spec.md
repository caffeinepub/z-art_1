# Specification

## Summary
**Goal:** Move the admin artwork upload experience into a dedicated Upload page so the default view remains focused on gallery browsing.

**Planned changes:**
- Update the default view to render only the Gallery content (grid + artwork detail dialog) and remove the admin upload form from that view.
- Add a separate Upload page/view that renders the existing `AdminUploadForm` component.
- Add header navigation to switch between “Gallery” (always visible) and “Upload” (visible only to authenticated admins).
- Gate the Upload page so non-admin or unauthenticated users see an English access-denied message and a way to return to Gallery, without rendering `AdminUploadForm`.

**User-visible outcome:** Users land on a Gallery-only view for browsing artworks, while authenticated admins can navigate to a separate Upload page to upload new artwork; non-admins cannot access the Upload page.
