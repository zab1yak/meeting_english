import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/prisma/client';

/**
 * Секретные поля скрыты во всех запросах по умолчанию. Код, которому они нужны
 * (вход, проверка ответов, конструктор учителя), запрашивает их явно:
 * `omit: { answerKey: false }` или `select: { answerKey: true }`.
 */
export const SECRET_FIELDS_OMIT = {
  block: { answerKey: true },
  lessonSnapshot: { answerKeys: true },
  user: { passwordHash: true },
} as const;

type CreatePrismaClientOptions = {
  /** Размер пула соединений; PGlite (`prisma dev`) держит только одно. */
  maxConnections?: number;
};

// Тип возврата выводится: явная аннотация `PrismaClient` стёрла бы omit из типов результатов.
export function createPrismaClient(
  connectionString: string,
  { maxConnections }: CreatePrismaClientOptions = {},
) {
  const adapter = new PrismaPg({ connectionString, max: maxConnections });
  return new PrismaClient({ adapter, omit: SECRET_FIELDS_OMIT });
}

/** Клиент с глобальным omit секретных полей. */
export type Db = ReturnType<typeof createPrismaClient>;
/** Клиент внутри `db.$transaction(async (tx) => …)`. */
export type DbTx = Parameters<Parameters<Db['$transaction']>[0]>[0];

export { Prisma } from './generated/prisma/client';
export * from './generated/prisma/enums';
