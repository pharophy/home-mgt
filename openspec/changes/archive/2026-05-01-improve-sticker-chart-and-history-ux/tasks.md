## 1. Spec And UX Framing

- [x] 1.1 Confirm the Sticker Chart reload bug and capture the expected persisted-week behavior in failing tests before refactoring.
- [x] 1.2 Add or update failing client tests for the Sticker Chart header, equal-width columns, cell alignment, and child-context layout expectations.
- [x] 1.3 Add or update failing client tests for History month view and gallery view behavior.

## 2. Sticker Chart State And Layout

- [x] 2.1 Update chart/view-model state hydration so saved completion stickers from earlier days in the visible current week reload after refresh.
- [x] 2.2 Refactor matrix cell rendering so interactive current-day stars, muted placeholders, loading states, and completed stickers share consistent alignment geometry.
- [x] 2.3 Adjust the Sticker Chart table layout so weekday columns remain uniform in width regardless of content state.
- [x] 2.4 Redesign the chart row composition to reduce low-value grey space and prioritize readable activity labels, activity imagery, and step imagery.
- [x] 2.5 Rework the top Sticker Chart header so active-child controls and current week/month context form one compact integrated layout.

## 3. History Experience

- [x] 3.1 Implement a navigable month view in History that indicates which days have saved sticker completions.
- [x] 3.2 Implement a gallery mode in History for browsing all saved stickers with contextual metadata.
- [x] 3.3 Ensure empty, filtered, and day-selected History states remain clear and cohesive across both modes.
- [x] 3.4 Add child-based filtering to History so month and gallery modes can be scoped to one child or all children.
- [x] 3.5 Refine the gallery into a masonry-style wall with varied sticker sizes and near-touching gutters.

## 4. Verification

- [x] 4.1 Run `npm test --workspace client`.
- [x] 4.2 Run `openspec validate improve-sticker-chart-and-history-ux --type change --strict --no-interactive`.
