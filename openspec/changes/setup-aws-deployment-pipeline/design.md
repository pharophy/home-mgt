## Context

The repository already supports a local production path: build the client and server, then run a single Node server that serves the compiled client and API together. The server can bind to a configurable host and port, and it can use SQL persistence when `PRESCHOOL_SQL_CONNECTION_STRING` is present.

The target environment is now the user's existing Windows EC2 instance, which already runs IIS on ports `80/443` and also hosts the SQL database. Session Manager has been restored, and RDP remains available for bootstrap or break-glass use. The production hostname is `starstep.blabberjax.com`.

The planned server layout is:
- IIS proxy site root: `C:\HostingSpaces\starstep.blabberjax.com\iis-proxy`
- Application root: `C:\HostingSpaces\starstep.blabberjax.com\app`

The requested production setup therefore prioritizes reuse of the existing Windows host, IIS, and database placement over cleaner workload isolation.

## Goals / Non-Goals

**Goals:**
- Provide one canonical production hosting pattern for this app on AWS.
- Reuse the existing Windows EC2 instance for both the Node app and SQL Server.
- Automate build, deploy, and restart from GitHub Actions on the main branch.
- Automate safe application of SQL schema migrations during deployment.
- Put IIS in front of the Node app on the existing `80/443` listeners.
- Recover AWS Systems Manager access so future deployments do not depend on interactive RDP sessions.
- Serve the app from a `blabberjax.com` subdomain routed through Cloudflare.
- Keep production secrets out of the repository and require SQL-backed persistence in production.

**Non-Goals:**
- Introduce ECS, EKS, Elastic Beanstalk, App Runner, RDS, or other higher-cost managed runtime services.
- Add blue/green, canary, or multi-region deployment strategies.
- Re-architect the app into separate frontend and backend services.
- Manage Cloudflare or AWS infrastructure through Terraform in this change unless implementation proves it is required for the minimal path.
- Support automatic rollback of destructive database migrations.

## Decisions

### Use the existing Windows EC2 instance as the app and database host

The production app will run on the existing Windows EC2 instance that already hosts SQL Server and IIS. The Node process will serve the built client and API together, aligning with the app's current single-process production model while avoiding the cost and setup work of a second machine.

Alternatives considered:
- Provision a separate application EC2 host: better isolation, but higher cost and more setup for the current goal.
- Use static hosting or a managed frontend platform: not sufficient for the current Node API, environment-based secrets, and migration flow.

### Use GitHub Actions with AWS Systems Manager as the preferred deployment transport, with RDP for initial bootstrap

GitHub Actions will run the verification/build pipeline, assemble a deployment artifact, and then deploy that artifact to the existing Windows EC2 host using AWS Systems Manager. Because SSM is currently offline, the initial bootstrap work will happen over RDP so the host can be prepared, the SSM Agent can be fixed, and the instance profile/network prerequisites can be verified. After that, deployments should execute by sending PowerShell-driven remote commands through SSM instead of relying on interactive logins or Git operations on the server.

This keeps deployment logic understandable, avoids opening extra admin protocols for automation, and matches the actual operational state of the server.

Alternatives considered:
- Continue deploying manually through RDP only: workable for break-glass operations, but not repeatable enough.
- WinRM or SSH to Windows: possible fallback options, but less attractive than SSM once the instance is properly managed.
- Keep a live Git checkout on the server and deploy by `git fetch/checkout`: workable, but less isolated and less production-friendly than artifact delivery.

### Use IIS as the public reverse proxy and run the Node app on a localhost-only port

IIS will continue owning ports `80/443` and will reverse proxy `starstep.blabberjax.com` to the Node process on an internal localhost port such as `3001`. The IIS site physical path will be `C:\HostingSpaces\starstep.blabberjax.com\iis-proxy`, while the Node app will run from the separate application tree under `C:\HostingSpaces\starstep.blabberjax.com\app`. This lets the server keep its existing IIS footprint while avoiding direct Internet exposure of the Node listener.

This matches the server's current role and makes hostname routing, TLS termination, and coexistence with other IIS-hosted sites straightforward.

Alternatives considered:
- Bind the Node app directly to `80/443`: rejected because IIS already owns those ports and is the cleaner public entry point.
- Host Node inside IIS-specific adapters: rejected because simple reverse proxying to a normal Node process is easier to operate.

### Reuse the existing Windows scheduled-task startup path for unattended app startup and deploy restarts

The Node app process must start automatically after host reboot and must be restartable by the deployment workflow after a new release artifact is published. The repo already contains Windows-specific production startup support, and this change will reuse and extend that scheduled-task-oriented path rather than introducing a new Windows service wrapper. The startup script on the host should launch the deployed server runtime rather than rebuilding from source during every restart. The app deployment layout should preserve a stable location for secrets such as `.env`, preferably outside versioned release payloads even though `.env.prod` will be the deployment-source file kept locally on the server.

This preserves the repo's Windows-friendly operational direction while making the deployment suitable for unattended hosting with minimal operational churn.

Alternatives considered:
- Introduce a Windows service wrapper now: viable, but unnecessary extra churn for the initial production deployment.
- Introduce a Linux-style service manager assumption: incompatible with the actual host OS.

### Use Cloudflare DNS for the public subdomain in proxied mode and keep IIS as the origin

The production endpoint will live on a dedicated `blabberjax.com` subdomain in Cloudflare with proxying enabled. Cloudflare will handle public DNS, and IIS will act as the origin listener for that hostname before forwarding requests to the Node app on localhost.

This matches the user's existing DNS ownership and current IIS deployment surface.

Alternatives considered:
- Route 53: unnecessary because the domain already uses Cloudflare.
- Direct raw EC2 hostname access: unsuitable for a stable user-facing app.

