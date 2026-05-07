import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createDefaultState } from "../domain/state.js";
import type { PreschoolParticipationState } from "../domain/types.js";
import { managedGeneratedAssetMountPath } from "./image-assets.js";
import { ManagedGeneratedImageStore } from "./managed-generated-images.js";
import type { ParticipationStore } from "./store.js";

class InMemoryStore implements ParticipationStore {
  constructor(public state: PreschoolParticipationState) {}

  async read(): Promise<PreschoolParticipationState> {
    return structuredClone(this.state);
  }

  async write(state: PreschoolParticipationState): Promise<void> {
    this.state = structuredClone(state);
  }
}

test("managed generated image store persists generated images as static asset paths", async () => {
  const assetRootDir = await mkdtemp(path.join(os.tmpdir(), "home-mgt-managed-assets-"));
  try {
    const delegate = new InMemoryStore(createDefaultState());
    const store = new ManagedGeneratedImageStore(delegate, assetRootDir);
    const state = createDefaultState();
    state.routines.push({
      id: "routine-1",
      childProfileId: "child-1",
      name: "Morning helper",
      imageUrl: "data:image/png;base64,QUJD",
      schedule: {
        days: ["monday"]
      },
      steps: [
        {
          id: "step-1",
          label: "Brush teeth",
          imageUrl: "data:image/png;base64,QUJD",
          order: 0
        }
      ],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    });

    await store.write(state);

    assert.match(
      delegate.state.routines[0]?.imageUrl ?? "",
      new RegExp(`^${managedGeneratedAssetMountPath}/routines/routine-1\\.[a-z0-9]+$`)
    );
    assert.match(
      delegate.state.routines[0]?.steps[0]?.imageUrl ?? "",
      new RegExp(
        `^${managedGeneratedAssetMountPath}/routines/routine-1/steps/step-1\\.[a-z0-9]+$`
      )
    );

    const routineFile = path.join(assetRootDir, "routines", "routine-1.png");
    const stepFile = path.join(assetRootDir, "routines", "routine-1", "steps", "step-1.png");
    assert.equal(await readFile(routineFile, "utf8"), "ABC");
    assert.equal(await readFile(stepFile, "utf8"), "ABC");
  } finally {
    await rm(assetRootDir, { recursive: true, force: true });
  }
});

test("managed generated image store migrates legacy inline generated images on read", async () => {
  const assetRootDir = await mkdtemp(path.join(os.tmpdir(), "home-mgt-managed-assets-"));
  try {
    const state = createDefaultState();
    state.chores.push({
      id: "chore-1",
      childProfileId: "child-1",
      name: "Carry napkins",
      imageUrl: "data:image/png;base64,QUJD",
      recurrence: {
        days: ["monday"]
      },
      requiresApproval: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    });
    state.completions.push({
      id: "completion-1",
      itemType: "chore",
      itemId: "chore-1",
      childProfileId: "child-1",
      status: "completed",
      recordedBy: {
        id: "parent-1",
        role: "parentAdmin"
      },
      completedAt: "2026-01-01T00:00:00.000Z",
      celebrationImageUrl: "data:image/png;base64,QUJD"
    });

    const delegate = new InMemoryStore(state);
    const store = new ManagedGeneratedImageStore(delegate, assetRootDir);

    const loaded = await store.read();

    assert.match(
      loaded.chores[0]?.imageUrl ?? "",
      new RegExp(`^${managedGeneratedAssetMountPath}/chores/chore-1\\.[a-z0-9]+$`)
    );
    assert.match(
      loaded.completions[0]?.celebrationImageUrl ?? "",
      new RegExp(`^${managedGeneratedAssetMountPath}/completions/completion-1\\.[a-z0-9]+$`)
    );
    assert.equal(delegate.state.chores[0]?.imageUrl?.startsWith("data:image/"), false);
    assert.equal(
      delegate.state.completions[0]?.celebrationImageUrl?.startsWith("data:image/"),
      false
    );
  } finally {
    await rm(assetRootDir, { recursive: true, force: true });
  }
});

test("managed generated image store clears broken managed asset references on read", async () => {
  const assetRootDir = await mkdtemp(path.join(os.tmpdir(), "home-mgt-managed-assets-"));
  try {
    const state = createDefaultState();
    state.chores.push({
      id: "chore-1",
      childProfileId: "child-1",
      name: "Carry napkins",
      imageUrl: `${managedGeneratedAssetMountPath}/chores/chore-1.png`,
      recurrence: {
        days: ["monday"]
      },
      requiresApproval: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    });

    const delegate = new InMemoryStore(state);
    const store = new ManagedGeneratedImageStore(delegate, assetRootDir);

    const loaded = await store.read();

    assert.equal(loaded.chores[0]?.imageUrl, undefined);
    assert.equal(delegate.state.chores[0]?.imageUrl, undefined);
  } finally {
    await rm(assetRootDir, { recursive: true, force: true });
  }
});
