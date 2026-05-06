import { existsSync } from "node:fs";
import { createApp } from "./app.js";
import { loadProjectEnvironment } from "./lib/env.js";
import { resolveManagedGeneratedAssetDir } from "./lib/image-assets.js";
import { ManagedGeneratedImageStore } from "./lib/managed-generated-images.js";
import { createParticipationStore } from "./lib/sql-store.js";
import path from "node:path";

loadProjectEnvironment();

function resolveClientDistDir(): string | undefined {
  const candidates = [
    path.resolve(process.cwd(), "../client/dist"),
    path.resolve(process.cwd(), "client/dist")
  ];

  return candidates.find((candidate) => existsSync(path.join(candidate, "index.html")));
}

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";
const dataFile = path.join(process.cwd(), "server-data.json");
const clientDistDir = resolveClientDistDir();
const generatedAssetDir = resolveManagedGeneratedAssetDir(process.cwd());

const store = new ManagedGeneratedImageStore(
  createParticipationStore({
    dataFile,
    sqlConnectionString: process.env.PRESCHOOL_SQL_CONNECTION_STRING
  }),
  generatedAssetDir
);

await store.read();

const app = createApp({
  clientDistDir,
  dataFile,
  generatedAssetDir,
  store
});

app.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
});