### Connect to SQL Server locally on the same Windows host by production-only SQL configuration

The application will connect to the SQL Server that already runs on the same Windows EC2 instance using `PRESCHOOL_SQL_CONNECTION_STRING`, stored in a protected runtime `.env` file or equivalent protected environment value under the application tree. The deployment source file will be `.env.prod`, which should be copied into the protected runtime location during deployment without echoing secret values in logs or console output. Production startup must fail if SQL configuration is missing, preserving the current production contract that the app does not silently fall back to JSON storage.

This reuses the current persistence model and avoids cross-host database networking concerns.

Alternatives considered:
- Move SQL to a different host first: cleaner, but out of scope for the current goal.
- Keep relying on file-backed fallback in production: incompatible with the production persistence requirements.

### Use an internal checked-in SQL migration module and run it before switching the app release

Schema evolution will use a checked-in internal SQL migration module rather than ad hoc startup mutation alone. The GitHub Actions deployment flow will publish the candidate release to the Windows host, run pending migrations against the local production SQL database before activating the new app version, and stop the deployment if migration execution fails.

This makes database changes reviewable, repeatable, and tied to source control. It also reduces the risk of deploying app code that expects a schema version the database has not reached yet.

Alternatives considered:
- Keep relying only on startup-time idempotent table creation: acceptable for initial bootstrap, but too weak for ongoing schema evolution.
- Run migrations after app restart: rejected because the new app could observe an outdated schema during startup.
- Apply migrations manually from an operator workstation: rejected because it breaks repeatability and makes deploy state harder to audit.

### Deliver release artifacts to the Windows host instead of using Git on the server

The Windows host should receive a packaged release artifact that contains the built server, built client, deployment scripts, package manifests, and other runtime assets needed to install production dependencies and start the app. The host should unpack that artifact into a versioned release directory, refresh the active `current` pointer or directory, apply migrations, and then restart the app.

This reduces the server's coupling to source-control operations and produces a cleaner production deployment model.

Alternatives considered:
- Use Git directly on the server: rejected because it requires a live checkout, Git tooling, and branch state on the production host.
- Package only the built outputs and no package manifests: rejected because the server still needs a supported path to install runtime dependencies.

### Keep managed generated images in the shared application tree and seed them from the local production artifact

Managed generated-image files should not live only inside a versioned release directory on the Windows host. Instead, the production app should resolve them from the shared application tree under `C:\HostingSpaces\starstep.blabberjax.com\app\shared\generated-assets` so the files survive release rotation. The initial remote deploy should seed that shared asset directory from the local production artifact so any existing routine, chore, or completion images continue to resolve after the cutover.

This keeps generated images stable across redeploys while still allowing the application to create new assets on the remote host after go-live.

Alternatives considered:
- Keep assets inside each release directory: rejected because deploys would make image persistence fragile.
- Store generated binary assets in SQL: rejected because the app already serves them as files and the simpler path is to preserve the filesystem asset model.

### Restore Session Manager as an operational prerequisite for routine deployments

Because Session Manager is currently offline for the target instance, the deployment model explicitly includes recovering it as part of the environment setup. That means verifying the Windows SSM Agent, ensuring the instance profile includes the required Systems Manager permissions, and confirming outbound connectivity to the Systems Manager endpoints.

This reduces long-term dependence on RDP and gives the deployment a safer automation channel.

Alternatives considered:
- Ignore SSM and keep using RDP for ongoing deployments: rejected because it is manual and error-prone.
- Depend on EC2 Serial Console: not required for normal operations and not currently available.

## Risks / Trade-offs

- Single-instance hosting creates one app-host failure domain -> Mitigation: keep bootstrap scripts and deployment docs precise so the host can be recreated quickly.
- Sharing the Windows host between IIS, SQL Server, and the app increases contention risk -> Mitigation: document resource expectations and keep the Node process bound to localhost behind IIS.
- Routine deployments depend on restoring SSM from its current offline state -> Mitigation: make RDP bootstrap and SSM recovery an explicit early task in the change.
- Failed migrations can leave the database ahead of the previously running app build -> Mitigation: require forward-compatible migrations where practical, block app cutover on migration failure, and document rollback expectations for non-reversible schema changes.
- Depending on Cloudflare and IIS reverse proxying adds TLS and rewrite configuration work -> Mitigation: document one supported hostname binding and reverse proxy configuration path and validate it during implementation.

## Migration Plan

1. Use RDP to verify Node, confirm SSM remote execution works, and prepare the Windows host directories and environment under `C:\HostingSpaces\starstep.blabberjax.com`.
2. Configure the IIS site for `starstep.blabberjax.com` with physical path `C:\HostingSpaces\starstep.blabberjax.com\iis-proxy` and reverse proxy rules to the Node app on localhost.
3. Configure the existing Windows scheduled-task startup path for the application tree under `C:\HostingSpaces\starstep.blabberjax.com\app`.
4. Add the migration mechanism, baseline schema tracking, and deployment command path for applying pending migrations.
5. Configure GitHub repository secrets for SSM-driven deployment, host metadata, runtime secrets, and the SQL connection string.
6. Create the Cloudflare DNS record for `starstep.blabberjax.com` and point it at the existing IIS origin.
7. Run the first GitHub Actions deployment so it uploads the release artifact, writes or refreshes the protected runtime `.env` file from `.env.prod` without exposing secrets in logs, applies migrations, verifies IIS-to-Node proxying and database connectivity, then switches normal usage to the new hostname.
8. If deployment fails before app cutover, keep the currently running release in place. If deployment fails after a successful forward-only migration, restore the previous app release only when it remains schema-compatible; otherwise deploy a fix-forward release.

## Open Questions

None at this time.
