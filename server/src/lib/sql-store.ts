import sql from "mssql/msnodesqlv8.js";

import { createDefaultState } from "../domain/state.js";
import type {
  Chore,
  Completion,
  PreschoolParticipationState,
  RewardLedgerEntry,
  Routine,
  RoutineStep
} from "../domain/types.js";
import { JsonParticipationStore, type ParticipationStore } from "./store.js";

type SqlHouseholdSettingsRow = {
  celebration_mode: "full" | "gentle";
};

type SqlChildProfileRow = {
  id: string;
  name: string;
  avatar_url: string | null;
  color: string;
  motivators_json: string;
  created_at: string;
  updated_at: string;
};

type SqlRoutineRow = {
  id: string;
  child_profile_id: string;
  name: string;
  image_url: string | null;
  schedule_days_json: string;
  reward_type: "stars" | "stickers" | null;
  reward_amount: number | null;
  created_at: string;
  updated_at: string;
};

type SqlRoutineStepRow = {
  id: string;
  routine_id: string;
  label: string;
  icon: string | null;
  image_url: string | null;
  step_order: number;
};

type SqlChoreRow = {
  id: string;
  child_profile_id: string;
  name: string;
  image_url: string | null;
  recurrence_days_json: string;
  requires_approval: boolean;
  reward_type: "stars" | "stickers" | null;
  reward_amount: number | null;
  created_at: string;
  updated_at: string;
};

type SqlCompletionRow = {
  id: string;
  item_type: Completion["itemType"];
  item_id: string;
  child_profile_id: string;
  scheduled_day: Completion["scheduledDay"] | null;
  parent_entity_type: Completion["parentEntityType"] | null;
  parent_entity_id: string | null;
  status: Completion["status"];
  recorded_by_id: string;
  recorded_by_role: Completion["recordedBy"]["role"];
  completed_at: string;
  approved_at: string | null;
  approved_by_id: string | null;
  approved_by_role: Completion["recordedBy"]["role"] | null;
  celebration_image_url: string | null;
  celebration_prompt: string | null;
  celebration_theme: string | null;
  celebration_generated_at: string | null;
};

type SqlRewardRow = {
  id: string;
  child_profile_id: string;
  source_type: RewardLedgerEntry["sourceType"];
  source_id: string;
  completion_id: string;
  reward_type: RewardLedgerEntry["rewardType"];
  amount: number;
  awarded_at: string;
};

export type SqlParticipationSnapshot = {
  householdSettings: SqlHouseholdSettingsRow | null;
  childProfiles: SqlChildProfileRow[];
  routines: SqlRoutineRow[];
  routineSteps: SqlRoutineStepRow[];
  chores: SqlChoreRow[];
  completions: SqlCompletionRow[];
  rewards: SqlRewardRow[];
};

export interface SqlParticipationClient {
  ensureSchema(): Promise<void>;
  readSnapshot(): Promise<SqlParticipationSnapshot>;
  writeSnapshot(snapshot: SqlParticipationSnapshot): Promise<void>;
}

function parseConnectionString(connectionString: string): Record<string, string> {
  return Object.fromEntries(
    connectionString
      .split(";")
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .map((part) => {
        const separatorIndex = part.indexOf("=");
        if (separatorIndex < 0) {
          return [part, ""];
        }

        return [
          part.slice(0, separatorIndex).trim().toLowerCase(),
          part.slice(separatorIndex + 1).trim()
        ];
      })
  );
}

