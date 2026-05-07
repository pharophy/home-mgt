## Why

Managed generated images now load from same-origin `/generated-assets/...` paths, but the Vite dev server only proxies `/api` requests to the backend. As a result, images fail to load in development even though production serves them correctly.

## What Changes

- Proxy `/generated-assets` through the Vite dev server to the backend target used for API requests.
- Prevent missing `/generated-assets/...` requests from falling through to the SPA shell in production.
- Clear broken app-owned generated instructional image references when the managed asset file is missing so normal instructional backfill can recover them.
- Add regression coverage for the Vite dev proxy configuration so managed generated images keep loading in development.

## Capabilities

### New Capabilities

### Modified Capabilities
- `generated-image-file-storage`: Same-origin managed generated-image paths remain loadable during local development, not just in production.

## Impact

- Affected client dev tooling: Vite proxy configuration.
- Affected server routing: SPA fallback exclusions for generated assets.
- Affected persistence read behavior: broken managed generated-image references are scrubbed before state is returned.
- Affected tests: add client and server regression coverage for generated-asset routing behavior.
