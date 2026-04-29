import { randomUUID } from "node:crypto";

import type { Express } from "express";

import type { Completion, RewardDefinition } from "../domain/types.js";
import { isWeekday } from "../domain/weekdays.js";
import { ensureRole } from "../lib/auth.js";
import { awardReward } from "../lib/rewards.js";
import type { ParticipationStore } from "../lib/store.js";
import { sendValidationError } from "../lib/validation.js";

export function registerCompletionRoutes(app: Express, store: ParticipationStore): void {
  app.post("/api/completions", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin", "childDisplay"])) {
      return;
    }

    const itemType = req.body?.itemType;
    const itemId = typeof req.body?.itemId === "string" ? req.body.itemId : "";
    const childProfileId =
      typeof req.body?.childProfileId === "string" ? req.body.childProfileId : "";
    const scheduledDay =
      typeof req.body?.scheduledDay === "string" && isWeekday(req.body.scheduledDay.toLowerCase())
        ? req.body.scheduledDay.toLowerCase()
        : undefined;
    const parentEntityType =
      req.body?.parentEntityType === "routine" || req.body?.parentEntityType === "chore"
        ? req.body.parentEntityType
        : undefined;
    const parentEntityId =
      typeof req.body?.parentEntityId === "string" ? req.body.parentEntityId : undefined;

    if (
      itemType !== "routineStep" &&
      itemType !== "routine" &&
      itemType !== "chore"
    ) {
      sendValidationError(res, "Completion itemType is invalid");
      return;
    }

    if (!itemId || !childProfileId) {
      sendValidationError(res, "Completion itemId and childProfileId are required");
      return;
    }

    const state = await store.read();
    const childProfile = state.childProfiles.find((entry) => entry.id === childProfileId);
    if (!childProfile) {
      sendValidationError(res, "Child profile not found");
      return;
    }

    let requiresApproval = false;
    let reward: RewardDefinition | undefined;

    if (itemType === "chore") {
      const chore = state.chores.find((entry) => entry.id === itemId);
      if (!chore) {
        sendValidationError(res, "Chore not found");
        return;
      }

      requiresApproval = chore.requiresApproval;
      reward = chore.reward;
    } else if (itemType === "routineStep") {
      const routine = state.routines.find((entry) =>
        entry.steps.some((step) => step.id === itemId)
      );
      if (!routine) {
        sendValidationError(res, "Routine step not found");
        return;
      }

      reward = routine.reward;
    } else {
      const routine = state.routines.find((entry) => entry.id === itemId);
      if (!routine) {
        sendValidationError(res, "Routine not found");
        return;
      }

      reward = routine.reward;
    }

    const completion: Completion = {
      id: randomUUID(),
      itemType,
      itemId,
      childProfileId,
      scheduledDay,
      parentEntityType,
      parentEntityId,
      status: requiresApproval ? "pendingApproval" : "completed",
      recordedBy: req.actor,
      completedAt: new Date().toISOString()
    };

    state.completions.push(completion);
    if (!requiresApproval) {
      awardReward(state, completion, reward);
    }

    await store.write(state);
    res.status(201).json(completion);
  });

  app.post("/api/completions/:completionId/approve", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const state = await store.read();
    const completion = state.completions.find((entry) => entry.id === req.params.completionId);
    if (!completion) {
      res.status(404).json({ error: "Completion not found" });
      return;
    }

    if (completion.status !== "pendingApproval") {
      res.status(409).json({ error: "Completion is not pending approval" });
      return;
    }

    completion.status = "approved";
    completion.approvedAt = new Date().toISOString();
    completion.approvedBy = req.actor;

    const chore = state.chores.find((entry) => entry.id === completion.itemId);
    awardReward(state, completion, chore?.reward);

    await store.write(state);
    res.json(completion);
  });

  app.delete("/api/completions/:completionId", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const state = await store.read();
    const completionIndex = state.completions.findIndex(
      (entry) => entry.id === req.params.completionId
    );
    if (completionIndex < 0) {
      res.status(404).json({ error: "Completion not found" });
      return;
    }

    state.completions.splice(completionIndex, 1);
    state.rewards = state.rewards.filter(
      (reward) => reward.completionId !== req.params.completionId
    );

    await store.write(state);
    res.status(204).end();
  });
}
