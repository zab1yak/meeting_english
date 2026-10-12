import { describe, expect, it } from 'vitest';

import { parseEnv } from './env';

describe('parseEnv', () => {
  it('подставляет значения по умолчанию', () => {
    const result = parseEnv({});
    expect(result.success && result.data).toEqual({
      REALTIME_PORT: 3001,
      WEB_ORIGIN: 'http://localhost:3000',
      REDIS_URL: undefined,
    });
  });

  it('пустой REDIS_URL считается отсутствующим', () => {
    const result = parseEnv({ REDIS_URL: '' });
    expect(result.success && result.data.REDIS_URL).toBeUndefined();
  });

  it('приводит WEB_ORIGIN к origin без слэша', () => {
    const result = parseEnv({ WEB_ORIGIN: 'https://example.com/' });
    expect(result.success && result.data.WEB_ORIGIN).toBe('https://example.com');
  });

  it('отклоняет нечисловой порт', () => {
    expect(parseEnv({ REALTIME_PORT: 'abc' }).success).toBe(false);
  });
});
