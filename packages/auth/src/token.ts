import { createHash, randomBytes } from 'node:crypto';

/** Секрет для cookie или ссылки: 256 бит случайности в base64url. */
export function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * В БД хранится только sha256 токена: при утечке дампа сессии и приглашения не угнать.
 * Соль не нужна — у токена 256 бит энтропии, подбор по словарю невозможен.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
