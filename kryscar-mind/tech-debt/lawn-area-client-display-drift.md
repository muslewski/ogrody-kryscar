---
type: debt
title: "Lawn auto-fill: client display area can drift after manual parcel edits"
status: open
created: 2026-06-04
zone: "[[customer-lawns]]"
severity: low
---

# Client display area drift on edited auto-filled parcels

## Problem
After **Auto wypełnij**, the persisted lawn area is the **server**-recomputed net
value (`netArea` clips each building to the *current* parcel ring before
subtracting — always correct). But the **client** live readout in `LawnDrawer`'s
`recomputeArea()` (`src/components/lawns/LawnDrawer.tsx`) subtracts each building
overlay's **raw** spherical area without re-clipping to the parcel ring.

If a user auto-fills, then drags the parcel edge **inward** so a building now
straddles the new boundary, the client subtracts the *whole* building area while
the server subtracts only the on-lot portion — so the number shown can read smaller
than what gets saved. Measured ~2,230 m² gap on a contrived example. Display-only:
the saved `areaM2` is always the authoritative server value.

## Why deferred
The common path (auto-fill → save, or auto-fill → light corner nudges that keep the
building interior) shows the correct number. The drift needs an unusual edit
(dragging the parcel boundary across a building). Not worth shipping `polygon-clipping`
to the client bundle for 3a.

## Fix options (when revisited)
- (a) Re-clip building area against the current ring on the client before
  subtracting (port the clip to the client, or expose a light WASM/JS clip).
- (b) Freeze the displayed net area for auto-filled lawns until "Rysuj od nowa",
  and make the building overlays explicitly non-editable.
- (c) Recompute net area via a debounced call to a server action on parcel edit.

Recommended: (b) — cheapest, and matches the "auto-fill is a starting point" model.
