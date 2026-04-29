import type { Response } from "express";

import { isWeekday } from "../domain/weekdays.js";
import type { RewardDefinition, ValidationErrorBody, Weekday } from "../domain/types.js";

export function isRewardDefinition(value: unknown): value is RewardDefinition {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RewardDefinition>;
  return (
    (candidate.type === "stars" || candidate.type === "stickers") &&
    typeof candidate.amount === "number" &&
    candidate.amount > 0
  );
}

export function validateDays(days: unknown): days is Weekday[] {
  return Array.isArray(days) && days.length > 0 && days.every((day) => typeof day === "string" && isWeekday(day));
}

export function sendValidationError(res: Response, error: string): Response<ValidationErrorBody> {
  return res.status(400).json({ error });
}