function parseStringArray(value: string): string[] {
  const parsed = JSON.parse(value) as unknown;
  return Array.isArray(parsed)
    ? parsed.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function toSqlSnapshot(state: PreschoolParticipationState): SqlParticipationSnapshot {
  return {
    householdSettings: {
      celebration_mode: state.householdSettings.celebrationMode
    },
    childProfiles: state.childProfiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      avatar_url: profile.avatarUrl ?? null,
      color: profile.color,
      motivators_json: JSON.stringify(profile.motivators),
      created_at: profile.createdAt,
      updated_at: profile.updatedAt
    })),
    routines: state.routines.map((routine) => ({
      id: routine.id,
      child_profile_id: routine.childProfileId,
      name: routine.name,
      image_url: routine.imageUrl ?? null,
      schedule_days_json: JSON.stringify(routine.schedule.days),
      reward_type: routine.reward?.type ?? null,
      reward_amount: routine.reward?.amount ?? null,
      created_at: routine.createdAt,
      updated_at: routine.updatedAt
    })),
    routineSteps: state.routines.flatMap((routine) =>
      routine.steps.map((step) => ({
        id: step.id,
        routine_id: routine.id,
        label: step.label,
        icon: step.icon ?? null,
        image_url: step.imageUrl ?? null,
        step_order: step.order
      }))
    ),
    chores: state.chores.map((chore) => ({
      id: chore.id,
      child_profile_id: chore.childProfileId,
      name: chore.name,
      image_url: chore.imageUrl ?? null,
      recurrence_days_json: JSON.stringify(chore.recurrence.days),
      requires_approval: chore.requiresApproval,
      reward_type: chore.reward?.type ?? null,
      reward_amount: chore.reward?.amount ?? null,
      created_at: chore.createdAt,
      updated_at: chore.updatedAt
    })),
    completions: state.completions.map((completion) => ({
      id: completion.id,
      item_type: completion.itemType,
      item_id: completion.itemId,
      child_profile_id: completion.childProfileId,
      scheduled_day: completion.scheduledDay ?? null,
      parent_entity_type: completion.parentEntityType ?? null,
      parent_entity_id: completion.parentEntityId ?? null,
      status: completion.status,
      recorded_by_id: completion.recordedBy.id,
      recorded_by_role: completion.recordedBy.role,
      completed_at: completion.completedAt,
      approved_at: completion.approvedAt ?? null,
      approved_by_id: completion.approvedBy?.id ?? null,
      approved_by_role: completion.approvedBy?.role ?? null,
      celebration_image_url: completion.celebrationImageUrl ?? null,
      celebration_prompt: completion.celebrationPrompt ?? null,
      celebration_theme: completion.celebrationTheme ?? null,
      celebration_generated_at: completion.celebrationGeneratedAt ?? null
    })),
    rewards: state.rewards.map((reward) => ({
      id: reward.id,
      child_profile_id: reward.childProfileId,
      source_type: reward.sourceType,
      source_id: reward.sourceId,
      completion_id: reward.completionId,
      reward_type: reward.rewardType,
      amount: reward.amount,
      awarded_at: reward.awardedAt
    }))
  };
}

function fromSqlSnapshot(snapshot: SqlParticipationSnapshot): PreschoolParticipationState {
  const base = createDefaultState();
  const routineStepsByRoutine = new Map<string, RoutineStep[]>();
  for (const step of snapshot.routineSteps) {
    const steps = routineStepsByRoutine.get(step.routine_id) ?? [];
    steps.push({
      id: step.id,
      label: step.label,
      icon: step.icon ?? undefined,
      imageUrl: step.image_url ?? undefined,
      order: step.step_order
    });
    routineStepsByRoutine.set(step.routine_id, steps);
  }

  const routines: Routine[] = snapshot.routines.map((routine) => ({
    id: routine.id,
    childProfileId: routine.child_profile_id,
    name: routine.name,
    imageUrl: routine.image_url ?? undefined,
    schedule: {
      days: parseStringArray(routine.schedule_days_json) as Routine["schedule"]["days"]
    },
    steps: (routineStepsByRoutine.get(routine.id) ?? []).sort((a, b) => a.order - b.order),
    reward:
      routine.reward_type && typeof routine.reward_amount === "number"
        ? {
            type: routine.reward_type,
            amount: routine.reward_amount
          }
        : undefined,
    createdAt: routine.created_at,
    updatedAt: routine.updated_at
  }));

  const chores: Chore[] = snapshot.chores.map((chore) => ({
    id: chore.id,
    childProfileId: chore.child_profile_id,
    name: chore.name,
    imageUrl: chore.image_url ?? undefined,
    recurrence: {
      days: parseStringArray(chore.recurrence_days_json) as Chore["recurrence"]["days"]
    },
    requiresApproval: Boolean(chore.requires_approval),
    reward:
      chore.reward_type && typeof chore.reward_amount === "number"
        ? {
            type: chore.reward_type,
            amount: chore.reward_amount
          }
        : undefined,
    createdAt: chore.created_at,
    updatedAt: chore.updated_at
  }));

  return {
    ...base,
    householdSettings: {
      celebrationMode: snapshot.householdSettings?.celebration_mode ?? base.householdSettings.celebrationMode
    },
    childProfiles: snapshot.childProfiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      avatarUrl: profile.avatar_url ?? undefined,
      color: profile.color,
      motivators: parseStringArray(profile.motivators_json),
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    })),
    routines,
    chores,
    completions: snapshot.completions.map((completion) => ({
      id: completion.id,
      itemType: completion.item_type,
      itemId: completion.item_id,
      childProfileId: completion.child_profile_id,
      scheduledDay: completion.scheduled_day ?? undefined,
      parentEntityType: completion.parent_entity_type ?? undefined,
      parentEntityId: completion.parent_entity_id ?? undefined,
      status: completion.status,
      recordedBy: {
        id: completion.recorded_by_id,
        role: completion.recorded_by_role
      },
      completedAt: completion.completed_at,
      approvedAt: completion.approved_at ?? undefined,
      approvedBy:
        completion.approved_by_id && completion.approved_by_role
          ? {
              id: completion.approved_by_id,
              role: completion.approved_by_role
            }
          : undefined,
      celebrationImageUrl: completion.celebration_image_url ?? undefined,
      celebrationPrompt: completion.celebration_prompt ?? undefined,
      celebrationTheme: completion.celebration_theme ?? undefined,
      celebrationGeneratedAt: completion.celebration_generated_at ?? undefined
    })),
    rewards: snapshot.rewards.map((reward) => ({
      id: reward.id,
      childProfileId: reward.child_profile_id,
      sourceType: reward.source_type,
      sourceId: reward.source_id,
      completionId: reward.completion_id,
      rewardType: reward.reward_type,
      amount: reward.amount,
      awardedAt: reward.awarded_at
    }))
  };
}

