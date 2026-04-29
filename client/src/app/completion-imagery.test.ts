import { describe, expect, it } from "vitest";

import {
  buildCompletionImagePrompt,
  buildInstructionalImagePrompt,
  selectCompletionTheme
} from "./completion-imagery";

describe("completion imagery helpers", () => {
  it("builds prompt-safe original inspired-by imagery requests", () => {
    const prompt = buildCompletionImagePrompt({
      childName: "Milo",
      activityName: "Carry napkins",
      interestThemes: ["energetic blue cartoon dogs", "race cars"],
      selectedTheme: "race cars"
    });

    expect(prompt).toContain("original celebratory illustration");
    expect(prompt).toContain("Carry napkins");
    expect(prompt).toContain("race cars");
    expect(prompt).toContain("Do not depict copyrighted characters");
    expect(prompt).toContain("inspiration themes only");
  });

  it("varies selected inspiration themes across completion events", () => {
    expect(
      selectCompletionTheme(["energetic blue cartoon dogs", "race cars"], 0)
    ).toBe("energetic blue cartoon dogs");
    expect(
      selectCompletionTheme(["energetic blue cartoon dogs", "race cars"], 1)
    ).toBe("race cars");
  });

  it("builds instructional-image prompts from task semantics rather than celebration themes", () => {
    const prompt = buildInstructionalImagePrompt({
      activityName: "Morning helper",
      stepLabels: ["Get dressed", "Brush teeth"]
    });

    expect(prompt).toContain("Morning helper");
    expect(prompt).toContain("Get dressed");
    expect(prompt).toContain("Brush teeth");
    expect(prompt).toContain("instructional image");
    expect(prompt).not.toContain("race cars");
    expect(prompt).not.toContain("cartoon dogs");
  });
});
