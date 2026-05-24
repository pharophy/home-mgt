## 1. Deployment Spec And Ops Design

- [x] 1.1 Confirm the remaining environment assumptions for `starstep.blabberjax.com` and the `C:\HostingSpaces\starstep.blabberjax.com` deployment layout
- [x] 1.2 Define the Windows host bootstrap, IIS reverse proxy, scheduled-task startup model, and release directory layout needed for the target deployment
- [x] 1.3 Define the required GitHub repository secrets and production environment variables, including `PRESCHOOL_SQL_CONNECTION_STRING`
- [x] 1.4 Choose the migration approach for the SQL store and define the deployment ordering and rollback expectations for schema changes
- [x] 1.5 Define the bootstrap and verification steps now that SSM is online on the existing Windows EC2 instance

## 2. Test-First Deployment Support

- [x] 2.1 Add or update failing automated coverage for Windows production-startup, IIS-oriented environment, or deployment-script behavior introduced by this change
- [x] 2.2 Add failing automated coverage for migration discovery, migration execution, and deployment failure behavior when a migration does not succeed
- [x] 2.3 Add the minimal server or script changes needed to make the new deployment-oriented tests pass without regressing the existing local production path

## 3. GitHub Actions And Host Automation

- [x] 3.1 Add the migration files, migration runner, and tracked schema-version state needed for repeatable SQL schema evolution
- [x] 3.2 Add the GitHub Actions workflow that runs the required checks, applies migrations, and deploys the production build to the existing Windows EC2 instance on main
- [x] 3.3 Add the host-side bootstrap or deploy scripts needed to install dependencies, publish the release, copy `.env.prod` into the protected runtime env location, run migrations in the correct order, and restart the managed Windows app process
- [x] 3.4 Add the IIS reverse proxy configuration templates or documentation required for `starstep.blabberjax.com` on the existing server
- [x] 3.5 Restore or document the AWS Systems Manager prerequisites required for routine automated deployment to the existing instance

## 4. Cloudflare And Same-Host SQL Connectivity

- [x] 4.1 Document the Cloudflare DNS record and origin routing setup for `starstep.blabberjax.com`
- [x] 4.2 Document the local SQL Server connection expectations and protected `.env` configuration on the Windows host
- [x] 4.3 Verify the deployment flow preserves the production requirement to fail fast when SQL configuration is missing
- [x] 4.4 Document the operator response path for failed production migrations and schema-compatible rollback versus fix-forward decisions

## 5. Validation

- [x] 5.1 Run the relevant automated tests for the touched runtime and deployment code
- [x] 5.2 Validate the OpenSpec change with `openspec validate setup-aws-deployment-pipeline --type change --strict --no-interactive`
- [x] 5.3 Perform a documented production smoke-check procedure for the deployed hostname, IIS-to-Node proxy reachability, and database-backed startup
- [x] 5.4 Migrate existing managed generated images from the local production snapshot into the shared remote asset directory and verify they continue to resolve after release rotation
