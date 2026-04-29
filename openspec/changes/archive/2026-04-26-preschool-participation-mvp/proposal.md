## Why

The product direction has narrowed from a general family organizer to a preschool participation tool for parents of a 4-year-old. Existing household apps do not fit a non-reader child who needs tiny-step routines, parent guidance, and visible encouragement to help with chores.

## What Changes

- Introduce a tablet-first preschool participation experience centered on routines and simple chores.
- Add a child profile model optimized for a 4-year-old, including avatar, color, and motivation preferences.
- Add parent-authored routines composed of visual, ordered steps that a child can complete on a shared tablet.
- Add age-appropriate recurring chores with optional approval and simple rewards such as stars or stickers.
- Add a child-facing tablet mode with large touch targets, one active task at a time, and immediate completion feedback.
- Add caregiver access so another adult can run routines and mark completions without full admin privileges.
- Explicitly defer broad family calendar aggregation, meal planning, grocery flows, and generalized home management features from the MVP.

## Capabilities

### New Capabilities
- `preschool-participation`: Child profile, visual routines, simple chores, lightweight rewards, and the child-facing tablet flow.
- `caregiver-access`: Limited-permission caregiver access to run routines and record completion without full household administration.

### Modified Capabilities
- None.

## Impact

- Affected code: React client information architecture, tablet-first flows, API endpoints, persistence layer, and future media upload handling for icons/photos.
- Affected systems: household data model, auth/roles model, routine and chore services, reward state, caregiver permissions.
- Dependencies: likely persistence for structured routine/chore data and uploaded media, plus role-aware API authorization.
