import { Hono } from "hono";
import type { Bindings } from "../types/env";

export const healthRoute = new Hono<{ Bindings: Bindings }>();

healthRoute.get("/", (c) => {
  return c.json({
    ok: true,
    service: "qahal-worker",
    timestamp: new Date().toISOString()
  });
});
