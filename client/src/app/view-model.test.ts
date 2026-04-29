import { describe, expect, it } from "vitest";

import type { Routine, TabletTask, Weekday } from "./types";
import {
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
});
