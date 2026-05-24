import sql from "mssql/msnodesqlv8.js";

export type SqlMigration = {
  id: string;
  sql: string;
};

export interface SqlMigrationExecutor {
  ensureMigrationTable(): Promise<void>;
  listAppliedMigrationIds(): Promise<string[]>;
  applyMigration(id: string, sqlText: string): Promise<void>;
}

const sqlMigrations: SqlMigration[] = [
  {
    id: "001_base_preschool_participation_schema",
    sql: `
      IF OBJECT_ID('dbo.household_settings', 'U') IS NULL
      CREATE TABLE dbo.household_settings (
        id INT NOT NULL PRIMARY KEY,
        celebration_mode NVARCHAR(16) NOT NULL
      );
      IF OBJECT_ID('dbo.child_profiles', 'U') IS NULL
      CREATE TABLE dbo.child_profiles (
        id NVARCHAR(128) NOT NULL PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        avatar_url NVARCHAR(MAX) NULL,
        color NVARCHAR(32) NOT NULL,
        motivators_json NVARCHAR(MAX) NOT NULL,
        created_at NVARCHAR(64) NOT NULL,
        updated_at NVARCHAR(64) NOT NULL
      );
      IF OBJECT_ID('dbo.routines', 'U') IS NULL
      CREATE TABLE dbo.routines (
        id NVARCHAR(128) NOT NULL PRIMARY KEY,
        child_profile_id NVARCHAR(128) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        image_url NVARCHAR(MAX) NULL,
        schedule_days_json NVARCHAR(MAX) NOT NULL,
        reward_type NVARCHAR(16) NULL,
        reward_amount INT NULL,
        created_at NVARCHAR(64) NOT NULL,
        updated_at NVARCHAR(64) NOT NULL
      );
      IF OBJECT_ID('dbo.routine_steps', 'U') IS NULL
      CREATE TABLE dbo.routine_steps (
        id NVARCHAR(128) NOT NULL PRIMARY KEY,
        routine_id NVARCHAR(128) NOT NULL,
        label NVARCHAR(255) NOT NULL,
        icon NVARCHAR(64) NULL,
        image_url NVARCHAR(MAX) NULL,
        step_order INT NOT NULL
      );
      IF OBJECT_ID('dbo.chores', 'U') IS NULL
      CREATE TABLE dbo.chores (
        id NVARCHAR(128) NOT NULL PRIMARY KEY,
        child_profile_id NVARCHAR(128) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        image_url NVARCHAR(MAX) NULL,
        recurrence_days_json NVARCHAR(MAX) NOT NULL,
        requires_approval BIT NOT NULL,
        reward_type NVARCHAR(16) NULL,
        reward_amount INT NULL,
        created_at NVARCHAR(64) NOT NULL,
        updated_at NVARCHAR(64) NOT NULL
      );
      IF OBJECT_ID('dbo.completions', 'U') IS NULL
      CREATE TABLE dbo.completions (
        id NVARCHAR(128) NOT NULL PRIMARY KEY,
        item_type NVARCHAR(32) NOT NULL,
        item_id NVARCHAR(128) NOT NULL,
        child_profile_id NVARCHAR(128) NOT NULL,
        scheduled_day NVARCHAR(16) NULL,
        parent_entity_type NVARCHAR(32) NULL,
        parent_entity_id NVARCHAR(128) NULL,
        status NVARCHAR(32) NOT NULL,
        recorded_by_id NVARCHAR(128) NOT NULL,
        recorded_by_role NVARCHAR(32) NOT NULL,
        completed_at NVARCHAR(64) NOT NULL,
        approved_at NVARCHAR(64) NULL,
        approved_by_id NVARCHAR(128) NULL,
        approved_by_role NVARCHAR(32) NULL,
        celebration_image_url NVARCHAR(MAX) NULL,
        celebration_prompt NVARCHAR(MAX) NULL,
        celebration_theme NVARCHAR(255) NULL,
        celebration_generated_at NVARCHAR(64) NULL
      );
      IF OBJECT_ID('dbo.rewards', 'U') IS NULL
      CREATE TABLE dbo.rewards (
        id NVARCHAR(128) NOT NULL PRIMARY KEY,
        child_profile_id NVARCHAR(128) NOT NULL,
        source_type NVARCHAR(32) NOT NULL,
        source_id NVARCHAR(128) NOT NULL,
        completion_id NVARCHAR(128) NOT NULL,
        reward_type NVARCHAR(16) NOT NULL,
        amount INT NOT NULL,
        awarded_at NVARCHAR(64) NOT NULL
      );
    `
  }
];

export function getSqlMigrations(): SqlMigration[] {
  return sqlMigrations.map((migration) => ({ ...migration }));
}

export async function applySqlMigrations(executor: SqlMigrationExecutor): Promise<void> {
  await executor.ensureMigrationTable();
  const appliedMigrationIds = new Set(await executor.listAppliedMigrationIds());

  for (const migration of sqlMigrations) {
    if (appliedMigrationIds.has(migration.id)) {
      continue;
    }

    await executor.applyMigration(migration.id, migration.sql);
  }
}

export class MssqlSqlMigrationExecutor implements SqlMigrationExecutor {
  constructor(private readonly getPool: () => Promise<any>) {}

  async ensureMigrationTable(): Promise<void> {
    const pool = await this.getPool();
    await pool.request().batch(`
      IF OBJECT_ID('dbo.schema_migrations', 'U') IS NULL
      CREATE TABLE dbo.schema_migrations (
        id NVARCHAR(255) NOT NULL PRIMARY KEY,
        applied_at NVARCHAR(64) NOT NULL
      );
    `);
  }

  async listAppliedMigrationIds(): Promise<string[]> {
    const pool = await this.getPool();
    const result = (await pool.request().query(
      "SELECT id FROM dbo.schema_migrations ORDER BY id"
    )) as { recordset: Array<{ id: string }> };

    return result.recordset.map((row) => row.id);
  }

  async applyMigration(id: string, sqlText: string): Promise<void> {
    const pool = await this.getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      await new sql.Request(transaction).batch(sqlText);
      await new sql.Request(transaction)
        .input("id", sql.NVarChar(255), id)
        .input("applied_at", sql.NVarChar(64), new Date().toISOString())
        .query(`
          INSERT INTO dbo.schema_migrations (id, applied_at)
          VALUES (@id, @applied_at)
        `);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
