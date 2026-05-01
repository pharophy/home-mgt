import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { AddressInfo } from "node:net";

import { createApp } from "./app.js";

let tempDir = "";
let baseUrl = "";
let dataFile = "";
let closeServer: (() => Promise<void>) | null = null;
let appOptions: Parameters<typeof createApp>[0] = {};

async function requestJson(
  input: string,
  init?: RequestInit
): Promise<{ status: number; json: unknown }> {
  const response = await fetch(`${baseUrl}${input}`, init);
  return {
    status: response.status,
    json: (await response.json()) as unknown
  };
}

async function startServer(): Promise<void> {
  const app = createApp({ dataFile, ...appOptions });
  const server = app.listen(0);
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
  closeServer = async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error: Error | undefined) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  };
}

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "home-mgt-"));
  dataFile = path.join(tempDir, "home.json");
  appOptions = {};
  await startServer();
});

afterEach(async () => {
  if (closeServer) {
    await closeServer();
  }

  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("parent can create child profiles, routines, and chores", async () => {
  const childProfileResponse = await requestJson("/api/child-profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Milo",
      color: "#F59E0B",
      motivators: ["stickers", "dance break"]
    })
  });

  assert.equal(childProfileResponse.status, 201);
  const childProfile = childProfileResponse.json as { id: string; name: string };
  assert.equal(childProfile.name, "Milo");

  const routineResponse = await requestJson("/api/routines", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Morning helper",
      schedule: {
        days: ["monday", "tuesday", "wednesday", "thursday", "friday"]
      },
      steps: [
        {
          label: "Get dressed",
          icon: "shirt"
        },
        {
          label: "Put pajamas in hamper",
          icon: "hamper"
        }
      ],
      reward: {
        type: "stars",
        amount: 2
      }
    })
  });

  assert.equal(routineResponse.status, 201);

  const choreResponse = await requestJson("/api/chores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Carry napkins to table",
      recurrence: {
        days: ["monday", "wednesday"]
      },
      requiresApproval: true,
      reward: {
        type: "stickers",
        amount: 1
      }
    })
  });

  assert.equal(choreResponse.status, 201);

  const stateResponse = await requestJson("/api/state", {
    headers: {
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    }
  });

  assert.equal(stateResponse.status, 200);
  const state = stateResponse.json as {
    childProfiles: Array<{ id: string }>;
    routines: Array<{ name: string }>;
    chores: Array<{ name: string }>;
  };

  assert.equal(state.childProfiles.length, 1);
  assert.equal(state.routines[0]?.name, "Morning helper");
  assert.equal(state.chores[0]?.name, "Carry napkins to table");
});

test("production app serves the built client shell and static assets", async () => {
  const clientDistDir = await mkdtemp(path.join(os.tmpdir(), "home-mgt-client-"));
  await mkdir(path.join(clientDistDir, "assets"), { recursive: true });
  await writeFile(
    path.join(clientDistDir, "index.html"),
    "<!doctype html><html><body><script src=\"/assets/app.js\"></script></body></html>",
    "utf8"
  );
  await writeFile(path.join(clientDistDir, "assets", "app.js"), "console.log('prod');", "utf8");

  appOptions = {
    clientDistDir
  };

  if (closeServer) {
    await closeServer();
  }
  await startServer();

  const shellResponse = await fetch(`${baseUrl}/setup`);
  assert.equal(shellResponse.status, 200);
  assert.match(await shellResponse.text(), /<script src="\/assets\/app\.js"><\/script>/);

  const assetResponse = await fetch(`${baseUrl}/assets/app.js`);
  assert.equal(assetResponse.status, 200);
  assert.equal(await assetResponse.text(), "console.log('prod');");
});

