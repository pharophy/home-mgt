import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import App from "./App";
import {
  __setInstructionalImageGeneratorForTests
} from "./app/completion-imagery";
import { currentWeekday } from "./app/view-model";

const fetchMock = vi.fn<typeof fetch>();
const weekOrder = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
] as const;

vi.stubGlobal("fetch", fetchMock);

function stateResponse(overrides: Record<string, unknown> = {}) {
  return new Response(
    JSON.stringify({
      schemaVersion: 1,
      householdSettings: {
        celebrationMode: "full"
      },
      childProfiles: [],
      routines: [],
      chores: [],
      completions: [],
      rewards: [],
      pendingApprovals: [],
      ...overrides
    }),
    { status: 200 }
  );
}

function todayPlanResponse(overrides: Record<string, unknown> = {}) {
  return new Response(
    JSON.stringify({
      day: "monday",
      routines: [],
      chores: [],
      pendingApprovals: [],
      ...overrides
    }),
    { status: 200 }
  );
}

function previousWeekday(day: ReturnType<typeof currentWeekday>) {
  const index = weekOrder.indexOf(day);
  return weekOrder[(index + weekOrder.length - 1) % weekOrder.length];
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width
  });
  window.dispatchEvent(new Event("resize"));
}

describe("App", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.location.hash = "";
    setViewportWidth(1280);
    delete (window as Window & { __enableInstructionalBackfill__?: boolean })
      .__enableInstructionalBackfill__;
    __setInstructionalImageGeneratorForTests(async ({ activityName, stepLabels }) => ({
      imageUrl: `data:image/svg+xml;${encodeURIComponent(
        `${activityName}:${stepLabels.join("|")}`
      )}`,
      prompt: `${activityName}:${stepLabels.join("|")}`
    }));
    vi.useRealTimers();
  });

  it("creates a child profile and keeps the weekly matrix ready for today's plan", async () => {
    fetchMock
      .mockResolvedValueOnce(stateResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "child-1",
            name: "Milo",
            avatarUrl: "https://example.com/milo.png",
            color: "#F59E0B",
            motivators: []
          }),
          { status: 201 }
        )
      );

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /setup/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new child/i }));
    fireEvent.change(screen.getByLabelText(/child name/i), {
      target: { value: "Milo" }
    });
    fireEvent.click(screen.getByRole("button", { name: /save child profile/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "/api/child-profiles",
        expect.objectContaining({
          method: "POST"
        })
      );
    });

    expect(await screen.findByText("Milo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add new child/i })).toBeInTheDocument();
    expect(screen.getByText("Ready for today's plan")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /sticker chart/i }));
    expect(screen.getByRole("table", { name: /weekly completion matrix/i })).toBeInTheDocument();
  });

  it("uses the unified activity flow to create a step-based activity", async () => {
    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#60A5FA",
              motivators: []
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "routine-1",
            name: "Morning helper",
            childProfileId: "child-1",
            schedule: { days: ["monday"] },
            steps: [{ id: "step-1", label: "Get dressed", order: 0 }]
          }),
          { status: 201 }
        )
      );

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /setup/i }));
    fireEvent.click(screen.getByRole("button", { name: /^activities$/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new activity/i }));
    fireEvent.change(screen.getByLabelText(/activity name/i), {
      target: { value: "Morning helper" }
    });
    fireEvent.click(screen.getByRole("button", { name: /add step/i }));
    fireEvent.change(screen.getByLabelText(/step 1 name/i), {
      target: { value: "Get dressed" }
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /monday activity/i }));

    expect(await screen.findByAltText(/picture for step 1/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /save activity/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        "/api/routines",
        expect.objectContaining({
          method: "POST"
        })
      );
    });

    expect(screen.getAllByText("Morning helper").length).toBeGreaterThan(0);
  });

  it("auto-generates an instructional image after the parent finishes naming an activity", async () => {
    __setInstructionalImageGeneratorForTests(async () => ({
      imageUrl: "data:image/svg+xml;instructional",
      prompt: "instructional prompt"
    }));

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#60A5FA",
              motivators: []
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "routine-1",
            name: "Morning helper",
            childProfileId: "child-1",
            imageUrl: "data:image/svg+xml;instructional",
            schedule: { days: ["monday"] },
            steps: [{ id: "step-1", label: "Get dressed", order: 0 }]
          }),
          { status: 201 }
        )
      );

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /setup/i }));
    fireEvent.click(screen.getByRole("button", { name: /^activities$/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new activity/i }));
    const activityNameInput = screen.getByLabelText(/activity name/i);
    fireEvent.focus(activityNameInput);
    fireEvent.change(activityNameInput, {
      target: { value: "Morning helper" }
    });
    fireEvent.blur(activityNameInput);
    fireEvent.click(screen.getByRole("button", { name: /add step/i }));
    fireEvent.change(screen.getByLabelText(/step 1 name/i), {
      target: { value: "Get dressed" }
    });

    expect(await screen.findByAltText(/instructional image preview/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/instructional image url/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /generate instructional image/i })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: /monday activity/i }));
    fireEvent.click(screen.getByRole("button", { name: /save activity/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        "/api/routines",
        expect.objectContaining({
          method: "POST"
        })
      );
    });

    expect(
      JSON.parse(String(fetchMock.mock.calls[2]?.[1]?.body))
    ).toMatchObject({
      childProfileId: "child-1",
      name: "Morning helper",
      schedule: {
        days: ["monday"]
      },
      steps: [
        {
          label: "Get dressed",
          icon: ""
        }
      ]
    });
  });

  it("saves a valid activity before instructional images finish generating", async () => {
    let resolveInstructionalImage!: (value: {
      imageUrl: string;
      prompt: string;
    }) => void;

    __setInstructionalImageGeneratorForTests(
      () =>
        new Promise((resolve) => {
          resolveInstructionalImage = resolve;
        })
    );

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#60A5FA",
              motivators: []
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "routine-1",
            name: "Morning helper",
            childProfileId: "child-1",
            imageUrl: "",
            schedule: { days: ["monday"] },
            steps: [{ id: "step-1", label: "Get dressed", order: 0, imageUrl: "" }]
          }),
          { status: 201 }
        )
      );

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /setup/i }));
    fireEvent.click(screen.getByRole("button", { name: /^activities$/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new activity/i }));
    fireEvent.change(screen.getByLabelText(/activity name/i), {
      target: { value: "Morning helper" }
    });
    fireEvent.click(screen.getByRole("button", { name: /add step/i }));
    fireEvent.change(screen.getByLabelText(/step 1 name/i), {
      target: { value: "Get dressed" }
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /monday activity/i }));
    fireEvent.click(screen.getByRole("button", { name: /save activity/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        "/api/routines",
        expect.objectContaining({
          method: "POST"
        })
      );
    });

    expect(await screen.findByText(/activity saved/i)).toBeInTheDocument();
    expect(screen.getByText(/generating image/i)).toBeInTheDocument();

    resolveInstructionalImage({
      imageUrl: "data:image/svg+xml;instructional-finished",
      prompt: "finished prompt"
    });
  });

  it("shows a saved activity image on the sticker chart after background generation finishes", async () => {
    let resolveInstructionalImage!: (value: {
      imageUrl: string;
      prompt: string;
    }) => void;

    (window as Window & { __enableInstructionalBackfill__?: boolean }).__enableInstructionalBackfill__ = true;

    __setInstructionalImageGeneratorForTests(
      () =>
        new Promise((resolve) => {
          resolveInstructionalImage = resolve;
        })
    );

    fetchMock.mockImplementation(async (input, init) => {
      const url = String(input);

      if (url === "/api/state") {
        return stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#60A5FA",
              motivators: []
            }
          ]
        });
      }

      if (url.startsWith("/api/today-plan")) {
        return todayPlanResponse();
      }

      if (url === "/api/chores" && init?.method === "POST") {
        return new Response(
          JSON.stringify({
            id: "chore-1",
            name: "Carry napkins",
            childProfileId: "child-1",
            imageUrl: "",
            recurrence: { days: ["monday"] },
            requiresApproval: false
          }),
          { status: 201 }
        );
      }

      if (url === "/api/chores/chore-1" && init?.method === "PATCH") {
        return new Response(
          JSON.stringify({
            id: "chore-1",
            name: "Carry napkins",
            childProfileId: "child-1",
            imageUrl: "data:image/svg+xml;background-finished",
            recurrence: { days: ["monday"] },
            requiresApproval: false
          }),
          { status: 200 }
        );
      }

      return new Response(null, { status: 204 });
    });

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /setup/i }));
    fireEvent.click(screen.getByRole("button", { name: /^activities$/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new activity/i }));
    fireEvent.change(screen.getByLabelText(/activity name/i), {
      target: { value: "Carry napkins" }
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /monday activity/i }));
    fireEvent.click(screen.getByRole("button", { name: /save activity/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/chores",
        expect.objectContaining({
          method: "POST"
        })
      );
    });

    fireEvent.click(screen.getByRole("button", { name: /sticker chart/i }));

    expect(await screen.findByText("Carry napkins")).toBeInTheDocument();
    expect(screen.queryByAltText(/picture for carry napkins/i)).not.toBeInTheDocument();

    resolveInstructionalImage({
      imageUrl: "data:image/svg+xml;background-finished",
      prompt: "background-finished"
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/chores/chore-1",
        expect.objectContaining({
          method: "PATCH"
        })
      );
    });

    expect(await screen.findByAltText(/picture for carry napkins/i)).toHaveAttribute(
      "src",
      "data:image/svg+xml;background-finished"
    );
  });

  it("uses the unified activity flow to create a single-action activity with approval", async () => {
    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: []
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "chore-1",
            name: "Carry napkins",
            childProfileId: "child-1",
            recurrence: { days: ["monday"] },
            requiresApproval: false
          }),
          { status: 201 }
        )
      );

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /setup/i }));
    fireEvent.click(screen.getByRole("button", { name: /^activities$/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new activity/i }));
    fireEvent.change(screen.getByLabelText(/activity name/i), {
      target: { value: "Carry napkins" }
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /monday activity/i }));
    fireEvent.click(screen.getByRole("button", { name: /save activity/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        "/api/chores",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              childProfileId: "child-1",
              name: "Carry napkins",
              recurrence: {
                days: ["monday"]
              },
              requiresApproval: false
            })
          })
      );
    });
  });

  it("blocks saving a task when no scheduled day is selected and explains the requirement", async () => {
    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: []
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /setup/i }));
    fireEvent.click(screen.getByRole("button", { name: /^activities$/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new activity/i }));
    fireEvent.change(screen.getByLabelText(/activity name/i), {
      target: { value: "Carry napkins" }
    });
    fireEvent.click(screen.getByRole("button", { name: /save activity/i }));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      screen.getByText(/select at least one scheduled day before saving this activity/i)
    ).toBeInTheDocument();
  });

  it("shows pending and unavailable instructional-image states in activity authoring", async () => {
    let rejectInstructionalImage!: (reason?: unknown) => void;

    __setInstructionalImageGeneratorForTests(
      () =>
        new Promise((_, reject) => {
          rejectInstructionalImage = reject;
        })
    );

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: []
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /setup/i }));
    fireEvent.click(screen.getByRole("button", { name: /^activities$/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new activity/i }));
    fireEvent.change(screen.getByLabelText(/activity name/i), {
      target: { value: "Carry napkins" }
    });
    fireEvent.blur(screen.getByLabelText(/activity name/i));

    expect(await screen.findByText(/generating image/i)).toBeInTheDocument();

    rejectInstructionalImage(new Error("generation failed"));

    expect(await screen.findByText(/image unavailable/i)).toBeInTheDocument();
  });

  it("shows the server validation message when a task save is rejected", async () => {
    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: []
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse())
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Activity name is required" }), {
          status: 400
        })
      );

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /setup/i }));
    fireEvent.click(screen.getByRole("button", { name: /^activities$/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new activity/i }));
    fireEvent.change(screen.getByLabelText(/activity name/i), {
      target: { value: "Carry napkins" }
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /monday activity/i }));
    fireEvent.click(screen.getByRole("button", { name: /save activity/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        "/api/chores",
        expect.objectContaining({
          method: "POST"
        })
      );
    });

    expect(await screen.findByText("Activity name is required")).toBeInTheDocument();
  });

  it("opens on the weekly matrix without caregiver setup affordances", async () => {
    fetchMock.mockResolvedValueOnce(stateResponse());

    render(<App />);

    expect(await screen.findByRole("table", { name: /weekly completion matrix/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sticker chart/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /setup/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /history/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /children/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^activities$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /overview/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /completion/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/caregiver mode/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/invite or create caregiver/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/child name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/activity name/i)).not.toBeInTheDocument();
  });

  it("manages child profiles from a dedicated children page", async () => {
    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              avatarUrl: "https://example.com/milo.png",
              color: "#34D399",
              motivators: ["cars"]
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "child-1",
            name: "Miles",
            avatarUrl: "https://example.com/miles.png",
            color: "#60A5FA",
            motivators: ["blue dogs"]
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /setup/i }));
    fireEvent.click(screen.getByRole("button", { name: /edit child milo/i }));
    fireEvent.change(screen.getByLabelText(/child name/i), {
      target: { value: "Miles" }
    });
    fireEvent.change(screen.getByLabelText(/interest themes/i), {
      target: { value: "blue dogs" }
    });
    fireEvent.click(screen.getByRole("button", { name: /update child profile/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        "/api/child-profiles/child-1",
        expect.objectContaining({
          method: "PATCH"
        })
      );
    });

    expect(screen.getAllByText("Miles").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /delete child miles/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        4,
        "/api/child-profiles/child-1",
        expect.objectContaining({
          method: "DELETE"
        })
      );
      });

    expect(screen.queryByText("Miles")).not.toBeInTheDocument();
  });

  it("clears related rewards and pending approvals from parent state after deleting a child profile", async () => {
    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: []
            },
            {
              id: "child-2",
              name: "Zoe",
              color: "#60A5FA",
              motivators: []
            }
          ],
          completions: [
            {
              id: "completion-1",
              itemId: "chore-1",
              itemType: "chore",
              childProfileId: "child-1",
              status: "pendingApproval"
            },
            {
              id: "completion-2",
              itemId: "chore-2",
              itemType: "chore",
              childProfileId: "child-2",
              status: "completed"
            }
          ],
          rewards: [
            {
              id: "reward-1",
              childProfileId: "child-1",
              sourceId: "chore-1",
              completionId: "completion-1",
              amount: 2,
              rewardType: "stars"
            },
            {
              id: "reward-2",
              childProfileId: "child-2",
              sourceId: "chore-2",
              completionId: "completion-2",
              amount: 1,
              rewardType: "stickers"
            }
          ],
          pendingApprovals: [
            {
              id: "completion-1",
              itemId: "chore-1",
              itemType: "chore",
              childProfileId: "child-1",
              status: "pendingApproval"
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse())
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    await screen.findByText("Milo");
    fireEvent.click(screen.getByRole("button", { name: /setup/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete child milo/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        "/api/child-profiles/child-1",
        expect.objectContaining({
          method: "DELETE"
        })
      );
    });
  });

  it("shows saved stickers on a dedicated history page", async () => {
    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "Put dishes in dishwasher",
              childProfileId: "child-1",
              recurrence: { days: ["monday"] },
              requiresApproval: false
            }
          ],
          completions: [
            {
              id: "completion-1",
              itemId: "chore-1",
              itemType: "chore",
              childProfileId: "child-1",
              status: "completed",
              scheduledDay: "monday",
              completedAt: "2026-04-28T10:00:00.000Z",
              celebrationImageUrl: "data:image/png;base64,history",
              celebrationTheme: "race cars"
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /history/i }));

    expect(await screen.findByRole("heading", { name: /sticker history/i })).toBeInTheDocument();
    expect(screen.getByAltText(/saved sticker for put dishes in dishwasher/i)).toHaveAttribute(
      "src",
      "data:image/png;base64,history"
    );
    expect(screen.getAllByText("Milo").length).toBeGreaterThan(0);
    expect(screen.getByText("Put dishes in dishwasher")).toBeInTheDocument();
    expect(screen.getByText(/race cars/i)).toBeInTheDocument();
  });

  it("updates and deletes single-action activities from the activities page", async () => {
    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: []
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "Carry napkins",
              childProfileId: "child-1",
              recurrence: { days: ["monday"] },
              requiresApproval: true,
              reward: {
                type: "stars",
                amount: 2
              }
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "chore-1",
            name: "Carry napkins outside",
            childProfileId: "child-1",
            recurrence: { days: ["monday", "tuesday"] },
            requiresApproval: false
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /setup/i }));
    fireEvent.click(screen.getByRole("button", { name: /^activities$/i }));
    fireEvent.click(screen.getByRole("button", { name: /edit activity carry napkins/i }));
    fireEvent.change(screen.getByLabelText(/activity name/i), {
      target: { value: "Carry napkins outside" }
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /tuesday activity/i }));
    fireEvent.click(screen.getByRole("button", { name: /update activity/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        "/api/chores/chore-1",
        expect.objectContaining({
          method: "PATCH"
        })
      );
    });

    expect(screen.getByText("Carry napkins outside")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /delete activity carry napkins outside/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        4,
        "/api/chores/chore-1",
        expect.objectContaining({
          method: "DELETE"
        })
      );
    });

    expect(screen.queryByText("Carry napkins outside")).not.toBeInTheDocument();
  });

  it("clears related rewards and pending approvals from parent state after deleting an activity", async () => {
    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: []
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "Carry napkins",
              childProfileId: "child-1",
              recurrence: { days: ["monday"] },
              requiresApproval: true
            },
            {
              id: "chore-2",
              name: "Water plant",
              childProfileId: "child-1",
              recurrence: { days: ["monday"] },
              requiresApproval: false
            }
          ],
          completions: [
            {
              id: "completion-1",
              itemId: "chore-1",
              itemType: "chore",
              childProfileId: "child-1",
              status: "pendingApproval"
            },
            {
              id: "completion-2",
              itemId: "chore-2",
              itemType: "chore",
              childProfileId: "child-1",
              status: "completed"
            }
          ],
          rewards: [
            {
              id: "reward-1",
              childProfileId: "child-1",
              sourceId: "chore-1",
              completionId: "completion-1",
              amount: 2,
              rewardType: "stars"
            },
            {
              id: "reward-2",
              childProfileId: "child-1",
              sourceId: "chore-2",
              completionId: "completion-2",
              amount: 1,
              rewardType: "stickers"
            }
          ],
          pendingApprovals: [
            {
              id: "completion-1",
              itemId: "chore-1",
              itemType: "chore",
              childProfileId: "child-1",
              status: "pendingApproval"
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse())
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    render(<App />);

    await screen.findByText("Carry napkins");
    fireEvent.click(screen.getByRole("button", { name: /setup/i }));
    fireEvent.click(screen.getByRole("button", { name: /^activities$/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete activity carry napkins/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        "/api/chores/chore-1",
        expect.objectContaining({
          method: "DELETE"
        })
      );
    });
  });

  it("keeps the weekly matrix as the primary parent workflow surface", async () => {
    const today = currentWeekday();

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["energetic blue cartoon dogs", "race cars"]
            }
          ],
          routines: [
            {
              id: "routine-1",
              name: "Morning helper",
              childProfileId: "child-1",
              schedule: { days: [today] },
              steps: [{ id: "step-1", label: "Get dressed", order: 0 }]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "Carry napkins",
              childProfileId: "child-1",
              recurrence: { days: ["wednesday"] },
              requiresApproval: false
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    expect(await screen.findByRole("table", { name: /weekly completion matrix/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /completion/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/activity name/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(`toggle morning helper for ${today}`, "i")
      })
    ).toBeInTheDocument();
  });

  it("requests a backend completion image after recording completion", async () => {
    const today = currentWeekday();

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "Carry napkins",
              childProfileId: "child-1",
              recurrence: { days: [today] },
              requiresApproval: false
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "completion-1",
            itemId: "chore-1",
            itemType: "chore",
            childProfileId: "child-1",
            status: "completed",
            scheduledDay: today
          }),
          { status: 201 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            imageUrl: "data:image/png;base64,celebration",
            prompt: "prompt text",
            selectedTheme: "race cars"
          }),
          { status: 200 }
        )
      );

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: new RegExp(`toggle carry napkins for ${today}`, "i")
      })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        "/api/completions",
        expect.objectContaining({
          method: "POST"
        })
      );
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        4,
        "/api/completion-images",
        expect.objectContaining({
          method: "POST"
        })
      );
    });

    expect(
      JSON.parse(String(fetchMock.mock.calls[3]?.[1]?.body))
    ).toMatchObject({
      childName: "Milo",
      activityName: "Carry napkins",
      interestThemes: ["race cars"],
      celebrationMode: "full"
    });

    expect(await screen.findByAltText(/celebration image for carry napkins on/i)).toBeInTheDocument();
  });

  it("shows loading feedback immediately after a sticker chart reward target is tapped", async () => {
    const today = currentWeekday();
    let resolveCompletion!: (value: Response) => void;

    fetchMock.mockImplementation(async (input) => {
      const url = String(input);

      if (url === "/api/state") {
        return stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "Carry napkins",
              childProfileId: "child-1",
              recurrence: { days: [today] },
              requiresApproval: false
            }
          ]
        });
      }

      if (url.startsWith("/api/today-plan")) {
        return todayPlanResponse();
      }

      if (url === "/api/completions") {
        return new Promise((resolve) => {
          resolveCompletion = resolve;
        });
      }

      if (url === "/api/completion-images") {
        return new Response(
          JSON.stringify({
            imageUrl: "data:image/png;base64,celebration",
            prompt: "prompt text",
            selectedTheme: "race cars"
          }),
          { status: 200 }
        );
      }

      return new Response(null, { status: 404 });
    });

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: new RegExp(`toggle carry napkins for ${today}`, "i")
      })
    );

    expect(await screen.findByText(/creating image/i)).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", {
        name: /celebration for carry napkins/i
      })
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/completions",
      expect.objectContaining({ method: "POST" })
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);

    resolveCompletion(
      new Response(
        JSON.stringify({
          id: "completion-1",
          itemId: "chore-1",
          itemType: "chore",
          childProfileId: "child-1",
          status: "completed",
          scheduledDay: today
        }),
        { status: 201 }
      )
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        4,
        "/api/completion-images",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("allows the sticker chart tap-to-earn CTA to wrap on tablet-width screens", async () => {
    const today = currentWeekday();
    const originalWidth = window.innerWidth;
    setViewportWidth(1024);

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: []
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "Carry napkins",
              childProfileId: "child-1",
              recurrence: { days: [today] },
              requiresApproval: false
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    const cta = await screen.findByText(/tap to earn/i);
    expect(cta).toBeInTheDocument();
    expect(cta.getAttribute("style")).toContain("left: 0.25rem;");
    expect(cta.getAttribute("style")).toContain("right: 0.25rem;");
    expect(cta.getAttribute("style")).toContain("transform: none;");
    expect(cta.getAttribute("style")).toContain("white-space: normal;");

    setViewportWidth(originalWidth);
  });

  it("uses the compact tablet layout for setup while preserving the same workflow", async () => {
    setViewportWidth(1024);

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /setup/i }));

    const setupShell = screen.getByTestId("setup-shell");
    expect(setupShell).toHaveClass("is-compact-tablet");
    expect(screen.getByRole("button", { name: /children/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /activities/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add new child/i })).toBeInTheDocument();
  });

  it("keeps setup editor actions in the compact tablet reachability treatment", async () => {
    setViewportWidth(1024);

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: []
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /setup/i }));
    fireEvent.click(screen.getByRole("button", { name: /add new child/i }));

    expect(screen.getByTestId("setup-editor-actions")).toHaveClass("is-compact-tablet");
    expect(screen.getByRole("button", { name: /save child profile/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("uses the compact tablet layout for history while preserving the same workflow", async () => {
    setViewportWidth(1024);

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: []
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "Put dishes in dishwasher",
              childProfileId: "child-1",
              recurrence: { days: ["monday"] },
              requiresApproval: false
            }
          ],
          completions: [
            {
              id: "completion-1",
              itemId: "chore-1",
              itemType: "chore",
              childProfileId: "child-1",
              status: "completed",
              scheduledDay: "monday",
              completedAt: "2026-05-02T17:15:00.000Z",
              celebrationImageUrl: "data:image/png;base64,history-1"
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /history/i }));

    const historyShell = screen.getByTestId("history-layout");
    expect(historyShell).toHaveClass("is-compact-tablet");
    expect(screen.getByRole("button", { name: /month view/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /gallery view/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/filter history by child/i)).toBeInTheDocument();
  });

  it("records completion even when backend celebration imagery generation fails", async () => {
    const today = currentWeekday();

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "Carry napkins",
              childProfileId: "child-1",
              recurrence: { days: [today] },
              requiresApproval: false
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "completion-1",
            itemId: "chore-1",
            itemType: "chore",
            childProfileId: "child-1",
            status: "completed",
            scheduledDay: today
          }),
          { status: 201 }
        )
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "Completion image unavailable" }), { status: 503 }));

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: new RegExp(`toggle carry napkins for ${today}`, "i")
      })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        4,
        "/api/completion-images",
        expect.objectContaining({
          method: "POST"
        })
      );
    });

    expect(
      await screen.findByRole("button", {
        name: new RegExp(`toggle carry napkins for ${today}`, "i")
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/^image unavailable$/i)).toBeInTheDocument();
  });

  it("renders a weekly matrix with sample activities as rows and weekdays as columns", async () => {
    const today = currentWeekday();
    const futureDay = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].find(
      (day) => day !== today
    ) ?? "tuesday";

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ],
          routines: [
            {
              id: "routine-1",
              name: "morning routine",
              childProfileId: "child-1",
              schedule: { days: ["monday", "tuesday", "wednesday", "thursday", "friday"] },
              reward: {
                type: "stars",
                amount: 1
              },
              steps: [
                { id: "step-1", label: "brush teeth", order: 0 },
                { id: "step-2", label: "comb hair", order: 1 },
                { id: "step-3", label: "eat breakfast", order: 2 }
              ]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "put dishes in dishwasher",
              childProfileId: "child-1",
              recurrence: { days: ["monday", "tuesday", "wednesday", "thursday", "friday"] },
              requiresApproval: false,
              reward: {
                type: "stickers",
                amount: 1
              }
            },
            {
              id: "chore-2",
              name: "sleep in own bed",
              childProfileId: "child-1",
              recurrence: { days: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] },
              requiresApproval: false
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    expect(await screen.findByRole("table", { name: /weekly completion matrix/i })).toBeInTheDocument();
    expect(screen.getByText("morning routine")).toBeInTheDocument();
    expect(screen.getByText("put dishes in dishwasher")).toBeInTheDocument();
    expect(screen.getByText("sleep in own bed")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { current: "date" })).toHaveTextContent(new RegExp(today, "i"));
    expect(screen.getByRole("button", { name: new RegExp(`toggle morning routine for ${today}`, "i") })).toBeEnabled();
    expect(screen.getByLabelText(/star reward target for morning routine/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sticker reward target for put dishes in dishwasher/i)).toBeInTheDocument();
    expect(screen.getAllByText(/tap to earn/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^Complete$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(new RegExp(`scheduled for ${futureDay}`, "i"))).not.toBeInTheDocument();
    expect(
      screen.getByLabelText(new RegExp(`future star reward placeholder for morning routine on ${futureDay}`, "i"))
    ).toBeInTheDocument();
  });

  it("shows generated pictures for tasks and subtasks in the sticker chart", async () => {
    const today = currentWeekday();
    __setInstructionalImageGeneratorForTests(async ({ activityName, stepLabels }) => ({
      imageUrl: `data:image/svg+xml;${encodeURIComponent(
        `${activityName}:${stepLabels.join("|")}`
      )}`,
      prompt: `${activityName}:${stepLabels.join("|")}`
    }));

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ],
          routines: [
            {
              id: "routine-1",
              name: "morning routine",
              childProfileId: "child-1",
              imageUrl: `data:image/svg+xml;${encodeURIComponent("morning routine:brush teeth|comb hair")}`,
              schedule: { days: [today] },
              reward: {
                type: "stars",
                amount: 1
              },
              steps: [
                {
                  id: "step-1",
                  label: "brush teeth",
                  order: 0,
                  imageUrl: `data:image/svg+xml;${encodeURIComponent("brush teeth:morning routine")}`
                },
                {
                  id: "step-2",
                  label: "comb hair",
                  order: 1,
                  imageUrl: `data:image/svg+xml;${encodeURIComponent("comb hair:morning routine")}`
                }
              ]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "put dishes in dishwasher",
              childProfileId: "child-1",
              imageUrl: `data:image/svg+xml;${encodeURIComponent("put dishes in dishwasher:")}`,
              recurrence: { days: [today] },
              requiresApproval: false
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    const routineImage = await screen.findByAltText(/picture for morning routine/i);
    expect(routineImage).toHaveAttribute("src", expect.stringContaining(encodeURIComponent("morning routine")));
    expect(await screen.findByAltText(/picture for brush teeth/i)).toHaveAttribute(
      "src",
      expect.stringContaining("brush%20teeth")
    );
    expect(await screen.findByAltText(/picture for comb hair/i)).toHaveAttribute(
      "src",
      expect.stringContaining("comb%20hair")
    );
    expect(screen.getByText("brush teeth")).toBeInTheDocument();
    expect(screen.getByText("comb hair")).toBeInTheDocument();
    expect(await screen.findByAltText(/picture for put dishes in dishwasher/i)).toHaveAttribute(
      "src",
      expect.stringContaining("put%20dishes%20in%20dishwasher")
    );
  });

  it("backfills missing instructional images onto saved tasks and subtasks", async () => {
    (window as Window & { __enableInstructionalBackfill__?: boolean }).__enableInstructionalBackfill__ =
      true;
    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ],
          routines: [
            {
              id: "routine-1",
              name: "morning routine",
              childProfileId: "child-1",
              imageUrl: "",
              schedule: { days: ["monday"] },
              reward: {
                type: "stars",
                amount: 1
              },
              steps: [
                { id: "step-1", label: "brush teeth", order: 0, imageUrl: "" },
                { id: "step-2", label: "comb hair", order: 1, imageUrl: "" }
              ]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "put dishes in dishwasher",
              childProfileId: "child-1",
              imageUrl: "",
              recurrence: { days: ["monday"] },
              requiresApproval: false
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse())
      .mockImplementation(async (input, init) => {
        const url = String(input);
        if (url === "/api/state") {
          return stateResponse({
            childProfiles: [
              {
                id: "child-1",
                name: "Milo",
                color: "#34D399",
                motivators: ["race cars"]
              }
            ],
            routines: [
              {
                id: "routine-1",
                name: "morning routine",
                childProfileId: "child-1",
                imageUrl: `data:image/svg+xml;${encodeURIComponent("morning routine:brush teeth|comb hair")}`,
                schedule: { days: ["monday"] },
                reward: {
                  type: "stars",
                  amount: 1
                },
                steps: [
                  {
                    id: "step-1",
                    label: "brush teeth",
                    order: 0,
                    imageUrl: `data:image/svg+xml;${encodeURIComponent("brush teeth:morning routine")}`
                  },
                  {
                    id: "step-2",
                    label: "comb hair",
                    order: 1,
                    imageUrl: `data:image/svg+xml;${encodeURIComponent("comb hair:morning routine")}`
                  }
                ]
              }
            ],
            chores: [
              {
                id: "chore-1",
                name: "put dishes in dishwasher",
                childProfileId: "child-1",
                imageUrl: `data:image/svg+xml;${encodeURIComponent("put dishes in dishwasher:")}`,
                recurrence: { days: ["monday"] },
                requiresApproval: false
              }
            ]
          });
        }

        if (url === "/api/today-plan?childProfileId=child-1&day=monday") {
          return todayPlanResponse({
            day: "monday",
            routines: [
              {
                id: "routine-1",
                name: "morning routine",
                childProfileId: "child-1",
                imageUrl: "",
                schedule: { days: ["monday"] },
                reward: {
                  type: "stars",
                  amount: 1
                },
                steps: [
                  { id: "step-1", label: "brush teeth", order: 0, imageUrl: "" },
                  { id: "step-2", label: "comb hair", order: 1, imageUrl: "" }
                ]
              }
            ],
            chores: [
              {
                id: "chore-1",
                name: "put dishes in dishwasher",
                childProfileId: "child-1",
                imageUrl: "",
                recurrence: { days: ["monday"] },
                requiresApproval: false
              }
            ]
          });
        }

        if (url === "/api/routines/routine-1" && init?.method === "PATCH") {
          return new Response(
            JSON.stringify({
              id: "routine-1",
              name: "morning routine",
              childProfileId: "child-1",
              imageUrl: `data:image/svg+xml;${encodeURIComponent("morning routine:brush teeth|comb hair")}`,
              schedule: { days: ["monday"] },
              reward: {
                type: "stars",
                amount: 1
              },
              steps: [
                {
                  id: "step-1",
                  label: "brush teeth",
                  order: 0,
                  imageUrl: `data:image/svg+xml;${encodeURIComponent("brush teeth:morning routine")}`
                },
                {
                  id: "step-2",
                  label: "comb hair",
                  order: 1,
                  imageUrl: `data:image/svg+xml;${encodeURIComponent("comb hair:morning routine")}`
                }
              ]
            }),
            { status: 200 }
          );
        }

        if (url === "/api/chores/chore-1" && init?.method === "PATCH") {
          return new Response(
            JSON.stringify({
              id: "chore-1",
              name: "put dishes in dishwasher",
              childProfileId: "child-1",
              imageUrl: `data:image/svg+xml;${encodeURIComponent("put dishes in dishwasher:")}`,
              recurrence: { days: ["monday"] },
              requiresApproval: false
            }),
            { status: 200 }
          );
        }

        return new Response(null, { status: 204 });
      });

    render(<App />);

    expect(await screen.findByAltText(/picture for morning routine/i)).toHaveAttribute(
      "src",
      expect.stringContaining("morning%20routine")
    );
    expect(await screen.findByAltText(/picture for brush teeth/i)).toHaveAttribute(
      "src",
      expect.stringContaining("brush%20teeth")
    );
    expect(await screen.findByAltText(/picture for comb hair/i)).toHaveAttribute(
      "src",
      expect.stringContaining("comb%20hair")
    );
    expect(await screen.findByAltText(/picture for put dishes in dishwasher/i)).toHaveAttribute(
      "src",
      expect.stringContaining("put%20dishes%20in%20dishwasher")
    );

    expect(
      fetchMock.mock.calls.some(
        ([url, init]) => url === "/api/routines/routine-1" && init?.method === "PATCH"
      )
    ).toBe(true);
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) => url === "/api/chores/chore-1" && init?.method === "PATCH"
      )
    ).toBe(true);
  });

  it("does not backfill saved generated activity images when they are served by asset urls", async () => {
    (window as Window & { __enableInstructionalBackfill__?: boolean }).__enableInstructionalBackfill__ =
      true;
    const instructionalGenerator = vi.fn(async ({ activityName, stepLabels }) => ({
      imageUrl: `data:image/svg+xml;${encodeURIComponent(
        `${activityName}:${stepLabels.join("|")}`
      )}`,
      prompt: `${activityName}:${stepLabels.join("|")}`
    }));
    __setInstructionalImageGeneratorForTests(instructionalGenerator);

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ],
          routines: [
            {
              id: "routine-1",
              name: "morning routine",
              childProfileId: "child-1",
              imageUrl: "/generated-assets/routines/routine-1.png",
              schedule: { days: ["monday"] },
              reward: {
                type: "stars",
                amount: 1
              },
              steps: [
                {
                  id: "step-1",
                  label: "brush teeth",
                  order: 0,
                  imageUrl: "/generated-assets/routines/routine-1/steps/step-1.png"
                },
                {
                  id: "step-2",
                  label: "comb hair",
                  order: 1,
                  imageUrl: "/generated-assets/routines/routine-1/steps/step-2.png"
                }
              ]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "put dishes in dishwasher",
              childProfileId: "child-1",
              imageUrl: "/generated-assets/chores/chore-1.png",
              recurrence: { days: ["monday"] },
              requiresApproval: false
            }
          ]
        })
      )
      .mockResolvedValueOnce(
        todayPlanResponse({
          day: "monday",
          routines: [
            {
              id: "routine-1",
              name: "morning routine",
              childProfileId: "child-1",
              imageUrl: "/generated-assets/routines/routine-1.png",
              schedule: { days: ["monday"] },
              reward: {
                type: "stars",
                amount: 1
              },
              steps: [
                {
                  id: "step-1",
                  label: "brush teeth",
                  order: 0,
                  imageUrl: "/generated-assets/routines/routine-1/steps/step-1.png"
                },
                {
                  id: "step-2",
                  label: "comb hair",
                  order: 1,
                  imageUrl: "/generated-assets/routines/routine-1/steps/step-2.png"
                }
              ]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "put dishes in dishwasher",
              childProfileId: "child-1",
              imageUrl: "/generated-assets/chores/chore-1.png",
              recurrence: { days: ["monday"] },
              requiresApproval: false
            }
          ]
        })
      );

    render(<App />);

    expect(await screen.findByAltText(/picture for morning routine/i)).toHaveAttribute(
      "src",
      "/generated-assets/routines/routine-1.png"
    );
    expect(await screen.findByAltText(/picture for brush teeth/i)).toHaveAttribute(
      "src",
      "/generated-assets/routines/routine-1/steps/step-1.png"
    );
    expect(await screen.findByAltText(/picture for comb hair/i)).toHaveAttribute(
      "src",
      "/generated-assets/routines/routine-1/steps/step-2.png"
    );
    expect(await screen.findByAltText(/picture for put dishes in dishwasher/i)).toHaveAttribute(
      "src",
      "/generated-assets/chores/chore-1.png"
    );

    expect(instructionalGenerator).not.toHaveBeenCalled();
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          (url === "/api/routines/routine-1" || url === "/api/chores/chore-1") &&
          init?.method === "PATCH"
      )
    ).toBe(false);
  });

  it("rehydrates a saved completion image into the weekly matrix after state load", async () => {
    const today = currentWeekday();

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "put dishes in dishwasher",
              childProfileId: "child-1",
              recurrence: { days: [today] },
              requiresApproval: false
            }
          ],
          completions: [
            {
              id: "completion-1",
              itemId: "chore-1",
              itemType: "chore",
              childProfileId: "child-1",
              status: "completed",
              scheduledDay: today,
              celebrationImageUrl: "data:image/png;base64,persisted",
              celebrationPrompt: "saved prompt",
              celebrationTheme: "race cars"
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    expect(await screen.findByAltText(/celebration image for put dishes in dishwasher/i)).toHaveAttribute(
      "src",
      "data:image/png;base64,persisted"
    );
  });

  it("rehydrates a saved completion image from an asset url into the weekly matrix after state load", async () => {
    const today = currentWeekday();

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "put dishes in dishwasher",
              childProfileId: "child-1",
              recurrence: { days: [today] },
              requiresApproval: false
            }
          ],
          completions: [
            {
              id: "completion-1",
              itemId: "chore-1",
              itemType: "chore",
              childProfileId: "child-1",
              status: "completed",
              scheduledDay: today,
              celebrationImageUrl: "/generated-assets/completions/completion-1.png",
              celebrationPrompt: "saved prompt",
              celebrationTheme: "race cars"
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    expect(await screen.findByAltText(/celebration image for put dishes in dishwasher/i)).toHaveAttribute(
      "src",
      "/generated-assets/completions/completion-1.png"
    );
  });

  it("rehydrates a saved completion image for an earlier day in the current week after state load", async () => {
    const today = currentWeekday();
    const earlierDay = previousWeekday(today);

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "put dishes in dishwasher",
              childProfileId: "child-1",
              recurrence: { days: [earlierDay, today] },
              requiresApproval: false
            }
          ],
          completions: [
            {
              id: "completion-1",
              itemId: "chore-1",
              itemType: "chore",
              childProfileId: "child-1",
              status: "completed",
              scheduledDay: earlierDay,
              celebrationImageUrl: "data:image/png;base64,persisted-earlier",
              celebrationPrompt: "saved prompt",
              celebrationTheme: "race cars"
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    expect(
      await screen.findByAltText(/celebration image for put dishes in dishwasher on/i)
    ).toHaveAttribute("src", "data:image/png;base64,persisted-earlier");
  });

  it("shows an integrated sticker chart header with current month, weekday context, and child switching", async () => {
    const now = new Date();
    const currentMonth = now.toLocaleString("en-US", { month: "long" });
    const sundayStart = new Date(now);
    sundayStart.setDate(sundayStart.getDate() - sundayStart.getDay());
    const visibleDayNumbers = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(sundayStart);
      day.setDate(sundayStart.getDate() + index);
      return day.getDate();
    });

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: []
            },
            {
              id: "child-2",
              name: "Zoe",
              color: "#60A5FA",
              motivators: []
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    expect(await screen.findByText(/weekly sticker progress/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(currentMonth, "i"))).toBeInTheDocument();
    expect(screen.queryByText(/mon\s+to\s+sun/i)).not.toBeInTheDocument();
    const columnHeaders = screen.getAllByRole("columnheader");
    expect(columnHeaders[1]).toHaveTextContent(/Sunday/i);
    expect(columnHeaders[7]).toHaveTextContent(/Saturday/i);
    for (const dayNumber of visibleDayNumbers) {
      expect(screen.getByText(new RegExp(`^${dayNumber}$`))).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Milo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zoe" })).toBeInTheDocument();
    expect(screen.queryByText(/choose which child to view in the sticker chart/i)).not.toBeInTheDocument();
  });

  it("offers month and gallery history views with child filtering", async () => {
    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: []
            },
            {
              id: "child-2",
              name: "Zoe",
              color: "#60A5FA",
              motivators: []
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "Put dishes in dishwasher",
              childProfileId: "child-1",
              recurrence: { days: ["monday"] },
              requiresApproval: false
            },
            {
              id: "chore-2",
              name: "Feed the cat",
              childProfileId: "child-1",
              recurrence: { days: ["tuesday"] },
              requiresApproval: false
            },
            {
              id: "chore-3",
              name: "Water the plants",
              childProfileId: "child-2",
              recurrence: { days: ["tuesday"] },
              requiresApproval: false
            }
          ],
          completions: [
            {
              id: "completion-1",
              itemId: "chore-1",
              itemType: "chore",
              childProfileId: "child-1",
              status: "completed",
              scheduledDay: "monday",
              completedAt: "2026-05-01T17:15:00.000Z",
              celebrationImageUrl: "data:image/png;base64,history-1"
            },
            {
              id: "completion-2",
              itemId: "chore-2",
              itemType: "chore",
              childProfileId: "child-1",
              status: "completed",
              scheduledDay: "tuesday",
              completedAt: "2026-05-02T17:15:00.000Z",
              celebrationImageUrl: "data:image/png;base64,history-2"
            },
            {
              id: "completion-3",
              itemId: "chore-1",
              itemType: "chore",
              childProfileId: "child-1",
              status: "completed",
              scheduledDay: "tuesday",
              completedAt: "2026-05-02T18:15:00.000Z",
              celebrationImageUrl: "data:image/png;base64,history-3"
            },
            {
              id: "completion-4",
              itemId: "chore-3",
              itemType: "chore",
              childProfileId: "child-2",
              status: "completed",
              scheduledDay: "tuesday",
              completedAt: "2026-05-02T19:15:00.000Z",
              celebrationImageUrl: "data:image/png;base64,history-4"
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /history/i }));

    expect(await screen.findByRole("button", { name: /month view/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: /gallery view/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous month/i })).toHaveTextContent("<<");
    expect(screen.getByRole("button", { name: /next month/i })).toHaveTextContent(">>");
    expect(screen.getByRole("grid", { name: /sticker calendar for may 2026/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/filter history by child/i)).toHaveDisplayValue(/all children/i);
    expect(screen.getByRole("button", { name: /may 1, 2026/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /may 2, 2026/i })).toBeInTheDocument();
    expect(screen.getAllByAltText(/earned on may 2, 2026/i)).toHaveLength(3);

    fireEvent.click(screen.getByRole("button", { name: /may 2, 2026/i }));
    expect(await screen.findByText(/showing stickers from may 2, 2026/i)).toBeInTheDocument();
    expect(screen.getByAltText(/saved sticker for feed the cat/i)).toBeInTheDocument();
    expect(screen.getByAltText(/saved sticker for put dishes in dishwasher/i)).toBeInTheDocument();
    expect(screen.getByAltText(/saved sticker for water the plants/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/filter history by child/i), {
      target: { value: "child-1" }
    });
    expect(screen.getByLabelText(/filter history by child/i)).toHaveDisplayValue(/milo/i);
    expect(screen.getAllByAltText(/earned on may 2, 2026/i)).toHaveLength(2);
    expect(screen.getByAltText(/saved sticker for feed the cat/i)).toBeInTheDocument();
    expect(screen.getByAltText(/saved sticker for put dishes in dishwasher/i)).toBeInTheDocument();
    expect(screen.queryByAltText(/saved sticker for water the plants/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /gallery view/i }));
    expect(
      await screen.findAllByAltText(/saved sticker for put dishes in dishwasher/i)
    ).toHaveLength(2);
    expect(screen.getByAltText(/saved sticker for feed the cat/i)).toBeInTheDocument();
    expect(screen.queryByAltText(/saved sticker for water the plants/i)).not.toBeInTheDocument();
    expect(screen.getByRole("list")).toHaveClass(
      "history-grid",
      "history-grid--immersive",
      "history-grid--masonry",
      "history-grid--full-width"
    );
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("history-card--immersive");
    expect(screen.getAllByRole("listitem")[0]?.className).toMatch(/history-card--(feature|tall|wide)/);
    expect(screen.getByText(/feed the cat/i).closest(".history-copy")).toHaveClass(
      "history-copy--overlay"
    );

    fireEvent.change(screen.getByLabelText(/filter history by child/i), {
      target: { value: "all" }
    });
    expect(screen.getByLabelText(/filter history by child/i)).toHaveDisplayValue(/all children/i);
    expect(await screen.findByAltText(/saved sticker for water the plants/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /view saved sticker for feed the cat/i }));
    expect(
      await screen.findByRole("dialog", { name: /sticker spotlight for feed the cat/i })
    ).toBeInTheDocument();
    expect(screen.getByAltText(/spotlight sticker for feed the cat/i)).toBeInTheDocument();
  });

  it("renders history structure before sticker images finish loading", async () => {
    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: []
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "Put dishes in dishwasher",
              childProfileId: "child-1",
              recurrence: { days: ["monday"] },
              requiresApproval: false
            }
          ],
          completions: [
            {
              id: "completion-1",
              itemId: "chore-1",
              itemType: "chore",
              childProfileId: "child-1",
              status: "completed",
              scheduledDay: "monday",
              completedAt: "2026-05-02T17:15:00.000Z",
              celebrationImageUrl: "data:image/png;base64,history-1"
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /history/i }));

    expect(await screen.findByRole("grid", { name: /sticker calendar for may 2026/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/loading sticker earned on may 2, 2026 for put dishes in dishwasher/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /gallery view/i }));
    expect(await screen.findByRole("list")).toBeInTheDocument();
    expect(screen.getByLabelText(/loading saved sticker for put dishes in dishwasher/i)).toBeInTheDocument();
  });

  it("toggles only today's matrix cell and shows celebration art in that cell", async () => {
    const today = currentWeekday();
    let resolveImageResponse!: (value: Response) => void;

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "put dishes in dishwasher",
              childProfileId: "child-1",
              recurrence: { days: ["monday", "tuesday", "wednesday", "thursday", "friday"] },
              requiresApproval: false
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "completion-1",
            itemId: "chore-1",
            itemType: "chore",
            childProfileId: "child-1",
            status: "completed",
            scheduledDay: today
          }),
          { status: 201 }
        )
      )
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveImageResponse = resolve;
          })
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    render(<App />);

    const cellToggle = await screen.findByRole("button", {
      name: new RegExp(`toggle put dishes in dishwasher for ${today}`, "i")
    });
    fireEvent.click(cellToggle);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        "/api/completions",
        expect.objectContaining({ method: "POST" })
      );
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        4,
        "/api/completion-images",
        expect.objectContaining({ method: "POST" })
      );
    });

    expect(
      screen.getByRole("dialog", {
        name: /celebration for put dishes in dishwasher/i
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/creating sticker/i)).toBeInTheDocument();

    resolveImageResponse(
      new Response(
        JSON.stringify({
          imageUrl: "data:image/png;base64,celebration",
          prompt: "prompt text",
          selectedTheme: "race cars"
        }),
        { status: 200 }
      )
    );

    expect(
      await screen.findByAltText(/celebration spotlight for put dishes in dishwasher/i)
    ).toBeInTheDocument();
    expect(
      screen.getByAltText(/celebration image for put dishes in dishwasher/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", {
        name: /celebration for put dishes in dishwasher/i
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(`view sticker for put dishes in dishwasher on ${today}`, "i")
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(`delete sticker for put dishes in dishwasher on ${today}`, "i")
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/sticker reward target for put dishes in dishwasher/i)
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", {
          name: /celebration for put dishes in dishwasher/i
        })
      ).not.toBeInTheDocument();
    }, { timeout: 2500 });

    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`delete sticker for put dishes in dishwasher on ${today}`, "i")
      })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        5,
        "/api/completions/completion-1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  it("opens a completed sticker in a maximized view and keeps deletion on a separate control", async () => {
    const today = currentWeekday();
    let resolveImageResponse!: (value: Response) => void;

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "put dishes in dishwasher",
              childProfileId: "child-1",
              recurrence: { days: [today] },
              requiresApproval: false
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse())
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "completion-1",
            itemId: "chore-1",
            itemType: "chore",
            childProfileId: "child-1",
            status: "completed",
            scheduledDay: today
          }),
          { status: 201 }
        )
      )
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveImageResponse = resolve;
          })
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: new RegExp(`toggle put dishes in dishwasher for ${today}`, "i")
      })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        4,
        "/api/completion-images",
        expect.objectContaining({ method: "POST" })
      );
    });

    resolveImageResponse(
      new Response(
        JSON.stringify({
          imageUrl: "data:image/png;base64,celebration",
          prompt: "prompt text",
          selectedTheme: "race cars"
        }),
        { status: 200 }
      )
    );

    expect(
      await screen.findByRole("button", {
        name: new RegExp(`view sticker for put dishes in dishwasher on ${today}`, "i")
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: new RegExp(`delete sticker for put dishes in dishwasher on ${today}`, "i")
      })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`view sticker for put dishes in dishwasher on ${today}`, "i")
      })
    );

    expect(
      await screen.findByRole("dialog", {
        name: /sticker view for put dishes in dishwasher/i
      })
    ).toBeInTheDocument();
    expect(
      screen.getByAltText(/expanded sticker for put dishes in dishwasher/i)
    ).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) => url === "/api/completions/completion-1" && init?.method === "DELETE"
      )
    ).toBe(false);

    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`delete sticker for put dishes in dishwasher on ${today}`, "i")
      })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/completions/completion-1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  it("opens a saved sticker from an earlier day in the week without exposing a delete control there", async () => {
    const today = currentWeekday();
    const earlierDay = previousWeekday(today);

    fetchMock
      .mockResolvedValueOnce(
        stateResponse({
          childProfiles: [
            {
              id: "child-1",
              name: "Milo",
              color: "#34D399",
              motivators: ["race cars"]
            }
          ],
          chores: [
            {
              id: "chore-1",
              name: "put dishes in dishwasher",
              childProfileId: "child-1",
              recurrence: { days: [earlierDay, today] },
              requiresApproval: false
            }
          ],
          completions: [
            {
              id: "completion-1",
              itemId: "chore-1",
              itemType: "chore",
              childProfileId: "child-1",
              status: "completed",
              scheduledDay: earlierDay,
              celebrationImageUrl: "data:image/png;base64,earlier-sticker",
              completedAt: "2026-05-01T18:15:00.000Z"
            }
          ]
        })
      )
      .mockResolvedValueOnce(todayPlanResponse());

    render(<App />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: new RegExp(`view sticker for put dishes in dishwasher on ${earlierDay}`, "i")
      })
    );

    expect(
      await screen.findByRole("dialog", {
        name: /sticker view for put dishes in dishwasher/i
      })
    ).toBeInTheDocument();
    expect(screen.getByAltText(/expanded sticker for put dishes in dishwasher/i)).toHaveAttribute(
      "src",
      "data:image/png;base64,earlier-sticker"
    );
    expect(
      screen.queryByRole("button", {
        name: new RegExp(`delete sticker for put dishes in dishwasher on ${earlierDay}`, "i")
      })
    ).not.toBeInTheDocument();
  });
});
