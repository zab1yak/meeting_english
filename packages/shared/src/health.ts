import { z } from 'zod';

/** Ответ эндпоинтов /health у web и realtime. */
export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.enum(['web', 'realtime']),
  redis: z.enum(['connected', 'disabled', 'error']).optional(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
