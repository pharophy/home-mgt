import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildCompletionImagePrompt,
  buildInstructionalImagePrompt,
  generateInstructionalImage,
  selectCompletionTheme
} from "./completion-imagery";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("completion imagery helpers", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

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

  it("requests instructional images from the backend with parent auth headers", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          imageUrl: "data:image/png;base64,instructional",
          prompt: "instructional prompt"
        }),
        { status: 200 }
      )
    );

    await generateInstructionalImage({
      activityName: "Morning helper",
      stepLabels: ["Get dressed"]
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/instructional-images",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-actor-role": "parentAdmin",
          "x-actor-id": "parent-1"
        })
      })
    );
  });
});
