## Context

The repository already has separate client and server workspaces, a combined dev script, and a server start path that only launches the API. The missing piece is a production entrypoint that builds both workspaces and serves the compiled client from the same machine so the app can be exercised locally in a production-like mode.

This change affects the root scripts, server startup behavior, and static asset serving. It must preserve the current dev workflow and test setup.

## Goals / Non-Goals

**Goals:**
- Provide a single local production launch path that builds the client and server, then serves the built app from the server.
- Allow the production server to host the client bundle and SPA entrypoint from the local filesystem.
- Keep the development workflow unchanged.
- Keep the existing data store selection behavior intact.

**Non-Goals:**
- No new hosting provider, CI/CD platform, or remote deployment automation.
- No change to app behavior or domain features.
- No rewrite of the client build toolchain.

## Decisions

1. Serve the built client from the Express server in production.
   - This keeps the production runtime simple: one Node process, one port, one process tree.
   - Alternatives considered: a separate static file server or reverse proxy. Rejected because they add operational complexity for a local-machine deployment without improving the actual product behavior.

2. Make static serving opt-in through production startup wiring, not through the dev/test path.
   - The app should only look for the client build output when the production entrypoint passes that path in.
   - Alternatives considered: always serving a static directory if it exists. Rejected because it can accidentally couple tests and development to build artifacts.

3. Add a root-level production launch script that performs build then start.
   - This provides a predictable pipeline for the user to run locally.
   - Alternatives considered: relying on separate manual build and start commands. Rejected because the user explicitly asked for a production pipeline.

4. Bind the production server to a configurable host and port.
   - Defaulting to a local-network-friendly host allows the app to be reached from other devices on the same LAN when needed.
   - Alternatives considered: hard-coding a port or host. Rejected because it makes local hosting brittle and less reusable.

## Risks / Trade-offs

- [Risk] Production serving logic can accidentally affect API-only or test behavior. → Mitigation: keep static hosting behind production startup wiring and cover it with integration tests.
- [Risk] SPA fallback can mask unexpected route mistakes. → Mitigation: restrict the fallback to non-API requests only.
- [Risk] A single process serving both app and API can make failures more coupled. → Mitigation: keep the runtime minimal and the build/start commands explicit.

## Migration Plan

1. Add production static-serving support to the server without changing dev startup.
2. Add a root-level production launch script that builds both workspaces and starts the server.
3. Add tests for the production launch path and client asset serving.
4. Update the README with the new local production command.
5. Roll back by removing the production static-serving wiring and restoring the prior scripts if needed.

## Open Questions

- What command name should be the primary documented launch path: `npm run prod`, `npm run start:prod`, or both?
- Should the production server default to the current API port or a separate local-hosting port?
