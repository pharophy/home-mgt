## ADDED Requirements

### Requirement: Generated images SHALL be materialized as managed files
The system SHALL materialize generated instructional and celebratory images into managed files on disk and SHALL persist same-origin managed asset paths instead of inline generated-image payloads.

#### Scenario: Parent saves a generated instructional image
- **WHEN** a routine, routine step, or chore is saved with a generated image payload
- **THEN** the system writes that generated image into the managed asset directory
- **THEN** the persisted activity image field stores a same-origin managed asset path instead of the inline payload

#### Scenario: Server saves a generated completion sticker
- **WHEN** the server stores a generated completion image for a recorded completion
- **THEN** the system writes that generated image into the managed asset directory
- **THEN** the persisted completion image field stores a same-origin managed asset path instead of the inline payload

### Requirement: Managed generated images SHALL be served as static assets
The system SHALL serve managed generated images as same-origin static content so browsers can load them without invoking stateful image lookup logic.

#### Scenario: Browser loads a saved generated image
- **WHEN** the client renders a managed generated-image path for a routine, routine step, chore, or completion
- **THEN** the server responds by serving the corresponding file bytes from the managed asset directory
- **THEN** the request does not require rebuilding household state to locate the image

### Requirement: Legacy inline generated images SHALL be migrated automatically
The system SHALL preserve existing saved generated images by migrating legacy inline generated-image payloads into managed files during normal persistence reads or writes.

#### Scenario: Existing state still contains inline generated image payloads
- **WHEN** the server reads persisted state that still contains inline generated-image payloads
- **THEN** the system materializes managed files for those payloads
- **THEN** the system replaces the inline payloads with same-origin managed asset paths
- **THEN** subsequent reads no longer depend on inline generated-image payloads for those records
