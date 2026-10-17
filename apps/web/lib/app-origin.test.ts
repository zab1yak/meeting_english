import { describe, expect, it } from 'vitest';

import { appOrigin } from './app-origin';

describe('appOrigin: адрес сайта для ссылок-приглашений', () => {
  it('берёт APP_ORIGIN без завершающего слэша', () => {
    expect(appOrigin({ APP_ORIGIN: 'https://english.example/' }, 'evil.example')).toBe(
      'https://english.example',
    );
  });

  it('в продакшне без APP_ORIGIN — ошибка, а не адрес из заголовка Host', () => {
    expect(() => appOrigin({ NODE_ENV: 'production' }, 'evil.example')).toThrow(/APP_ORIGIN/);
  });

  it('локально без APP_ORIGIN — http и Host запроса', () => {
    expect(appOrigin({ NODE_ENV: 'development' }, 'localhost:3000')).toBe('http://localhost:3000');
  });

  it('локально без Host — localhost:3000', () => {
    expect(appOrigin({ NODE_ENV: 'development' }, null)).toBe('http://localhost:3000');
  });
});
