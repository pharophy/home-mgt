## Why

The app can run in local production mode, but it has no repeatable path to reach a real hosted environment. Using the existing Windows EC2 instance that already runs IIS is the lowest-friction production path because it avoids provisioning a second host while still making the app reachable on a stable `blabberjax.com` subdomain.

## What Changes

- Add a production deployment capability for the existing Windows EC2 instance so it can host the built Node app behind IIS while continuing to run SQL Server.
- Add a GitHub Actions workflow that validates the app, publishes a release artifact, and deploys that artifact to the existing Windows EC2 instance from the default branch.
- Add automated production database migrations so SQL schema changes are applied as part of deployment instead of requiring manual database updates.
- Add production runtime configuration for same-host SQL connectivity through environment-managed secrets.
- Add deployment and operations documentation for RDP bootstrap, SSM recovery, IIS reverse proxy configuration, Cloudflare DNS, GitHub secrets, and routine redeploy or rollback steps.

## Capabilities

### New Capabilities
- `aws-ec2-deployment`: Host the app on the existing Windows EC2 instance with IIS on `80/443`, the Node app on an internal localhost port, automated GitHub Actions deployment, Cloudflare-backed subdomain routing, automated production schema migrations, and same-host SQL connectivity.

### Modified Capabilities
- `persistence`: Evolve the SQL-backed data model through versioned migrations that can be applied automatically during production deployment.
- `windows-prod-startup`: Move Windows production startup automation from a current-user logon registration to a scheduled-task-based startup path that can be reused for unattended hosting and deploy-triggered restarts.

## Impact

- GitHub Actions workflows and repository secrets configuration
- Windows production startup and environment configuration
- SQL schema migration tooling and deployment ordering
- IIS reverse proxy configuration and Windows host bootstrap
- AWS Systems Manager recovery and remote execution setup
- Cloudflare DNS configuration for the production subdomain
- Operational documentation for deploy, verify, and rollback
