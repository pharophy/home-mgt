## Context

The current client already distinguishes parent/admin workflows from the child-facing tablet stage, but the actual layouts still skew desktop-like in several places. Parent surfaces rely on multi-panel compositions and non-sticky controls, while the child-facing tablet stage and tablet launcher do not yet define how they should behave across portrait and landscape tablet sizes. Because this product is meant to be used on a shared household tablet, ergonomics on medium-width touch screens are not cosmetic polish; they directly affect whether the app feels usable in the kitchen, hallway, or bedtime routine context where the device is actually used.

This change crosses navigation, shared layout primitives, the Sticker Chart, parent workspaces, and the child-facing stage. It benefits from a design pass up front so the spec changes align around one tablet model instead of a set of unrelated CSS tweaks.

## Goals / Non-Goals

**Goals:**
- Establish a shared tablet UX baseline for touch targets, safe-area spacing, and reachable primary actions.
- Preserve a clear parent-to-child handoff into tablet mode without promoting tablet mode into a permanent top-level parent destination.
- Make core parent surfaces readable and operable on common tablet widths in both portrait and landscape usage.
- Keep the child-facing task stage legible, tappable, and orientation-aware without exposing parent controls.

**Non-Goals:**
- Redesign the app for phones or very small mobile screens.
- Introduce a brand new information architecture or additional user roles.
- Replace the existing child/task data model or image-generation flows.
- Build a native app shell or platform-specific gesture system.

## Decisions

### Introduce shared tablet ergonomics rules instead of per-component one-offs
The client should define a small set of shared tablet layout rules in CSS and component structure, such as minimum touch target sizing, viewport-safe padding, and spacing for sticky action zones. That creates one tablet baseline that parent and child surfaces can reuse.

Alternative considered:
- Patch each screen independently. Rejected because it would produce inconsistent tap target sizes and repeated breakpoint logic across the app.

### Preserve route/workspace context when launching child-facing tablet mode
Entering tablet mode should preserve the parent’s current child selection and current parent destination so a parent can exit child mode and return to the same operational context. The launch path should remain secondary rather than a top-level tab.

Alternative considered:
- Treat tablet mode as a fully separate route with no preserved return state. Rejected because shared-device handoff becomes clumsy for the common parent-child-parent loop.

### Favor tablet-specific layout adaptations over shrinking existing desktop panels
For Setup, Sticker Chart, and History, the design should adapt panel composition at tablet widths rather than trying to squeeze every desktop panel into the same multi-column layout. Likely tactics include stacked sections, sticky child/context controls, horizontally scrollable chart regions with stable labels, and persistent action bars for save/complete actions.

Alternative considered:
- Keep the existing layouts and only reduce spacing/font sizes. Rejected because that preserves the same interaction density that causes touch friction in the first place.

### Keep child-facing tablet mode visually simple and orientation-aware
The child stage should keep one dominant action, large artwork, and large completion controls while adapting its internal layout between portrait and landscape. Parent/admin affordances should remain absent except for an intentional exit affordance suitable for a shared tablet handoff.

Alternative considered:
- Add more task metadata or secondary controls in tablet mode. Rejected because it increases distraction and weakens the non-reader-first interaction model.

## Risks / Trade-offs

- [Tablet breakpoints may overfit one device class] -> Mitigation: define requirements around usable behavior on common tablet widths rather than tying behavior to one exact resolution.
- [Sticky controls can obscure content] -> Mitigation: reserve explicit safe-area-aware padding so fixed or sticky elements do not cover the final rows or form controls.
- [Parent return context may become stale after data changes] -> Mitigation: preserve only lightweight route and selection context, then re-derive visible data from the current app state on return.
- [Horizontal chart scrolling can hurt scanability] -> Mitigation: keep row labels and current context visible while limiting scroll to the matrix region rather than the whole page.

## Migration Plan

1. Add regression tests for tablet launch/return behavior, child-stage responsiveness, and tablet-width parent layouts.
2. Introduce shared tablet layout primitives and responsive component updates behind the existing parent/tablet mode state.
3. Update Sticker Chart, Setup, History, and tablet stage layouts to consume the shared tablet rules.
4. Verify the tablet handoff still protects parent/admin controls during child use.
5. Run client tests and strict OpenSpec validation before implementation is considered ready.

Rollback strategy:
- Revert the responsive/tablet-specific layout changes and return to the prior workspace compositions if the new tablet adaptations introduce instability.

## Open Questions

- Whether the best tablet launch affordance belongs in the app header, child context area, or a dedicated secondary utility strip.
- Whether History needs a distinct tablet card density mode in addition to general responsive layout changes.
- Whether the Sticker Chart should prefer horizontal matrix scrolling or a partially condensed row presentation first on portrait tablets.