export class SqlParticipationStore implements ParticipationStore {
  constructor(private readonly client: SqlParticipationClient) {}

  async read(): Promise<PreschoolParticipationState> {
    await this.client.ensureSchema();
    return fromSqlSnapshot(await this.client.readSnapshot());
  }

  async write(state: PreschoolParticipationState): Promise<void> {
    await this.client.ensureSchema();
    await this.client.writeSnapshot(toSqlSnapshot(state));
  }
}

export class MssqlParticipationClient implements SqlParticipationClient {
  private poolPromise: Promise<any> | null = null;
  private schemaEnsured = false;

  constructor(private readonly connectionString: string) {}

  private async getPool(): Promise<any> {
    if (!this.poolPromise) {
      const parsed = parseConnectionString(this.connectionString);
      const config = {
        server: parsed.server ?? "localhost",
        database: parsed.database,
        user: parsed["user id"] ?? parsed.uid,
        password: parsed.password ?? parsed.pwd,
        driver: parsed.driver?.replace(/^\{|\}$/g, ""),
        options: {
          trustedConnection:
            (parsed.trusted_connection ?? "").toLowerCase() === "yes" ||
            (parsed.trusted_connection ?? "").toLowerCase() === "true",
          trustServerCertificate:
            (parsed.trustservercertificate ?? "").toLowerCase() === "yes" ||
            (parsed.trustservercertificate ?? "").toLowerCase() === "true"
        }
      };
      this.poolPromise = new sql.ConnectionPool(config).connect();
    }

    return this.poolPromise;
  }

  async ensureSchema(): Promise<void> {
    if (this.schemaEnsured) {
      return;
    }

    const pool = await this.getPool();
    await pool.request().batch(`
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
    `);
    this.schemaEnsured = true;
  }

  async readSnapshot(): Promise<SqlParticipationSnapshot> {
    const pool = await this.getPool();
    const householdSettings = (await pool.request().query(
      "SELECT TOP 1 celebration_mode FROM dbo.household_settings ORDER BY id"
    )) as { recordset: SqlHouseholdSettingsRow[] };
    const childProfiles = (await pool.request().query(
      "SELECT * FROM dbo.child_profiles ORDER BY created_at, id"
    )) as { recordset: SqlChildProfileRow[] };
    const routines = (await pool.request().query(
      "SELECT * FROM dbo.routines ORDER BY created_at, id"
    )) as { recordset: SqlRoutineRow[] };
    const routineSteps = (await pool.request().query(
      "SELECT * FROM dbo.routine_steps ORDER BY routine_id, step_order, id"
    )) as { recordset: SqlRoutineStepRow[] };
    const chores = (await pool.request().query(
      "SELECT * FROM dbo.chores ORDER BY created_at, id"
    )) as { recordset: SqlChoreRow[] };
    const completions = (await pool.request().query(
      "SELECT * FROM dbo.completions ORDER BY completed_at, id"
    )) as { recordset: SqlCompletionRow[] };
    const rewards = (await pool.request().query(
      "SELECT * FROM dbo.rewards ORDER BY awarded_at, id"
    )) as { recordset: SqlRewardRow[] };

    return {
      householdSettings: householdSettings.recordset[0] ?? null,
      childProfiles: childProfiles.recordset,
      routines: routines.recordset,
      routineSteps: routineSteps.recordset,
      chores: chores.recordset,
      completions: completions.recordset,
      rewards: rewards.recordset
    };
  }

