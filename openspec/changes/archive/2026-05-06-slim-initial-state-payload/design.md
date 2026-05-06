## Context

The server currently persists generated instructional and celebratory images as data URLs on routines, chores, routine steps, and completion records. Those same large strings are returned directly from `/api/state` and related responses, which inflated the live bootstrap payload to roughly 75 MB and caused the tablet browser to fail before any major surface could render. The fix needs to preserve existing saved imagery, avoid a data migration, and improve first-load reliability across chart, setup, and history views.

## Goals / Non-Goals

**Goals:**
- Keep initial state and daily plan responses lightweight enough to load reliably on constrained devices.
- Preserve the current persisted-image model without forcing a one-time migration of stored base64 data.
- Allow chart, setup, and history views to render metadata first and let image loading happen progressively through normal browser image requests.
- Minimize client churn by preserving existing field names where practical.

**Non-Goals:**
- Replacing stored base64 images in persistence with filesystem blobs or external object storage.
- Reworking the visual design of Sticker Chart, Setup, or History beyond what is required for progressive image loading.
- Introducing authentication changes beyond the existing actor-header model.

## Decisions

### Convert persisted generated image fields to asset URLs at the API boundary
Bootstrap and entity-read responses will no longer return inline `data:image/...` strings for saved generated images. Instead, the server will serialize persisted generated images as same-origin asset URLs keyed by the owning entity, such as completion image content and saved routine/chore image content. This keeps response JSON small while preserving the same conceptual fields for the client.

Alternative considered:
- Keep `/api/state` shape unchanged and add compression only. Rejected because the device failure is driven by extreme payload size and parsing/rendering pressure, not just transfer size.

### Serve persisted images through dedicated Express endpoints
The server will add read endpoints that decode persisted generated image data and return image bytes with the correct content type. Browsers can then load those resources independently via `<img src>`, which naturally supports progressive loading and avoids blocking the app bootstrap.

Alternative considered:
- Add a second JSON endpoint that still returns all base64 image strings after bootstrap. Rejected because it would merely move the same failure mode to a later request instead of letting the browser handle image fetching efficiently.

### Preserve client field names and broaden generated-image reference detection
Client rendering will continue using `imageUrl` and `celebrationImageUrl`, but generated-image detection logic must treat both inline data URLs and server-served asset URLs as valid generated-image references. This keeps draft preview flows intact while letting saved entities use lightweight URLs.

Alternative considered:
- Add parallel fields like `imageAssetUrl`. Rejected because it would increase branching throughout the client for limited value.

## Risks / Trade-offs

- [Risk] Some routes may still leak large inline data URLs if serialization is applied inconsistently. -> Mitigation: centralize API serialization helpers and cover state, today-plan, and CRUD responses with tests.
- [Risk] New image asset endpoints could return broken images for malformed stored data. -> Mitigation: treat invalid or missing image data as `404`/`204` style absent assets and let the client fall back gracefully.
- [Risk] Setup image backfill logic currently recognizes only inline generated images. -> Mitigation: update the client helper and regression-test that saved generated images are not unnecessarily regenerated after reload.

## Migration Plan

No data migration is required. Existing persisted base64 image data remains in JSON or SQL storage. Deployment consists of shipping the new serialization layer and asset routes. Rollback is straightforward because persistence format does not change.

## Open Questions

- None. The current issue is sufficiently explained by payload size, and serving persisted images by URL addresses the observed device failures directly.
