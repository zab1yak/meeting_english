import 'server-only';

import { createSession, revokeSession } from '@me/auth';
import { cookies, headers } from 'next/headers';

import { sessionCookieConfig } from '../access';
import { getDb } from './db';

const cookieConfig = sessionCookieConfig(process.env);

export async function readSessionToken(): Promise<string> {
  return (await cookies()).get(cookieConfig.name)?.value ?? '';
}

/** IP и браузер для списка сессий. За Caddy адрес клиента — первый в X-Forwarded-For. */
async function requestMeta() {
  const list = await headers();
  const forwarded = list.get('x-forwarded-for')?.split(',')[0]?.trim();
  return { ip: forwarded ?? list.get('x-real-ip'), userAgent: list.get('user-agent') };
}

/**
 * Вход: новая сессия и cookie. Сессия из текущей cookie удаляется —
 * идентификатор сессии никогда не переживает вход (защита от session fixation).
 * Только для Server Actions и Route Handlers: в Server Component cookie не установить.
 */
export async function startSession(userId: string): Promise<void> {
  const db = getDb();
  await revokeSession(db, await readSessionToken());
  const { token } = await createSession(db, userId, await requestMeta());
  (await cookies()).set(cookieConfig.name, token, cookieConfig.options);
}

/** Выход: удаляет сессию в БД и cookie в браузере. */
export async function endSession(): Promise<void> {
  await revokeSession(getDb(), await readSessionToken());
  (await cookies()).set(cookieConfig.name, '', { ...cookieConfig.options, maxAge: 0 });
}
