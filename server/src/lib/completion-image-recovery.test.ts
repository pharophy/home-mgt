import assert from "node:assert/strict";
import test from "node:test";

import { createDefaultState } from "../domain/state.js";
import type {
  CompletionImageRequest,
  CompletionImageResult,
  CompletionImageService,
  PreschoolParticipationState
} from "../domain/types.js";
import type { ParticipationStore } from "./store.js";
import { recoverMissingCompletionImages } from "./completion-image-recovery.js";

class InMemoryStore implements ParticipationStore {
  constructor(public state: PreschoolParticipationState) {}

  async read(): Promise<PreschoolParticipationState> {
    return structuredClone(this.state);
  }

  async write(state: PreschoolParticipationState): Promise<void> {
    this.state = structuredClone(state);
  }
}

test("recovery regenerates missing completion stickers from saved prompts", async () => {
  const state = createDefaultState();
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
    completedAt: "2026-05-05T00:00:00.000Z",
    celebrationPrompt: "Saved prompt",
    celebrationTheme: "race cars"
  });

  const store = new InMemoryStore(state);
  const promptCalls: string[] = [];
  const metadataCalls: CompletionImageRequest[] = [];
  const completionImageService: CompletionImageService = {
    async generateCelebrationImageFromPrompt(prompt: string): Promise<string> {
      promptCalls.push(prompt);
      return "data:image/png;base64,QUJD";
    },
    async generateCelebrationImage(request: CompletionImageRequest): Promise<CompletionImageResult> {
      metadataCalls.push(request);
      return {
        imageUrl: "data:image/png;base64,REVG",
        prompt: "rebuilt prompt",
        selectedTheme: "new theme"
      };
    }
  };

  const result = await recoverMissingCompletionImages({
    store,
    completionImageService,
    now: () => "2026-05-06T00:00:00.000Z"
  });

  assert.deepEqual(result, {
    recoveredCount: 1,
    skippedCount: 0,
    unresolvedCount: 0
  });
  assert.deepEqual(promptCalls, ["Saved prompt"]);
  assert.equal(metadataCalls.length, 0);
  assert.equal(
    store.state.completions[0]?.celebrationImageUrl,
    "data:image/png;base64,QUJD"
  );
  assert.equal(store.state.completions[0]?.celebrationPrompt, "Saved prompt");
  assert.equal(store.state.completions[0]?.celebrationTheme, "race cars");
  assert.equal(
    store.state.completions[0]?.celebrationGeneratedAt,
    "2026-05-06T00:00:00.000Z"
  );
});

test("recovery rebuilds missing completion stickers from current metadata when no saved prompt exists", async () => {
  const state = createDefaultState();
  state.householdSettings.celebrationMode = "gentle";
  state.childProfiles.push({
    id: "child-1",
    name: "Milo",
    color: "#336699",
    motivators: ["race cars", "blue dogs"],
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z"
  });
  state.chores.push({
    id: "chore-1",
    childProfileId: "child-1",
    name: "Carry napkins",
    recurrence: {
      days: ["monday"]
    },
    requiresApproval: false,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z"
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
    completedAt: "2026-05-05T00:00:00.000Z"
  });

  const store = new InMemoryStore(state);
  const requests: CompletionImageRequest[] = [];
  const completionImageService: CompletionImageService = {
    async generateCelebrationImageFromPrompt(): Promise<string> {
      throw new Error("should not use saved prompt flow");
    },
    async generateCelebrationImage(request: CompletionImageRequest): Promise<CompletionImageResult> {
      requests.push(request);
      return {
        imageUrl: "data:image/png;base64,QUJD",
        prompt: "generated prompt",
        selectedTheme: "race cars"
      };
    }
  };

  const result = await recoverMissingCompletionImages({
    store,
    completionImageService,
    now: () => "2026-05-06T00:00:00.000Z"
  });

  assert.deepEqual(result, {
    recoveredCount: 1,
    skippedCount: 0,
    unresolvedCount: 0
  });
  assert.deepEqual(requests, [
    {
      childName: "Milo",
      activityName: "Carry napkins",
      interestThemes: ["race cars", "blue dogs"],
      celebrationMode: "gentle",
      variantSeed: 0
    }
  ]);
  assert.equal(store.state.completions[0]?.celebrationPrompt, "generated prompt");
  assert.equal(store.state.completions[0]?.celebrationTheme, "race cars");
  assert.equal(
    store.state.completions[0]?.celebrationGeneratedAt,
    "2026-05-06T00:00:00.000Z"
  );
});

test("recovery skips completions that already have sticker images", async () => {
  const state = createDefaultState();
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
    completedAt: "2026-05-05T00:00:00.000Z",
    celebrationImageUrl: "/generated-assets/completions/completion-1.png"
  });

  let writeCount = 0;
  const store: ParticipationStore = {
    async read() {
      return structuredClone(state);
    },
    async write() {
      writeCount += 1;
    }
  };

  const completionImageService: CompletionImageService = {
    async generateCelebrationImageFromPrompt(): Promise<string> {
      throw new Error("should not regenerate");
    },
    async generateCelebrationImage(): Promise<CompletionImageResult> {
      throw new Error("should not regenerate");
    }
  };

  const result = await recoverMissingCompletionImages({
    store,
    completionImageService
  });

  assert.deepEqual(result, {
    recoveredCount: 0,
    skippedCount: 1,
    unresolvedCount: 0
  });
  assert.equal(writeCount, 0);
});
