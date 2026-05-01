import path from "node:path";
import { existsSync } from "node:fs";

import cors from "cors";
import express, { type Express } from "express";

import type { CreateAppOptions } from "./domain/types.js";
import { createCompletionImageService } from "./lib/completion-images.js";
import { createInstructionalImageService } from "./lib/instructional-images.js";
import { createParticipationStore } from "./lib/sql-store.js";
import { registerChildProfileRoutes } from "./routes/child-profiles.js";
import { registerChoreRoutes } from "./routes/chores.js";
import { registerCompletionImageRoutes } from "./routes/completion-images.js";
import { registerCompletionRoutes } from "./routes/completions.js";
import { registerHouseholdSettingsRoutes } from "./routes/household-settings.js";
import { registerInstructionalImageRoutes } from "./routes/instructional-images.js";
import { registerRoutineRoutes } from "./routes/routines.js";
import { registerStateRoutes } from "./routes/state.js";
import { registerTodayPlanRoutes } from "./routes/today-plan.js";

export function createApp(options: CreateAppOptions = {}): Express {
  const dataFile = options.dataFile ?? path.join(process.cwd(), "server-data.json");
  const store =
    options.store ??
    createParticipationStore({
      dataFile,
      sqlConnectionString:
        options.sqlConnectionString ?? process.env.PRESCHOOL_SQL_CONNECTION_STRING,
      sqlClient: options.sqlClient
    });
  const completionImageService =
    options.completionImageService ?? createCompletionImageService(process.env.OPENAI_API_KEY);
  const instructionalImageService =
    options.instructionalImageService ??
    createInstructionalImageService(process.env.OPENAI_API_KEY);
  const clientDistDir =
    options.clientDistDir && existsSync(path.join(options.clientDistDir, "index.html"))
      ? path.resolve(options.clientDistDir)
      : null;
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  if (clientDistDir) {
    app.use(express.static(clientDistDir));
    app.get(/^(?!\/api(?:\/|$)).*/, (req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") {
        next();
        return;
      }

      res.sendFile(path.join(clientDistDir, "index.html"));
    });
  }

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString()
    });
  });

  registerChildProfileRoutes(app, store);
  registerRoutineRoutes(app, store);
  registerChoreRoutes(app, store);
  registerTodayPlanRoutes(app, store);
  registerCompletionRoutes(app, store);
  registerCompletionImageRoutes(app, store, completionImageService);
  registerInstructionalImageRoutes(app, store, instructionalImageService);
  registerHouseholdSettingsRoutes(app, store);
  registerStateRoutes(app, store);

  return app;
}
