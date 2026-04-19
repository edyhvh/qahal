export interface VerifyInitDataInput {
  initData: string;
  botToken?: string;
  maxAgeSeconds: number;
}

export interface VerifyInitDataResult {
  valid: boolean;
  reason?: string;
  user?: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
    language_code?: string;
  };
}

const encoder = new TextEncoder();

const toHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
};

const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
};

const hmacSha256 = async (keyBytes: Uint8Array, message: string): Promise<Uint8Array> => {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return new Uint8Array(signature);
};

const parseTelegramUser = (params: URLSearchParams): VerifyInitDataResult["user"] => {
  const rawUser = params.get("user");
  if (!rawUser) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(rawUser) as Record<string, unknown>;
    if (typeof parsed.id !== "number") {
      return undefined;
    }

    return {
      id: parsed.id,
      username: typeof parsed.username === "string" ? parsed.username : undefined,
      first_name: typeof parsed.first_name === "string" ? parsed.first_name : undefined,
      last_name: typeof parsed.last_name === "string" ? parsed.last_name : undefined,
      photo_url: typeof parsed.photo_url === "string" ? parsed.photo_url : undefined,
      language_code: typeof parsed.language_code === "string" ? parsed.language_code : undefined
    };
  } catch {
    return undefined;
  }
};

const extractAuthDate = (initData: string): number | null => {
  const params = new URLSearchParams(initData);
  const raw = params.get("auth_date");
  if (!raw) {
    return null;
  }

  const authDate = Number(raw);
  if (!Number.isFinite(authDate)) {
    return null;
  }

  return authDate;
};

export const verifyTelegramInitData = async ({
  initData,
  botToken,
  maxAgeSeconds
}: VerifyInitDataInput): Promise<VerifyInitDataResult> => {
  if (!initData) {
    return { valid: false, reason: "missing_init_data" };
  }

  if (!botToken) {
    return { valid: false, reason: "missing_bot_token" };
  }

  const params = new URLSearchParams(initData);
  const authDate = extractAuthDate(initData);
  if (!authDate) {
    return { valid: false, reason: "missing_auth_date" };
  }

  const hash = params.get("hash");
  if (!hash) {
    return { valid: false, reason: "missing_hash" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (authDate > now + 30) {
    return { valid: false, reason: "auth_date_in_future" };
  }

  if (now - authDate > maxAgeSeconds) {
    return { valid: false, reason: "init_data_expired" };
  }

  const dataCheckString = Array.from(params.entries())
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = await hmacSha256(encoder.encode("WebAppData"), botToken);
  const computedHash = toHex(await hmacSha256(secretKey, dataCheckString));

  if (!timingSafeEqual(computedHash, hash)) {
    return { valid: false, reason: "invalid_hash" };
  }

  return {
    valid: true,
    user: parseTelegramUser(params)
  };
};
