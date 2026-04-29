import type { Express } from "express";

import { ensureRole } from "../lib/auth.js";
import type { ParticipationStore } from "../lib/store.js";

export function registerHouseholdSettingsRoutes(app: Express, store: ParticipationStore): void {
  app.get("/api/household-settings", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const state = await store.read();
    res.json(state.householdSettings);
  });

  app.patch("/api/household-settings", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const state = await store.read();
    if (req.body?.celebrationMode === "gentle" || req.body?.celebrationMode === "full") {
      state.householdSettings.celebrationMode = req.body.celebrationMode;
    }

    await store.write(state);
    res.json(state.householdSettings);
  });
}
