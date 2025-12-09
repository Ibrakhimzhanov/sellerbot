import { z } from "zod";

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, "Missing TELEGRAM_BOT_TOKEN"),
  DATABASE_URL: z.string().min(1, "Missing DATABASE_URL"),
  ADMIN_TELEGRAM_ID: z.coerce.number(),
  PAYMENT_CARD_NUMBER: z.string().min(1, "Missing PAYMENT_CARD_NUMBER"),
  SUPPORT_USERNAME: z.string().default("@support")
});

export const env = envSchema.parse({
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  DATABASE_URL: process.env.DATABASE_URL,
  ADMIN_TELEGRAM_ID: process.env.ADMIN_TELEGRAM_ID,
  PAYMENT_CARD_NUMBER: process.env.PAYMENT_CARD_NUMBER,
  SUPPORT_USERNAME: process.env.SUPPORT_USERNAME ?? "@support"
});

export type Env = typeof env;
