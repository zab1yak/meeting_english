import { describe, expect, it } from 'vitest';

import { healthResponseSchema } from './health';

describe('healthResponseSchema', () => {
  it('принимает корректный ответ', () => {
    expect(healthResponseSchema.parse({ status: 'ok', service: 'web' })).toEqual({
      status: 'ok',
      service: 'web',
    });
  });

  it('отклоняет неизвестный сервис', () => {
    expect(healthResponseSchema.safeParse({ status: 'ok', service: 'db' }).success).toBe(false);
  });
});
