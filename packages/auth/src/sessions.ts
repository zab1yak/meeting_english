import type { Db, DbTx, Role } from '@me/db';

import { SESSION_IDLE_TTL_MS, isSessionExpired, nextSessionExpiry } from './policy';
import { generateToken, hashToken } from './token';

/** При входе на 11-м устройстве самая старая сессия вытесняется. */
export const MAX_SESSIONS_PER_USER = 10;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
  /** sha256 токена — id записи AuthSession. */
  sessionId: string;
};

export type SessionMeta = { ip?: string | null; userAgent?: string | null };

function clip(value: string | null | undefined, max: number): string | null {
  return value ? value.slice(0, max) : null;
}

/** Создаёт сессию. Токен возвращается один раз — для cookie; в БД только его хэш. */
export async function createSession(
  db: Db,
  userId: string,
  meta: SessionMeta = {},
  now: Date = new Date(),
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateToken();
  const expiresAt = new Date(now.getTime() + SESSION_IDLE_TTL_MS);

  await db.$transaction(async (tx) => {
    const overflow = await tx.authSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: MAX_SESSIONS_PER_USER - 1,
      select: { id: true },
    });
    if (overflow.length > 0) {
      await tx.authSession.deleteMany({ where: { id: { in: overflow.map(({ id }) => id) } } });
    }
    await tx.authSession.create({
      data: {
        id: hashToken(token),
        userId,
        expiresAt,
        createdAt: now,
        ip: clip(meta.ip, 64),
        userAgent: clip(meta.userAgent, 512),
      },
    });
  });

  return { token, expiresAt };
}

/**
 * Пользователь по токену из cookie или null. Истёкшая сессия удаляется,
 * действующая продлевается по правилам nextSessionExpiry.
 */
export async function validateSession(
  db: Db,
  token: string,
  now: Date = new Date(),
): Promise<SessionUser | null> {
  if (!token) return null;
  const id = hashToken(token);
  const session = await db.authSession.findUnique({
    where: { id },
    select: {
      createdAt: true,
      expiresAt: true,
      user: { select: { id: true, email: true, name: true, role: true, mustChangePassword: true } },
    },
  });
  if (!session) return null;

  if (isSessionExpired(session, now)) {
    await db.authSession.deleteMany({ where: { id } });
    return null;
  }

  const nextExpiry = nextSessionExpiry(session, now);
  if (nextExpiry) {
    // updateMany не падает, если сессию параллельно удалили (выход в другой вкладке).
    await db.authSession.updateMany({ where: { id }, data: { expiresAt: nextExpiry } });
  }

  return { ...session.user, sessionId: id };
}

/** Выход: удаляет сессию этого токена. */
export async function revokeSession(db: Db, token: string): Promise<void> {
  if (!token) return;
  await db.authSession.deleteMany({ where: { id: hashToken(token) } });
}

/** Отзывает все сессии пользователя (смена или сброс пароля). */
export async function revokeAllSessions(
  db: Db | DbTx,
  userId: string,
  { exceptSessionId }: { exceptSessionId?: string } = {},
): Promise<void> {
  await db.authSession.deleteMany({
    where: { userId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
  });
}
