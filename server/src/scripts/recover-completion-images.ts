import path from "node:path";

import { loadProjectEnvironment } from "../lib/env.js";
import { resolveManagedGeneratedAssetDir } from "../lib/image-assets.js";
import { ManagedGeneratedImageStore } from "../lib/managed-generated-images.js";
import { createCompletionImageService } from "../lib/completion-images.js";
import { recoverMissingCompletionImages } from "../lib/completion-image-recovery.js";
import { createParticipationStore } from "../lib/sql-store.js";

loadProjectEnvironment(path.resolve(process.cwd(), ".."));

const store = new ManagedGeneratedImageStore(
  createParticipationStore({
    dataFile: path.join(process.cwd(), "server-data.json"),
    sqlConnectionString: process.env.PRESCHOOL_SQL_CONNECTION_STRING
  }),
  resolveManagedGeneratedAssetDir(path.resolve(process.cwd(), ".."))
);

const summary = await recoverMissingCompletionImages({
  store,
  completionImageService: createCompletionImageService(process.env.OPENAI_API_KEY)
});

console.log(
  JSON.stringify(
    {
      recoveredCount: summary.recoveredCount,
      skippedCount: summary.skippedCount,
      unresolvedCount: summary.unresolvedCount
    },
    null,
    2
  )
);
