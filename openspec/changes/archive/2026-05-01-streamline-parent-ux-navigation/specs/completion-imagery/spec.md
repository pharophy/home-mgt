## MODIFIED Requirements

### Requirement: The system SHALL provide a sticker history view
The system SHALL provide a dedicated History destination that shows all saved generated sticker images from recorded completions in a scan-friendly gallery focused on review rather than setup.

#### Scenario: Parent views saved stickers
- **WHEN** the parent opens the History destination after stickers have been generated
- **THEN** the system shows all saved stickers in reverse chronological order with child, activity, and completion context
- **THEN** the system does not mix child or activity setup controls into that review surface

#### Scenario: No stickers have been generated
- **WHEN** the parent opens the History destination with no saved sticker completions
- **THEN** the system shows an empty state explaining that sticker history will appear after completions generate art
