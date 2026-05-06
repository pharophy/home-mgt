import { randomUUID } from "node:crypto";

import type { Express } from "express";

import type { Routine, RoutineStep } from "../domain/types.js";
import { ensureRole } from "../lib/auth.js";
import { serializeRoutine } from "../lib/image-assets.js";
import { deleteRoutineAndRelatedState } from "../lib/state-cleanup.js";
import type { ParticipationStore } from "../lib/store.js";
import { isRewardDefinition, sendValidationError, validateDays } from "../lib/validation.js";

function parseRoutineSteps(steps: unknown): RoutineStep[] | { error: string } {
  if (!Array.isArray(steps) || steps.length === 0) {
    return { error: "Routine must include at least one step" };
  }

  const routineSteps: RoutineStep[] = [];
  for (const [index, step] of steps.entries()) {
    if (!step || typeof step !== "object") {
      return { error: "Routine step is invalid" };
    }

    const label = typeof step.label === "string" ? step.label.trim() : "";
    const icon =
      typeof step.icon === "string" && step.icon.trim().length > 0
        ? step.icon.trim()
        : undefined;
    const imageUrl =
      typeof step.imageUrl === "string" && step.imageUrl.trim().length > 0
        ? step.imageUrl.trim()
        : undefined;

    if (!label) {
      return { error: "Routine step label is required" };
    }

    routineSteps.push({
      id: randomUUID(),
      label,
      icon,
      imageUrl,
      order: index
    });
  }

  return routineSteps;
}

export function registerRoutineRoutes(app: Express, store: ParticipationStore): void {
  app.post("/api/routines", async (req, res) => {
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
    const days = req.body?.schedule?.days;
    const steps = Array.isArray(req.body?.steps) ? req.body.steps : [];
    const reward = isRewardDefinition(req.body?.reward) ? req.body.reward : undefined;

    if (!childProfileId || !name) {
      sendValidationError(res, "Routine childProfileId and name are required");
      return;
    }

    if (!validateDays(days)) {
      sendValidationError(res, "Routine schedule days are required");
      return;
    }

    const routineSteps = parseRoutineSteps(steps);
    if ("error" in routineSteps) {
      sendValidationError(res, routineSteps.error);
      return;
    }

    const state = await store.read();
    const childProfile = state.childProfiles.find((entry) => entry.id === childProfileId);
    if (!childProfile) {
      sendValidationError(res, "Child profile not found");
      return;
    }

    const now = new Date().toISOString();
    const routine: Routine = {
      id: randomUUID(),
      childProfileId,
      name,
      imageUrl,
      schedule: {
        days
      },
      steps: routineSteps,
      reward,
      createdAt: now,
      updatedAt: now
    };

    state.routines.push(routine);
    await store.write(state);
    res.status(201).json(serializeRoutine(routine));
  });

  app.get("/api/routines", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin", "childDisplay"])) {
      return;
    }

    const state = await store.read();
    res.json(state.routines.map(serializeRoutine));
  });

  app.patch("/api/routines/:routineId", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const imageUrl =
      typeof req.body?.imageUrl === "string" && req.body.imageUrl.trim().length > 0
        ? req.body.imageUrl.trim()
        : undefined;
    const days = req.body?.schedule?.days;
    const steps = req.body?.steps;
    const reward = isRewardDefinition(req.body?.reward) ? req.body.reward : undefined;

    if (!name) {
      sendValidationError(res, "Routine childProfileId and name are required");
      return;
    }

    if (!validateDays(days)) {
      sendValidationError(res, "Routine schedule days are required");
      return;
    }

    const routineSteps = parseRoutineSteps(steps);
    if ("error" in routineSteps) {
      sendValidationError(res, routineSteps.error);
      return;
    }

    const state = await store.read();
    const routine = state.routines.find((entry) => entry.id === req.params.routineId);
    if (!routine) {
      res.status(404).json({ error: "Routine not found" });
      return;
    }

    routine.name = name;
    routine.imageUrl = imageUrl;
    routine.schedule.days = days;
    routine.steps = routineSteps;
    routine.reward = reward;
    routine.updatedAt = new Date().toISOString();

    await store.write(state);
    res.json(serializeRoutine(routine));
  });

  app.delete("/api/routines/:routineId", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const state = await store.read();
    const deleted = deleteRoutineAndRelatedState(state, req.params.routineId);
    if (!deleted) {
      res.status(404).json({ error: "Routine not found" });
      return;
    }

    await store.write(state);
    res.status(204).send();
  });
}
