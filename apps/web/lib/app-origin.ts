type OriginEnv = { NODE_ENV?: string; APP_ORIGIN?: string };

/**
 * Публичный адрес сайта для ссылок-приглашений. В продакшне только из APP_ORIGIN:
 * заголовок Host задаёт клиент, и токен приглашения ушёл бы на чужой домен.
 * Локально без APP_ORIGIN — адрес из Host запроса.
 */
export function appOrigin(env: OriginEnv, host: string | null): string {
  if (env.APP_ORIGIN) return env.APP_ORIGIN.replace(/\/+$/, '');
  if (env.NODE_ENV === 'production') {
    throw new Error('APP_ORIGIN не задан: в продакшне адрес для ссылок берётся только из него');
  }
  return `http://${host ?? 'localhost:3000'}`;
}
