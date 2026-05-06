import type { Express } from "express";

import type {
  CelebrationMode,
  CompletionImageService
} from "../domain/types.js";
import { ensureRole } from "../lib/auth.js";
import type { ParticipationStore } from "../lib/store.js";
import { sendValidationError } from "../lib/validation.js";

function isCelebrationMode(value: unknown): value is CelebrationMode {
  return value === "full" || value === "gentle";
}

export function registerCompletionImageRoutes(
  app: Express,
  store: ParticipationStore,
  completionImageService: CompletionImageService
): void {
  app.post("/api/completion-images", async (req, res) => {
    if (!ensureRole(req, res, ["parentAdmin"])) {
      return;
    }

    const completionId =
      typeof req.body?.completionId === "string" ? req.body.completionId.trim() : "";
    const childName = typeof req.body?.childName === "string" ? req.body.childName.trim() : "";
    const activityName =
      typeof req.body?.activityName === "string" ? req.body.activityName.trim() : "";
    const interestThemes = Array.isArray(req.body?.interestThemes)
      ? req.body.interestThemes.filter(
          (value: unknown): value is string =>
            typeof value === "string" && value.trim().length > 0
        )
      : [];
    const celebrationMode = isCelebrationMode(req.body?.celebrationMode)
      ? req.body.celebrationMode
      : null;
    const variantSeed =
      typeof req.body?.variantSeed === "number" ? req.body.variantSeed : undefined;

    if (!completionId || !childName || !activityName || !celebrationMode) {
      sendValidationError(
        res,
        "Completion image completionId, childName, activityName, and celebrationMode are required"
      );
      return;
    }

    try {
      const state = await store.read();
      const completion = state.completions.find((entry) => entry.id === completionId);
      if (!completion) {
        res.status(404).json({ error: "Completion not found" });
        return;
      }

      const result = await completionImageService.generateCelebrationImage({
        childName,
        activityName,
        interestThemes,
        celebrationMode,
        variantSeed
      });
      completion.celebrationImageUrl = result.imageUrl;
      completion.celebrationPrompt = result.prompt;
      completion.celebrationTheme = result.selectedTheme;
      completion.celebrationGeneratedAt = new Date().toISOString();
      await store.write(state);
      res.json({
        ...result,
        imageUrl: completion.celebrationImageUrl
      });
    } catch {
      res.status(503).json({ error: "Completion image unavailable" });
    }
  });
}
