import { z } from 'zod';

/** Пустая строка из .env (`REDIS_URL=`) считается отсутствующим значением. */
const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

const envSchema = z.object({
  REALTIME_PORT: z.coerce.number().int().min(0).max(65535).default(3001),
  // Origin без пути и завершающего слэша, иначе CORS не совпадёт
  WEB_ORIGIN: z
    .url()
    .default('http://localhost:3000')
    .transform((value) => new URL(value).origin),
  REDIS_URL: z.preprocess(emptyToUndefined, z.url().optional()),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: NodeJS.ProcessEnv) {
  return envSchema.safeParse(source);
}
