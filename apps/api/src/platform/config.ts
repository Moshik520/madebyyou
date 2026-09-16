import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PAYMENT_PROVIDER: z.enum(['mock']).default('mock'),
  LLM_PROVIDER: z.enum(['agent-sdk']).default('agent-sdk'),
  IMAGE_PROVIDER: z.enum(['mock', 'openai']).default('mock'),
  OPENAI_API_KEY: z.string().min(1).optional(),
  IMAGE_QUALITY: z.enum(['low', 'medium', 'high', 'xhigh', 'max']).default('low'),



});

const parsed = envSchema
  .refine(
    (env) => env.IMAGE_PROVIDER !== 'openai' || Boolean(env.OPENAI_API_KEY),
    {
      message: 'OPENAI_API_KEY is required when IMAGE_PROVIDER is "openai"',
      path: ['OPENAI_API_KEY'],
    },
  )
  .safeParse(process.env);


if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(z.treeifyError(parsed.error), null, 2));
  process.exit(1);
}

export const config = parsed.data;
