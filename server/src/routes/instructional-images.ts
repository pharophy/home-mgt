import type { Express } from "express";

import { ensureRole } from "../lib/auth.js";
import type { ParticipationStore } from "../lib/store.js";
import type { InstructionalImageService } from "../domain/types.js";
import { sendValidationError } from "../lib/validation.js";

export function registerInstructionalImageRoutes(
  app: Express,
  store: ParticipationStore,
  instructionalImageService: InstructionalImageService
): void {
  app.post("/api/instructional-images", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const activityName =
      typeof req.body?.activityName === "string" ? req.body.activityName.trim() : "";
    const stepLabels = Array.isArray(req.body?.stepLabels)
      ? req.body.stepLabels.filter(
          (value: unknown): value is string => typeof value === "string" && value.trim().length > 0
        )
      : [];

    if (!activityName) {
      sendValidationError(res, "Instructional image activityName is required");
      return;
    }

    try {
      void store;
      const result = await instructionalImageService.generateInstructionalImage({
        activityName,
        stepLabels
      });
      res.json(result);
    } catch {
      res.status(503).json({ error: "Instructional image unavailable" });
    }
  });
}
