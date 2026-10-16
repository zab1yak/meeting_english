// Правила доступа без обращения к БД: общие для DAL и proxy.
import { sessionCookie, type SessionCookie } from '@me/auth/cookie';
import type { Role } from '@me/db';

export function homePathFor(role: Role): string {
  return role === 'TEACHER' ? '/teacher' : '/student';
}

type AccessSubject = { role: Role; mustChangePassword: boolean };
type AccessRequirement = {
  /** Нужная роль; без неё достаточно войти. */
  role?: Role;
  /** Страница смены пароля доступна и с временным паролем. */
  allowPasswordChange?: boolean;
};
export type AccessDecision = { allow: true } | { allow: false; redirectTo: string };

/** Решение DAL: пускать ли пользователя на страницу или в Server Action. */
export function accessDecision(
  user: AccessSubject | null,
  { role, allowPasswordChange = false }: AccessRequirement,
): AccessDecision {
  if (!user) return { allow: false, redirectTo: '/login' };
  if (user.mustChangePassword && !allowPasswordChange) {
    return { allow: false, redirectTo: '/change-password' };
  }
  if (role && user.role !== role) return { allow: false, redirectTo: homePathFor(user.role) };
  return { allow: true };
}

type CookieEnv = { NODE_ENV?: string; COOKIE_SECURE?: string };

/**
 * В продакшне cookie всегда Secure (сайт работает только по HTTPS за Caddy).
 * Локально по http — без Secure, иначе Safari её не сохранит; COOKIE_SECURE=true включает.
 */
export function sessionCookieConfig(env: CookieEnv): SessionCookie {
  const secure = env.NODE_ENV === 'production' || env.COOKIE_SECURE === 'true';
  return sessionCookie({ secure });
}