  async writeSnapshot(snapshot: SqlParticipationSnapshot): Promise<void> {
    const pool = await this.getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      await new sql.Request(transaction).batch(`
        DELETE FROM dbo.routine_steps;
        DELETE FROM dbo.rewards;
        DELETE FROM dbo.completions;
        DELETE FROM dbo.routines;
        DELETE FROM dbo.chores;
        DELETE FROM dbo.child_profiles;
        DELETE FROM dbo.household_settings;
      `);

      if (snapshot.householdSettings) {
        await new sql.Request(transaction)
          .input("celebration_mode", sql.NVarChar(16), snapshot.householdSettings.celebration_mode)
          .query(
            "INSERT INTO dbo.household_settings (id, celebration_mode) VALUES (1, @celebration_mode)"
          );
      }

      for (const row of snapshot.childProfiles) {
        await new sql.Request(transaction)
          .input("id", sql.NVarChar(128), row.id)
          .input("name", sql.NVarChar(255), row.name)
          .input("avatar_url", sql.NVarChar(sql.MAX), row.avatar_url)
          .input("color", sql.NVarChar(32), row.color)
          .input("motivators_json", sql.NVarChar(sql.MAX), row.motivators_json)
          .input("created_at", sql.NVarChar(64), row.created_at)
          .input("updated_at", sql.NVarChar(64), row.updated_at)
          .query(`
            INSERT INTO dbo.child_profiles
            (id, name, avatar_url, color, motivators_json, created_at, updated_at)
            VALUES (@id, @name, @avatar_url, @color, @motivators_json, @created_at, @updated_at)
          `);
      }

      for (const row of snapshot.routines) {
        await new sql.Request(transaction)
          .input("id", sql.NVarChar(128), row.id)
          .input("child_profile_id", sql.NVarChar(128), row.child_profile_id)
          .input("name", sql.NVarChar(255), row.name)
          .input("image_url", sql.NVarChar(sql.MAX), row.image_url)
          .input("schedule_days_json", sql.NVarChar(sql.MAX), row.schedule_days_json)
          .input("reward_type", sql.NVarChar(16), row.reward_type)
          .input("reward_amount", sql.Int, row.reward_amount)
          .input("created_at", sql.NVarChar(64), row.created_at)
          .input("updated_at", sql.NVarChar(64), row.updated_at)
          .query(`
            INSERT INTO dbo.routines
            (id, child_profile_id, name, image_url, schedule_days_json, reward_type, reward_amount, created_at, updated_at)
            VALUES (@id, @child_profile_id, @name, @image_url, @schedule_days_json, @reward_type, @reward_amount, @created_at, @updated_at)
          `);
      }

      for (const row of snapshot.routineSteps) {
        await new sql.Request(transaction)
          .input("id", sql.NVarChar(128), row.id)
          .input("routine_id", sql.NVarChar(128), row.routine_id)
          .input("label", sql.NVarChar(255), row.label)
          .input("icon", sql.NVarChar(64), row.icon)
          .input("image_url", sql.NVarChar(sql.MAX), row.image_url)
          .input("step_order", sql.Int, row.step_order)
          .query(`
            INSERT INTO dbo.routine_steps
            (id, routine_id, label, icon, image_url, step_order)
            VALUES (@id, @routine_id, @label, @icon, @image_url, @step_order)
          `);
      }

      for (const row of snapshot.chores) {
        await new sql.Request(transaction)
          .input("id", sql.NVarChar(128), row.id)
          .input("child_profile_id", sql.NVarChar(128), row.child_profile_id)
          .input("name", sql.NVarChar(255), row.name)
          .input("image_url", sql.NVarChar(sql.MAX), row.image_url)
          .input("recurrence_days_json", sql.NVarChar(sql.MAX), row.recurrence_days_json)
          .input("requires_approval", sql.Bit, row.requires_approval)
          .input("reward_type", sql.NVarChar(16), row.reward_type)
          .input("reward_amount", sql.Int, row.reward_amount)
          .input("created_at", sql.NVarChar(64), row.created_at)
          .input("updated_at", sql.NVarChar(64), row.updated_at)
          .query(`
            INSERT INTO dbo.chores
            (id, child_profile_id, name, image_url, recurrence_days_json, requires_approval, reward_type, reward_amount, created_at, updated_at)
            VALUES (@id, @child_profile_id, @name, @image_url, @recurrence_days_json, @requires_approval, @reward_type, @reward_amount, @created_at, @updated_at)
          `);
      }

      for (const row of snapshot.completions) {
        await new sql.Request(transaction)
          .input("id", sql.NVarChar(128), row.id)
          .input("item_type", sql.NVarChar(32), row.item_type)
          .input("item_id", sql.NVarChar(128), row.item_id)
          .input("child_profile_id", sql.NVarChar(128), row.child_profile_id)
          .input("scheduled_day", sql.NVarChar(16), row.scheduled_day)
          .input("parent_entity_type", sql.NVarChar(32), row.parent_entity_type)
          .input("parent_entity_id", sql.NVarChar(128), row.parent_entity_id)
          .input("status", sql.NVarChar(32), row.status)
          .input("recorded_by_id", sql.NVarChar(128), row.recorded_by_id)
          .input("recorded_by_role", sql.NVarChar(32), row.recorded_by_role)
          .input("completed_at", sql.NVarChar(64), row.completed_at)
          .input("approved_at", sql.NVarChar(64), row.approved_at)
          .input("approved_by_id", sql.NVarChar(128), row.approved_by_id)
          .input("approved_by_role", sql.NVarChar(32), row.approved_by_role)
          .input("celebration_image_url", sql.NVarChar(sql.MAX), row.celebration_image_url)
          .input("celebration_prompt", sql.NVarChar(sql.MAX), row.celebration_prompt)
          .input("celebration_theme", sql.NVarChar(255), row.celebration_theme)
          .input("celebration_generated_at", sql.NVarChar(64), row.celebration_generated_at)
          .query(`
            INSERT INTO dbo.completions
            (id, item_type, item_id, child_profile_id, scheduled_day, parent_entity_type, parent_entity_id, status, recorded_by_id, recorded_by_role, completed_at, approved_at, approved_by_id, approved_by_role, celebration_image_url, celebration_prompt, celebration_theme, celebration_generated_at)
            VALUES (@id, @item_type, @item_id, @child_profile_id, @scheduled_day, @parent_entity_type, @parent_entity_id, @status, @recorded_by_id, @recorded_by_role, @completed_at, @approved_at, @approved_by_id, @approved_by_role, @celebration_image_url, @celebration_prompt, @celebration_theme, @celebration_generated_at)
          `);
      }

      for (const row of snapshot.rewards) {
        await new sql.Request(transaction)
          .input("id", sql.NVarChar(128), row.id)
          .input("child_profile_id", sql.NVarChar(128), row.child_profile_id)
          .input("source_type", sql.NVarChar(32), row.source_type)
          .input("source_id", sql.NVarChar(128), row.source_id)
          .input("completion_id", sql.NVarChar(128), row.completion_id)
          .input("reward_type", sql.NVarChar(16), row.reward_type)
          .input("amount", sql.Int, row.amount)
          .input("awarded_at", sql.NVarChar(64), row.awarded_at)
          .query(`
            INSERT INTO dbo.rewards
            (id, child_profile_id, source_type, source_id, completion_id, reward_type, amount, awarded_at)
            VALUES (@id, @child_profile_id, @source_type, @source_id, @completion_id, @reward_type, @amount, @awarded_at)
          `);
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export function createParticipationStore({
  dataFile,
  sqlConnectionString,
  sqlClient
}: {
  dataFile: string;
  sqlConnectionString?: string;
  sqlClient?: SqlParticipationClient;
}): ParticipationStore {
  if (sqlClient) {
    return new SqlParticipationStore(sqlClient);
  }

  if (sqlConnectionString) {
    return new SqlParticipationStore(new MssqlParticipationClient(sqlConnectionString));
  }

  return new JsonParticipationStore(dataFile);
}
