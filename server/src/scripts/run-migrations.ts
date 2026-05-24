import { loadProjectEnvironment } from "../lib/env.js";
import { MssqlSqlMigrationExecutor, applySqlMigrations } from "../lib/sql-migrations.js";
import { MssqlParticipationClient } from "../lib/sql-store.js";

loadProjectEnvironment();

const connectionString = process.env.PRESCHOOL_SQL_CONNECTION_STRING;

if (!connectionString) {
  throw new Error("PRESCHOOL_SQL_CONNECTION_STRING is required to run SQL migrations.");
}

const client = new MssqlParticipationClient(connectionString);
await applySqlMigrations(new MssqlSqlMigrationExecutor(() => client.getPool()));

console.log("SQL migrations applied successfully.");
