import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { createDefaultState, migrateState } from "../domain/state.js";
import type { PreschoolParticipationState } from "../domain/types.js";

export interface ParticipationStore {
  read(): Promise<PreschoolParticipationState>;
  write(state: PreschoolParticipationState): Promise<void>;
}

async function ensureDataFile(dataFile: string): Promise<void> {
  await mkdir(path.dirname(dataFile), { recursive: true });
  if (!existsSync(dataFile)) {
    await writeFile(dataFile, JSON.stringify(createDefaultState(), null, 2), "utf8");
  }
}

export class JsonParticipationStore implements ParticipationStore {
  constructor(private readonly dataFile: string) {}

  async read(): Promise<PreschoolParticipationState> {
    await ensureDataFile(this.dataFile);
    const raw = await readFile(this.dataFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<PreschoolParticipationState>;
    const migrated = migrateState(parsed);

    if (JSON.stringify(parsed) !== JSON.stringify(migrated)) {
      await this.write(migrated);
    }

    return migrated;
  }

  async write(state: PreschoolParticipationState): Promise<void> {
    await ensureDataFile(this.dataFile);
    await writeFile(this.dataFile, JSON.stringify(state, null, 2), "utf8");
  }
}
