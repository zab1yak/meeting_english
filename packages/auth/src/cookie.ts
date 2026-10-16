import { SESSION_ABSOLUTE_TTL_MS } from './policy';

const BASE_NAME = 'me_session';

export type SessionCookie = {
  name: string;
  options: {
    httpOnly: true;
    secure: boolean;
    sameSite: 'lax';
    path: '/';
    /** Секунды. */
    maxAge: number;
  };
};

/**
 * Параметры cookie сессии. Срок cookie — абсолютный предел сессии: скользящий срок
 * хранится в БД, поэтому cookie не нужно переустанавливать при продлении.
 *
 * С HTTPS имя получает префикс __Host-: браузер примет такую cookie только с Secure,
 * Path=/ и без Domain — её не подменить с поддомена.
 */
export function sessionCookie({ secure }: { secure: boolean }): SessionCookie {
  return {
    name: secure ? `__Host-${BASE_NAME}` : BASE_NAME,
    options: {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_ABSOLUTE_TTL_MS / 1000,
    },
  };
}
