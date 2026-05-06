## ADDED Requirements

### Requirement: Bootstrap state responses SHALL exclude inline persisted generated image payloads
The system SHALL keep bootstrap-style JSON responses lightweight by excluding inline base64 generated image payloads from persisted activity and completion records that are returned to the client.

#### Scenario: Parent app requests initial state
- **WHEN** the client requests `/api/state`
- **THEN** the system returns child, activity, completion, and reward metadata needed to render Sticker Chart, Setup, and History
- **THEN** any persisted generated instructional or completion image references in that response are represented as fetchable asset URLs rather than inline `data:image/...` payloads

#### Scenario: Client requests the current daily plan
- **WHEN** the client requests `/api/today-plan` for a child and weekday
- **THEN** the response remains lightweight enough to render the plan metadata before large image bytes are fetched
- **THEN** any persisted generated activity image references in that response are represented as fetchable asset URLs rather than inline `data:image/...` payloads

### Requirement: Persisted generated images SHALL be readable through same-origin asset routes
The system SHALL expose persisted generated instructional and celebratory images through same-origin image endpoints so browsers can load them progressively after metadata has rendered.

#### Scenario: Browser loads a saved activity image
- **WHEN** a saved routine, routine step, or chore references a persisted generated image
- **THEN** the system provides an image URL that resolves to the persisted image bytes for that entity
- **THEN** the browser can request that image independently from the bootstrap JSON response
- **THEN** the image request succeeds without requiring custom actor headers that standard browser `<img>` requests cannot send

#### Scenario: Browser loads a saved completion sticker
- **WHEN** a recorded completion references a persisted generated sticker
- **THEN** the system provides an image URL that resolves to the persisted sticker bytes for that completion
- **THEN** Sticker Chart and History can render their metadata without waiting for all sticker bytes to be embedded in `/api/state`
- **THEN** the image request succeeds without requiring custom actor headers that standard browser `<img>` requests cannot send
