## MODIFIED Requirements

### Requirement: Completing a task SHALL trigger custom AI-generated completion imagery
The system SHALL generate a custom celebratory image when a task is marked complete from the weekly completion matrix, using a server-side OpenAI image-generation workflow informed by the configured child-interest-inspired themes, and SHALL persist that generated image on the recorded completion so later chart and history loads can reuse it.

#### Scenario: Matrix cell is marked complete
- **WHEN** a current-day activity cell is toggled to complete from the weekly completion matrix
- **THEN** the client requests creation of a custom completion image from the server
- **THEN** the server triggers creation of a custom completion image using the configured child-interest-inspired themes as prompt context

#### Scenario: Completion image generation succeeds
- **WHEN** the client requests a completion image for a recorded completion
- **THEN** the server generates the celebratory image
- **THEN** the server saves the generated image fields on that completion record
- **THEN** subsequent state loads include the saved completion image without requiring regeneration
- **THEN** the Sticker Chart can reload that saved image for the appropriate completed day later in the same visible week

#### Scenario: Completion image prompt is built for a child with interests
- **WHEN** the server builds a completion-image prompt for a child whose profile includes configured interests
- **THEN** the prompt names one selected interest theme as the lead visual direction
- **THEN** the prompt includes the remaining configured interests as supporting motifs when present
- **THEN** the prompt instructs the image model to keep the result original and avoid copyrighted character reproduction

#### Scenario: Repeated celebrations are generated for similar completions
- **WHEN** the server generates completion images for repeated celebrations for the same child and activity
- **THEN** the system varies the visual recipe across requests instead of reusing the same motif combination every time
- **THEN** the system still keeps the selected child interests visible in the prompt context for each request

#### Scenario: Completion is later unmarked
- **WHEN** a previously completed task is unmarked
- **THEN** the system removes the completion record that held the saved celebratory image
- **THEN** the weekly matrix no longer shows the saved image for that task

### Requirement: The system SHALL provide a sticker history view
The system SHALL provide a dedicated History destination that shows saved generated sticker images from recorded completions through both a calendar-like month view and an interactive gallery view, so the parent can review stickers by day, browse a varied visual wall, or inspect one sticker at a time in a larger spotlight.

#### Scenario: Parent views saved stickers in month view
- **WHEN** the parent opens the History destination after stickers have been generated
- **THEN** the system provides a calendar-like month view that indicates which calendar days have saved sticker completions
- **THEN** the parent can move between months without leaving the History destination
- **THEN** the parent can filter the visible history to a specific child or all children without leaving the History destination
- **THEN** selecting or inspecting a day reveals the saved sticker results for that date

#### Scenario: Parent views saved stickers in gallery view
- **WHEN** the parent switches to the gallery mode of the History destination
- **THEN** the system shows saved stickers in a media-first gallery with child, activity, and completion context
- **THEN** the gallery uses a masonry-style layout with visibly varied sticker sizes rather than a perfectly uniform grid
- **THEN** the masonry wall spans the full available width of the History content area
- **THEN** the masonry wall uses minimal gutters so sticker images nearly touch each other
- **THEN** the parent can open a single sticker into a larger spotlight view without leaving History
- **THEN** the parent can keep the current child filter applied while switching between month and gallery modes
- **THEN** the gallery can be used to browse stickers across dates rather than being limited to a single day

#### Scenario: No stickers have been generated
- **WHEN** the parent opens the History destination with no saved sticker completions
- **THEN** the system shows an empty state explaining that sticker history will appear after completions generate art
- **THEN** the empty state applies consistently to both month and gallery review modes
