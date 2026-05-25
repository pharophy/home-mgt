## Overview

This change is a lightweight identity pass over the existing parent-facing app shell. It does not introduce a new workflow or navigation model. Instead, it adds a branded header and aligns browser metadata with the Starstep product name.

## Scope

The change covers two related surfaces:

1. In-app shell branding
2. Browser and install-surface metadata

## Design Decisions

### Branded shell header

The shell should show a compact brand panel above the existing top-level navigation. That panel should use a Starstep logo asset plus short supporting copy, but it should remain lightweight enough that the weekly matrix and setup flows stay primary.

Reasoning:
- The existing shell already has a stable top-level structure.
- A dedicated brand panel keeps identity work localized to the shell rather than pushing branding into each route.
- The header can improve product clarity without bringing back dashboard clutter that earlier UX changes intentionally removed.

### Browser metadata set at runtime

The React shell should own favicon, manifest, and theme-color metadata because the logo asset is already part of the client bundle. Runtime insertion keeps the metadata aligned with the shipped asset path that Vite fingerprints in builds.

Reasoning:
- Static HTML can carry the page title directly.
- Runtime metadata generation avoids hardcoding a build-time asset URL for the favicon or manifest icon.
- A generated manifest is sufficient for the current single-icon PWA needs without adding a separate maintained manifest file.

### Minimal metadata contract

The branding contract should stay intentionally small for now:
- document title
- favicon
- manifest name/short name/icon
- theme color

This keeps the scope aligned with the current UI change and avoids over-specifying broader marketing or launch-screen requirements that are not implemented yet.

## Risks And Mitigations

- Header chrome could crowd the primary workflow.
  - Mitigation: keep the brand panel short, place it once at the shell level, and avoid adding secondary actions inside it.

- Browser metadata could drift from the visible product identity.
  - Mitigation: source the visible shell and metadata from the same Starstep asset/name set and pin the behavior with client regression coverage.
