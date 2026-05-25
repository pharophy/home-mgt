import assert from "node:assert/strict";
import fs from "node:fs";

const workflow = fs.readFileSync(
  new URL("../.github/workflows/deploy-starstep-windows.yml", import.meta.url),
  "utf8"
);

assert.match(workflow, /name:\s+Resolve AWS region/);
assert.match(workflow, /id:\s+resolve-aws-region/);
assert.match(workflow, /node scripts\/resolve-aws-region\.mjs/);
assert.match(
  workflow,
  /aws-region:\s+\${{\s*steps\.resolve-aws-region\.outputs\.region\s*}}/
);
