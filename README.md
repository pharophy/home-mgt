# home-mgt

`home-mgt` is a tablet-first preschool participation MVP for parents of a 4-year-old. It helps a child follow visual routines, complete simple chores, and get immediate feedback on a shared household tablet while still giving parents and caregivers clear control.

## Current MVP

- Parent mode for child profile setup, routine creation, chore creation, caregiver setup, and daily dashboard review
- Child tablet mode with one active task at a time, routine-step progression, chore completion, and gentle/full celebration modes
- Caregiver mode for viewing the child's active plan and recording progress without household-admin controls
- Node + Express API for child profiles, routines, chores, completions, rewards, caregivers, and household settings

## Local development

- `npm run dev` starts the Vite client and Express server together
- `npm run build` builds both workspaces
- `npm run start` starts the built server
- `npm run prod` builds both workspaces and then starts the production server locally
- `npm run prod:startup:install` registers the current Windows user to start prod on logon
- `npm run prod:startup:uninstall` removes that Windows autostart registration
- `npm test --workspace server` runs the server integration tests
- `npm test --workspace client` runs the client UI tests
- Set `PRESCHOOL_SQL_CONNECTION_STRING` to enable the SQL-backed participation store; otherwise the server falls back to `server-data.json`
- Set `HOST=0.0.0.0` and `PORT=3001` to bind the production server for local-network access if needed

The Windows autostart command uses a current-user logon task. That means the production server starts after you sign in to Windows, not before the login screen appears.

## Onboarding flow

1. Start in parent mode.
2. Create a child profile with a name, photo URL, and display color.
3. Add a simple routine and a simple chore for the current day.
4. Add a caregiver if another adult will help run the plan.
5. Open tablet mode for the child-facing flow, or switch to caregiver mode to rehearse the handoff.

## OpenSpec

This repo uses OpenSpec and spec-driven TDD by default. Project change artifacts live in `openspec/`, and Codex workflow skills live in `.codex/skills/`.

Core workflows:

- `/opsx:propose`
- `/opsx:explore`
- `/opsx:apply`
- `/opsx:archive`
