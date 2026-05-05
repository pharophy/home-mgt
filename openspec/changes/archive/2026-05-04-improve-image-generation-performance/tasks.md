## 1. Spec And Test Framing

- [x] 1.1 Add failing client tests that prove activity save completes before instructional image generation finishes.
- [x] 1.2 Add failing client tests for visible pending/unavailable instructional-image states in activity authoring.
- [x] 1.3 Add failing client tests for progressive History rendering and image placeholder behavior.

## 2. Save-First Activity Authoring

- [x] 2.1 Refactor activity create/update flows so valid task data saves immediately without waiting for generated imagery.
- [x] 2.2 Persist generated instructional images and step thumbnails back onto already-saved activities after background completion.
- [x] 2.3 Keep saved activities usable when post-save image generation fails, with a clear unavailable-image state.
- [x] 2.4 Add regression coverage and any required state updates so post-save background activity images appear later on the Sticker Chart.

## 3. Image Loading UX

- [x] 3.1 Add generating-image placeholder treatment for activity previews and step thumbnails while creation is pending.
- [x] 3.2 Add progressive-loading placeholders in History month and gallery views so the layout renders quickly before sticker images finish loading.
- [x] 3.3 Ensure the progressive-loading behavior works cleanly with existing child filters, month navigation, and masonry gallery layout.
- [x] 3.4 Keep save and error notifications visible on screen regardless of scroll position.

## 4. Verification

- [x] 4.1 Run `npm test --workspace client`.
- [x] 4.2 Run `openspec validate improve-image-generation-performance --type change --strict --no-interactive`.
