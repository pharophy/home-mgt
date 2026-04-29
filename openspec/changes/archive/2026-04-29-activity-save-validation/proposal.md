## Why

The parent activity builder currently sends incomplete activity payloads to the server and surfaces every validation failure as a generic `Request failed with 400` message. In practice, that makes task creation feel broken when the parent forgets a required field such as the activity name or scheduled day.

## What Changes

- Add explicit client-side validation for activity saves before making the request.
- Show actionable validation feedback when the parent tries to save an invalid activity.
- Preserve server-side validation as a fallback and surface server error messages when available.

## Impact

- Affected code: parent activity builder state and client integration tests.
- APIs: none.
- Data: none.
