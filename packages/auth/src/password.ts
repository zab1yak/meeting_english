import { randomInt } from 'node:crypto';

import { hash, verify, type Options } from '@node-rs/argon2';

/**
 * argon2id (алгоритм по умолчанию в @node-rs/argon2) с параметрами минимума OWASP:
 * 19 МиБ памяти, 2 прохода, 1 поток — около 30–50 мс на проверку.
 * Параметры записываются в саму строку хэша, поэтому их можно менять без миграции.
 */
const ARGON2_OPTIONS: Options = { memoryCost: 19_456, timeCost: 2, parallelism: 1 };

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

let dummyHash: Promise<string> | undefined;

/**
 * Проверяет пароль. Без хэша (пользователь не найден) проверяет фиктивный хэш,
 * чтобы время ответа не выдавало, зарегистрирован ли email.
 */
export async function verifyPassword(passwordHash: string | null, password: string) {
  dummyHash ??= hashPassword('dummy-password-for-timing').catch((error: unknown) => {
    // Не кэшируем отказ навсегда: следующий вход попробует посчитать хэш снова.
    dummyHash = undefined;
    throw error;
  });
  const target = passwordHash ?? (await dummyHash);
  try {
    const valid = await verify(target, password);
    return passwordHash !== null && valid;
  } catch {
    // Битый хэш в БД — отказ во входе, а не 500.
    return false;
  }
}

/** Без похожих символов: 0/O, 1/l/I — пароль диктуют ученику голосом или пишут в чат. */
const TEMP_PASSWORD_ALPHABET = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Временный пароль, который учитель выдаёт ученику при сбросе. */
export function generateTempPassword(length = 12): string {
  let password = '';
  for (let i = 0; i < length; i++) {
    password += TEMP_PASSWORD_ALPHABET.charAt(randomInt(TEMP_PASSWORD_ALPHABET.length));
  }
  return password;
}
