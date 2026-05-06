## Why

Generated instructional and completion images are currently persisted as inline base64 strings and then served through dynamic routes that reread the full household state for every image request. That keeps image loads much slower than necessary and prevents the app from using normal static-file serving and caching behavior.

## What Changes

- Persist generated activity and completion images as managed files on disk instead of inline base64 blobs in SQL-backed state.
- Store same-origin managed asset paths in persistence for generated routine, routine-step, chore, and completion images.
- Serve managed generated images as static content so browsers can load and cache them without hitting stateful image lookup routes.
- Migrate legacy persisted inline generated images to managed files when they are encountered so existing saved images continue to work.

## Capabilities

### New Capabilities
- `generated-image-file-storage`: Generated instructional and celebratory images are materialized into managed files and served as same-origin static assets.

### Modified Capabilities
- `persistence`: SQL-backed persistence stores managed generated-image references instead of inline generated-image payloads.

## Impact

- Affected server code: app startup wiring, persistence wrappers, generated-image serialization helpers, and static asset serving.
- Affected client code: generated-image detection must recognize managed static asset paths.
- Affected stored data: legacy inline generated-image payloads need compatibility migration to managed files.
