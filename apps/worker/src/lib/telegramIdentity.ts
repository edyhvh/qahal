import type { Context } from "hono";
import type { Bindings } from "../types/env";
import { verifyTelegramInitData } from "../services/telegramAuth";
import { isProductionRequest } from "./runtimeEnv";

type IdentityResolution = {
  isProduction: boolean;
  telegramId: number | null;
  reason?: string;
};

type RequiredIdentityResult =
  | {
      ok: true;
      telegramId: number;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

type OptionalIdentityResult =
  | {
      ok: true;
      telegramId?: number;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

const getInitDataFromHeaders = (
  c: Context<{ Bindings: Bindings }>,
): string | undefined => {
  const header = c.req.header("x-telegram-init-data")?.trim();
  if (header) {
    return header;
  }

  const authorization = c.req.header("authorization")?.trim();
  if (!authorization) {
    return undefined;
  }

  const lower = authorization.toLowerCase();
  if (!lower.startsWith("tma ")) {
    return undefined;
  }

  const raw = authorization.slice(4).trim();
  return raw.length > 0 ? raw : undefined;
};

const parseMaxAgeSeconds = (value: string | undefined): number => {
  const parsed = Number(value ?? "300");
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 300;
  }
  return Math.floor(parsed);
};

const resolveIdentity = async (
  c: Context<{ Bindings: Bindings }>,
): Promise<IdentityResolution> => {
  const isProduction = isProductionRequest(c);
  const initData = getInitDataFromHeaders(c);

  if (!initData) {
    return {
      isProduction,
      telegramId: null,
      reason: "missing_init_data",
    };
  }

  const verification = await verifyTelegramInitData({
    initData,
    botToken: c.env.TELEGRAM_BOT_TOKEN,
    maxAgeSeconds: parseMaxAgeSeconds(c.env.INITDATA_MAX_AGE_SECONDS),
  });

  if (!verification.valid || typeof verification.user?.id !== "number") {
    return {
      isProduction,
      telegramId: null,
      reason: verification.reason ?? "invalid_init_data",
    };
  }

  return {
    isProduction,
    telegramId: verification.user.id,
  };
};

export const requireTelegramIdentity = async (
  c: Context<{ Bindings: Bindings }>,
  requestedTelegramId: number,
): Promise<RequiredIdentityResult> => {
  const identity = await resolveIdentity(c);

  if (typeof identity.telegramId === "number") {
    if (identity.telegramId !== requestedTelegramId) {
      return {
        ok: false,
        status: 403,
        error: "telegram_id_mismatch",
      };
    }

    return {
      ok: true,
      telegramId: identity.telegramId,
    };
  }

  if (identity.isProduction) {
    return {
      ok: false,
      status: 401,
      error: identity.reason ?? "unauthorized",
    };
  }

  return {
    ok: true,
    telegramId: requestedTelegramId,
  };
};

export const resolveOptionalTelegramIdentity = async (
  c: Context<{ Bindings: Bindings }>,
  requestedTelegramId?: number,
): Promise<OptionalIdentityResult> => {
  const identity = await resolveIdentity(c);

  if (typeof identity.telegramId === "number") {
    if (
      typeof requestedTelegramId === "number" &&
      requestedTelegramId !== identity.telegramId
    ) {
      return {
        ok: false,
        status: 403,
        error: "telegram_id_mismatch",
      };
    }

    return {
      ok: true,
      telegramId: identity.telegramId,
    };
  }

  if (identity.isProduction && typeof requestedTelegramId === "number") {
    return {
      ok: false,
      status: 401,
      error: identity.reason ?? "unauthorized",
    };
  }

  return {
    ok: true,
    telegramId: requestedTelegramId,
  };
};
