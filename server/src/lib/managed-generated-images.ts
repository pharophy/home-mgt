import { existsSync } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import type { PreschoolParticipationState } from "../domain/types.js";
import {
  isManagedGeneratedAssetPath,
  managedGeneratedAssetMountPath,
  managedGeneratedAssetUrlToFilePath,
  parsePersistedImageDataUrl
} from "./image-assets.js";
import type { ParticipationStore } from "./store.js";

function extensionForContentType(contentType: string): string {
  switch (contentType.toLowerCase()) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}

async function writeManagedGeneratedAsset(
  assetRootDir: string,
  relativePathWithoutExtension: string,
  imageUrl: string
): Promise<string | undefined> {
  const parsed = parsePersistedImageDataUrl(imageUrl);
  if (!parsed) {
    return undefined;
  }

  const extension = extensionForContentType(parsed.contentType);
  const relativePath = `${relativePathWithoutExtension}.${extension}`;
  const filePath = path.join(assetRootDir, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, parsed.body);
  return `${managedGeneratedAssetMountPath}/${relativePath.replace(/\\/g, "/")}`;
}

async function normalizeGeneratedImageReference(
  assetRootDir: string,
  imageUrl: string | undefined,
  relativePathWithoutExtension: string
): Promise<{ imageUrl: string | undefined; changed: boolean }> {
  if (!imageUrl) {
    return { imageUrl: undefined, changed: false };
  }

  if (isManagedGeneratedAssetPath(imageUrl)) {
    const managedFilePath = managedGeneratedAssetUrlToFilePath(imageUrl, assetRootDir);
    if (managedFilePath && !existsSync(managedFilePath)) {
      return {
        imageUrl: undefined,
        changed: true
      };
    }

    return { imageUrl, changed: false };
  }

  const managedPath = await writeManagedGeneratedAsset(
    assetRootDir,
    relativePathWithoutExtension,
    imageUrl
  );
  if (!managedPath) {
    return { imageUrl, changed: false };
  }

  return {
    imageUrl: managedPath,
    changed: managedPath !== imageUrl
  };
}

function collectManagedGeneratedAssetPaths(state: PreschoolParticipationState): Set<string> {
  const paths = new Set<string>();

  for (const routine of state.routines) {
    if (isManagedGeneratedAssetPath(routine.imageUrl)) {
      paths.add(routine.imageUrl);
    }
    for (const step of routine.steps) {
      if (isManagedGeneratedAssetPath(step.imageUrl)) {
        paths.add(step.imageUrl);
      }
    }
  }

  for (const chore of state.chores) {
    if (isManagedGeneratedAssetPath(chore.imageUrl)) {
      paths.add(chore.imageUrl);
    }
  }

  for (const completion of state.completions) {
    if (isManagedGeneratedAssetPath(completion.celebrationImageUrl)) {
      paths.add(completion.celebrationImageUrl);
    }
  }

  return paths;
}

async function deleteManagedGeneratedAssets(
  assetRootDir: string,
  removedPaths: Iterable<string>
): Promise<void> {
  for (const assetPath of removedPaths) {
    const filePath = managedGeneratedAssetUrlToFilePath(assetPath, assetRootDir);
    if (!filePath) {
      continue;
    }

    await rm(filePath, { force: true });
  }
}

export async function normalizeGeneratedImagesInState(
  state: PreschoolParticipationState,
  assetRootDir: string
): Promise<boolean> {
  let changed = false;

  for (const routine of state.routines) {
    const normalizedRoutine = await normalizeGeneratedImageReference(
      assetRootDir,
      routine.imageUrl,
      path.join("routines", routine.id)
    );
    if (normalizedRoutine.changed) {
      routine.imageUrl = normalizedRoutine.imageUrl;
      changed = true;
    }

    for (const step of routine.steps) {
      const normalizedStep = await normalizeGeneratedImageReference(
        assetRootDir,
        step.imageUrl,
        path.join("routines", routine.id, "steps", step.id)
      );
      if (normalizedStep.changed) {
        step.imageUrl = normalizedStep.imageUrl;
        changed = true;
      }
    }
  }

  for (const chore of state.chores) {
    const normalizedChore = await normalizeGeneratedImageReference(
      assetRootDir,
      chore.imageUrl,
      path.join("chores", chore.id)
    );
    if (normalizedChore.changed) {
      chore.imageUrl = normalizedChore.imageUrl;
      changed = true;
    }
  }

  for (const completion of state.completions) {
    const normalizedCompletion = await normalizeGeneratedImageReference(
      assetRootDir,
      completion.celebrationImageUrl,
      path.join("completions", completion.id)
    );
    if (normalizedCompletion.changed) {
      completion.celebrationImageUrl = normalizedCompletion.imageUrl;
      changed = true;
    }
  }

  return changed;
}

export class ManagedGeneratedImageStore implements ParticipationStore {
  constructor(
    private readonly delegate: ParticipationStore,
    private readonly assetRootDir: string
  ) {}

  async read(): Promise<PreschoolParticipationState> {
    const state = await this.delegate.read();
    const changed = await normalizeGeneratedImagesInState(state, this.assetRootDir);
    if (changed) {
      await this.delegate.write(state);
    }

    return state;
  }

  async write(state: PreschoolParticipationState): Promise<void> {
    const previousState = await this.delegate.read();
    const previousPaths = collectManagedGeneratedAssetPaths(previousState);

    await normalizeGeneratedImagesInState(state, this.assetRootDir);
    const nextPaths = collectManagedGeneratedAssetPaths(state);

    await this.delegate.write(state);

    const removedPaths = [...previousPaths].filter((assetPath) => !nextPaths.has(assetPath));
    await deleteManagedGeneratedAssets(this.assetRootDir, removedPaths);
  }
}
