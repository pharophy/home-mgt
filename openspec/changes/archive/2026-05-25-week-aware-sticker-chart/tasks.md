## 1. Regression Coverage

- [x] 1.1 Add a client regression test that fails when a prior-week completion appears in the current week's future weekday column
- [x] 1.2 Add or update view-model tests for visible-week completion filtering

## 2. Weekly Matrix Logic

- [x] 2.1 Update weekly matrix row construction to consider only completions from the visible calendar week
- [x] 2.2 Update persisted completion artwork mapping to use the same visible-week filter as the matrix cells

## 3. Validation

- [x] 3.1 Run OpenSpec validation for `week-aware-sticker-chart`
- [x] 3.2 Run the relevant client test coverage for weekly matrix completion rendering
