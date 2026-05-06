import { randomUUID } from "node:crypto";

import type { Express } from "express";

import type { Chore } from "../domain/types.js";
import { ensureRole } from "../lib/auth.js";
import { serializeChore } from "../lib/image-assets.js";
import { deleteChoreAndRelatedState } from "../lib/state-cleanup.js";
import type { ParticipationStore } from "../lib/store.js";
import { isRewardDefinition, sendValidationError, validateDays } from "../lib/validation.js";

export function registerChoreRoutes(app: Express, store: ParticipationStore): void {
  app.post("/api/chores", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const childProfileId =
      typeof req.body?.childProfileId === "string" ? req.body.childProfileId : "";
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const imageUrl =
      typeof req.body?.imageUrl === "string" && req.body.imageUrl.trim().length > 0
        ? req.body.imageUrl.trim()
        : undefined;
    const days = req.body?.recurrence?.days;
    const requiresApproval = Boolean(req.body?.requiresApproval);
    const reward = isRewardDefinition(req.body?.reward) ? req.body.reward : undefined;

    if (!childProfileId || !name) {
      sendValidationError(res, "Chore childProfileId and name are required");
      return;
    }

    if (!validateDays(days)) {
      sendValidationError(res, "Chore recurrence days are required");
      return;
    }

    const state = await store.read();
    const childProfile = state.childProfiles.find((entry) => entry.id === childProfileId);
    if (!childProfile) {
      sendValidationError(res, "Child profile not found");
      return;
    }

    const now = new Date().toISOString();
    const chore: Chore = {
      id: randomUUID(),
      childProfileId,
      name,
      imageUrl,
      recurrence: {
        days
      },
      requiresApproval,
      reward,
      createdAt: now,
      updatedAt: now
    };

    state.chores.push(chore);
    await store.write(state);
    res.status(201).json(serializeChore(chore));
  });

  app.get("/api/chores", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin", "childDisplay"])) {
      return;
    }

    const state = await store.read();
    res.json(state.chores.map(serializeChore));
  });

  app.patch("/api/chores/:choreId", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const imageUrl =
      typeof req.body?.imageUrl === "string" && req.body.imageUrl.trim().length > 0
        ? req.body.imageUrl.trim()
        : undefined;
    const days = req.body?.recurrence?.days;
    const requiresApproval = Boolean(req.body?.requiresApproval);
    const reward = isRewardDefinition(req.body?.reward) ? req.body.reward : undefined;

    if (!name) {
      sendValidationError(res, "Chore childProfileId and name are required");
      return;
    }

    if (!validateDays(days)) {
      sendValidationError(res, "Chore recurrence days are required");
      return;
    }

    const state = await store.read();
    const chore = state.chores.find((entry) => entry.id === req.params.choreId);
    if (!chore) {
      res.status(404).json({ error: "Chore not found" });
      return;
    }

    chore.name = name;
    chore.imageUrl = imageUrl;
    chore.recurrence.days = days;
    chore.requiresApproval = requiresApproval;
    chore.reward = reward;
    chore.updatedAt = new Date().toISOString();

    await store.write(state);
    res.json(serializeChore(chore));
  });

  app.delete("/api/chores/:choreId", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const state = await store.read();
    const deleted = deleteChoreAndRelatedState(state, req.params.choreId);
    if (!deleted) {
      res.status(404).json({ error: "Chore not found" });
      return;
    }

    await store.write(state);
    res.status(204).send();
  });
}
