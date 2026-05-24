# Starstep Windows EC2 Deployment

This deployment target hosts `starstep.blabberjax.com` on the existing Windows EC2 instance.

## Target Layout

- IIS site root: `C:\HostingSpaces\starstep.blabberjax.com\iis-proxy`
- App root: `C:\HostingSpaces\starstep.blabberjax.com\app`
- Release root: `C:\HostingSpaces\starstep.blabberjax.com\app\releases\<release-id>`
- Active runtime root: `C:\HostingSpaces\starstep.blabberjax.com\app\current`
- Shared secrets root: `C:\HostingSpaces\starstep.blabberjax.com\app\shared`
- Shared generated-assets root: `C:\HostingSpaces\starstep.blabberjax.com\app\shared\generated-assets`
- Runtime environment file: `C:\HostingSpaces\starstep.blabberjax.com\app\current\.env`
- Shared production environment file: `C:\HostingSpaces\starstep.blabberjax.com\app\shared\.env.prod`

## Manual Bootstrap

1. Confirm the existing IIS site binding for `starstep.blabberjax.com`.
2. Confirm `URL Rewrite` and `Application Request Routing (ARR)` are installed and ARR proxying is enabled.
3. Confirm AWS Systems Manager is online for the instance and can execute `AWS-RunPowerShellScript`.
4. Install Node.js and npm on the Windows host if they are not already present.
5. Create these directories:
   - `C:\HostingSpaces\starstep.blabberjax.com\app\current`
   - `C:\HostingSpaces\starstep.blabberjax.com\app\releases`
   - `C:\HostingSpaces\starstep.blabberjax.com\app\shared`
6. Place the production secrets in `C:\HostingSpaces\starstep.blabberjax.com\app\shared\.env.prod`.
7. Seed `C:\HostingSpaces\starstep.blabberjax.com\app\shared\generated-assets` from the packaged local production assets on the first remote deploy.
8. Stage an initial release artifact in `C:\HostingSpaces\starstep.blabberjax.com\app\current`.
9. Run `npm ci --omit=dev` in `C:\HostingSpaces\starstep.blabberjax.com\app\current`.
10. Run `npm run prod:startup:install` from `C:\HostingSpaces\starstep.blabberjax.com\app\current` in an elevated PowerShell session so the `HomeMgtProd` scheduled task is created.

## IIS Reverse Proxy

The IIS site for `starstep.blabberjax.com` should use `C:\HostingSpaces\starstep.blabberjax.com\iis-proxy` as its physical path.

Configure URL Rewrite so requests for `starstep.blabberjax.com` are proxied to:

- `http://127.0.0.1:3001`

Keep the Node listener bound to localhost only. IIS remains the public listener on ports `80/443`.

## Cloudflare

- Create or keep a proxied DNS record for `starstep.blabberjax.com`.
- Point the record at the IIS origin host.

## GitHub Secrets

The GitHub Actions workflow expects these repository secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `STARSTEP_EC2_INSTANCE_ID`
- `STARSTEP_DEPLOY_BUCKET`

## Deployment Flow

The workflow in `.github/workflows/deploy-starstep-windows.yml` does this:

1. Checks out the repository.
2. Installs dependencies.
3. Runs the Windows startup helper test.
4. Runs the server test suite.
5. Builds the client and server workspaces.
6. Creates a release zip containing the built app runtime.
7. Uploads that release zip to S3 and generates a presigned download URL.
8. Uses AWS Systems Manager to run a remote PowerShell deployment on the Windows EC2 instance.

The remote deployment script:

1. Downloads the release artifact from the presigned URL.
2. Expands it into `app\releases\<release-id>`.
3. Seeds `app\shared\generated-assets` from the packaged local production assets when the shared directory is still empty.
4. Copies `app\shared\.env.prod` to the release runtime `.env` file without echoing secret values.
5. Runs `npm ci --omit=dev`.
6. Runs `npm run --workspace server migrate`.
7. Refreshes `app\current` from the new release.
8. Stops the existing Node process for the active runtime.
9. Runs the `HomeMgtProd` scheduled task to start the deployed app runtime.

## Fail-Fast SQL Requirement

Production requires `PRESCHOOL_SQL_CONNECTION_STRING`. If it is missing from `app\shared\.env.prod`, the migration step or the server startup will fail before the app is considered healthy.

## Smoke Check

After deployment:

1. Confirm the SSM command finished successfully.
2. Run `npm run smoke:starstep` from the repository root, or `node scripts/smoke-check-starstep.mjs https://starstep.blabberjax.com`.
3. Confirm `https://starstep.blabberjax.com/api/health` returns `200`.
4. Confirm the site shell loads through IIS and Cloudflare.
5. Confirm the app can read SQL-backed state through `/api/state`.

## Failed Migration Response

If the migration step fails:

1. Do not activate a new release.
2. Keep the previous running app instance in place.
3. Fix the migration or produce a forward-compatible follow-up change.
4. Re-run the deployment after the migration issue is resolved.
