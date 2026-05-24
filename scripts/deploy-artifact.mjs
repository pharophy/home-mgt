import path from "node:path";

export const DEPLOY_ARTIFACT_ARCHIVE_BASENAME = "starstep-release";

export function getDeployArtifactArchiveName(revision) {
  return `${DEPLOY_ARTIFACT_ARCHIVE_BASENAME}-${revision}.zip`;
}

export function getDeployArtifactEntries() {
  return [
    "package.json",
    "package-lock.json",
    path.join("client", "package.json"),
    path.join("client", "dist"),
    path.join("server", "package.json"),
    path.join("server", "dist"),
    path.join("scripts", "prod-startup.ps1"),
    path.join("scripts", "windows-prod-startup.mjs")
  ];
}
