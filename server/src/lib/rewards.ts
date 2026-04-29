import { randomUUID } from "node:crypto";

import type {
  Completion,
  PreschoolParticipationState,
  RewardDefinition,
  RewardLedgerEntry
} from "../domain/types.js";

export function awardReward(
  state: PreschoolParticipationState,
  completion: Completion,
  reward: RewardDefinition | undefined
): RewardLedgerEntry | null {
  if (!reward) {
    return null;
  }

  const sourceType = completion.parentEntityType ?? (completion.itemType === "chore" ? "chore" : "routine");
  const sourceId = completion.parentEntityId ?? completion.itemId;
  const entry: RewardLedgerEntry = {
    id: randomUUID(),
    childProfileId: completion.childProfileId,
    sourceType,
    sourceId,
    completionId: completion.id,
    rewardType: reward.type,
    amount: reward.amount,
    awardedAt: new Date().toISOString()
  };

  state.rewards.push(entry);
  return entry;
}
