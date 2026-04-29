import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import App from "./App";
import {
  __setInstructionalImageGeneratorForTests
} from "./app/completion-imagery";
import { currentWeekday } from "./app/view-model";

const fetchMock = vi.fn<typeof fetch>();

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

function expectSummaryMetric(label: string, value: number) {
  expect(screen.getByText(label).parentElement).toHaveTextContent(`${label}${value}`);
}

describe("App", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.location.hash = "";
    __setInstructionalImageGeneratorForTests(null);
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

    fireEvent.click(screen.getByRole("button", { name: /children/i }));
    fireEvent.change(screen.getByLabelText(/child name/i), {
      target: { value: "Milo" }
    });
    fireEvent.change(screen.getByLabelText(/avatar or photo url/i), {
      target: { value: "https://example.com/milo.png" }
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
    expect(screen.getByText("Ready for today's plan")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /matrix/i }));
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

    fireEvent.click(await screen.findByRole("button", { name: /activities/i }));
    fireEvent.change(screen.getByLabelText(/activity name/i), {
      target: { value: "Morning helper" }
    });
    fireEvent.change(screen.getByLabelText(/step 1 label/i), {
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

    expect(screen.getAllByText("Morning helper").length).toBeGreaterThan(0);
  });

  it("can generate an instructional image from activity details before saving", async () => {
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

    fireEvent.click(await screen.findByRole("button", { name: /activities/i }));
    fireEvent.change(screen.getByLabelText(/activity name/i), {
      target: { value: "Morning helper" }
    });
    fireEvent.change(screen.getByLabelText(/step 1 label/i), {
      target: { value: "Get dressed" }
    });
    fireEvent.click(screen.getByRole("button", { name: /generate instructional image/i }));

    expect(await screen.findByAltText(/instructional image preview/i)).toBeInTheDocument();

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
      imageUrl: "data:image/svg+xml;instructional",
      schedule: {
        days: ["monday"]
      },
      steps: [
        {
          label: "Get dressed",
          icon: "",
          imageUrl: ""
        }
      ]
    });
  });

  it("uses the unified activity flow to create a single-action activity with approval and rewards", async () => {
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
            requiresApproval: true,
            reward: {
              type: "stars",
              amount: 2
            }
          }),
          { status: 201 }
        )
      );

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /activities/i }));
    fireEvent.change(screen.getByLabelText(/activity name/i), {
      target: { value: "Carry napkins" }
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /monday activity/i }));
    fireEvent.click(screen.getByLabelText(/requires parent approval when there are no subtasks/i));
    fireEvent.change(screen.getByLabelText(/^reward amount$/i), {
      target: { value: "2" }
    });
    fireEvent.change(screen.getByLabelText(/^reward type$/i), {
      target: { value: "stars" }
    });
    fireEvent.change(screen.getByLabelText(/step 1 label/i), {
      target: { value: "" }
    });
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
            requiresApproval: true,
            reward: {
              type: "stars",
              amount: 2
            }
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

    fireEvent.click(await screen.findByRole("button", { name: /activities/i }));
    fireEvent.change(screen.getByLabelText(/activity name/i), {
      target: { value: "Carry napkins" }
    });
    fireEvent.click(screen.getByRole("button", { name: /save activity/i }));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      screen.getByText(/select at least one scheduled day before saving this activity/i)
    ).toBeInTheDocument();
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

    fireEvent.click(await screen.findByRole("button", { name: /activities/i }));
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

  it("shows completed, incomplete, and review items in the overview dashboard", async () => {
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
          completions: [
            {
              id: "completion-1",
              itemId: "step-1",
              itemType: "routineStep",
              childProfileId: "child-1",
              parentEntityType: "routine",
              parentEntityId: "routine-1",
              status: "completed"
            }
          ],
          rewards: [{ id: "reward-1", amount: 3, rewardType: "stars" }],
          pendingApprovals: [{ id: "approval-1", itemId: "chore-1", status: "pendingApproval" }]
        })
      )
      .mockResolvedValueOnce(
        todayPlanResponse({
          routines: [
            {
              id: "routine-1",
              name: "Morning helper",
              childProfileId: "child-1",
              schedule: { days: ["monday"] },
              steps: [{ id: "step-1", label: "Get dressed", order: 0 }]
            }
          ],
          chores: [{ id: "chore-1", name: "Carry napkins" }],
          pendingApprovals: [{ id: "approval-1", itemId: "chore-1", status: "pendingApproval" }]
        })
      );

    render(<App />);

    expect(await screen.findByText("Completed today")).toBeInTheDocument();
    expect(screen.getByText("Morning helper")).toBeInTheDocument();
    expect(screen.getAllByText("Carry napkins").length).toBeGreaterThan(0);
    expect(screen.getByText("1 pending approvals")).toBeInTheDocument();
    expect(screen.getByText("3 rewards earned")).toBeInTheDocument();
  });

  it("keeps tablet execution separate from parent controls and records progress as child display", async () => {
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
      .mockResolvedValueOnce(
        todayPlanResponse({
          routines: [
            {
              id: "routine-1",
              name: "Morning helper",
              childProfileId: "child-1",
              schedule: { days: ["monday"] },
              steps: [
                { id: "step-1", label: "Get dressed", order: 0 },
                { id: "step-2", label: "Brush teeth", order: 1 }
              ]
            }
          ]
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "completion-1",
            itemId: "step-1",
            itemType: "routineStep",
            childProfileId: "child-1",
            parentEntityType: "routine",
            parentEntityId: "routine-1",
            status: "completed"
          }),
          { status: 201 }
        )
      );

    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: /tablet/i }));

    expect(screen.queryByLabelText(/child name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/activity name/i)).not.toBeInTheDocument();
    expect(screen.getByText("Get dressed")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /i did it/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        "/api/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "x-actor-role": "childDisplay"
          })
        })
      );
    });

    expect(screen.getByText("Get dressed complete")).toBeInTheDocument();
  });

  it("opens on the weekly matrix without caregiver setup affordances", async () => {
    fetchMock.mockResolvedValueOnce(stateResponse());

    render(<App />);

    expect(await screen.findByRole("table", { name: /weekly completion matrix/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /children/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /history/i })).toBeInTheDocument();
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

    fireEvent.click(await screen.findByRole("button", { name: /children/i }));
    fireEvent.click(screen.getByRole("button", { name: /edit child milo/i }));
    fireEvent.change(screen.getByLabelText(/child name/i), {
      target: { value: "Miles" }
    });
    fireEvent.change(screen.getByLabelText(/avatar or photo url/i), {
      target: { value: "https://example.com/miles.png" }
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

    await screen.findByText("Completed today");
    expectSummaryMetric("Pending approvals", 1);
    expect(screen.getByText("3 rewards earned")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /children/i }));
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

    expectSummaryMetric("Pending approvals", 0);
    fireEvent.click(screen.getByRole("button", { name: /matrix/i }));
    expect(screen.getByText("1 rewards earned")).toBeInTheDocument();
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
    expect(screen.getByText("Milo")).toBeInTheDocument();
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

    fireEvent.click(await screen.findByRole("button", { name: /activities/i }));
    fireEvent.click(screen.getByRole("button", { name: /edit activity carry napkins/i }));
    fireEvent.change(screen.getByLabelText(/activity name/i), {
      target: { value: "Carry napkins outside" }
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /tuesday activity/i }));
    fireEvent.click(screen.getByLabelText(/requires parent approval when there are no subtasks/i));
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
    expectSummaryMetric("Pending approvals", 1);
    expect(screen.getByText("3 rewards earned")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /activities/i }));
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

    expectSummaryMetric("Pending approvals", 0);
    fireEvent.click(screen.getByRole("button", { name: /matrix/i }));
    expect(screen.getByText("1 rewards earned")).toBeInTheDocument();
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
            scheduledDay: "monday"
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

    expect(await screen.findByAltText(/celebration image for carry napkins/i)).toBeInTheDocument();
    expect(await screen.findByAltText(/celebration image for carry napkins/i)).toBeInTheDocument();
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
            scheduledDay: "monday"
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
        name: new RegExp(`toggle put dishes in dishwasher for ${today}`, "i")
      })
    ).toHaveClass("is-celebrating");
    expect(
      screen.queryByLabelText(/sticker reward target for put dishes in dishwasher/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/^Completed$/i)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", {
          name: /celebration for put dishes in dishwasher/i
        })
      ).not.toBeInTheDocument();
    }, { timeout: 2500 });

    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`toggle put dishes in dishwasher for ${today}`, "i")
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
});
