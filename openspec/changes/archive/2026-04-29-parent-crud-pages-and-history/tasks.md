## 1. OpenSpec And Contract

- [x] 1.1 Add failing client tests for the four-page parent navigation and dedicated history view
- [x] 1.2 Add failing server tests for child profile update/delete and activity update/delete behavior
- [x] 1.3 Extend shared/client route and draft types as needed for dedicated children and history pages

## 2. Server CRUD Support

- [x] 2.1 Implement child profile update and cascading delete routes
- [x] 2.2 Implement chore update and delete routes
- [x] 2.3 Implement routine delete behavior with completion and reward cleanup

## 3. Parent UX Cleanup

- [x] 3.1 Refactor the client into dedicated pages for child profiles, activities, weekly matrix, and history
- [x] 3.2 Add create, update, and delete flows for child profiles in the dedicated page
- [x] 3.3 Add create, update, and delete flows for routines and chores in the dedicated activities page
- [x] 3.4 Keep the weekly matrix page focused on completion tracking while preserving saved sticker behavior
- [x] 3.5 Add the sticker history page backed by persisted completion imagery

## 4. Verification

- [x] 4.1 Run the relevant server test suite
- [x] 4.2 Run the relevant client test suite
- [x] 4.3 Validate the OpenSpec change

## 5. Delete Cleanup Follow-up

- [x] 5.1 Add failing client regression tests that verify deleting a child profile clears related rewards and pending approvals from the parent UI state
- [x] 5.2 Add failing client regression tests that verify deleting an activity clears related rewards and pending approvals from the parent UI state
- [x] 5.3 Fix client-side delete cleanup so reward totals and pending approval counts stay in sync after child-profile and activity deletes
- [x] 5.4 Re-run the relevant client test suite
