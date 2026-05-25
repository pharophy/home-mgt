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
assert.doesNotMatch(workflow, /aws ssm wait command-executed/);
assert.match(workflow, /AWS_ACCESS_KEY_ID/);
assert.match(workflow, /AWS_SECRET_ACCESS_KEY/);
assert.match(workflow, /STARSTEP_DEPLOY_BUCKET/);
assert.match(workflow, /\$script = .*FromBase64String.*\);\s*'/s);
assert.match(workflow, /Set-Content -LiteralPath \$scriptPath -Value \$script;/);
assert.match(
  workflow,
  /\('& powershell\.exe -NoProfile -ExecutionPolicy Bypass -File "\$scriptPath" -ArtifactUrl "\{0\}" -ReleaseId "\{1\}" -AppRoot "\{2\}";' -f \$env:STARSTEP_ARTIFACT_URL, '\$\{\{ github\.sha \}\}', \$env:STARSTEP_APP_ROOT\)/
);
assert.match(workflow, /\$deadline = \(Get-Date\)\.AddMinutes\(30\)/);
assert.match(workflow, /while \(\$true\) \{\s+\$invocation = aws ssm get-command-invocation[\s\S]*Start-Sleep -Seconds 15/s);
assert.match(workflow, /SSM deploy failed with status/);
