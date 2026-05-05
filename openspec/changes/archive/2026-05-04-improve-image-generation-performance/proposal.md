## Why

Instructional image generation currently sits too directly on the critical path for activity authoring and history review. Parents should be able to save tasks immediately, see clear progress while artwork is still being generated, and open History without waiting on large batches of images to settle.

## What Changes

- Allow parent activity saves to complete immediately even when the instructional image and step thumbnails are still being generated.
- Show explicit generating-image placeholder states in activity authoring and anywhere newly created task images are still pending.
- Improve History image loading so the month and gallery views render quickly and let images fill in progressively instead of blocking the surface.
- Preserve background image-generation and persistence behavior so saved activities and history records eventually hydrate with stable generated imagery.

## Capabilities

### New Capabilities
- `image-generation-performance`: Performance-oriented behavior for non-blocking image generation, visible pending states, and progressive image loading.

### Modified Capabilities
- `activity-authoring`: Activity save behavior changes so authoring no longer waits for image generation to finish.
- `completion-imagery`: History image presentation changes so saved sticker surfaces load progressively and stay responsive.

## Impact

- Affected client code in activity authoring, image-preview state, and History rendering.
- Likely affected server/client contracts for background instructional-image generation and persisted pending-image metadata.
- Affected tests across authoring flows, image-generation state transitions, and History performance/loading behavior.
