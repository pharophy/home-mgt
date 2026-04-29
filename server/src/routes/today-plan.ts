import type { Express } from "express";

import { isWeekday } from "../domain/weekdays.js";
import { ensureRole } from "../lib/auth.js";
import type { ParticipationStore } from "../lib/store.js";
import { sendValidationError } from "../lib/validation.js";

export function registerTodayPlanRoutes(app: Express, store: ParticipationStore): void {
  app.get("/api/today-plan", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin", "childDisplay"])) {
      return;
    }

    const childProfileId =
      typeof req.query.childProfileId === "string" ? req.query.childProfileId : "";
    const day = typeof req.query.day === "string" ? req.query.day.toLowerCase() : "";

    if (!childProfileId) {
      sendValidationError(res, "today-plan childProfileId is required");
      return;
    }

    if (!isWeekday(day)) {
      sendValidationError(res, "today-plan day is invalid");
      return;
    }

    const state = await store.read();
    const childProfile = state.childProfiles.find((entry) => entry.id === childProfileId);
    if (!childProfile) {
      sendValidationError(res, "Child profile not found");
      return;
    }

    res.json({
      childProfile,
      day,
      routines: state.routines.filter(
        (routine) =>
          routine.childProfileId === childProfileId &&
          routine.schedule.days.includes(day)
      ),
      chores: state.chores.filter(
        (chore) =>
          chore.childProfileId === childProfileId &&
          chore.recurrence.days.includes(day)
      ),
      pendingApprovals: state.completions.filter(
        (completion) =>
          completion.childProfileId === childProfileId &&
          completion.status === "pendingApproval"
      )
    });
  });
}
