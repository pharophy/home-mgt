## 1. Shared Contract And Store Design

- [x] 1.1 Add failing tests for persisted completion artwork surviving reload and disappearing after unmark
- [x] 1.2 Extend the shared completion/state contract to carry persisted celebration image fields
- [x] 1.3 Replace snapshot-style persistence assumptions with an injectable participation repository/store seam

## 2. SQL-Backed Server Persistence

- [x] 2.1 Add failing server persistence tests for SQL-backed child profile, activity, completion, reward, and household-settings reads/writes
- [x] 2.2 Implement a SQL participation store with idempotent schema initialization for the MVP tables
- [x] 2.3 Make the production server use the SQL store by default when the SQL connection string is configured

## 3. Durable Completion Image Lifecycle

- [x] 3.1 Add failing server tests for persisting generated completion image data onto a completion record
- [x] 3.2 Update the completion-image route/service flow to save generated image fields to the matching completion
- [x] 3.3 Update completion deletion/unmark behavior so saved celebration art disappears with the completion

## 4. Client Hydration

- [x] 4.1 Add failing client tests for rehydrating saved completion images into the weekly matrix after state reload
- [x] 4.2 Update the client matrix state to read persisted completion artwork from the server state while keeping transient pending/error UX

## 5. Verification

- [x] 5.1 Run the relevant server test suite
- [x] 5.2 Run the relevant client test suite
- [x] 5.3 Validate the OpenSpec change
