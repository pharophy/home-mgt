import type { Request, Response } from "express";

import type { ActorContext, ActorRole, AuthorizedRequest } from "../domain/types.js";

export function getActor(req: Request): ActorContext | null {
  const role = req.header("x-actor-role");
  const id = req.header("x-actor-id");

  if (
    (role === "parentAdmin" || role === "childDisplay") &&
    typeof id === "string" &&
    id.length > 0
  ) {
    return { role, id };
  }

  return null;
}

export function requireActor(req: Request, res: Response): req is AuthorizedRequest {
  const actor = getActor(req);
  if (!actor) {
    res.status(401).json({ error: "Missing actor context" });
    return false;
  }

  (req as AuthorizedRequest).actor = actor;
  return true;
}

export function ensureRole(
  req: Request,
  res: Response,
  roles: ActorRole[]
): req is AuthorizedRequest {
  if (!requireActor(req, res)) {
    return false;
  }

  if (!roles.includes(req.actor.role)) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }

  return true;
}
