## MODIFIED Requirements

### Requirement: Completing a task SHALL trigger custom AI-generated completion imagery
The system SHALL generate a custom celebratory image when a task is marked complete, using server-side image generation that materially reflects the configured child-interest-inspired themes.

#### Scenario: Completion image prompt is built for a child with interests
- **WHEN** the server builds a completion-image prompt for a child whose profile includes configured interests
- **THEN** the prompt names one selected interest theme as the lead visual direction
- **THEN** the prompt includes the remaining configured interests as supporting motifs when present
- **THEN** the prompt instructs the image model to keep the result original and avoid copyrighted character reproduction

#### Scenario: Repeated celebrations are generated for similar completions
- **WHEN** the server generates completion images for repeated celebrations for the same child and activity
- **THEN** the system varies the visual recipe across requests instead of reusing the same motif combination every time
- **THEN** the system still keeps the selected child interests visible in the prompt context for each request
