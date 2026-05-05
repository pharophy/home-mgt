## 1. Spec And Regression Coverage

- [ ] 1.1 Add failing client tests for tablet launch and return behavior that preserve parent route and selected-child context.
- [ ] 1.2 Add failing client tests for tablet-width parent workspace layouts, including reachable primary actions and visible context on Setup, Sticker Chart, or History.
- [ ] 1.3 Add failing client tests for child-facing tablet portrait and landscape behavior with large reachable completion controls.

## 2. Shared Tablet Ergonomics

- [ ] 2.1 Introduce shared tablet layout primitives in the client styling layer for touch target sizing, safe-area spacing, and persistent action regions.
- [ ] 2.2 Refactor parent-facing workspace containers to use the shared tablet ergonomics rules without regressing desktop behavior.

## 3. Navigation And Handoff

- [ ] 3.1 Update parent-to-child tablet launch behavior so tablet mode preserves parent destination and selected-child context for return.
- [ ] 3.2 Add an intentional exit path from child-facing tablet mode that restores the preserved parent context without exposing ambient admin navigation during child use.

## 4. Tablet Surface Updates

- [ ] 4.1 Adapt the Sticker Chart for tablet-sized interaction, including readable context and touch-friendly current-day completion cells.
- [ ] 4.2 Adapt Setup and History tablet layouts so content stacks cleanly and key actions remain reachable during scrolling.
- [ ] 4.3 Refine the child-facing tablet stage for portrait and landscape orientations while preserving one dominant completion action.

## 5. Verification

- [ ] 5.1 Run `npm test --workspace client`.
- [ ] 5.2 Run `openspec validate improve-tablet-ux --type change --strict --no-interactive`.
