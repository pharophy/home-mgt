## Context

The current completion-image flow lives entirely in the client and uses a synthetic SVG placeholder. That keeps tests fast, but it means the celebratory reward moment is not actually generated from the child's saved interests and it forces any future API key usage into the browser unless the architecture changes. This change needs to preserve the existing non-blocking completion UX while moving image generation to the server, where `.env` configuration can be used safely.

## Goals / Non-Goals

**Goals:**
- Generate celebratory completion imagery through the OpenAI API on the server when an activity is marked complete.
- Read the OpenAI API key from `.env` on the server and keep it out of client code.
- Preserve the current completion-first behavior: the task is recorded even if image generation is slow, missing, or fails.
- Keep the existing celebratory reveal animation once an image is returned to the client.

**Non-Goals:**
- Rework instructional task image generation in this change.
- Persist generated completion images beyond the current in-memory/UI completion state.
- Build a full sticker gallery, download flow, or moderation review console.

## Decisions

### Use a server endpoint for completion-image generation
The client will no longer generate celebratory images directly. Instead, after a completion is recorded, it will POST completion context to a dedicated backend endpoint.

Rationale:
- The OpenAI API key must not be exposed in browser bundles.
- The backend can centralize prompt construction, model selection, and future retry/logging behavior.

Alternatives considered:
- Call OpenAI directly from the client: rejected because it exposes credentials.
- Generate the image during `/api/completions` itself: rejected for now because it couples image latency to the primary completion write path.

### Keep completion recording and image generation as separate steps
The existing UX already treats imagery as a follow-on artifact. We will keep that split: record completion first, then request the image.

Rationale:
- This preserves the current non-blocking contract from the baseline spec.
- It keeps failure handling simple: the client can show `imageUnavailable` without rolling back the completion.

Alternatives considered:
- Synchronous completion+image generation in one request: rejected because it would make completion success depend on third-party latency.

### Generate images on the server with the OpenAI Node SDK and return a data URL
The server will call the OpenAI API via the official Node SDK. For the initial implementation, the server returns a generated image as a data URL string to the client.

Rationale:
- The official SDK is the supported integration path.
- Returning a data URL avoids introducing object storage or a file-serving pipeline in this first increment.
- A data URL is compatible with the current `<img src>` client rendering path.

Inference from official docs:
- The OpenAI docs recommend the Image API or Responses API for image generation; for a single image from one prompt, the Image API is the simpler fit.

Alternatives considered:
- Responses API tool calling: viable, but unnecessary for a single non-conversational image request.
- Writing generated files to disk: rejected because there is no persistence or cleanup strategy yet.

### Treat missing API configuration as a recoverable runtime condition
If `OPENAI_API_KEY` is missing, or the OpenAI request fails, the completion-image endpoint will return a recoverable error response and the client will show the existing unavailable state.

Rationale:
- The user asked to start with the completion image behavior, not to block the app on deployment completeness.
- This keeps local development workable even before `.env` is configured.

Alternatives considered:
- Fail server startup when the key is missing: rejected because the rest of the app still works without celebratory imagery.

## Risks / Trade-offs

- [Risk] Third-party latency could make the celebratory image feel delayed. -> Mitigation: keep image generation asynchronous from completion recording and preserve a pending state in the UI.
- [Risk] Generated image payloads may be large as base64 data URLs. -> Mitigation: start with a single modest-sized image and avoid persistence in this change.
- [Risk] OpenAI errors or missing org verification could make image generation intermittently unavailable. -> Mitigation: surface image-unavailable UI without affecting completion success.
- [Risk] Prompt inputs based on child interests could drift toward copyrighted-character requests. -> Mitigation: reuse and enforce the existing prompt-safety wording on the server.
