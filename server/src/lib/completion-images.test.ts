import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCompletionImagePrompt,
  createCompletionImageService,
  selectCompletionTheme,
  selectCompletionVariation,
} from "./completion-images.js";

test("builds prompt-safe original inspired-by imagery requests", () => {
  const prompt = buildCompletionImagePrompt({
    childName: "Milo",
    activityName: "Carry napkins",
    interestThemes: ["energetic blue cartoon dogs", "race cars"],
    selectedTheme: "race cars",
    visualVariation: "low-angle winner moment with confetti motion trails"
  });

  assert.match(prompt, /original celebratory illustration/i);
  assert.match(prompt, /Carry napkins/);
  assert.match(prompt, /lead visual theme: race cars/i);
  assert.match(prompt, /supporting visual motifs: energetic blue cartoon dogs/i);
  assert.match(prompt, /low-angle winner moment with confetti motion trails/i);
  assert.match(prompt, /Do not depict copyrighted characters/i);
  assert.match(prompt, /Make the child interests visibly present in the scene/i);
});

test("varies selected inspiration themes across completion events", () => {
  assert.equal(
    selectCompletionTheme(["energetic blue cartoon dogs", "race cars"], 0),
    "energetic blue cartoon dogs"
  );
  assert.equal(selectCompletionTheme(["energetic blue cartoon dogs", "race cars"], 1), "race cars");
});

test("rotates visual variation recipes across repeated completion events", () => {
  assert.notEqual(selectCompletionVariation(0), selectCompletionVariation(1));
  assert.notEqual(selectCompletionVariation(1), selectCompletionVariation(2));
});

test("fails fast when the OpenAI API key is missing", async () => {
  const service = createCompletionImageService(undefined);

  await assert.rejects(
    () =>
      service.generateCelebrationImage({
        childName: "Milo",
        activityName: "Carry napkins",
        interestThemes: ["race cars"],
        celebrationMode: "full"
      }),
    /OpenAI API key is not configured/
  );
});

test("uses the faster sticker generation model without lowering medium quality", async () => {
  let capturedRequest: Record<string, unknown> | null = null;
  const service = createCompletionImageService("test-key", {
    client: {
      images: {
        generate: async (request: Record<string, unknown>) => {
          capturedRequest = request;
          return {
            data: [{ b64_json: "celebration-image" }]
          };
        }
      }
    }
  });

  const result = await service.generateCelebrationImage({
    childName: "Milo",
    activityName: "Carry napkins",
    interestThemes: ["race cars"],
    celebrationMode: "full",
    variantSeed: 1
  });

  assert.equal(result.imageUrl, "data:image/png;base64,celebration-image");
  assert.ok(capturedRequest);
  const generatedRequest = capturedRequest as Record<string, unknown>;
  assert.equal(generatedRequest.model, "gpt-image-1-mini");
  assert.equal(generatedRequest.size, "1024x1024");
  assert.equal(generatedRequest.quality, "medium");
});
