## Context

The current product leans on generated imagery for both instructional task visuals and celebratory completion history. That improves the experience once assets exist, but it also creates latency pressure in two places: saving a new activity and opening image-heavy history views. The repo already persists generated assets after creation, so the performance opportunity is to remove image generation from blocking UI actions and make loading states first-class instead of incidental.

## Goals / Non-Goals

**Goals:**
- Let parents save activities immediately without waiting for instructional image generation to complete.
- Represent pending image generation explicitly in the client so the parent sees a generating placeholder instead of a frozen or incomplete form.
- Keep History responsive by rendering structure and metadata first, then loading sticker images progressively.
- Reuse existing persistence paths so generated assets still become stable saved images after background completion.

**Non-Goals:**
- Redesign the visual style of the Setup or History pages beyond what is needed for pending/loading states.
- Replace the existing image-generation provider or prompt strategy.
- Introduce a full background job system with external queues or workers.

## Decisions

### Save activity records before instructional images finish
The activity create/update flow will persist the activity immediately once required text and schedule data are valid, then continue instructional-image generation as a follow-up persistence step. This keeps the primary parent action on the fast path.

Alternative considered:
- Keep save synchronous and only optimize the generator. Rejected because even improved generation latency still leaves the main user action blocked on a non-critical asset.

### Track pending instructional image state separately from final image URLs
The client should distinguish among `pending`, `ready`, and `unavailable` image states for task previews and step thumbnails. The saved activity contract can remain image-URL based if the client derives pending state locally during create/update flows, with optional persisted hints if needed.

Alternative considered:
- Store only an empty image URL until generation finishes. Rejected because the UI cannot then reliably communicate whether generation is in progress versus missing or failed.

### Render History metadata immediately and defer image-heavy fill-in
History month and gallery views should derive their layout from saved completion metadata first, then allow sticker images to load progressively with placeholders/skeletons. The structure of the view should not wait on full image paint.

Alternative considered:
- Preload all history images before rendering. Rejected because it amplifies initial cost exactly where the user wants fast browsing.

### Favor local progressive-loading techniques over server-side aggregation changes
This change should first use client rendering tactics such as explicit placeholders, lazy image loading, and stable layout boxes before expanding into new API shapes.

Alternative considered:
- Add a new history summary endpoint immediately. Deferred because the current data model may be sufficient once image loading is decoupled from view rendering.

## Risks / Trade-offs

- [Background generation race after save] -> Mitigation: persist the activity first, then patch in generated image fields using the saved record identity and keep tests around eventual hydration.
- [Parents may mistake placeholders for failures] -> Mitigation: use explicit generating copy and distinct unavailable/error states.
- [History placeholders may still feel visually busy] -> Mitigation: reserve stable aspect-ratio boxes so layout is fast without reflow thrash.
- [Partial save/update flows become more stateful] -> Mitigation: keep pending-image state isolated in dedicated client helpers rather than mixing it through large render components.

## Migration Plan

1. Update OpenSpec requirements for save-first authoring and progressive History loading.
2. Add regression tests proving saves complete before images finish and History renders usable structure while images are still loading.
3. Refactor authoring flows to persist activity data before image completion callbacks.
4. Add pending/ready/unavailable image state rendering in Setup and History.
5. Validate client tests and strict OpenSpec validation before release.

Rollback strategy:
- Revert the client flow changes and restore synchronous image-dependent save behavior if background persistence proves unstable.

## Open Questions

- Whether existing activity update endpoints are sufficient for the post-save image patch path without introducing a dedicated async image-refresh endpoint.
- Whether History needs a separate lightweight summary representation later if progressive client loading alone is not enough.
