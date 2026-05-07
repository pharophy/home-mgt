## Why

The weekly Sticker Chart currently matches saved completions by weekday name alone. That causes a sticker earned on a prior week's Friday to appear again in this week's Friday column, which makes future days look pre-completed.

## What Changes

- Scope weekly Sticker Chart completions to the visible calendar week instead of matching any historical completion with the same weekday.
- Derive weekly matrix completion state from completion timestamps so only completions recorded within the visible week can fill that week's cells.
- Preserve current-day interaction rules while keeping past and future scheduled cells read-only unless they belong to a recorded completion in the current visible week.
- Add regression coverage for prior-week completions so they do not appear as stickers in future-day columns of the current week.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `weekly-completion-matrix`: Weekly matrix cells now reflect completion state only for the visible calendar week, not all historical completions with the same weekday.

## Impact

- Affected client view-model logic for weekly matrix row construction and completion-art mapping.
- Affected Sticker Chart rendering tests in the client workspace.
- No API contract changes are required because completion timestamps already exist in persisted records.
