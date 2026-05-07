## ADDED Requirements

### Requirement: Missing completion sticker images can be regenerated from persisted records

The system SHALL provide a supported recovery path for completions whose saved sticker image is missing.

#### Scenario: Recover a completion sticker from a saved prompt

- **GIVEN** a completion record exists without a saved `celebrationImageUrl`
- **AND** the completion has a persisted `celebrationPrompt`
- **WHEN** the recovery workflow is run
- **THEN** the system regenerates a replacement sticker image from that saved prompt
- **AND** persists the regenerated image through the managed generated asset store
- **AND** leaves the completion prompt and theme intact

#### Scenario: Recover a completion sticker from current completion metadata

- **GIVEN** a completion record exists without a saved `celebrationImageUrl`
- **AND** the completion does not have a persisted `celebrationPrompt`
- **WHEN** the recovery workflow is run
- **THEN** the system rebuilds a completion image request from the current child profile, activity name, and household celebration mode
- **AND** persists the regenerated image through the managed generated asset store

#### Scenario: Skip completions that already have saved sticker images

- **GIVEN** a completion record already has a saved `celebrationImageUrl`
- **WHEN** the recovery workflow is run
- **THEN** the system leaves that completion unchanged
