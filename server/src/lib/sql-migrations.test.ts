import assert from "node:assert/strict";
import test from "node:test";

import {
  applySqlMigrations,
  getSqlMigrations,
  type SqlMigrationExecutor
} from "./sql-migrations.js";

class RecordingMigrationExecutor implements SqlMigrationExecutor {
  statements: string[] = [];
  appliedMigrationIds: string[] = [];
  failOnMigrationId: string | null = null;

  async ensureMigrationTable(): Promise<void> {
    this.statements.push("ensureMigrationTable");
  }

  async listAppliedMigrationIds(): Promise<string[]> {
    this.statements.push("listAppliedMigrationIds");
    return [...this.appliedMigrationIds];
  }

  async applyMigration(id: string, sqlText: string): Promise<void> {
    this.statements.push(`apply:${id}`);
    if (this.failOnMigrationId === id) {
      throw new Error(`Migration failed: ${id}`);
    }

    assert.match(sqlText, /CREATE TABLE/i);
    this.appliedMigrationIds.push(id);
  }
}

test("applySqlMigrations applies pending migrations in order", async () => {
  const executor = new RecordingMigrationExecutor();

  await applySqlMigrations(executor);

  assert.deepEqual(executor.statements, [
    "ensureMigrationTable",
    "listAppliedMigrationIds",
    ...getSqlMigrations().map((migration) => `apply:${migration.id}`)
  ]);
  assert.deepEqual(
    executor.appliedMigrationIds,
    getSqlMigrations().map((migration) => migration.id)
  );
});

test("applySqlMigrations skips migrations that are already recorded", async () => {
  const [firstMigration] = getSqlMigrations();
  const executor = new RecordingMigrationExecutor();
  executor.appliedMigrationIds = [firstMigration.id];

  await applySqlMigrations(executor);

  assert.deepEqual(executor.statements, [
    "ensureMigrationTable",
    "listAppliedMigrationIds"
  ]);
});

test("applySqlMigrations stops when a migration fails", async () => {
  const [firstMigration] = getSqlMigrations();
  const executor = new RecordingMigrationExecutor();
  executor.failOnMigrationId = firstMigration.id;

  await assert.rejects(() => applySqlMigrations(executor), /Migration failed/);
  assert.deepEqual(executor.appliedMigrationIds, []);
});
