## Context

The current generated-image flow persists `data:image/...` payloads directly in routine, chore, routine-step, and completion records. The server then converts those values into same-origin API routes, but each route currently calls `store.read()` and rebuilds the entire household state before serving a single image. That makes initial JSON smaller than before, but it still leaves image loading bound to expensive persistence reads and base64 decoding work.

The existing SQL schema already stores image references in string columns, so the persistence contract can shift from "inline base64 blob" to "managed same-origin asset path" without changing table structure. The biggest remaining requirement is compatibility: existing saved images must keep working without a manual migration step.

## Goals / Non-Goals

**Goals:**
- Persist generated images as managed files and store only same-origin asset paths in SQL-backed state.
- Serve generated images through static-file middleware instead of stateful per-image lookup routes.
- Preserve existing saved generated images by migrating legacy inline payloads automatically when they are read or rewritten.
- Keep route handlers mostly unchanged by centralizing generated-image materialization in a persistence wrapper.

**Non-Goals:**
- Moving generated assets to cloud object storage.
- Introducing a separate database table for image metadata.
- Redesigning the client image UX beyond recognizing the new managed asset paths.

## Decisions

### Wrap the participation store with a managed-image persistence layer
Generated-image conversion belongs at the persistence seam, not scattered across route handlers. A wrapper store will normalize generated-image fields before writing state and migrate legacy inline generated-image payloads after reading state. That keeps routine, chore, completion, and state routes largely unchanged while ensuring persistence always trends toward file-backed references.

Alternative considered:
- Convert image payloads in each route handler separately. Rejected because the same logic would need to be repeated across create, update, completion-image, and migration paths.

### Store deterministic same-origin asset paths in existing image URL fields
Generated assets will be written under a managed asset directory outside the built client bundle and exposed at a dedicated same-origin path such as `/generated-assets/...`. The persisted `imageUrl` / `celebrationImageUrl` fields will store those same-origin paths directly, allowing the client to use them without additional serialization.

Alternative considered:
- Keep SQL storing opaque file IDs and map them through separate lookup routes. Rejected because it reintroduces dynamic request handling when static-file serving is the goal.

### Migrate legacy inline generated images lazily
When the wrapper store reads state and finds inline generated-image payloads, it will write managed files, replace those fields with managed asset paths, and persist the updated state. This avoids a one-time migration script while ensuring the app gradually eliminates inline blobs from persistence.

Alternative considered:
- Require a dedicated one-time migration command. Rejected because the repo should self-heal existing saved data during normal usage.

### Use file-diff cleanup for replaced or deleted managed generated assets
The wrapper store will compare managed generated-image references between the previous and next states and delete files that are no longer referenced. That prevents unbounded orphan growth when activities are edited or deleted.

Alternative considered:
- Never delete managed files. Rejected because routine/chore edits and completion cleanup would leak storage indefinitely.

## Risks / Trade-offs

- [Risk] Lazy migration adds write work to the first read after deployment. -> Mitigation: migration is limited to generated-image fields and only runs while inline payloads remain.
- [Risk] File deletion logic could remove the wrong assets if paths are not scoped carefully. -> Mitigation: only manage files under the generated asset root and use deterministic app-owned paths.
- [Risk] Static asset paths become publicly readable on the local app origin. -> Mitigation: the app already exposes equivalent images without authentication, and the new path removes unnecessary server-state work rather than broadening data visibility.

## Migration Plan

Deploy the managed-asset wrapper and static asset directory together. On first read/write after deployment, existing inline generated-image payloads are materialized into managed files and persisted back as asset paths. Rollback remains possible because the SQL columns still hold strings, but managed files created during forward deployment would remain on disk unless explicitly cleaned up.

## Open Questions

- None.
