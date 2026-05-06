import type { Express, Response } from "express";

import {
  isManagedGeneratedAssetPath,
  parsePersistedImageDataUrl
} from "../lib/image-assets.js";
import type { ParticipationStore } from "../lib/store.js";

function sendPersistedImage(res: Response, imageUrl: string | undefined): void {
  if (isManagedGeneratedAssetPath(imageUrl)) {
    res.redirect(307, imageUrl);
    return;
  }

  const parsed = parsePersistedImageDataUrl(imageUrl);
  if (!parsed) {
    res.status(404).end();
    return;
  }

  res.setHeader("Content-Type", parsed.contentType);
  res.setHeader("Content-Length", String(parsed.body.length));
  res.send(parsed.body);
}

export function registerImageAssetRoutes(app: Express, store: ParticipationStore): void {
  app.get("/api/routines/:routineId/image", async (req, res) => {
    const state = await store.read();
    const routine = state.routines.find((entry) => entry.id === req.params.routineId);
    if (!routine) {
      res.status(404).end();
      return;
    }

    sendPersistedImage(res, routine.imageUrl);
  });

  app.get("/api/routines/:routineId/steps/:stepId/image", async (req, res) => {
    const state = await store.read();
    const routine = state.routines.find((entry) => entry.id === req.params.routineId);
    const step = routine?.steps.find((entry) => entry.id === req.params.stepId);
    if (!step) {
      res.status(404).end();
      return;
    }

    sendPersistedImage(res, step.imageUrl);
  });

  app.get("/api/chores/:choreId/image", async (req, res) => {
    const state = await store.read();
    const chore = state.chores.find((entry) => entry.id === req.params.choreId);
    if (!chore) {
      res.status(404).end();
      return;
    }

    sendPersistedImage(res, chore.imageUrl);
  });

  app.get("/api/completions/:completionId/image", async (req, res) => {
    const state = await store.read();
    const completion = state.completions.find((entry) => entry.id === req.params.completionId);
    if (!completion) {
      res.status(404).end();
      return;
    }

    sendPersistedImage(res, completion.celebrationImageUrl);
  });
}
