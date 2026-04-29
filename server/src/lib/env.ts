import fs from "node:fs";
import path from "node:path";

import dotenv from "dotenv";

export function resolveProjectEnvPath(cwd: string): string {
  const normalizedCwd = path.resolve(cwd);
  const serverDir = path.basename(normalizedCwd).toLowerCase() === "server";
  const repoRoot = serverDir ? path.dirname(normalizedCwd) : normalizedCwd;
  return path.join(repoRoot, ".env");
}

export function loadProjectEnvironment(cwd = process.cwd()): void {
  const envPath = resolveProjectEnvPath(cwd);
  if (!fs.existsSync(envPath)) {
    return;
  }

  dotenv.config({ path: envPath });
}
