import { Hono } from "hono";
import { corsMiddleware } from "./middleware/cors";
import { healthRoute } from "./routes/health";
import { authRoute } from "./routes/auth";
import type { Bindings } from "./types/env";

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", corsMiddleware);

app.get("/", (c) => {
  return c.json({ ok: true, service: "qahal-worker" });
});

app.route("/health", healthRoute);
app.route("/auth", authRoute);

app.onError((err, c) => {
  console.error("Unhandled worker error", err);
  return c.json({ ok: false, error: "internal_server_error" }, 500);
});

export default app;
