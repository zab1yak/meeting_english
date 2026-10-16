import 'server-only';

import { isTeacherOfStudent, validateSession, type SessionUser } from '@me/auth';
import type { Role } from '@me/db';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';

import { accessDecision } from '../access';
import { getDb } from './db';
import { readSessionToken } from './session';

/**
 * Data Access Layer: единственная точка проверки прав. Вызывается в каждой странице,
 * Route Handler и Server Action — проверки в layout или proxy недостаточно
 * (layout не перерисовывается при клиентской навигации, Server Action вызывают напрямую).
 */

/** Текущий пользователь или null. cache — один запрос к БД на рендер. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = await readSessionToken();
  return token ? validateSession(getDb(), token) : null;
});

type Requirement = { role?: Role; allowPasswordChange?: boolean };

/** Пользователь с нужными правами; иначе редирект (на вход, в свой кабинет или к смене пароля). */
export async function requireUser(requirement: Requirement = {}): Promise<SessionUser> {
  const user = await getCurrentUser();
  const decision = accessDecision(user, requirement);
  if (!decision.allow) redirect(decision.redirectTo);
  if (!user) redirect('/login');
  return user;
}

export function requireTeacher(): Promise<SessionUser> {
  return requireUser({ role: 'TEACHER' });
}

export function requireStudent(): Promise<SessionUser> {
  return requireUser({ role: 'STUDENT' });
}

/** Учитель, который ведёт этого ученика. Чужой ученик — 404, чтобы не выдавать его существование. */
export async function requireTeacherOfStudent(studentId: string): Promise<SessionUser> {
  const teacher = await requireTeacher();
  if (!(await isTeacherOfStudent(getDb(), teacher.id, studentId))) notFound();
  return teacher;
}
