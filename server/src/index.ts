import { createApp } from "./app.js";
import { loadProjectEnvironment } from "./lib/env.js";

loadProjectEnvironment();

const app = createApp();
const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
