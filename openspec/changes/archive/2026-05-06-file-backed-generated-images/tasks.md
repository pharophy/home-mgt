## 1. Regression Coverage

- [x] 1.1 Add server tests that fail if generated image payloads are still persisted inline instead of as managed asset paths
- [x] 1.2 Add server tests that fail if managed generated images are not served as static files
- [x] 1.3 Add regression coverage for lazy migration of legacy inline generated-image payloads

## 2. Managed Asset Persistence

- [x] 2.1 Add a managed generated-image asset helper that writes data URLs to disk, returns same-origin asset paths, and cleans up removed files
- [x] 2.2 Wrap participation-store reads and writes so generated image fields are normalized to managed asset paths and legacy inline payloads are migrated automatically
- [x] 2.3 Update app startup and generated-image helpers to serve and recognize managed static asset paths

## 3. Validation

- [x] 3.1 Run OpenSpec validation for `file-backed-generated-images`
- [x] 3.2 Run the relevant build/tests or direct smoke checks covering managed generated-image persistence and static serving
