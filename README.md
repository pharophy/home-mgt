# home-mgt

<!-- No-op change to trigger a deploy verification run. -->

`home-mgt` is a tablet-first preschool participation MVP for parents of a 4-year-old. It helps a child follow visual routines, complete simple chores, and get immediate feedback on a shared household tablet while still giving parents and caregivers clear control.

## Current MVP

- Parent mode for child profile setup, routine creation, chore creation, caregiver setup, and daily dashboard review
- Child tablet mode with one active task at a time, routine-step progression, chore completion, and gentle/full celebration modes
- Caregiver mode for viewing the child's active plan and recording progress without household-admin controls
- Node + Express API for child profiles, routines, chores, completions, rewards, caregivers, and household settings

## Local development

- `npm run dev` starts the Vite client on `5173` and the Express dev backend on `3002`
- `npm run build` builds both workspaces
- `npm run start` starts the built server on `3001`
- `npm run prod` builds both workspaces and then starts the production server locally
- `npm run prod:startup:install` creates the `HomeMgtProd` scheduled task for Windows production startup
- `npm run prod:startup:uninstall` removes that Windows startup registration
- `npm test --workspace server` runs the server integration tests
- `npm test --workspace client` runs the client UI tests
- `npm run --workspace server migrate` applies pending SQL migrations
- Set `PRESCHOOL_SQL_CONNECTION_STRING` in `.env` or `.env.prod`; real app startup requires SQL-backed persistence and will fail fast if it is missing
- Set `HOST=0.0.0.0` and `PORT=3001` to bind the production server for local-network access if needed
- Override `PORT` before `npm run dev` to change the backend dev port; the client proxy follows that port automatically unless `VITE_API_TARGET` is set explicitly

The Windows production startup helper now targets a scheduled-task-based startup path. On the existing Starstep host, IIS remains the public entry point and proxies `starstep.blabberjax.com` to the Node app on `127.0.0.1:3001`. Production deployments use a release artifact delivered over SSM rather than Git operations on the server.

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
