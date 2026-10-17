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

/**
 * Клиент внутри транзакции — с тем же omit. Сгенерированный `$transaction` типизирует
 * свой аргумент как клиент без omit, и типы врали бы, что секретные поля в результате есть.
 */
export type DbTx = Omit<Db, '$connect' | '$disconnect' | '$on' | '$use' | '$extends'>;

/** Интерактивная транзакция с типами DbTx. Используйте вместо `db.$transaction(fn)`. */
export function inTransaction<R>(db: Db, fn: (tx: DbTx) => Promise<R>): Promise<R> {
  return db.$transaction((tx) => fn(tx as DbTx));
}

export { Prisma } from './generated/prisma/client';
export * from './generated/prisma/enums';
