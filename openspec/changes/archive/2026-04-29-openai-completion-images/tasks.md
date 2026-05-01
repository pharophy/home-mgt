## 1. Server Image Generation Setup

- [x] 1.1 Add server dependencies and environment loading for OpenAI-backed image generation
- [x] 1.2 Add a server-side completion image generation service that builds safe prompts from child interests and completion context
- [x] 1.3 Add a backend endpoint for requesting celebratory completion images with recoverable failure responses

## 2. Client Completion Flow

- [x] 2.1 Replace the client-only completion image generator with a call to the backend completion-image endpoint
- [x] 2.2 Preserve the existing pending, success, unavailable, and celebratory reveal states in the completion UI

## 3. Verification

- [x] 3.1 Add or update server tests for successful OpenAI-backed completion image generation and missing-config failure handling
- [x] 3.2 Add or update client tests for completion-triggered backend image requests and non-blocking failure handling
- [x] 3.3 Update the E2E flow to verify celebratory image generation still appears after completion
- [x] 3.4 Run the relevant server, client, and E2E test suites
