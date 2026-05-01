## Why

The completion-image flow is currently producing images that feel repetitive across repeated celebrations, and the configured child interest themes are not being reflected strongly enough in the generated results. That weakens the reward moment and misses the core personalization behavior promised by the product.

## What Changes

- Strengthen server-side completion-image prompt construction so configured child interests are translated into explicit visual direction rather than a weak generic inspiration mention.
- Add controlled per-request variation inputs so repeated completions for the same child and activity do not keep generating near-identical images.
- Add regression tests that lock in both interest-driven prompt content and variation behavior.

## Impact

- Affected code: `server/src/lib/completion-images.ts`, completion-image route/service tests, and any client/server tests that assert completion-image request details.
- APIs: no request or response shape change is required.
- UX: completion celebrations should feel more personalized and less repetitive.
