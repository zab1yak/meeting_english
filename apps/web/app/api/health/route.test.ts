import { healthResponseSchema } from '@me/shared';
import { describe, expect, it } from 'vitest';

import { GET } from './route';

describe('GET /api/health', () => {
  it('отвечает 200 и валидным телом', async () => {
    const res = GET();
    expect(res.status).toBe(200);
    expect(healthResponseSchema.parse(await res.json())).toEqual({ status: 'ok', service: 'web' });
  });
});
