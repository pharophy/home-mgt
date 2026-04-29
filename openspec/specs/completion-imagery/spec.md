## ADDED Requirements

### Requirement: The system SHALL support configured child-interest-inspired themes for completion imagery
The system SHALL allow the household to configure a set of child-interest-inspired themes that can be used as creative input for task-completion imagery.

#### Scenario: Household configures child interests
- **WHEN** a parent/admin user saves child-interest-inspired themes such as energetic blue cartoon dogs, race cars, or rescue-pup adventure vibes
- **THEN** the system stores those themes for use in completion imagery generation

### Requirement: Completing a task SHALL trigger custom AI-generated completion imagery
The system SHALL generate a custom celebratory image when a task is marked complete, using AI or LLM-driven image generation informed by the configured child-interest-inspired themes.

#### Scenario: Task is marked complete
- **WHEN** a task completion is recorded from the daily completion view
- **THEN** the system triggers creation of a custom completion image using the configured child-interest-inspired themes as prompt context

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

### Requirement: Image-generation prompts SHALL request original inspired-by imagery
The system SHALL construct image-generation prompts so configured interests are treated as inspiration for original imagery rather than as requests to reproduce copyrighted characters, branded scenes, or exact franchise art.

#### Scenario: Prompt is built from configured interests
- **WHEN** the system prepares the image-generation prompt for a completed task
- **THEN** the prompt requests original inspired-by celebratory imagery and does not ask for direct reproduction of copyrighted characters or branded visual assets

### Requirement: Task completion SHALL not depend on image generation success
The system SHALL treat task completion as the primary action and SHALL NOT require image generation to succeed before recording the task as complete.

#### Scenario: Image generation is delayed or fails
- **WHEN** the system cannot immediately generate the completion image
- **THEN** the task remains recorded as completed even if the image is pending, delayed, or unavailable

### Requirement: The system SHALL provide a sticker history view
The system SHALL provide a history page that shows saved generated sticker images from recorded completions.

#### Scenario: Parent views saved stickers
- **WHEN** the parent opens the history page after stickers have been generated
- **THEN** the system shows each saved sticker with its child, activity, and completion context

#### Scenario: No stickers have been generated
- **WHEN** the parent opens the history page with no saved sticker completions
- **THEN** the system shows an empty state explaining that sticker history will appear after completions generate art
