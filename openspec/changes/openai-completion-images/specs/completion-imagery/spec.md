## MODIFIED Requirements

### Requirement: Completing a task SHALL trigger custom AI-generated completion imagery
The system SHALL generate a custom celebratory image when a task is marked complete, using a server-side OpenAI image-generation workflow informed by the configured child-interest-inspired themes.

#### Scenario: Task is marked complete
- **WHEN** a task completion is recorded from the daily completion view
- **THEN** the client requests creation of a custom completion image from the server
- **THEN** the server triggers creation of a custom completion image using the configured child-interest-inspired themes as prompt context
