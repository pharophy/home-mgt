## Context

The weekly Sticker Chart currently determines matrix completion state by matching `childProfileId`, `itemId`, and `scheduledDay`. That logic ignores the actual completion timestamp, so a saved completion from a prior week can populate the same weekday column in the current visible week.

The client already receives `completedAt` on completion records, and the chart already computes the visible week headers from the current date. That means the fix can stay client-side if the matrix view-model consistently filters completions to the visible week before deriving cell state and completion artwork.

## Goals / Non-Goals

**Goals:**

- Make weekly matrix completion state reflect only completions recorded in the visible calendar week.
- Preserve the existing interaction model where only the current day column is actionable.
- Keep current-week earlier completions visible so the chart still works as a weekly review surface.

**Non-Goals:**

- Redesigning the History page or its month-based review flow.
- Changing the server completion API or SQL schema.
- Adding cross-week chart navigation in this change.

## Decisions

### Filter matrix completions by visible week using `completedAt`

The weekly matrix will treat a completion as eligible for a cell only when:

- the completion matches the child, item, and scheduled weekday, and
- the completion status is `completed` or `approved`, and
- the completion `completedAt` timestamp falls within the visible Sunday-through-Saturday week.

This uses existing data and fixes the bug at the place where the incorrect projection happens.

Alternative considered:

- Add a new persisted calendar-date field for the scheduled slot. Rejected because the current bug can be fixed without a server or persistence change, and the existing timestamp is enough for a single visible-week chart.

### Use the same visible-week filter for persisted sticker artwork

The `completionArtwork` map built from persisted completions will use the same visible-week eligibility rules as the matrix rows. This keeps cell completion state and image rendering consistent and avoids showing a historical sticker image in a current-week future cell.

Alternative considered:

- Filter only the row completion state and leave artwork hydration unchanged. Rejected because it can still leak historical images into cells that should be muted placeholders.

### Keep invalid or missing timestamps out of week-specific cells

If a completion lacks a parseable `completedAt`, it will not populate the current weekly chart. That is safer than treating the record as current and repeating the same bug with ambiguous data.

Alternative considered:

- Fall back to `scheduledDay`-only matching when `completedAt` is missing. Rejected because it preserves the incorrect cross-week behavior.

## Risks / Trade-offs

- [Older malformed completion records may disappear from the chart] → History still preserves saved stickers, and new completions already persist `completedAt`.
- [Week filtering can become timezone-sensitive near midnight] → Use the browser-local `Date` boundaries consistently for both visible week headers and completion eligibility.
