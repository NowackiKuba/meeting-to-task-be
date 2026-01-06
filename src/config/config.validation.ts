import { DATABASE_CONFIG_SCHEMA } from 'src/orm/database.config';
import { z } from 'zod';

export const BASE_CONFIG = z.object({
  ENV: z.enum(['development', 'production']).default('production'),
  PORT: z.coerce.number().optional().default(8080),
  ORIGIN: z.string().optional().default('http://localhost:3000'),
  VERSION: z.string().optional().default('1.0'),
  API_KEY: z.string().uuid().optional(),
  JWT_SECRET: z.string(),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  OPENAI_API_KEY: z.string(),
  ANTHROPIC_API_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_API_KEY: z.string(),
  STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  STRIPE_PRICE_ID_BASIC: z.string(),
  STRIPE_PRICE_ID_PRO: z.string(),
  REDIS_HOST: z.string().optional().default('localhost'),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_USER: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  EMAIL_USER: z.string().optional(),
  GOOGLE_USER_EMAIL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REFRESH_TOKEN: z.string().optional(),
});

export const CONFIG_SCHEMA = BASE_CONFIG.merge(DATABASE_CONFIG_SCHEMA);

export type Config = z.infer<typeof CONFIG_SCHEMA>;
