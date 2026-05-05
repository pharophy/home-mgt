## MODIFIED Requirements

### Requirement: The system SHALL provide a sticker history view
The system SHALL provide a dedicated History destination that shows all saved generated sticker images from recorded completions in a scan-friendly gallery focused on review rather than setup.

#### Scenario: Parent views saved stickers
- **WHEN** the parent opens the History destination after stickers have been generated
- **THEN** the system shows all saved stickers in reverse chronological order with child, activity, and completion context
- **THEN** the system does not mix child or activity setup controls into that review surface
- **THEN** the History structure and metadata render without waiting for every sticker image to finish loading

#### Scenario: History images are still loading
- **WHEN** the History month or gallery view is visible before some saved sticker images have fully loaded
- **THEN** the system keeps the layout stable with lightweight placeholder states for those images
- **THEN** sticker images fill in progressively as they load rather than blocking the entire view

#### Scenario: No stickers have been generated
- **WHEN** the parent opens the History destination with no saved sticker completions
- **THEN** the system shows an empty state explaining that sticker history will appear after completions generate art