test("parent can save a routine with a large instructional image payload", async () => {
  const childProfileResponse = await requestJson("/api/child-profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Milo",
      color: "#F59E0B"
    })
  });

  const childProfile = childProfileResponse.json as { id: string };
  const largeImageUrl = `data:image/png;base64,${"a".repeat(200_000)}`;

  const routineResponse = await requestJson("/api/routines", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Morning helper",
      imageUrl: largeImageUrl,
      schedule: {
        days: ["monday"]
      },
      steps: [
        {
          label: "Get dressed",
          icon: "shirt",
          imageUrl: largeImageUrl
        }
      ]
    })
  });

  assert.equal(routineResponse.status, 201);
  const routine = routineResponse.json as { imageUrl: string; steps: Array<{ imageUrl?: string }> };
  assert.equal(routine.imageUrl, largeImageUrl);
  assert.equal(routine.steps[0]?.imageUrl, largeImageUrl);
});

test("parent can request an instructional image for an activity", async () => {
  appOptions = {
    instructionalImageService: {
      generateInstructionalImage: async () => ({
        imageUrl: "data:image/png;base64,instructional",
        prompt: "instructional prompt"
      })
    }
  };

  if (closeServer) {
    await closeServer();
  }
  await startServer();

  const response = await requestJson("/api/instructional-images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      activityName: "Morning helper",
      stepLabels: ["Get dressed", "Brush teeth"]
    })
  });

  assert.equal(response.status, 200);
  assert.deepEqual(response.json, {
    imageUrl: "data:image/png;base64,instructional",
    prompt: "instructional prompt"
  });
});

test("child display can record progress but cannot access parent admin state", async () => {
  const childProfileResponse = await requestJson("/api/child-profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Milo",
      color: "#60A5FA"
    })
  });

  const childProfile = childProfileResponse.json as { id: string };

  const routineResponse = await requestJson("/api/routines", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Cleanup time",
      schedule: {
        days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      },
      steps: [
        {
          label: "Books on shelf",
          icon: "books"
        }
      ]
    })
  });

  const routine = routineResponse.json as { id: string; steps: Array<{ id: string }> };

  const completionResponse = await requestJson("/api/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "childDisplay",
      "x-actor-id": "tablet-1"
    },
    body: JSON.stringify({
      itemType: "routineStep",
      itemId: routine.steps[0]?.id,
      childProfileId: childProfile.id,
      parentEntityType: "routine",
      parentEntityId: routine.id
    })
  });

  assert.equal(completionResponse.status, 201);

  const deniedStateResponse = await requestJson("/api/state", {
    headers: {
      "x-actor-role": "childDisplay",
      "x-actor-id": "tablet-1"
    }
  });

  assert.equal(deniedStateResponse.status, 403);
});

