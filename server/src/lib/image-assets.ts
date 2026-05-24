import { existsSync } from "node:fs";
import path from "node:path";

import type { Chore, Completion, Routine, RoutineStep } from "../domain/types.js";

type ParsedImageDataUrl = {
  contentType: string;
  body: Buffer;
};

export const managedGeneratedAssetMountPath = "/generated-assets";

function decodeUtf8Payload(payload: string): Buffer {
  try {
    return Buffer.from(decodeURIComponent(payload), "utf8");
  } catch {
    return Buffer.from(payload, "utf8");
  }
}

export function resolveManagedGeneratedAssetDir(cwd: string): string {
  const normalizedCwd = path.resolve(cwd);
  const serverDir = path.basename(normalizedCwd).toLowerCase() === "server";
  const currentDir = path.basename(normalizedCwd).toLowerCase() === "current";
  const repoRoot = serverDir || currentDir ? path.dirname(normalizedCwd) : normalizedCwd;
  const sharedAssetDir = path.join(repoRoot, "shared", "generated-assets");

  if (existsSync(path.join(repoRoot, "shared"))) {
    return sharedAssetDir;
  }

  return path.join(repoRoot, "generated-assets");
}

export function isManagedGeneratedAssetPath(
  imageUrl: string | undefined
): imageUrl is string {
  return typeof imageUrl === "string" && imageUrl.startsWith(`${managedGeneratedAssetMountPath}/`);
}

export function managedGeneratedAssetUrlToFilePath(
  imageUrl: string,
  assetRootDir: string
): string | null {
  if (!isManagedGeneratedAssetPath(imageUrl)) {
    return null;
  }

  const relativePath = imageUrl.slice(managedGeneratedAssetMountPath.length + 1);
  const filePath = path.resolve(assetRootDir, relativePath);
  const normalizedRoot = path.resolve(assetRootDir);

  if (filePath === normalizedRoot || !filePath.startsWith(`${normalizedRoot}${path.sep}`)) {
    return null;
  }

  return filePath;
}

export function parsePersistedImageDataUrl(imageUrl: string | undefined): ParsedImageDataUrl | null {
  if (!imageUrl?.startsWith("data:image/")) {
    return null;
  }

  const commaIndex = imageUrl.indexOf(",");
  if (commaIndex < 0) {
    return null;
  }

  const metadata = imageUrl.slice(5, commaIndex);
  const payload = imageUrl.slice(commaIndex + 1);
  const metadataParts = metadata.split(";");
  const contentType = metadataParts[0]?.trim();
  if (!contentType) {
    return null;
  }

  const body = metadataParts.includes("base64")
    ? Buffer.from(payload, "base64")
    : decodeUtf8Payload(payload);

  return {
    contentType,
    body
  };
}

function cloneRoutineStep(step: RoutineStep): RoutineStep {
  return {
    ...step
  };
}

export function serializeRoutine(routine: Routine): Routine {
  return {
    ...routine,
    steps: routine.steps.map(cloneRoutineStep)
  };
}

export function serializeChore(chore: Chore): Chore {
  return {
    ...chore
  };
}

export function serializeCompletion(completion: Completion): Completion {
  return {
    ...completion
  };
}
