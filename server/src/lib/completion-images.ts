import OpenAI from "openai";

import type {
  CompletionImageRequest,
  CompletionImageResult,
  CompletionImageService
} from "../domain/types.js";

type ImageGenerationClient = {
  images: {
    generate(request: {
      model: string;
      prompt: string;
      size: string;
      quality: string;
    }): Promise<{ data?: Array<{ b64_json?: string | null }> }>;
  };
};

const completionVisualVariations = [
  "low-angle winner moment with confetti motion trails",
  "storybook badge ceremony with oversized reward sparkles",
  "playroom parade scene with celebratory banners and toy-scale props",
  "close-up victory pose with swirling sticker shapes and cheering background details",
  "cozy mural-style scene with bold shapes, spotlight glow, and playful motion"
] as const;

export function selectCompletionTheme(
  interestThemes: string[],
  variantSeed: number
): string {
  const cleanedThemes = interestThemes
    .map((theme) => theme.trim())
    .filter((theme) => theme.length > 0);

  if (cleanedThemes.length === 0) {
    return "playful preschool adventure";
  }

  return cleanedThemes[Math.abs(variantSeed) % cleanedThemes.length] ?? cleanedThemes[0];
}

export function selectCompletionVariation(variantSeed: number): string {
  return (
    completionVisualVariations[
      Math.abs(variantSeed) % completionVisualVariations.length
    ] ?? completionVisualVariations[0]
  );
}

export function buildCompletionImagePrompt({
  childName,
  activityName,
  interestThemes,
  selectedTheme,
  visualVariation
}: {
  childName: string;
  activityName: string;
  interestThemes: string[];
  selectedTheme: string;
  visualVariation: string;
}): string {
  const cleanedThemes = interestThemes
    .map((theme) => theme.trim())
    .filter((theme) => theme.length > 0);
  const supportingThemes = cleanedThemes
    .filter((theme) => theme !== selectedTheme)
    .join(", ");

  return [
    `Create an original celebratory illustration for ${childName} after completing ${activityName}.`,
    `Lead visual theme: ${selectedTheme}.`,
    `Supporting visual motifs: ${supportingThemes || "playful preschool adventure"}.`,
    `Visual variation to apply for this reward moment: ${visualVariation}.`,
    "Make the child interests visibly present in the scene through props, background details, shapes, or costume-like styling.",
    "Keep it bright, friendly, and suitable for a preschool reward moment.",
    "Do not depict copyrighted characters, franchise names, logos, or exact branded scenes."
  ].join(" ");
}

export function createCompletionImageService(
  apiKey: string | undefined,
  options: { client?: ImageGenerationClient } = {}
): CompletionImageService {
  const client = options.client ?? (apiKey ? new OpenAI({ apiKey }) : null);

  return {
    async generateCelebrationImage(
      request: CompletionImageRequest
    ): Promise<CompletionImageResult> {
      if (!apiKey) {
        throw new Error("OpenAI API key is not configured");
      }
      const variantSeed = request.variantSeed ?? Date.now();
      const selectedTheme = selectCompletionTheme(
        request.interestThemes,
        variantSeed
      );
      const visualVariation = selectCompletionVariation(variantSeed);
      const prompt = buildCompletionImagePrompt({
        childName: request.childName,
        activityName: request.activityName,
        interestThemes: request.interestThemes,
        selectedTheme,
        visualVariation
      });

      const response = await client!.images.generate({
        model: "gpt-image-1-mini",
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
        prompt,
        selectedTheme
      };
    }
  };
}
