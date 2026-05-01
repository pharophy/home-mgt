## MODIFIED Requirements

### Requirement: Completing a task SHALL trigger custom AI-generated completion imagery
The system SHALL generate a custom celebratory image when a task is marked complete and SHALL persist that generated image on the recorded completion.

#### Scenario: Completion image generation succeeds
- **WHEN** the client requests a completion image for a recorded completion
- **THEN** the server generates the celebratory image
- **THEN** the server saves the generated image fields on that completion record
- **THEN** subsequent state loads include the saved completion image without requiring regeneration

#### Scenario: Completion is later unmarked
- **WHEN** a previously completed task is unmarked
- **THEN** the system removes the completion record that held the saved celebratory image
- **THEN** the weekly matrix no longer shows the saved image for that task
