## 1. Matrix Interaction Model

- [x] 1.1 Add failing tests that model the weekly matrix using the sample activities `morning routine`, `put dishes in dishwasher`, and `sleep in own bed`
- [x] 1.2 Add matrix view-model helpers that map scheduled routines and chores into activity rows and weekday cells
- [x] 1.3 Add completion toggle support for creating and removing current-day completions

## 2. Single-Route Weekly UX

- [x] 2.1 Replace the current multi-route parent/admin landing experience with a weekly matrix-first route
- [x] 2.2 Render weekday columns, activity rows, and current-day header highlighting with the day number
- [x] 2.3 Restrict direct interaction to the current-day column and allow accidental unmarking from the same cell
- [x] 2.4 Replace scheduled non-current text cells with centered muted reward placeholders

## 3. Cell Imagery

- [x] 3.1 Show completion pending, ready, and unavailable states inside matrix cells
- [x] 3.2 Request OpenAI-backed celebration imagery when a current-day cell is toggled complete
- [x] 3.3 Reveal the generated image inside the completed matrix cell with the celebratory animation
- [x] 3.4 Replace plain completion text in interactive cells with empty star/sticker reward affordances
- [x] 3.5 Make server-side matrix-cell image generation resolve the shared project `.env` configuration regardless of launch directory
- [x] 3.6 Make the generated image fully take over the completed matrix cell once ready
- [x] 3.7 Show a modal-style celebration overlay with immediate loading state and starburst animation before settling the image back into the cell
- [x] 3.8 Make the live empty reward target use the same centered visual frame as the completed image
- [x] 3.9 Add a stronger visible CTA so today's live reward target reads as clickable

## 4. Verification

- [x] 4.1 Add or update server tests for completion toggle behavior
- [x] 4.2 Add or update client tests for matrix rendering, current-day-only interaction, and per-cell imagery
- [x] 4.3 Update the E2E flow to cover the weekly matrix workflow
- [x] 4.4 Run the relevant server, client, build, and E2E suites
- [x] 4.5 Add a regression test for workspace-relative OpenAI environment loading
- [x] 4.6 Add a regression test for the temporary celebration overlay loading-to-image lifecycle
