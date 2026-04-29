import assert from "node:assert/strict";
import { test } from "node:test";

import { createDefaultState, migrateState } from "./state.js";
import type { Completion } from "./types.js";
import { awardReward } from "../lib/rewards.js";

test("migrateState fills missing preschool participation fields from defaults", () => {
  const migrated = migrateState({
    childProfiles: [
      {
        id: "child-1",
        name: "Milo",
        color: "#FBBF24",
        motivators: [],
        createdAt: "2026-04-26T00:00:00.000Z",
        updatedAt: "2026-04-26T00:00:00.000Z"
      }
    ],
    routines: [],
    chores: []
  });

  assert.equal(migrated.schemaVersion, 1);
  assert.deepEqual(migrated.householdRoles, {
    parentAdmins: []
  });
  assert.deepEqual(migrated.completions, []);
  assert.deepEqual(migrated.rewards, []);
});

test("awardReward records a reward entry for the completion source", () => {
  const state = createDefaultState();
  const completion: Completion = {
    id: "completion-1",
    itemType: "routineStep",
    itemId: "step-1",
    childProfileId: "child-1",
    parentEntityType: "routine",
    parentEntityId: "routine-1",
    status: "completed",
    recordedBy: {
      id: "tablet-1",
      role: "childDisplay"
    },
    completedAt: new Date().toISOString()
  };

  const entry = awardReward(state, completion, {
    type: "stars",
    amount: 2
  });

  assert.ok(entry);
  assert.equal(entry?.sourceType, "routine");
  assert.equal(entry?.sourceId, "routine-1");
  assert.equal(state.rewards.length, 1);
});
