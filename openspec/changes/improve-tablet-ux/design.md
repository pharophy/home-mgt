## Context

The current client already has the workflows it needs, but several surfaces still skew desktop-like in layout density and control sizing. Parent surfaces rely on multi-panel compositions and non-sticky controls, and some existing views do not yet define how they should adapt across portrait and landscape tablet sizes. The Sticker Chart also has a perceived-performance gap at the top of the interaction funnel: after a user taps a star, the UI can wait too long before showing that sticker generation is underway, which encourages repeated taps. Because this product is meant to be usable on tablet-class screens as well as desktop, the work should improve responsiveness and touch ergonomics without creating a device-specific product variant.

This change crosses shared layout primitives, the Sticker Chart, parent workspaces, and possibly existing child-facing surfaces where touch ergonomics need improvement. It benefits from a design pass up front so the spec changes align around one responsive model instead of a set of unrelated CSS tweaks.

## Goals / Non-Goals

**Goals:**
- Establish a shared tablet UX baseline for touch targets, safe-area spacing, and reachable primary actions.
- Keep desktop and tablet on the same routes, workflows, and information architecture.
- Make core app surfaces readable and operable on common tablet widths in both portrait and landscape usage.
- Improve touch ergonomics without introducing tablet-only features or navigation.
- Make Sticker Chart completion feedback feel immediate so users do not re-tap while sticker generation is pending.

**Non-Goals:**
- Redesign the app for phones or very small mobile screens.
- Introduce a brand new information architecture or additional user roles.
- Replace the existing child/task data model or image-generation flows.
- Split the app into separate desktop and tablet workflow variants.
- Build a native app shell or platform-specific gesture system.

## Decisions

### Introduce shared tablet ergonomics rules instead of per-component one-offs
The client should define a small set of shared tablet layout rules in CSS and component structure, such as minimum touch target sizing, viewport-safe padding, and spacing for sticky action zones. That creates one tablet baseline that parent and child surfaces can reuse.

Alternative considered:
- Patch each screen independently. Rejected because it would produce inconsistent tap target sizes and repeated breakpoint logic across the app.

### Preserve the existing navigation and workflow model
The responsive tablet work should not introduce new routes, launch paths, or device-specific workflow splits. Tablet should use the same navigation structure and the same user-facing jobs as desktop, with only layout and control ergonomics changing.

Alternative considered:
- Add tablet-specific navigation or a device-specific handoff model. Rejected because it creates a second product shape instead of improving the existing one.

### Favor tablet-specific layout adaptations over shrinking existing desktop panels
For Setup, Sticker Chart, and History, the design should adapt panel composition at tablet widths rather than trying to squeeze every desktop panel into the same multi-column layout. Likely tactics include stacked sections, sticky child/context controls, horizontally scrollable chart regions with stable labels, and persistent action bars for save/complete actions.

Alternative considered:
- Keep the existing layouts and only reduce spacing/font sizes. Rejected because that preserves the same interaction density that causes touch friction in the first place.

### Favor responsive adaptation over tablet-only behavior
Where existing surfaces need improvement, the design should adapt spacing, stacking, scroll regions, and action placement responsively instead of changing the workflow itself. If the child-facing stage needs ergonomic improvements, they should preserve the same behavior and mental model already present on desktop-sized usage.

Alternative considered:
- Create tablet-only surface behavior that diverges from desktop. Rejected because the requirement is parity of behavior across device sizes.

### Show optimistic pending feedback immediately on Sticker Chart completion
The moment a user taps a current-day reward target, the Sticker Chart should switch that cell into a visible loading state before the sticker image request finishes. That gives immediate acknowledgement of the tap, reduces duplicate input, and improves perceived performance even if actual sticker generation remains unchanged.

Alternative considered:
- Wait for the completion request or image-generation request to resolve before showing loading feedback. Rejected because it leaves a dead period that users interpret as a missed tap.

### Favor a faster sticker-generation model before lowering visible quality
The completion-image path should first pursue lower latency by switching celebratory sticker generation from `gpt-image-1` to `gpt-image-1-mini` while keeping the square `1024x1024` and `medium` quality configuration. That targets faster turnaround with the smallest likely quality trade-off.

Alternative considered:
- Drop quality from `medium` to `low` on the existing model first. Rejected because it is more likely to cause a visible downgrade than a model change while still pursuing speed.

## Risks / Trade-offs

- [Tablet breakpoints may overfit one device class] -> Mitigation: define requirements around usable behavior on common tablet widths rather than tying behavior to one exact resolution.
- [Sticky controls can obscure content] -> Mitigation: reserve explicit safe-area-aware padding so fixed or sticky elements do not cover the final rows or form controls.
- [Horizontal chart scrolling can hurt scanability] -> Mitigation: keep row labels and current context visible while limiting scroll to the matrix region rather than the whole page.
- [Responsive tweaks may accidentally create behavior drift between desktop and tablet] -> Mitigation: keep tests focused on parity of workflow and route behavior while asserting only layout/ergonomic differences.
- [Optimistic loading state may desync from failed completions] -> Mitigation: make the pending cell state resolve cleanly into completed, reverted, or unavailable states based on the actual completion result.
- [Faster image configuration may reduce sticker quality] -> Mitigation: keep `medium` quality and square output while limiting the speed optimization to the completion-image path first.

## Migration Plan

1. Add regression tests for tablet-width layouts and parity of behavior across desktop and tablet usage.
2. Introduce shared tablet layout primitives and responsive component updates without changing route or workflow state.
3. Update Sticker Chart, Setup, History, and any existing touch-heavy surfaces to consume the shared tablet rules.
4. Add immediate pending feedback for Sticker Chart completion clicks so loading appears at tap time rather than after a slow async gap.
5. Verify that the same workflows remain available and behave the same across desktop and tablet breakpoints.
6. Run client tests and strict OpenSpec validation before implementation is considered ready.

Rollback strategy:
- Revert the responsive/tablet-specific layout changes and return to the prior workspace compositions if the new tablet adaptations introduce instability.

## Open Questions

- Whether History needs a distinct tablet card density mode in addition to general responsive layout changes.
- Whether the Sticker Chart should prefer horizontal matrix scrolling or a partially condensed row presentation first on portrait tablets.
