## Why

The app currently simulates completion imagery with a local SVG placeholder, so the reward moment does not actually use the child's configured interests to produce unique celebratory art. We need a real server-side image generation path that uses the OpenAI API key from `.env` without exposing secrets to the browser.

## What Changes

- Replace the client-only placeholder completion image generator with a server-backed OpenAI image generation flow for celebratory completion art.
- Add a backend completion-image endpoint that accepts completion context, uses child interest themes as prompt inputs, and returns an image payload the UI can reveal with the existing celebration animation.
- Load the OpenAI API key from `.env` on the server and treat missing configuration or generation failures as non-blocking for completion recording.
- Keep instructional task image generation unchanged for now; this change starts only with completion-triggered celebratory images when an activity is marked complete.

## Capabilities

### New Capabilities
- `openai-image-generation`: Server-side OpenAI image generation for celebratory preschool completion art using environment-based credentials

### Modified Capabilities
- `completion-imagery`: Completion imagery generation changes from a local placeholder implementation to a backend OpenAI-powered image workflow while preserving non-blocking completion behavior and celebratory reveal

## Impact

- Affected code: server route registration, server environment/bootstrap, client completion-image flow, client tests, server tests, and E2E coverage
- New dependencies: OpenAI Node SDK and server-side environment loading support
- APIs: new backend endpoint for completion image generation
- Systems: `.env`-based secret configuration for the local server runtime
