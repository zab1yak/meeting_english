import type { Db, Role } from '@me/db';

import { hashPassword } from '../src/password';

let counter = 0;

/** Пользователь для теста. Пароль хэшируется, только если он нужен тесту (argon2 медленный). */
export async function createUser(
  db: Db,
  role: Role,
  { password, name }: { password?: string; name?: string } = {},
) {
  counter += 1;
  return db.user.create({
    data: {
      email: `user${counter}@example.com`,
      name: name ?? `Пользователь ${counter}`,
      role,
      passwordHash: password ? await hashPassword(password) : 'not-a-real-hash',
    },
  });
}
