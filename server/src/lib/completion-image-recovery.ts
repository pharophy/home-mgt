import type {
  Chore,
  Completion,
  CompletionImageService,
  PreschoolParticipationState,
  Routine
} from "../domain/types.js";
import type { ParticipationStore } from "./store.js";

export interface CompletionImageRecoverySummary {
  recoveredCount: number;
  skippedCount: number;
  unresolvedCount: number;
}

function resolveCompletionActivityName(
  completion: Completion,
  state: PreschoolParticipationState
): string | undefined {
  if (completion.itemType === "chore") {
    return state.chores.find((entry: Chore) => entry.id === completion.itemId)?.name;
  }

  if (completion.itemType === "routine") {
    return state.routines.find((entry: Routine) => entry.id === completion.itemId)?.name;
  }

  if (completion.parentEntityType === "routine" && completion.parentEntityId) {
    return state.routines.find((entry: Routine) => entry.id === completion.parentEntityId)?.name;
  }

  return undefined;
}

export async function recoverMissingCompletionImages({
  store,
  completionImageService,
  now = () => new Date().toISOString()
}: {
  store: ParticipationStore;
  completionImageService: CompletionImageService;
  now?: () => string;
}): Promise<CompletionImageRecoverySummary> {
  const state = await store.read();
  let changed = false;
  let recoveredCount = 0;
  let skippedCount = 0;
  let unresolvedCount = 0;

  for (const [index, completion] of state.completions.entries()) {
    if (completion.celebrationImageUrl) {
      skippedCount += 1;
      continue;
    }

    const savedPrompt = completion.celebrationPrompt?.trim();
    if (savedPrompt) {
      completion.celebrationImageUrl =
        await completionImageService.generateCelebrationImageFromPrompt(savedPrompt);
      completion.celebrationGeneratedAt = now();
      recoveredCount += 1;
      changed = true;
      continue;
    }

    const child = state.childProfiles.find((entry) => entry.id === completion.childProfileId);
    const activityName = resolveCompletionActivityName(completion, state);
    if (!child || !activityName) {
      unresolvedCount += 1;
      continue;
    }

    const generated = await completionImageService.generateCelebrationImage({
      childName: child.name,
      activityName,
      interestThemes: child.motivators,
      celebrationMode: state.householdSettings.celebrationMode,
      variantSeed: index
    });
    completion.celebrationImageUrl = generated.imageUrl;
    completion.celebrationPrompt = generated.prompt;
    completion.celebrationTheme = generated.selectedTheme;
    completion.celebrationGeneratedAt = now();
    recoveredCount += 1;
    changed = true;
  }

  if (changed) {
    await store.write(state);
  }

  return {
    recoveredCount,
    skippedCount,
    unresolvedCount
  };
}
