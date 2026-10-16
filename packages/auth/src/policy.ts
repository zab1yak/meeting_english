const DAY_MS = 24 * 60 * 60 * 1000;

/** Сессия истекает после 30 дней без использования… */
export const SESSION_IDLE_TTL_MS = 30 * DAY_MS;
/** …и в любом случае через 90 дней после входа. */
export const SESSION_ABSOLUTE_TTL_MS = 90 * DAY_MS;

export function isSessionExpired(session: { expiresAt: Date }, now: Date): boolean {
  return now.getTime() >= session.expiresAt.getTime();
}

/**
 * Новый срок сессии при использовании или null, если продлевать не нужно.
 * Продлеваем, только когда прошла половина срока: так в БД пишем раз в ~15 дней,
 * а не на каждый запрос.
 */
export function nextSessionExpiry(
  session: { createdAt: Date; expiresAt: Date },
  now: Date,
): Date | null {
  const remaining = session.expiresAt.getTime() - now.getTime();
  if (remaining > SESSION_IDLE_TTL_MS / 2) return null;
  const candidate = Math.min(
    now.getTime() + SESSION_IDLE_TTL_MS,
    session.createdAt.getTime() + SESSION_ABSOLUTE_TTL_MS,
  );
  return candidate > session.expiresAt.getTime() ? new Date(candidate) : null;
}

/**
 * Путь для редиректа после входа (?next=). Только внутренние пути:
 * иначе ссылка вида /login?next=//evil.example уводит на чужой сайт.
 */
export function safeRedirectPath(input: string | null | undefined, fallback: string): string {
  if (!input?.startsWith('/')) return fallback;
  let decoded: string;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    return fallback;
  }
  for (const value of [input, decoded]) {
    // eslint-disable-next-line no-control-regex -- управляющие символы и есть то, что отсекаем
    if (value.startsWith('//') || value.includes('\\') || /[\u0000-\u001f]/.test(value)) {
      return fallback;
    }
  }
  return input;
}
