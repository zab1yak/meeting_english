import 'server-only';

import { createPrismaClient, type Db } from '@me/db';

// Один клиент на процесс: в dev Next перезагружает модули при каждом изменении,
// и без globalThis каждый HMR открывал бы новый пул соединений.
const globalForDb = globalThis as typeof globalThis & { meetingEnglishDb?: Db };

/** Prisma-клиент с глобальным omit секретных полей. Создаётся при первом обращении. */
export function getDb(): Db {
  if (!globalForDb.meetingEnglishDb) {
    const url = process.env['DATABASE_URL'];
    if (!url) throw new Error('DATABASE_URL не задан');
    globalForDb.meetingEnglishDb = createPrismaClient(url);
  }
  return globalForDb.meetingEnglishDb;
}
