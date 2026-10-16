import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { sessionCookieConfig } from './lib/access';
import { config, proxy } from './proxy';

const cookieName = sessionCookieConfig(process.env).name;

function request(path: string, withCookie = false) {
  const req = new NextRequest(new URL(path, 'http://localhost:3000'));
  if (withCookie) req.cookies.set(cookieName, 'some-token');
  return req;
}

describe('proxy: оптимистичная проверка входа', () => {
  it('закрытый раздел без cookie — на вход с возвратом', () => {
    const res = proxy(request('/teacher/students?tab=all'));
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get('location') ?? '');
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('next')).toBe('/teacher/students?tab=all');
  });

  it.each(['/teacher', '/student', '/change-password'])(
    '%s с cookie пропускается дальше',
    (path) => {
      const res = proxy(request(path, true));
      expect(res.headers.get('location')).toBeNull();
      expect(res.headers.get('x-middleware-next')).toBe('1');
    },
  );

  it('matcher покрывает все закрытые разделы', () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining(['/teacher/:path*', '/student/:path*', '/change-password']),
    );
  });
});
