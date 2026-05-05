## 1. Spec And Regression Coverage

- [x] 1.1 Add failing client tests for tablet-width parent workspace layouts, including reachable primary actions and visible context on Setup, Sticker Chart, or History.
- [x] 1.2 Add failing client tests that confirm desktop and tablet keep the same routes, actions, and workflow order while layout presentation changes responsively.
- [x] 1.3 Add failing client tests for touch-friendly control sizing and reachable action regions on tablet-sized screens.
- [x] 1.4 Add failing client tests proving the Sticker Chart shows a loading state immediately after a reward target is tapped and does not require repeated taps during slow sticker generation.

## 2. Shared Tablet Ergonomics

- [x] 2.1 Introduce shared tablet layout primitives in the client styling layer for touch target sizing, safe-area spacing, and persistent action regions.
- [x] 2.2 Refactor parent-facing workspace containers to use the shared tablet ergonomics rules without regressing desktop behavior.

## 3. Tablet Surface Updates

- [x] 3.1 Adapt the Sticker Chart for tablet-sized interaction, including readable context and touch-friendly current-day completion cells.
- [x] 3.2 Update Sticker Chart completion handling so the tapped cell enters a visible pending/loading state immediately on click or tap.
- [x] 3.3 Adapt Setup and History tablet layouts so content stacks cleanly and key actions remain reachable during scrolling.
- [x] 3.4 Refine any existing touch-heavy surfaces responsively without introducing navigation or workflow differences between desktop and tablet.
- [x] 3.5 Update backend sticker generation to use a faster completion-image configuration without noticeable quality loss.

## 4. Verification

- [x] 4.1 Run `npm test --workspace client`.
- [x] 4.2 Run `openspec validate improve-tablet-ux --type change --strict --no-interactive`.
