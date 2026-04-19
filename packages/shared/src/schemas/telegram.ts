import { z } from "zod";

export const telegramVerifyRequestSchema = z.object({
  initData: z.string().min(1)
});

export type TelegramVerifyRequest = z.infer<typeof telegramVerifyRequestSchema>;
