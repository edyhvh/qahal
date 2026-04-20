import { cors } from "hono/cors";

const normalizeOrigin = (origin: string): string => {
  return origin.trim().toLowerCase().replace(/\/+$/, "");
};

const parseAllowedOrigins = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((origin) => normalizeOrigin(origin))
    .filter((origin) => origin.length > 0);
};

export const corsMiddleware = cors({
  origin: (origin, c) => {
    const allowedOrigins = parseAllowedOrigins(c.env.CORS_ALLOWED_ORIGINS);
    if (allowedOrigins.length === 0) {
      return "*";
    }

    if (!origin) {
      return "";
    }

    return allowedOrigins.includes(normalizeOrigin(origin)) ? origin : "";
  },
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
});
