import { describe, expect, it } from "vitest";

import type { Completion, Routine, TabletTask, Weekday } from "./types";
import {
  buildWeeklyMatrixRows,
  currentWeekday,
  getActiveChoreTask,
  getActiveRoutineTask,
  getActiveTabletTask,
  toggleDay
} from "./view-model";

describe("app view model helpers", () => {
  it("toggles weekdays into and out of a selected list", () => {
    expect(toggleDay(["monday"], "wednesday")).toEqual(["monday", "wednesday"]);
    expect(toggleDay(["monday", "wednesday"], "monday")).toEqual(["wednesday"]);
  });

  it("returns monday-first weekday values from Date#getDay indexes", () => {
    const dayIndexes = [0, 1, 2, 3, 4, 5, 6];
    const weekdays: Weekday[] = dayIndexes.map((dayIndex) => currentWeekday(dayIndex));

    expect(weekdays).toEqual([
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ]);
  });

  it("derives the next active routine step and chore task", () => {
    const routine: Routine = {
      id: "routine-1",
      name: "Morning helper",
      childProfileId: "child-1",
      schedule: {
        days: ["monday"]
      },
      steps: [
        { id: "step-1", label: "Get dressed", order: 0 },
        { id: "step-2", label: "Brush teeth", order: 1 }
      ]
    };

    const routineTask = getActiveRoutineTask([routine], { "routine-1": 1 });
    expect(routineTask).toEqual({
      kind: "routineStep",
      routine,
      step: routine.steps[1],
      stepIndex: 1
    } satisfies TabletTask);

    const choreTask = getActiveChoreTask(
      [
        {
          id: "chore-1",
          name: "Carry napkins",
          childProfileId: "child-1",
          recurrence: {
            days: ["monday"]
          },
          requiresApproval: true
        }
      ],
      []
    );
    expect(choreTask).toEqual({
      kind: "chore",
      chore: {
        id: "chore-1",
        name: "Carry napkins",
        childProfileId: "child-1",
        recurrence: {
          days: ["monday"]
        },
        requiresApproval: true
      }
    } satisfies TabletTask);

    expect(getActiveTabletTask(routineTask, choreTask)).toEqual(routineTask);
  });

  it("builds weekly matrix rows with generated pictures for routines and subtasks", () => {
    const rows = buildWeeklyMatrixRows({
      childProfileId: "child-1",
      routines: [
        {
          id: "routine-1",
          name: "Morning helper",
          childProfileId: "child-1",
          imageUrl: "",
          schedule: { days: ["monday"] },
          steps: [
            { id: "step-1", label: "Get dressed", icon: "", imageUrl: "", order: 0 },
            { id: "step-2", label: "Brush teeth", icon: "", imageUrl: "", order: 1 }
          ]
        }
      ],
      chores: [
        {
          id: "chore-1",
          name: "Carry napkins",
          childProfileId: "child-1",
          imageUrl: "",
          recurrence: { days: ["monday"] },
          requiresApproval: false
        }
      ],
      completions: [],
      currentDay: "monday"
    });

    expect(rows[0]).toMatchObject({
      id: "routine-1",
      imageUrl: null,
      steps: [
        {
          id: "step-1",
          label: "Get dressed",
          imageUrl: null
        },
        {
          id: "step-2",
          label: "Brush teeth",
          imageUrl: null
        }
      ]
    });
    expect(rows[1]).toMatchObject({
      id: "chore-1",
      imageUrl: null
    });
  });

  it("ignores prior-week completions when building current-week matrix cells", () => {
    const completions: Completion[] = [
      {
        id: "completion-1",
        itemId: "chore-1",
        itemType: "chore",
        childProfileId: "child-1",
        scheduledDay: "friday",
        status: "completed",
        completedAt: "2026-05-01T18:15:00.000Z"
      }
    ];

    const rows = buildWeeklyMatrixRows({
      childProfileId: "child-1",
      routines: [],
      chores: [
        {
          id: "chore-1",
          name: "Carry napkins",
          childProfileId: "child-1",
          imageUrl: "",
          recurrence: { days: ["friday", "monday"] },
          requiresApproval: false
        }
      ],
      completions,
      currentDay: "monday",
      now: new Date("2026-05-04T12:00:00.000Z")
    });

    expect(rows[0]?.cells.find((cell) => cell.day === "friday")).toMatchObject({
      day: "friday",
      scheduled: true,
      interactive: false,
      completed: false
    });
  });

  it("keeps earlier current-week completions visible in the matrix", () => {
    const completions: Completion[] = [
      {
        id: "completion-1",
        itemId: "chore-1",
        itemType: "chore",
        childProfileId: "child-1",
        scheduledDay: "friday",
        status: "completed",
        completedAt: "2026-05-08T18:15:00.000Z"
      }
    ];

    const rows = buildWeeklyMatrixRows({
      childProfileId: "child-1",
      routines: [],
      chores: [
        {
          id: "chore-1",
          name: "Carry napkins",
          childProfileId: "child-1",
          imageUrl: "",
          recurrence: { days: ["friday", "saturday"] },
          requiresApproval: false
        }
      ],
      completions,
      currentDay: "saturday",
      now: new Date("2026-05-09T12:00:00.000Z")
    });

    expect(rows[0]?.cells.find((cell) => cell.day === "friday")).toMatchObject({
      day: "friday",
      scheduled: true,
      interactive: false,
      completed: true,
      completionId: "completion-1"
    });
  });
});
