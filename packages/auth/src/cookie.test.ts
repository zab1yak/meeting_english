import { describe, expect, it } from 'vitest';

import { sessionCookie } from './cookie';

describe('sessionCookie', () => {
  it('в защищённом режиме: префикс __Host-, Secure, HttpOnly, SameSite=Lax, Path=/', () => {
    const cookie = sessionCookie({ secure: true });
    expect(cookie.name).toBe('__Host-me_session');
    expect(cookie.options).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 90 * 24 * 60 * 60,
    });
  });

  it('без HTTPS (локальная разработка по http): без префикса и без Secure', () => {
    const cookie = sessionCookie({ secure: false });
    expect(cookie.name).toBe('me_session');
    expect(cookie.options.secure).toBe(false);
    expect(cookie.options.httpOnly).toBe(true);
  });
});
