## Why

The app has a working development setup, but there is no clear production path for building both workspaces and running a single locally hosted production version. That makes it harder to validate the app under production-like conditions, share it on the local network, and catch environment-specific issues before deployment.

## What Changes

- Add a production build pipeline that compiles the client and server together.
- Add a production start path that serves the built app from this machine on the local network.
- Remove any reliance on the dev-only Vite server for the production runtime.
- Preserve the current local data file / SQL store behavior in production mode.
- Keep the development workflow unchanged.

## Capabilities

### New Capabilities
- `local-production-pipeline`: Build and run a production-ready local instance of the app from one machine, with the client served from the production server runtime.

### Modified Capabilities
- None.

## Impact

Affected areas include root package scripts, server startup behavior, client build output serving, and local environment configuration for production mode. This may also affect how the app is launched on the local machine and how static assets are resolved at runtime.
