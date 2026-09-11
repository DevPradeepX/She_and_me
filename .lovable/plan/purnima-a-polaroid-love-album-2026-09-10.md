# Purnima — A Polaroid Love Album

An intimate, private photo album for Purnima: warm cream paper, blush and rose accents, handwritten script captions, and photos that look like real Polaroids scattered on a table.

## What she'll see

**1. The locked door**
A soft, candlelit entry screen. A short love note to Purnima sits above a single passcode field. Typing `meripurnima` fades the note away and opens the album. The lock is remembered so she doesn't retype it every visit; a small "lock again" link is tucked in the footer.

**2. The album**
- A hero with her name in elegant script and a dedication line.
- Filter chips across the top: All / Sweet Moments / Favorites (plus a heart count).
- A wall of Polaroid cards — real white photo frames, each tilted a degree or two, soft drop shadows, the caption written underneath in handwriting, and a small heart button in the corner to mark favorites.
- Built to hold 50+ photos comfortably: the wall lays out in a masonry flow and loads in batches so it stays fast.

**3. Fullscreen view**
Tapping a Polaroid opens it fullscreen on a dimmed backdrop: the photo large and clean, its caption, date, and chapter beside it, a heart button, arrows and keyboard/swipe to move between photos, and a zoom toggle to look closer. Closing returns her to the exact spot on the wall.

**4. Adding photos**
A private "Add memories" panel where you can:
- Drop in many photos at once
- Write a handwritten-style caption and date for each
- Choose its chapter
- Drag Polaroids to reorder the wall
- Delete anything you change your mind about

## Starting content

The album ships with a set of beautiful placeholder Polaroids so the page looks complete and romantic from the first second — you replace them with your real photos through the add panel.

## Storage

You chose browser-only for now: photos live on this device in this browser. That means they stay after refresh, but they won't appear on her phone and are lost if the browser data is cleared. When you want her to open it from her own phone, say the word and I'll move it to real cloud storage with an account — the page itself won't change.

## Technical notes

- Design tokens (cream `#f6efe3`, ink `#3a2e24`, terracotta/rose accents, Cormorant Garamond display, Caveat handwriting, Inter body) go into `src/styles.css` as oklch semantic tokens; fonts loaded via `<link>` in `__root.tsx`.
- Routes: `/` (gate + album), `/manage` (photo management), both with their own `head()` metadata and `noindex` since it's private.
- Passcode is a client-side gate (no backend on browser-only storage), stored in `localStorage`; it keeps the page private-feeling but is not real security — noted honestly.
- Photos stored as compressed data in IndexedDB (localStorage is too small for 50+ photos); images downscaled on upload before saving.
- Polaroid card, lightbox, filter chips, and upload panel as separate components under `src/components/`.
- Reordering via pointer-based drag on the manage page; motion via CSS transitions to keep it light.
