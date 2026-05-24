import assert from "node:assert/strict";
import path from "node:path";

import {
  DEPLOY_ARTIFACT_ARCHIVE_BASENAME,
  getDeployArtifactArchiveName,
  getDeployArtifactEntries
} from "./deploy-artifact.mjs";

{
  assert.equal(DEPLOY_ARTIFACT_ARCHIVE_BASENAME, "starstep-release");
  assert.equal(getDeployArtifactArchiveName("abc123"), "starstep-release-abc123.zip");
}

{
  const entries = getDeployArtifactEntries();

  assert.deepEqual(entries, [
    "package.json",
    "package-lock.json",
    path.join("client", "package.json"),
    path.join("client", "dist"),
    path.join("server", "package.json"),
    path.join("server", "dist"),
    path.join("scripts", "prod-startup.ps1"),
    path.join("scripts", "windows-prod-startup.mjs")
  ]);
  assert.equal(entries.includes(".env.prod"), false);
}
