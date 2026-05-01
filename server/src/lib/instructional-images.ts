import OpenAI from "openai";

import type {
  InstructionalImageRequest,
  InstructionalImageResult,
  InstructionalImageService
} from "../domain/types.js";

export function buildInstructionalImagePrompt({
  activityName,
  stepLabels
}: InstructionalImageRequest): string {
  const stepContext = stepLabels
    .map((label) => label.trim())
    .filter((label) => label.length > 0)
    .join(", ");

  return [
    `Create an original preschool-friendly instructional icon for "${activityName}".`,
    stepContext
      ? `Use these step details as visual context: ${stepContext}.`
      : "Focus on a single clear child-safe action.",
    "Render the image as a clean, bold, easy-to-recognize illustration with minimal background clutter.",
    "Do not include any text, watermarks, logos, franchise characters, or copyrighted designs."
  ].join(" ");
}

export function createInstructionalImageService(
  apiKey: string | undefined
): InstructionalImageService {
  return {
    async generateInstructionalImage(
      request: InstructionalImageRequest
    ): Promise<InstructionalImageResult> {
      if (!apiKey) {
        throw new Error("OpenAI API key is not configured");
      }

      const client = new OpenAI({ apiKey });
      const prompt = buildInstructionalImagePrompt(request);
      const response = await client.images.generate({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024",
        quality: "medium"
      });

      const imageBase64 = response.data?.[0]?.b64_json;
      if (!imageBase64) {
        throw new Error("OpenAI image response did not include image data");
      }

      return {
        imageUrl: `data:image/png;base64,${imageBase64}`,
        prompt
      };
    }
  };
}
