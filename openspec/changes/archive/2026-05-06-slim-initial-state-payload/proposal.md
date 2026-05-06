## Why

The production app now returns an extremely large initial `/api/state` payload because saved instructional and completion images are embedded as base64 strings inside the JSON response. That makes the app appear empty on lower-memory devices because the first state fetch stalls or fails before Sticker Chart, Setup, and History can render.

## What Changes

- Replace inline generated image payloads in bootstrap-style API responses with same-origin image asset URLs.
- Keep the initial app state and daily plan responses lightweight enough to load before image bytes are fetched.
- Preserve existing chart, setup, and history behavior by allowing browsers to load images progressively after metadata renders.
- Add server routes that can serve persisted generated activity and completion images by entity identifier.

## Capabilities

### New Capabilities
- `state-bootstrap-payload`: The app can bootstrap from lightweight JSON metadata while loading persisted generated images separately as fetchable assets.

### Modified Capabilities
- `completion-imagery`: Saved completion stickers continue to persist and reappear after reloads, but they are delivered through fetchable image asset references instead of inline base64 state payloads.

## Impact

- Affected server APIs: `/api/state`, `/api/today-plan`, routine/chore CRUD responses, completion-image responses, and new image asset routes.
- Affected client code: bootstrap state loading, generated-image detection, and rendering paths for setup, chart, and history surfaces.
- Affected persistence behavior: none at the storage contract level; existing stored base64 image content remains the source of truth.
