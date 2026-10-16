import { describe, expect, it } from 'vitest';

import { accessDecision, homePathFor, sessionCookieConfig } from './access';

const teacher = { role: 'TEACHER' as const, mustChangePassword: false };
const student = { role: 'STUDENT' as const, mustChangePassword: false };

describe('homePathFor', () => {
  it('ведёт в кабинет своей роли', () => {
    expect(homePathFor('TEACHER')).toBe('/teacher');
    expect(homePathFor('STUDENT')).toBe('/student');
  });
});

describe('accessDecision', () => {
  it('без сессии — на вход', () => {
    expect(accessDecision(null, {})).toEqual({ allow: false, redirectTo: '/login' });
  });

  it('любой вошедший пользователь проходит, если роль не требуется', () => {
    expect(accessDecision(student, {})).toEqual({ allow: true });
  });

  it('нужная роль — проходит', () => {
    expect(accessDecision(teacher, { role: 'TEACHER' })).toEqual({ allow: true });
  });

  it('чужая роль — в свой кабинет, а не на чужие данные', () => {
    expect(accessDecision(student, { role: 'TEACHER' })).toEqual({
      allow: false,
      redirectTo: '/student',
    });
    expect(accessDecision(teacher, { role: 'STUDENT' })).toEqual({
      allow: false,
      redirectTo: '/teacher',
    });
  });

  it('временный пароль: никуда, кроме страницы смены пароля', () => {
    const temp = { ...student, mustChangePassword: true };
    expect(accessDecision(temp, { role: 'STUDENT' })).toEqual({
      allow: false,
      redirectTo: '/change-password',
    });
    expect(accessDecision(temp, { allowPasswordChange: true })).toEqual({ allow: true });
  });
});

describe('sessionCookieConfig', () => {
  it('в продакшне cookie всегда Secure', () => {
    expect(sessionCookieConfig({ NODE_ENV: 'production' }).options.secure).toBe(true);
  });

  it('в разработке по http — без Secure, если не включено явно', () => {
    expect(sessionCookieConfig({ NODE_ENV: 'development' }).options.secure).toBe(false);
    expect(
      sessionCookieConfig({ NODE_ENV: 'development', COOKIE_SECURE: 'true' }).options.secure,
    ).toBe(true);
  });

  it('COOKIE_SECURE=false отключает Secure только вне продакшна', () => {
    expect(
      sessionCookieConfig({ NODE_ENV: 'production', COOKIE_SECURE: 'false' }).options.secure,
    ).toBe(true);
  });
});