test("approval and rewards are issued only after parent approval", async () => {
  const childProfileResponse = await requestJson("/api/child-profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Milo",
      color: "#34D399"
    })
  });

  const childProfile = childProfileResponse.json as { id: string };

  const choreResponse = await requestJson("/api/chores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Feed pet with help",
      recurrence: {
        days: ["monday"]
      },
      requiresApproval: true,
      reward: {
        type: "stars",
        amount: 3
      }
    })
  });

  const chore = choreResponse.json as { id: string };

  const completionResponse = await requestJson("/api/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "childDisplay",
      "x-actor-id": "tablet-1"
    },
    body: JSON.stringify({
      itemType: "chore",
      itemId: chore.id,
      childProfileId: childProfile.id
    })
  });

  assert.equal(completionResponse.status, 201);
  const completion = completionResponse.json as { id: string; status: string };
  assert.equal(completion.status, "pendingApproval");

  const preApprovalState = await requestJson("/api/state", {
    headers: {
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    }
  });

  const preApproval = preApprovalState.json as {
    rewards: unknown[];
    pendingApprovals: Array<{ id: string }>;
  };
  assert.equal(preApproval.rewards.length, 0);
  assert.equal(preApproval.pendingApprovals.length, 1);

  const approvalResponse = await requestJson(`/api/completions/${completion.id}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    }
  });

  assert.equal(approvalResponse.status, 200);

  const postApprovalState = await requestJson("/api/state", {
    headers: {
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    }
  });

  const postApproval = postApprovalState.json as {
    rewards: Array<{ amount: number }>;
    pendingApprovals: unknown[];
  };
  assert.equal(postApproval.pendingApprovals.length, 0);
  assert.equal(postApproval.rewards.length, 1);
  assert.equal(postApproval.rewards[0]?.amount, 3);
});

test("parent can record a completion for the selected schedule day", async () => {
  const childProfileResponse = await requestJson("/api/child-profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Milo",
      color: "#34D399"
    })
  });

  const childProfile = childProfileResponse.json as { id: string };

  const choreResponse = await requestJson("/api/chores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Carry napkins",
      recurrence: {
        days: ["monday"]
      },
      requiresApproval: false
    })
  });

  const chore = choreResponse.json as { id: string };

  const completionResponse = await requestJson("/api/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      itemType: "chore",
      itemId: chore.id,
      childProfileId: childProfile.id,
      scheduledDay: "monday"
    })
  });

  assert.equal(completionResponse.status, 201);
  const completion = completionResponse.json as { scheduledDay?: string };
  assert.equal(completion.scheduledDay, "monday");
});

test("today plan resolves recurring routines and chores for the requested day", async () => {
  const childProfileResponse = await requestJson("/api/child-profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Milo",
      color: "#F472B6"
    })
  });

  const childProfile = childProfileResponse.json as { id: string };

  await requestJson("/api/routines", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Morning routine",
      schedule: {
        days: ["monday", "wednesday"]
      },
      steps: [
        {
          label: "Brush teeth",
          icon: "toothbrush"
        }
      ]
    })
  });

  await requestJson("/api/routines", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Library day prep",
      schedule: {
        days: ["friday"]
      },
      steps: [
        {
          label: "Pack books",
          icon: "books"
        }
      ]
    })
  });

  await requestJson("/api/chores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Put cup in sink",
      recurrence: {
        days: ["wednesday"]
      },
      requiresApproval: false
    })
  });

  await requestJson("/api/chores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Choose pajamas",
      recurrence: {
        days: ["sunday"]
      },
      requiresApproval: false
    })
  });

  const todayPlanResponse = await requestJson(
    `/api/today-plan?childProfileId=${childProfile.id}&day=wednesday`,
    {
      headers: {
        "x-actor-role": "childDisplay",
        "x-actor-id": "tablet-1"
      }
    }
  );

  assert.equal(todayPlanResponse.status, 200);
  const todayPlan = todayPlanResponse.json as {
    day: string;
    routines: Array<{ name: string }>;
    chores: Array<{ name: string }>;
  };

  assert.equal(todayPlan.day, "wednesday");
  assert.deepEqual(
    todayPlan.routines.map((routine) => routine.name),
    ["Morning routine"]
  );
  assert.deepEqual(
    todayPlan.chores.map((chore) => chore.name),
    ["Put cup in sink"]
  );
});

test("legacy persisted state is migrated to the current preschool schema", async () => {
  if (closeServer) {
    await closeServer();
  }

  await writeFile(
    dataFile,
    JSON.stringify(
      {
        childProfiles: [
          {
            id: "child-1",
            name: "Milo",
            color: "#FBBF24",
            motivators: []
          }
        ],
        routines: [],
        chores: []
      },
      null,
      2
    ),
    "utf8"
  );

  await startServer();

  const stateResponse = await requestJson("/api/state", {
    headers: {
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    }
  });

  assert.equal(stateResponse.status, 200);
  const state = stateResponse.json as {
    schemaVersion: number;
    householdRoles: {
      parentAdmins: string[];
    };
    rewards: unknown[];
    completions: unknown[];
  };

  assert.equal(state.schemaVersion, 1);
  assert.deepEqual(state.householdRoles, {
    parentAdmins: []
  });
  assert.deepEqual(state.rewards, []);
  assert.deepEqual(state.completions, []);
});

test("caregiver account routes are not part of the simplified mvp", async () => {
  const childProfileResponse = await requestJson("/api/child-profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Milo",
      color: "#A78BFA"
    })
  });

  const childProfile = childProfileResponse.json as { id: string };

  await requestJson("/api/routines", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Morning helper",
      schedule: {
        days: ["monday"]
      },
      steps: [
        {
          label: "Get dressed",
          icon: "shirt"
        }
      ]
    })
  });

  const caregiverResponse = await fetch(`${baseUrl}/api/caregivers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Auntie Jo",
      contact: "auntie@example.com"
    })
  });

  assert.equal(caregiverResponse.status, 404);
});

