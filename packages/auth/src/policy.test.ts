import { describe, expect, it } from 'vitest';

import {
  SESSION_ABSOLUTE_TTL_MS,
  SESSION_IDLE_TTL_MS,
  isSessionExpired,
  nextSessionExpiry,
  safeRedirectPath,
} from './policy';

const DAY = 24 * 60 * 60 * 1000;
const created = new Date('2026-01-01T00:00:00Z');
const at = (days: number) => new Date(created.getTime() + days * DAY);

describe('сроки сессии', () => {
  it('30 дней простоя, 90 дней абсолютный предел', () => {
    expect(SESSION_IDLE_TTL_MS).toBe(30 * DAY);
    expect(SESSION_ABSOLUTE_TTL_MS).toBe(90 * DAY);
  });

  it('истекла, когда now ≥ expiresAt', () => {
    expect(isSessionExpired({ expiresAt: at(30) }, at(29))).toBe(false);
    expect(isSessionExpired({ expiresAt: at(30) }, at(30))).toBe(true);
  });
});

describe('nextSessionExpiry: скользящее продление', () => {
  it('не продлевает, пока до истечения больше половины срока (не пишем в БД на каждый запрос)', () => {
    expect(nextSessionExpiry({ createdAt: created, expiresAt: at(30) }, at(10))).toBeNull();
  });

  it('продлевает на 30 дней от now, когда осталось меньше половины', () => {
    expect(nextSessionExpiry({ createdAt: created, expiresAt: at(30) }, at(16))).toEqual(at(46));
  });

  it('не выходит за абсолютный предел 90 дней от создания', () => {
    expect(nextSessionExpiry({ createdAt: created, expiresAt: at(75) }, at(70))).toEqual(at(90));
  });

  it('у предела продлевать некуда', () => {
    expect(nextSessionExpiry({ createdAt: created, expiresAt: at(90) }, at(80))).toBeNull();
  });
});

describe('safeRedirectPath: защита от open redirect', () => {
  it.each([
    ['/teacher', '/teacher'],
    ['/student/homework?id=1', '/student/homework?id=1'],
  ])('пропускает внутренний путь %s', (input, expected) => {
    expect(safeRedirectPath(input, '/')).toBe(expected);
  });

  it.each([
    null,
    '',
    'https://evil.example',
    '//evil.example',
    '/\\evil.example',
    'javascript:alert(1)',
    '/%2F%2Fevil.example',
    'teacher',
  ])('заменяет %s на запасной путь', (input) => {
    expect(safeRedirectPath(input, '/fallback')).toBe('/fallback');
  });
});
