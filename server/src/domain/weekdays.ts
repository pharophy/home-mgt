import type { Weekday } from "./types.js";

export const weekdays = new Set<Weekday>([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
]);

export function isWeekday(value: string): value is Weekday {
  return weekdays.has(value as Weekday);
}
