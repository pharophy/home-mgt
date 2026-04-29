import type { PreschoolParticipationState } from "../domain/types.js";

function removeRewardsForCompletionIds(
  state: PreschoolParticipationState,
  completionIds: string[]
): void {
  if (completionIds.length === 0) {
    return;
  }

  const completionIdSet = new Set(completionIds);
  state.rewards = state.rewards.filter((reward) => !completionIdSet.has(reward.completionId));
}

export function deleteChoreAndRelatedState(
  state: PreschoolParticipationState,
  choreId: string
): boolean {
  const choreIndex = state.chores.findIndex((entry) => entry.id === choreId);
  if (choreIndex === -1) {
    return false;
  }

  state.chores.splice(choreIndex, 1);
  const deletedCompletionIds = state.completions
    .filter((entry) => entry.itemId === choreId || entry.parentEntityId === choreId)
    .map((entry) => entry.id);
  state.completions = state.completions.filter(
    (entry) => entry.itemId !== choreId && entry.parentEntityId !== choreId
  );
  removeRewardsForCompletionIds(state, deletedCompletionIds);
  state.rewards = state.rewards.filter((reward) => reward.sourceId !== choreId);
  return true;
}

export function deleteRoutineAndRelatedState(
  state: PreschoolParticipationState,
  routineId: string
): boolean {
  const routineIndex = state.routines.findIndex((entry) => entry.id === routineId);
  if (routineIndex === -1) {
    return false;
  }

  state.routines.splice(routineIndex, 1);
  const deletedCompletionIds = state.completions
    .filter(
      (entry) =>
        entry.itemId === routineId ||
        entry.parentEntityId === routineId
    )
    .map((entry) => entry.id);
  state.completions = state.completions.filter(
    (entry) => entry.itemId !== routineId && entry.parentEntityId !== routineId
  );
  removeRewardsForCompletionIds(state, deletedCompletionIds);
  state.rewards = state.rewards.filter((reward) => reward.sourceId !== routineId);
  return true;
}

export function deleteChildProfileAndRelatedState(
  state: PreschoolParticipationState,
  childProfileId: string
): boolean {
  const childIndex = state.childProfiles.findIndex((entry) => entry.id === childProfileId);
  if (childIndex === -1) {
    return false;
  }

  const routineIds = state.routines
    .filter((entry) => entry.childProfileId === childProfileId)
    .map((entry) => entry.id);
  const choreIds = state.chores
    .filter((entry) => entry.childProfileId === childProfileId)
    .map((entry) => entry.id);

  state.childProfiles.splice(childIndex, 1);
  state.routines = state.routines.filter((entry) => entry.childProfileId !== childProfileId);
  state.chores = state.chores.filter((entry) => entry.childProfileId !== childProfileId);

  const deletedCompletionIds = state.completions
    .filter((entry) => entry.childProfileId === childProfileId)
    .map((entry) => entry.id);
  state.completions = state.completions.filter((entry) => entry.childProfileId !== childProfileId);
  removeRewardsForCompletionIds(state, deletedCompletionIds);
  const routineIdSet = new Set(routineIds);
  const choreIdSet = new Set(choreIds);
  state.rewards = state.rewards.filter(
    (reward) =>
      reward.childProfileId !== childProfileId &&
      !routineIdSet.has(reward.sourceId) &&
      !choreIdSet.has(reward.sourceId)
  );
  return true;
}
