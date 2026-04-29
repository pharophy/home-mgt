## Why

The parent UX is still centered around a mixed workspace where child setup, activity editing, status summaries, and the weekly matrix compete on the same surface. That makes routine management harder than it needs to be, and it hides key lifecycle actions such as updating or deleting child profiles and activities. The app also lacks a dedicated history view for reviewing the generated celebration stickers that are already being persisted on completions.

## What Changes

- Split the parent experience into dedicated pages for child profiles, activities, the weekly completion matrix, and sticker history.
- Add full CRUD support for child profiles from the parent UI and API.
- Add full CRUD support for activities from the parent UI and API for both routines and chores.
- Add a history page that lists generated sticker images from saved completions, with enough context to identify the child, activity, and completion time.
- Keep the weekly matrix as the primary completion workflow while removing mixed setup/editor controls from that page.

## Impact

- Affected code: client routing, parent-facing components, shared app route/types, server child-profile and activity routes, server integration tests, and client integration tests.
- APIs: new update/delete routes for child profiles, update/delete routes for chores, and delete routes for routines.
- Data: deleting child profiles or activities will cascade their related completion and reward history to keep SQL state coherent.
