## MODIFIED Requirements

### Requirement: Completing a task SHALL trigger custom AI-generated completion imagery
The system SHALL generate a custom celebratory image when a task is marked complete from the weekly completion matrix, using a server-side OpenAI image-generation workflow informed by the configured child-interest-inspired themes.

#### Scenario: Matrix cell is marked complete
- **WHEN** a current-day activity cell is toggled to complete from the weekly completion matrix
- **THEN** the client requests creation of a custom completion image from the server
- **THEN** the server triggers creation of a custom completion image using the configured child-interest-inspired themes as prompt context

### Requirement: Generated completion imagery SHALL be revealed inside the completed matrix cell
The system SHALL reveal a generated completion image inside the matrix cell that was toggled complete, using a lightweight celebratory animation.

#### Scenario: Completion image becomes available for a matrix cell
- **WHEN** a current-day matrix cell is toggled complete and the completion image is still being generated
- **THEN** the system immediately presents a centered, modal-style celebration overlay with a dimmed background
- **THEN** the overlay shows a loading indicator where the generated image will appear
- **WHEN** the completion image is ready to display after a matrix cell is marked complete
- **THEN** the system briefly presents the generated image in a centered, modal-style celebration overlay with a dimmed background and starburst animation
- **THEN** the system shows the image inside that matrix cell with a celebratory reveal animation rather than displaying it elsewhere
- **THEN** the generated image becomes the primary visual in the cell instead of continuing to show the incomplete or completed reward icon and status copy alongside it

### Requirement: Server-side completion imagery SHALL honor project environment configuration
The system SHALL resolve the OpenAI API key from the project's configured environment so matrix-cell completion imagery works regardless of whether the API server is started from the repository root or the server workspace.

#### Scenario: API server starts from a workspace-relative directory
- **WHEN** the API server starts from either the repository root or the `server` workspace directory
- **THEN** the completion-imagery route can still resolve the configured `OPENAI_API_KEY`
- **THEN** matrix-cell image generation remains available without requiring a duplicate `.env` file inside `server/`
