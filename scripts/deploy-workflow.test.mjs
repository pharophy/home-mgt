import assert from "node:assert/strict";
import fs from "node:fs";

const workflow = fs.readFileSync(
  new URL("../.github/workflows/deploy-starstep-windows.yml", import.meta.url),
  "utf8"
);

assert.match(workflow, /aws-region:\s+us-west-2/);
assert.doesNotMatch(workflow, /^\s+AWS_REGION:/m);
assert.doesNotMatch(workflow, /^\s*- name:\s+Resolve AWS region/m);
assert.doesNotMatch(workflow, /^\s+id:\s+resolve-aws-region/m);
assert.doesNotMatch(workflow, /^\s+\$resolvedRegion = node scripts\/resolve-aws-region\.mjs/m);
assert.match(workflow, /AWS_ACCESS_KEY_ID/);
assert.match(workflow, /AWS_SECRET_ACCESS_KEY/);
assert.match(workflow, /STARSTEP_DEPLOY_BUCKET/);
assert.match(workflow, /\$script = .*FromBase64String.*\);\s*'/s);
assert.match(workflow, /Set-Content -LiteralPath \$scriptPath -Value \$script;/);
assert.match(workflow, /-ReleaseId `"\$\{\{ github\.sha \}\}`" -AppRoot `"\$env:STARSTEP_APP_ROOT`";/);
