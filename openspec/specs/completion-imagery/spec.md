# completion-imagery Specification

## Purpose
Define how the system generates, persists, reveals, and presents celebratory completion imagery and sticker history for completed child activities.
## Requirements
### Requirement: The system SHALL support configured child-interest-inspired themes for completion imagery
The system SHALL allow the household to configure a set of child-interest-inspired themes that can be used as creative input for task-completion imagery.

#### Scenario: Household configures child interests
- **WHEN** a parent/admin user saves child-interest-inspired themes such as energetic blue cartoon dogs, race cars, or rescue-pup adventure vibes
- **THEN** the system stores those themes for use in completion imagery generation

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

### Requirement: Completion imagery SHALL remain separate from the instructional task image
The system SHALL treat the generated completion image as a celebratory artifact that is distinct from the stable instructional task image used to communicate what the task is.

#### Scenario: Task has both instructional and completion imagery
- **WHEN** a task is displayed before and after completion
- **THEN** the instructional task image continues to represent what to do and the generated completion image represents celebration of having done it

### Requirement: Instructional-image prompts SHALL use task semantics rather than interest themes
The system SHALL construct instructional-image prompts from the activity description and subtask details, rather than from the celebratory child-interest-inspired theme inputs used for completion imagery.

#### Scenario: Prompt is built for an instructional task image
- **WHEN** the system prepares the prompt for generating the instructional task image
- **THEN** the prompt is grounded in the task description and subtask details instead of the celebratory interest-theme inputs

### Requirement: Completion imagery SHALL vary across completions
The system SHALL vary the generated completion imagery so repeated completions can produce different visuals while remaining grounded in the configured child-interest-inspired themes.

#### Scenario: Multiple tasks are completed over time
- **WHEN** the system generates completion imagery for separate completion events
- **THEN** the generated images are not required to be identical and may vary while still reflecting the configured interests

### Requirement: Generated completion imagery SHALL be revealed with a celebratory animation
The system SHALL reveal a generated completion image with a lightweight celebratory animation, such as stars or similar upbeat background effects.

#### Scenario: Completion image becomes available
- **WHEN** the completion image is ready to display after a task is marked complete
- **THEN** the system shows the image with a celebratory reveal animation rather than displaying it with no transition

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

### Requirement: Image-generation prompts SHALL request original inspired-by imagery
The system SHALL construct image-generation prompts so configured interests are treated as inspiration for original imagery rather than as requests to reproduce copyrighted characters, branded scenes, or exact franchise art.

#### Scenario: Prompt is built from configured interests
- **WHEN** the system prepares the image-generation prompt for a completed task
- **THEN** the prompt requests original inspired-by celebratory imagery and does not ask for direct reproduction of copyrighted characters or branded visual assets

### Requirement: Server-side completion imagery SHALL honor project environment configuration
The system SHALL resolve the OpenAI API key from the project's configured environment so matrix-cell completion imagery works regardless of whether the API server is started from the repository root or the server workspace.

#### Scenario: API server starts from a workspace-relative directory
- **WHEN** the API server starts from either the repository root or the `server` workspace directory
- **THEN** the completion-imagery route can still resolve the configured `OPENAI_API_KEY`
- **THEN** matrix-cell image generation remains available without requiring a duplicate `.env` file inside `server/`

### Requirement: Task completion SHALL not depend on image generation success
The system SHALL treat task completion as the primary action and SHALL NOT require image generation to succeed before recording the task as complete.

#### Scenario: Image generation is delayed or fails
- **WHEN** the system cannot immediately generate the completion image
- **THEN** the task remains recorded as completed even if the image is pending, delayed, or unavailable

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

