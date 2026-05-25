# Change: Share production generated assets across releases

## Why
Production generated image assets are being written under the active release tree instead of the shared application tree, so redeploys can delete already-saved images.

## What Changes
- Resolve managed generated-image storage to `app/shared/generated-assets` anywhere production code runs under the application tree.
- Keep the local-development fallback path unchanged when no shared application tree exists.

## Impact
- `server`: generated image persistence and recovery will keep using a release-safe shared directory in production.
- `deployment`: redeploys will no longer remove previously saved generated images.
