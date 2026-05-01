import { existsSync } from "node:fs";
import { createApp } from "./app.js";
import { loadProjectEnvironment } from "./lib/env.js";
import path from "node:path";

loadProjectEnvironment();

function resolveClientDistDir(): string | undefined {
  const candidates = [
    path.resolve(process.cwd(), "../client/dist"),
    path.resolve(process.cwd(), "client/dist")
  ];

  return candidates.find((candidate) => existsSync(path.join(candidate, "index.html")));
}

const app = createApp({
  clientDistDir: resolveClientDistDir()
});
const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";

app.listen(port, host, () => {
  console.log(`API listening on http://${host}:${port}`);
});
