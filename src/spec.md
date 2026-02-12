# Specification

## Summary
**Goal:** Remove duplicate artwork deletion controls from the gallery/list UI and keep deletion available only on the edit page.

**Planned changes:**
- Remove any Delete action/control from the GalleryView artwork grid and its list-item components (e.g., artwork cards/menus).
- Ensure gallery/list components no longer import/call the delete mutation hook or otherwise trigger deletion.
- Keep the existing single “Delete Artwork” button on the edit page (UploadView in edit mode via AdminUploadForm) as the only deletion entry point, with no delete controls added to the artwork detail dialog.

**User-visible outcome:** Users can no longer delete artworks from the gallery/list view; deletion remains available only from the edit page for an artwork.
