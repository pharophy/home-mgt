## Context

The recent parent UX work made Sticker Chart the primary operating surface, but the current page still has several unresolved interaction and layout problems. The most serious is behavioral: persisted completion imagery from earlier days in the visible week is not consistently rehydrated into the chart after refresh, which makes the chart look unreliable even though the completion may still exist in saved state. The page also still spends too much area on grey framing and a loosely placed child-selection section rather than on large, readable activity imagery and text.

History has a related product issue. It currently behaves like a single flat review surface, which is useful for browsing all stickers but weak for answering a parent question like "what did we earn on Tuesday?" The user wants both a temporal navigation mode and an all-stickers gallery mode, so the design needs to support both date-oriented review and media-oriented browsing.

This is a cross-cutting client change because it touches weekly state hydration, chart rendering rules, page-level layout, and history presentation together.

## Goals / Non-Goals

**Goals:**
- Make persisted stickers for earlier days in the current visible week reload reliably into the Sticker Chart.
- Normalize chart-cell sizing and alignment so current-day stars and non-current placeholders share the same visual geometry.
- Increase the percentage of chart row space allocated to meaningful images and child-readable text.
- Add clear current-month context at the top of Sticker Chart and render the visible week in Sunday-first order.
- Rework the selected-child/header region so it feels integrated, compact, and proportional to the chart.
- Add both month-view and gallery-view history modes without losing the existing saved-sticker review value.

**Non-Goals:**
- Redesigning the overall app navigation beyond the Sticker Chart and History surfaces.
- Changing the completion-image generation model or introducing a new image provider.
- Replacing the underlying weekly matrix interaction model with a different tracking metaphor.

## Decisions

### 1. Treat weekly completion imagery as persisted chart state, not transient current-day UI state
The chart should derive each visible cell's completion-image state from persisted completion records for the entire visible week, not just from the current interaction path or current-day optimistic state.

Rationale:
- The reported refresh bug indicates the current rendering path is too dependent on transient state.
- Persisted completions should be the source of truth for chart rehydration.
- This keeps weekly review stable regardless of when the page is opened.

Alternatives considered:
- Re-request or regenerate missing imagery during page load. Rejected because previously generated stickers should not depend on a new generation request.
- Keep prior-day stickers only in History. Rejected because it weakens the chart's role as a week-at-a-glance surface.

### 2. Make chart geometry fixed and content-driven
Weekday columns should use consistent widths, and cell internals should share a common alignment box across interactive, muted, loading, and completed states.

Rationale:
- Equal-width columns make the week easier to scan.
- Shared alignment prevents the current-day icon from appearing visually elevated relative to muted cells.
- Fixed geometry reduces layout shift when content changes from star to image.

Alternatives considered:
- Let content size dictate column width. Rejected because text/image variance weakens week-level rhythm.
- Patch only the current-day star offset. Rejected because the underlying issue is inconsistent cell composition, not one icon offset.

### 3. Use a compact integrated chart header
The top portion of Sticker Chart should combine active-child context, child switching, and current week/month context in one compact header zone instead of a half-width child section plus disconnected chart content.

Rationale:
- The current layout wastes horizontal space and makes the page feel unbalanced.
- Integrating child context with week context keeps the parent's mental model in one place.
- A compact header leaves more vertical room for the chart itself.

Alternatives considered:
- Leave the child section above the chart and only resize it. Rejected because the issue is structural placement, not just dimensions.
- Move child switching into a side panel. Rejected because it would compete with chart width on smaller screens.

### 4. Rebalance chart rows around legibility for a child
Row layouts should prioritize large activity imagery, clear step thumbnails, and readable labels by reducing low-value grey framing, tightening gutters, and reserving more width for content-bearing areas.

Rationale:
- The chart needs to be legible to a child, not just navigable to a parent.
- Images and labels are the primary meaning-bearing elements in each row.
- Decorative neutral space should yield to instructional content.

Alternatives considered:
- Keep the existing composition and only scale images slightly. Rejected because it does not recover enough useful space.

### 5. Split History into date mode and gallery mode within one destination
History should support two review modes inside the same destination:
- Month view for navigating a calendar of sticker-producing days
- Gallery view for browsing all generated stickers in a media-first layout with a large-sticker spotlight interaction

Rationale:
- These modes answer different user questions and should coexist.
- A single destination avoids route bloat while still supporting two useful mental models.
- A calendar grid better supports "what happened on this day?" than a flat list of date chips.
- A spotlight interaction lets the gallery feel celebratory rather than purely archival.

Alternatives considered:
- Replace gallery with month view only. Rejected because users also want a broad visual browse surface.
- Put month and gallery in separate top-level destinations. Rejected because the distinction is secondary, not navigation-level.

## Risks / Trade-offs

- [Risk] Weekly rehydration changes may expose hidden assumptions in the current completion state model. Mitigation: define visible-week completion lookup rules explicitly in tests before refactoring rendering.
- [Risk] A denser, image-first chart layout could become cramped on narrow widths. Mitigation: define mobile/compact layout rules that preserve equal column widths while allowing row content to stack intentionally.
- [Risk] History month view can become visually busy if too many stickers exist on a single day. Mitigation: use day-level indicators and defer full sticker detail to day drill-in or linked gallery results.
- [Risk] Combining child context and week context into one header could overload the top row. Mitigation: prioritize one dominant child selector and concise date context rather than multiple competing panels.

## Migration Plan

- No data migration is expected if persisted completion images already exist on saved completion records.
- Update chart hydration logic and rendering first so existing stored stickers appear correctly after reload.
- Introduce the new History view modes behind the existing History destination so current routes remain stable.

## Open Questions

- Should the month view open a day-specific sticker tray inline, or should selecting a day filter the gallery below it?
- Should the Sticker Chart header show the full date range for the visible week in addition to the current month label?
- On very small screens, should child switching collapse into chips, a segmented control, or a compact dropdown?
