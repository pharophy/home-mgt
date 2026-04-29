import type { Express } from "express";

import { ensureRole } from "../lib/auth.js";
import type { ParticipationStore } from "../lib/store.js";

export function registerStateRoutes(app: Express, store: ParticipationStore): void {
  app.get("/api/state", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const state = await store.read();
    res.json({
      schemaVersion: state.schemaVersion,
      householdRoles: state.householdRoles,
      householdSettings: state.householdSettings,
      childProfiles: state.childProfiles,
      routines: state.routines,
      chores: state.chores,
      completions: state.completions,
      rewards: state.rewards,
      pendingApprovals: state.completions.filter(
        (completion) => completion.status === "pendingApproval"
      )
    });
  });
}
