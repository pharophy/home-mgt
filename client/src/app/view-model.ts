import { weekDays } from "./constants";
import type { Chore, Completion, Routine, TabletTask, Weekday, WeeklyMatrixRow } from "./types";

export function currentWeekday(dayIndex = new Date().getDay()): Weekday {
  return weekDays[(dayIndex + 6) % 7]?.value ?? "monday";
}

export function toggleDay(days: Weekday[], day: Weekday): Weekday[] {
  return days.includes(day)
    ? days.filter((value) => value !== day)
    : [...days, day];
}

export function getActiveRoutineTask(
  routines: Routine[],
  routineProgress: Record<string, number>
): Extract<TabletTask, { kind: "routineStep" }> | null {
  return (
    routines
      .map((routine) => {
        if (!Array.isArray(routine.steps) || routine.steps.length === 0) {
          return null;
        }

        const stepIndex = routineProgress[routine.id] ?? 0;
        const step = routine.steps[stepIndex];
        if (!step) {
          return null;
        }

        return {
          kind: "routineStep" as const,
          routine,
          step,
          stepIndex
        };
      })
      .find(Boolean) ?? null
  );
}

export function getActiveChoreTask(
  chores: Chore[],
  completedChoreIds: string[]
): Extract<TabletTask, { kind: "chore" }> | null {
  return (
    chores
      .filter((chore) => !completedChoreIds.includes(chore.id))
      .map((chore) => ({
        kind: "chore" as const,
        chore
      }))
      .find(Boolean) ?? null
  );
}

export function getActiveTabletTask(
  routineTask: Extract<TabletTask, { kind: "routineStep" }> | null,
  choreTask: Extract<TabletTask, { kind: "chore" }> | null
): TabletTask | null {
  return routineTask ?? choreTask ?? null;
}

export function currentDayNumber(now = new Date()): number {
  return now.getDate();
}

export function buildWeeklyMatrixRows({
  childProfileId,
  routines,
  chores,
  completions,
  currentDay
}: {
  childProfileId: string;
  routines: Routine[];
  chores: Chore[];
  completions: Completion[];
  currentDay: Weekday;
}): WeeklyMatrixRow[] {
  const routineRows: WeeklyMatrixRow[] = routines
    .filter((routine) => routine.childProfileId === childProfileId)
    .map((routine) => ({
      id: routine.id,
      name: routine.name,
      itemType: "routine",
      itemId: routine.id,
      childProfileId: routine.childProfileId,
      rewardType: routine.reward?.type ?? null,
      cells: weekDays.map((day) => {
        const completion = completions.find(
          (entry) =>
            entry.childProfileId === childProfileId &&
            entry.itemType === "routine" &&
            entry.itemId === routine.id &&
            entry.scheduledDay === day.value &&
            (entry.status === "completed" || entry.status === "approved")
        );

        return {
          day: day.value,
          scheduled: routine.schedule.days.includes(day.value),
          interactive: day.value === currentDay && routine.schedule.days.includes(day.value),
          completed: Boolean(completion),
          completionId: completion?.id
        };
      })
    }));

  const choreRows: WeeklyMatrixRow[] = chores
    .filter((chore) => chore.childProfileId === childProfileId)
    .map((chore) => ({
      id: chore.id,
      name: chore.name,
      itemType: "chore",
      itemId: chore.id,
      childProfileId: chore.childProfileId,
      rewardType: chore.reward?.type ?? null,
      cells: weekDays.map((day) => {
        const completion = completions.find(
          (entry) =>
            entry.childProfileId === childProfileId &&
            entry.itemType === "chore" &&
            entry.itemId === chore.id &&
            entry.scheduledDay === day.value &&
            (entry.status === "completed" || entry.status === "approved")
        );

        return {
          day: day.value,
          scheduled: chore.recurrence.days.includes(day.value),
          interactive: day.value === currentDay && chore.recurrence.days.includes(day.value),
          completed: Boolean(completion),
          completionId: completion?.id
        };
      })
    }));

  return [...routineRows, ...choreRows];
}
