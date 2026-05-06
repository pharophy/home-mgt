## 1. Spec And Serialization Setup

- [x] 1.1 Add server tests that fail if `/api/state` or `/api/today-plan` return inline persisted image data instead of lightweight image references
- [x] 1.2 Add server tests for same-origin persisted image asset routes for activity images and completion stickers

## 2. Server Implementation

- [x] 2.1 Add centralized serialization helpers that convert persisted generated image data into asset URLs for state, today-plan, and CRUD responses
- [x] 2.2 Add Express routes that serve persisted routine, routine-step, chore, and completion images by identifier
- [x] 2.3 Update completion-image responses and any affected route outputs to return asset-backed image references consistently

## 3. Client Regression Coverage And Integration

- [x] 3.1 Add failing client coverage for recognizing saved generated images when they are served by app asset URLs instead of inline data URLs
- [x] 3.2 Update client image-reference handling so Setup, Sticker Chart, and History continue to render and avoid unnecessary image regeneration after reload

## 4. Validation

- [x] 4.1 Run the relevant OpenSpec validation for `slim-initial-state-payload`
- [x] 4.2 Run targeted server and client tests covering the lightweight bootstrap payload behavior

## 5. Asset Route Auth Regression

- [x] 5.1 Add server regression coverage that persisted image asset routes load without actor headers
- [x] 5.2 Remove actor-header requirements from persisted same-origin image asset routes while keeping state bootstrap endpoints authenticated
