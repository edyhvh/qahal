export interface VerifyInitDataInput {
  initData: string;
  botToken?: string;
  maxAgeSeconds: number;
}

export interface VerifyInitDataResult {
  valid: boolean;
  reason?: string;
}

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

export const verifyTelegramInitData = ({ initData, botToken, maxAgeSeconds }: VerifyInitDataInput): VerifyInitDataResult => {
  if (!initData) {
    return { valid: false, reason: "missing_init_data" };
  }

  if (!botToken) {
    return { valid: false, reason: "missing_bot_token" };
  }

  const authDate = extractAuthDate(initData);
  if (!authDate) {
    return { valid: false, reason: "missing_auth_date" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > maxAgeSeconds) {
    return { valid: false, reason: "init_data_expired" };
  }

  // TODO: Replace with full Telegram HMAC signature validation.
  return { valid: true };
};
