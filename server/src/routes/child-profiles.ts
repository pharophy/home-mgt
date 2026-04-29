import { randomUUID } from "node:crypto";

import type { Express } from "express";

import type { ChildProfile } from "../domain/types.js";
import { ensureRole } from "../lib/auth.js";
import { deleteChildProfileAndRelatedState } from "../lib/state-cleanup.js";
import type { ParticipationStore } from "../lib/store.js";
import { sendValidationError } from "../lib/validation.js";

export function registerChildProfileRoutes(app: Express, store: ParticipationStore): void {
  app.post("/api/child-profiles", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const color = typeof req.body?.color === "string" ? req.body.color.trim() : "";
    const avatarUrl =
      typeof req.body?.avatarUrl === "string" && req.body.avatarUrl.trim().length > 0
        ? req.body.avatarUrl.trim()
        : undefined;
    const motivators = Array.isArray(req.body?.motivators)
      ? req.body.motivators.filter((value: unknown): value is string => typeof value === "string" && value.trim().length > 0)
      : [];

    if (!name) {
      sendValidationError(res, "Child profile name is required");
      return;
    }

    if (!color) {
      sendValidationError(res, "Child profile color is required");
      return;
    }

    const state = await store.read();
    const now = new Date().toISOString();
    const childProfile: ChildProfile = {
      id: randomUUID(),
      name,
      avatarUrl,
      color,
      motivators,
      createdAt: now,
      updatedAt: now
    };

    state.childProfiles.push(childProfile);
    if (!state.householdRoles.parentAdmins.includes(req.actor.id)) {
      state.householdRoles.parentAdmins.push(req.actor.id);
    }

    await store.write(state);
    res.status(201).json(childProfile);
  });

  app.get("/api/child-profiles", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin", "childDisplay"])) {
      return;
    }

    const state = await store.read();
    res.json(state.childProfiles);
  });

  app.patch("/api/child-profiles/:childProfileId", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const color = typeof req.body?.color === "string" ? req.body.color.trim() : "";
    const avatarUrl =
      typeof req.body?.avatarUrl === "string" && req.body.avatarUrl.trim().length > 0
        ? req.body.avatarUrl.trim()
        : undefined;
    const motivators = Array.isArray(req.body?.motivators)
      ? req.body.motivators.filter((value: unknown): value is string => typeof value === "string" && value.trim().length > 0)
      : [];

    if (!name) {
      sendValidationError(res, "Child profile name is required");
      return;
    }

    if (!color) {
      sendValidationError(res, "Child profile color is required");
      return;
    }

    const state = await store.read();
    const childProfile = state.childProfiles.find((entry) => entry.id === req.params.childProfileId);
    if (!childProfile) {
      res.status(404).json({ error: "Child profile not found" });
      return;
    }

    childProfile.name = name;
    childProfile.color = color;
    childProfile.avatarUrl = avatarUrl;
    childProfile.motivators = motivators;
    childProfile.updatedAt = new Date().toISOString();

    await store.write(state);
    res.json(childProfile);
  });

  app.delete("/api/child-profiles/:childProfileId", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const state = await store.read();
    const deleted = deleteChildProfileAndRelatedState(state, req.params.childProfileId);
    if (!deleted) {
      res.status(404).json({ error: "Child profile not found" });
      return;
    }

    await store.write(state);
    res.status(204).send();
  });
}
