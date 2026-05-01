import assert from "node:assert/strict";
import test from "node:test";

import { buildInstructionalImagePrompt, createInstructionalImageService } from "./instructional-images.js";

test("builds prompt-safe instructional image requests", () => {
  const prompt = buildInstructionalImagePrompt({
    activityName: "Morning helper",
    stepLabels: ["Get dressed", "Brush teeth"]
  });

  assert.match(prompt, /original preschool-friendly instructional icon/i);
  assert.match(prompt, /Morning helper/);
  assert.match(prompt, /Get dressed, Brush teeth/);
  assert.match(prompt, /minimal background clutter/i);
  assert.match(prompt, /Do not include any text/i);
});

test("fails fast when the OpenAI API key is missing", async () => {
  const service = createInstructionalImageService(undefined);

  await assert.rejects(
    () =>
      service.generateInstructionalImage({
        activityName: "Morning helper",
        stepLabels: ["Get dressed"]
      }),
    /OpenAI API key is not configured/
  );
});
