## 1. Production runtime

- [x] 1.1 Add production static-asset serving to the Express app without changing dev/test behavior.
- [x] 1.2 Wire the server entrypoint to resolve the built client output for production startup.
- [x] 1.3 Make the production host and port configurable from the environment.

## 2. Local production pipeline

- [x] 2.1 Add a root-level production launch script that builds the client and server before starting the production server.
- [x] 2.2 Update package scripts or documentation so the production launch path is obvious and repeatable.

## 3. Verification

- [x] 3.1 Add server integration coverage for production static serving and SPA fallback.
- [x] 3.2 Add a test that validates the production launch path still starts after a successful build.
- [x] 3.3 Update the README with the local production build/start command and access instructions.
- [x] 3.4 Add a regression test and launcher fix for Windows npm-based production startup.
