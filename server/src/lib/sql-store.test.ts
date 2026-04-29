import assert from "node:assert/strict";
import test from "node:test";

import { createDefaultState } from "../domain/state.js";
import type { PreschoolParticipationState } from "../domain/types.js";
import {
  SqlParticipationStore,
  createParticipationStore,
  type SqlParticipationClient,
  type SqlParticipationSnapshot
} from "./sql-store.js";

class InMemorySqlClient implements SqlParticipationClient {
  initialized = false;
  snapshot: SqlParticipationSnapshot = {
    householdSettings: null,
    childProfiles: [],
    routines: [],
    routineSteps: [],
    chores: [],
    completions: [],
    rewards: []
  };

  async ensureSchema(): Promise<void> {
    this.initialized = true;
  }

  async readSnapshot(): Promise<SqlParticipationSnapshot> {
    return structuredClone(this.snapshot);
  }

  async writeSnapshot(snapshot: SqlParticipationSnapshot): Promise<void> {
    this.snapshot = structuredClone(snapshot);
  }
}

function createSampleState(): PreschoolParticipationState {
  return {
    ...createDefaultState(),
    householdSettings: {
      celebrationMode: "gentle"
    },
    childProfiles: [
      {
        id: "child-1",
        name: "Milo",
        color: "#34D399",
        motivators: ["race cars", "gold stars"],
        createdAt: "2026-04-28T00:00:00.000Z",
        updatedAt: "2026-04-28T00:00:00.000Z"
      }
    ],
    routines: [
      {
        id: "routine-1",
        childProfileId: "child-1",
        name: "Morning helper",
        schedule: {
          days: ["monday", "tuesday"]
        },
        steps: [
          {
            id: "step-1",
            label: "Brush teeth",
            order: 0
          }
        ],
        reward: {
          type: "stars",
          amount: 2
        },
        createdAt: "2026-04-28T00:00:00.000Z",
        updatedAt: "2026-04-28T00:00:00.000Z"
      }
    ],
    chores: [
      {
        id: "chore-1",
        childProfileId: "child-1",
        name: "Carry napkins",
        recurrence: {
          days: ["wednesday"]
        },
        requiresApproval: false,
        reward: {
          type: "stickers",
          amount: 1
        },
        createdAt: "2026-04-28T00:00:00.000Z",
        updatedAt: "2026-04-28T00:00:00.000Z"
      }
    ],
    completions: [
      {
        id: "completion-1",
        itemType: "chore",
        itemId: "chore-1",
        childProfileId: "child-1",
        scheduledDay: "wednesday",
        status: "completed",
        recordedBy: {
          id: "parent-1",
          role: "parentAdmin"
        },
        completedAt: "2026-04-28T00:00:00.000Z",
        celebrationImageUrl: "data:image/png;base64,celebration",
        celebrationPrompt: "prompt text",
        celebrationTheme: "race cars",
        celebrationGeneratedAt: "2026-04-28T00:00:01.000Z"
      }
    ],
    rewards: [
      {
        id: "reward-1",
        childProfileId: "child-1",
        sourceType: "chore",
        sourceId: "chore-1",
        completionId: "completion-1",
        rewardType: "stickers",
        amount: 1,
        awardedAt: "2026-04-28T00:00:00.000Z"
      }
    ]
  };
}

test("sql participation store round-trips normalized participation state", async () => {
  const client = new InMemorySqlClient();
  const store = new SqlParticipationStore(client);
  const state = createSampleState();

  await store.write(state);
  const loaded = await store.read();

  assert.equal(client.initialized, true);
  assert.deepEqual(
    JSON.parse(JSON.stringify(loaded)),
    JSON.parse(JSON.stringify(state))
  );
});

test("createParticipationStore prefers the sql store when a connection string is configured", () => {
  const store = createParticipationStore({
    dataFile: "ignored.json",
    sqlConnectionString: "Server=localhost;Database=home_mgt;Trusted_Connection=Yes;",
    sqlClient: new InMemorySqlClient()
  });

  assert.equal(store.constructor.name, "SqlParticipationStore");
});
