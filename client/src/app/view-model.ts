import { weekDays } from "./constants";
import type { Chore, Completion, Routine, TabletTask, Weekday, WeeklyMatrixRow } from "./types";

export function currentWeekday(dayIndex = new Date().getDay()): Weekday {
  return weekDays[dayIndex]?.value ?? "sunday";
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

function startOfVisibleWeek(now: Date): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function endOfVisibleWeek(now: Date): Date {
  const end = startOfVisibleWeek(now);
  end.setDate(end.getDate() + 7);
  return end;
}

export function isCompletionInVisibleWeek(completion: Completion, now = new Date()): boolean {
  if (!completion.completedAt) {
    return false;
  }

  const completedAt = new Date(completion.completedAt);
  if (Number.isNaN(completedAt.getTime())) {
    return false;
  }

  const weekStart = startOfVisibleWeek(now);
  const weekEnd = endOfVisibleWeek(now);
  return completedAt >= weekStart && completedAt < weekEnd;
}

export function buildWeeklyMatrixRows({
  childProfileId,
  routines,
  chores,
  completions,
  currentDay,
  now = new Date()
}: {
  childProfileId: string;
  routines: Routine[];
  chores: Chore[];
  completions: Completion[];
  currentDay: Weekday;
  now?: Date;
}): WeeklyMatrixRow[] {
  const visibleWeekCompletions = completions.filter((completion) => isCompletionInVisibleWeek(completion, now));

  const routineRows: WeeklyMatrixRow[] = routines
    .filter((routine) => routine.childProfileId === childProfileId)
    .map((routine) => ({
      id: routine.id,
      name: routine.name,
      itemType: "routine",
      itemId: routine.id,
      childProfileId: routine.childProfileId,
      rewardType: routine.reward?.type ?? null,
      imageUrl: routine.imageUrl || null,
      steps: routine.steps.map((step) => ({
        id: step.id,
        label: step.label,
        imageUrl: step.imageUrl || null
      })),
      cells: weekDays.map((day) => {
        const completion = visibleWeekCompletions.find(
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
      imageUrl: chore.imageUrl || null,
      steps: [],
      cells: weekDays.map((day) => {
        const completion = visibleWeekCompletions.find(
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
