// Хелперы интеграционных тестов с настоящим Postgres. Только для тестов.
import path from 'node:path';

import { config } from 'dotenv';
import { describe } from 'vitest';

import { createPrismaClient, type Db } from './index';

// Воркеры Vitest не видят переменные, загруженные в globalSetup, — читаем корневой .env сами.
config({ path: path.resolve(import.meta.dirname, '../../../.env'), quiet: true });

/**
 * Отдельная тестовая БД: тесты очищают все таблицы, поэтому DATABASE_URL
 * разработчика не используется никогда. В CI переменная обязательна.
 */
export const testDatabaseUrl = process.env['TEST_DATABASE_URL'];

if (!testDatabaseUrl && process.env['CI']) {
  throw new Error('TEST_DATABASE_URL обязателен в CI: интеграционные тесты нельзя пропускать');
}

/** describe для тестов с БД: без TEST_DATABASE_URL локально они пропускаются. */
export const describeWithDb = testDatabaseUrl ? describe : describe.skip;

export function createTestDb(): Db {
  if (!testDatabaseUrl) throw new Error('TEST_DATABASE_URL не задан');
  const max = Number(process.env['TEST_DATABASE_POOL'] ?? '5');
  return createPrismaClient(testDatabaseUrl, { maxConnections: max });
}

/** Очищает все таблицы приложения (кроме истории миграций). */
export async function resetDb(db: Db): Promise<void> {
  const rows = await db.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = current_schema() AND tablename <> '_prisma_migrations'`;
  if (rows.length === 0) return;
  // Имена таблиц берутся из каталога Postgres, а не из ввода — экранируем кавычками.
  const tables = rows.map(({ tablename }) => `"${tablename.replaceAll('"', '""')}"`).join(', ');
  await db.$executeRawUnsafe(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
}
