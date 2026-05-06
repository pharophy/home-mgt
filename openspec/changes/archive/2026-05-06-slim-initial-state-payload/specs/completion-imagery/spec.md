## MODIFIED Requirements

### Requirement: Completing a task SHALL trigger custom AI-generated completion imagery
The system SHALL generate a custom celebratory image when a task is marked complete from the weekly completion matrix, using a server-side OpenAI image-generation workflow informed by the configured child-interest-inspired themes, and SHALL persist that generated image on the recorded completion.

#### Scenario: Matrix cell is marked complete
- **WHEN** a current-day activity cell is toggled to complete from the weekly completion matrix
- **THEN** the client requests creation of a custom completion image from the server
- **THEN** the server triggers creation of a custom completion image using the configured child-interest-inspired themes as prompt context

#### Scenario: Completion image generation succeeds
- **WHEN** the client requests a completion image for a recorded completion
- **THEN** the server generates the celebratory image
- **THEN** the server saves the generated image fields on that completion record
- **THEN** subsequent state loads include a saved completion image reference without requiring regeneration
- **THEN** that saved completion image reference can be resolved by the browser without embedding the full sticker bytes inside bootstrap JSON

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