test("child display is denied household settings changes", async () => {
  const settingsResponse = await requestJson("/api/household-settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "childDisplay",
      "x-actor-id": "tablet-1"
    },
    body: JSON.stringify({
      celebrationMode: "gentle"
    })
  });

  assert.equal(settingsResponse.status, 403);

  const parentSettingsResponse = await requestJson("/api/household-settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      celebrationMode: "gentle"
    })
  });

  assert.equal(parentSettingsResponse.status, 200);
  const settings = parentSettingsResponse.json as { celebrationMode: string };
  assert.equal(settings.celebrationMode, "gentle");
});

test("parent can update a routine with ordered visual steps", async () => {
  const childProfileResponse = await requestJson("/api/child-profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Milo",
      color: "#60A5FA"
    })
  });

  const childProfile = childProfileResponse.json as { id: string };

  const routineResponse = await requestJson("/api/routines", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Morning helper",
      schedule: {
        days: ["monday"]
      },
      steps: [
        {
          label: "Get dressed",
          icon: "shirt"
        }
      ]
    })
  });

  const routine = routineResponse.json as { id: string };

  const updateResponse = await requestJson(`/api/routines/${routine.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Morning launch",
      schedule: {
        days: ["monday", "tuesday"]
      },
      steps: [
        {
          label: "Get dressed",
          icon: "shirt"
        },
        {
          label: "Brush teeth",
          imageUrl: "https://example.com/brush.png"
        }
      ]
    })
  });

  assert.equal(updateResponse.status, 200);
  const updatedRoutine = updateResponse.json as {
    name: string;
    schedule: { days: string[] };
    steps: Array<{ label: string; icon?: string; imageUrl?: string; order: number }>;
  };

  assert.equal(updatedRoutine.name, "Morning launch");
  assert.deepEqual(updatedRoutine.schedule.days, ["monday", "tuesday"]);
  assert.deepEqual(
    updatedRoutine.steps.map((step) => ({
      label: step.label,
      icon: step.icon,
      imageUrl: step.imageUrl,
      order: step.order
    })),
    [
      {
        label: "Get dressed",
        icon: "shirt",
        imageUrl: undefined,
        order: 0
      },
      {
        label: "Brush teeth",
        icon: undefined,
        imageUrl: "https://example.com/brush.png",
        order: 1
      }
    ]
  );
});

test("parent can update and delete a child profile with cascading cleanup", async () => {
  const childProfileResponse = await requestJson("/api/child-profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Milo",
      color: "#34D399",
      motivators: ["cars"]
    })
  });
  const childProfile = childProfileResponse.json as { id: string };

  const choreResponse = await requestJson("/api/chores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Carry napkins",
      recurrence: {
        days: ["monday"]
      },
      requiresApproval: false,
      reward: {
        type: "stars",
        amount: 2
      }
    })
  });
  const chore = choreResponse.json as { id: string };

  const completionResponse = await requestJson("/api/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      itemType: "chore",
      itemId: chore.id,
      childProfileId: childProfile.id,
      scheduledDay: "monday"
    })
  });
  assert.equal(completionResponse.status, 201);

  const updateResponse = await requestJson(`/api/child-profiles/${childProfile.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Miles",
      color: "#60A5FA",
      avatarUrl: "https://example.com/miles.png",
      motivators: ["blue dogs"]
    })
  });

  assert.equal(updateResponse.status, 200);
  assert.deepEqual(updateResponse.json, {
    id: childProfile.id,
    name: "Miles",
    avatarUrl: "https://example.com/miles.png",
    color: "#60A5FA",
    motivators: ["blue dogs"],
    createdAt: (updateResponse.json as { createdAt: string }).createdAt,
    updatedAt: (updateResponse.json as { updatedAt: string }).updatedAt
  });

  const deleteResponse = await fetch(`${baseUrl}/api/child-profiles/${childProfile.id}`, {
    method: "DELETE",
    headers: {
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    }
  });
  assert.equal(deleteResponse.status, 204);

  const stateResponse = await requestJson("/api/state", {
    headers: {
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    }
  });
  const state = stateResponse.json as {
    childProfiles: unknown[];
    chores: unknown[];
    completions: unknown[];
    rewards: unknown[];
  };
  assert.deepEqual(state.childProfiles, []);
  assert.deepEqual(state.chores, []);
  assert.deepEqual(state.completions, []);
  assert.deepEqual(state.rewards, []);
});

