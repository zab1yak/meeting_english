import type { HealthResponse } from '@me/shared';

export const dynamic = 'force-dynamic';

export function GET(): Response {
  const body: HealthResponse = { status: 'ok', service: 'web' };
  return Response.json(body);
}
