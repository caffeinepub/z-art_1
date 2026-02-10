# Specification

## Summary
**Goal:** Let signed-in users edit existing artworks using the current Upload UI, and add a user-selectable “SOLD” display mode that can show a watermark overlay.

**Planned changes:**
- Add an “Edit” entry point from the Gallery that opens the existing Upload page in an explicit Edit mode for a selected artwork.
- In Edit mode, prefill title, description, and price; allow optional image replace/remove with the same preview and client-side optimization behavior as upload.
- Update the Upload form submission flow to choose create vs update, and return to the Gallery showing updated values without a hard refresh.
- Extend the React Query layer with an updateArtwork mutation and ensure proper cache invalidation/refetch; show English error toast on update failures without clearing the form.
- Update backend authorization so updateArtwork is allowed for the artwork owner and admins only, preserving immutable fields and existing isSold status.
- Add a Gallery control to choose sold display style (Badge vs Watermark) and apply it consistently in both the Gallery grid and artwork detail dialog; persist the choice across reloads via local storage (or equivalent frontend-only persistence).

**User-visible outcome:** Users can edit any previously uploaded artwork (including optionally changing its image) via the Upload page in Edit mode, and viewers can choose whether sold artworks show the existing badge or a large diagonal semi-transparent “SOLD” watermark across the image, with the preference remembered across reloads.
