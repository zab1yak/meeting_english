import { z } from 'zod';

const uuidSchema = z.uuid();

/**
 * id из клиента (Server Action, URL) до запроса к БД: колонки типа uuid,
 * и строка другого формата дала бы ошибку Postgres вместо отказа.
 */
export function isUuid(value: string): boolean {
  return uuidSchema.safeParse(value).success;
}
