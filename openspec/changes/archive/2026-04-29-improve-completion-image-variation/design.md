## Context

The completion-image workflow already generates celebratory images, but earlier prompt construction underused configured child-interest themes and produced visually repetitive results across repeated celebrations. The change is scoped to prompt and variation behavior inside the existing server-side image-generation pipeline.

## Decision

Keep the current API contract and persistence model, and improve variation entirely within the server prompt-construction path by:

- promoting one configured interest into an explicit lead motif
- keeping remaining interests as supporting motifs
- rotating variation recipes across repeated requests for the same child and activity

## Rationale

- Preserves the existing client/server integration
- Improves personalization without changing saved completion shape
- Keeps regression coverage focused on prompt construction and variation selection

## Non-Goals

- Changing the completion-image request or response schema
- Introducing client-side prompt construction
- Adding new persistence entities for variation history
