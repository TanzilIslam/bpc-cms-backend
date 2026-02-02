import { z } from 'zod';

export const environmentSchema = z.object({
  // Application
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default(3000),
  API_PREFIX: z.string().default('api/v1'),

  // Database
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(Number).default(3306),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRATION: z.string().default('30d'),

  // File Upload
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).default(10485760),
  ALLOWED_FILE_TYPES: z
    .string()
    .default('image/jpeg,image/png,image/gif,application/pdf'),

  // Security
  THROTTLE_TTL: z.string().transform(Number).default(60),
  THROTTLE_LIMIT: z.string().transform(Number).default(10),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  config: Record<string, unknown>,
): Environment {
  const result = environmentSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues.map(
      (err) => `${err.path.join('.')}: ${err.message}`,
    );
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  return result.data;
}
