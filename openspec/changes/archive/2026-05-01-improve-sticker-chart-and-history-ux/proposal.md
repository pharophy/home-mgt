## Why

The Sticker Chart and History surfaces now have the right high-level information architecture, but several details break trust or waste space. Persisted stickers from earlier days in the current week disappear after refresh, chart alignment is inconsistent, and the top layout underuses screen space in ways that make activity images and child-readable labels smaller and less legible than they should be.

This change is needed now because the weekly chart is the primary operational surface for both the parent and child. The current issues are no longer cosmetic; they undermine reliability, reduce scanability, and make the history experience feel flatter than the generated sticker system deserves.

## What Changes

- Fix the Sticker Chart hydration behavior so stickers generated on prior days of the current visible week reliably reappear after page refresh and reload from persisted completion records.
- Refine chart-cell layout so current-day interactive stars align visually with muted past/future placeholders rather than floating higher in their cells.
- Rework the Sticker Chart row layout to devote substantially more space to the activity image, step imagery, and readable text while eliminating low-value grey filler areas.
- Add current month context to the chart header in a more visible treatment and render the visible week in Sunday-first order.
- Make weekday columns hold consistent widths regardless of content or completion state.
- Rework the selected-child/header area above the chart into a more intentional, compact layout that uses horizontal space efficiently and feels integrated with the chart instead of occupying an awkward half-width block.
- Expand History into two complementary review modes:
  - a calendar-like month view for seeing which days generated stickers
  - a more interactive gallery view for browsing all generated stickers across time, including a larger single-sticker spotlight

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `weekly-completion-matrix`: strengthen weekly sticker persistence, chart-header context, row/cell alignment, equal-width columns, and image/text-first chart layout expectations
- `completion-imagery`: strengthen persisted completion-image reload behavior and expand History into month and gallery review modes
- `parent-ux-workspace`: refine the Sticker Chart page-level header and selected-child layout so it uses space intentionally and supports the chart as the primary surface

## Impact

- Affected code: parent-facing client components for the Sticker Chart and History views, chart row/cell rendering, related view-model/state hydration, and client tests.
- APIs: no new external API surface is expected, but completion-history/state-loading behavior may need small contract clarifications or stronger coverage.
- Dependencies: no new runtime dependency is required by default; calendar presentation should be implemented within the existing stack unless implementation complexity proves otherwise.
- Systems: `weekly-completion-matrix`, `completion-imagery`, and `parent-ux-workspace` specs all need updated behavioral contracts before implementation.