test("parent can update and delete a chore", async () => {
  const childProfileResponse = await requestJson("/api/child-profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Milo",
      color: "#34D399"
    })
  });
  const childProfile = childProfileResponse.json as { id: string };

  const choreResponse = await requestJson("/api/chores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Carry napkins",
      recurrence: {
        days: ["monday"]
      },
      requiresApproval: true
    })
  });
  const chore = choreResponse.json as { id: string };

  const updateResponse = await requestJson(`/api/chores/${chore.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Carry napkins outside",
      recurrence: {
        days: ["monday", "tuesday"]
      },
      requiresApproval: false,
      reward: {
        type: "stickers",
        amount: 1
      }
    })
  });

  assert.equal(updateResponse.status, 200);
  const updatedChore = updateResponse.json as {
    name: string;
    recurrence: { days: string[] };
    requiresApproval: boolean;
    reward?: { type: string; amount: number };
  };
  assert.equal(updatedChore.name, "Carry napkins outside");
  assert.deepEqual(updatedChore.recurrence.days, ["monday", "tuesday"]);
  assert.equal(updatedChore.requiresApproval, false);
  assert.deepEqual(updatedChore.reward, {
    type: "stickers",
    amount: 1
  });

  const deleteResponse = await fetch(`${baseUrl}/api/chores/${chore.id}`, {
    method: "DELETE",
    headers: {
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    }
  });
  assert.equal(deleteResponse.status, 204);

  const stateResponse = await requestJson("/api/state", {
    headers: {
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    }
  });
  const state = stateResponse.json as {
    chores: Array<{ id: string }>;
  };
  assert.equal(state.chores.some((entry) => entry.id === chore.id), false);
});

test("deleting a routine removes related routine-step completion history", async () => {
  const childProfileResponse = await requestJson("/api/child-profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Milo",
      color: "#60A5FA"
    })
  });
  const childProfile = childProfileResponse.json as { id: string };

  const routineResponse = await requestJson("/api/routines", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Morning helper",
      schedule: {
        days: ["monday"]
      },
      steps: [
        {
          label: "Get dressed",
          icon: "shirt"
        }
      ],
      reward: {
        type: "stars",
        amount: 2
      }
    })
  });
  const routine = routineResponse.json as { id: string; steps: Array<{ id: string }> };

  const completionResponse = await requestJson("/api/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "childDisplay",
      "x-actor-id": "tablet-1"
    },
    body: JSON.stringify({
      itemType: "routineStep",
      itemId: routine.steps[0]?.id,
      childProfileId: childProfile.id,
      parentEntityType: "routine",
      parentEntityId: routine.id
    })
  });
  assert.equal(completionResponse.status, 201);

  const deleteResponse = await fetch(`${baseUrl}/api/routines/${routine.id}`, {
    method: "DELETE",
    headers: {
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    }
  });
  assert.equal(deleteResponse.status, 204);

  const stateResponse = await requestJson("/api/state", {
    headers: {
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    }
  });
  const state = stateResponse.json as {
    routines: unknown[];
    completions: unknown[];
    rewards: unknown[];
  };
  assert.deepEqual(state.routines, []);
  assert.deepEqual(state.completions, []);
  assert.deepEqual(state.rewards, []);
});

test("parent can request an OpenAI-backed completion image and persist it on the completion", async () => {
  appOptions = {
    completionImageService: {
      generateCelebrationImage: async () => ({
        imageUrl: "data:image/png;base64,celebration",
        prompt: "prompt text",
        selectedTheme: "race cars"
      })
    }
  };

  if (closeServer) {
    await closeServer();
  }
  await startServer();

  const childProfileResponse = await requestJson("/api/child-profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Milo",
      color: "#34D399",
      motivators: ["race cars"]
    })
  });
  const childProfile = childProfileResponse.json as { id: string };

  const choreResponse = await requestJson("/api/chores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Carry napkins",
      recurrence: {
        days: ["monday"]
      },
      requiresApproval: false
    })
  });
  const chore = choreResponse.json as { id: string };

  const completionResponse = await requestJson("/api/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      itemType: "chore",
      itemId: chore.id,
      childProfileId: childProfile.id,
      scheduledDay: "monday"
    })
  });
  const completion = completionResponse.json as { id: string };

  const response = await requestJson("/api/completion-images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      completionId: completion.id,
      childName: "Milo",
      activityName: "Carry napkins",
      interestThemes: ["race cars"],
      celebrationMode: "full"
    })
  });

  assert.equal(response.status, 200);
  assert.deepEqual(response.json, {
    imageUrl: "data:image/png;base64,celebration",
    prompt: "prompt text",
    selectedTheme: "race cars"
  });

  const stateResponse = await requestJson("/api/state", {
    headers: {
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    }
  });
  const state = stateResponse.json as {
    completions: Array<{
      id: string;
      celebrationImageUrl?: string;
      celebrationPrompt?: string;
      celebrationTheme?: string;
    }>;
  };
  const savedCompletion = state.completions.find((entry) => entry.id === completion.id);
  assert.equal(savedCompletion?.celebrationImageUrl, "data:image/png;base64,celebration");
  assert.equal(savedCompletion?.celebrationPrompt, "prompt text");
  assert.equal(savedCompletion?.celebrationTheme, "race cars");
});

test("completion image failures are recoverable", async () => {
  appOptions = {
    completionImageService: {
      generateCelebrationImage: async () => {
        throw new Error("OpenAI unavailable");
      }
    }
  };

  if (closeServer) {
    await closeServer();
  }
  await startServer();

  const childProfileResponse = await requestJson("/api/child-profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Milo",
      color: "#34D399",
      motivators: ["race cars"]
    })
  });
  const childProfile = childProfileResponse.json as { id: string };

  const choreResponse = await requestJson("/api/chores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Carry napkins",
      recurrence: {
        days: ["monday"]
      },
      requiresApproval: false
    })
  });
  const chore = choreResponse.json as { id: string };

  const completionResponse = await requestJson("/api/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      itemType: "chore",
      itemId: chore.id,
      childProfileId: childProfile.id,
      scheduledDay: "monday"
    })
  });
  const completion = completionResponse.json as { id: string };

  const response = await requestJson("/api/completion-images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      completionId: completion.id,
      childName: "Milo",
      activityName: "Carry napkins",
      interestThemes: ["race cars"],
      celebrationMode: "full"
    })
  });

  assert.equal(response.status, 503);
  assert.deepEqual(response.json, {
    error: "Completion image unavailable"
  });
});

test("parent can remove a recorded completion", async () => {
  const childProfileResponse = await requestJson("/api/child-profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      name: "Milo",
      color: "#34D399"
    })
  });

  const childProfile = childProfileResponse.json as { id: string };

  const choreResponse = await requestJson("/api/chores", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      childProfileId: childProfile.id,
      name: "Put dishes in dishwasher",
      recurrence: {
        days: ["monday"]
      },
      requiresApproval: false
    })
  });

  const chore = choreResponse.json as { id: string };

  const completionResponse = await requestJson("/api/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    },
    body: JSON.stringify({
      itemType: "chore",
      itemId: chore.id,
      childProfileId: childProfile.id,
      scheduledDay: "monday"
    })
  });

  const completion = completionResponse.json as { id: string };

  const deleteResponse = await fetch(`${baseUrl}/api/completions/${completion.id}`, {
    method: "DELETE",
    headers: {
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    }
  });

  assert.equal(deleteResponse.status, 204);

  const stateResponse = await requestJson("/api/state", {
    headers: {
      "x-actor-role": "parentAdmin",
      "x-actor-id": "parent-1"
    }
  });

  const state = stateResponse.json as {
    completions: Array<{ id: string }>;
  };
  assert.equal(state.completions.some((entry) => entry.id === completion.id), false);
});
