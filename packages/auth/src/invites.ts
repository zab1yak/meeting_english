import type { Db, DbTx } from '@me/db';
import { acceptInviteInputSchema, type AcceptInviteInput } from '@me/shared';

import { isUniqueViolation, publicUserSelect, type PublicUser } from './accounts';
import { hashPassword } from './password';
import { err, type Result } from './result';
import { generateToken, hashToken } from './token';

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Приглашение ученика. Токен возвращается один раз — для ссылки; в БД только хэш. */
export async function createInvite(
  db: Db,
  teacherId: string,
  now: Date = new Date(),
): Promise<Result<{ token: string; expiresAt: Date }, 'FORBIDDEN'>> {
  const teacher = await db.user.findUnique({ where: { id: teacherId }, select: { role: true } });
  if (teacher?.role !== 'TEACHER') return err('FORBIDDEN');

  const token = generateToken();
  const expiresAt = new Date(now.getTime() + INVITE_TTL_MS);
  await db.invite.create({ data: { tokenHash: hashToken(token), teacherId, expiresAt } });
  return { ok: true, token, expiresAt };
}

/** Действующее приглашение (для страницы принятия) или null. */
export async function findInvite(
  db: Db,
  token: string,
  now: Date = new Date(),
): Promise<{ teacherId: string; teacherName: string } | null> {
  if (!token) return null;
  const invite = await db.invite.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { usedAt: true, expiresAt: true, teacherId: true, teacher: { select: { name: true } } },
  });
  if (!invite || invite.usedAt || invite.expiresAt <= now) return null;
  return { teacherId: invite.teacherId, teacherName: invite.teacher.name };
}

/**
 * Гасит приглашение атомарно: из параллельных попыток UPDATE … WHERE usedAt IS NULL
 * проходит ровно одна. Возвращает приглашение или null, если оно уже недействительно.
 */
async function claimInvite(tx: DbTx, token: string, now: Date) {
  const tokenHash = hashToken(token);
  const claimed = await tx.invite.updateMany({
    where: { tokenHash, usedAt: null, expiresAt: { gt: now } },
    data: { usedAt: now },
  });
  if (claimed.count !== 1) return null;
  return tx.invite.findUniqueOrThrow({
    where: { tokenHash },
    select: { id: true, teacherId: true },
  });
}

/** Регистрация ученика по приглашению: аккаунт, привязка к учителю и погашение — одной транзакцией. */
export async function acceptInviteAsNewStudent(
  db: Db,
  token: string,
  input: AcceptInviteInput,
  now: Date = new Date(),
): Promise<Result<{ user: PublicUser }, 'INVALID_INPUT' | 'INVITE_INVALID' | 'EMAIL_TAKEN'>> {
  const parsed = acceptInviteInputSchema.safeParse(input);
  if (!parsed.success) return err('INVALID_INPUT');
  const { name, email, password } = parsed.data;
  // argon2 до транзакции: не держим блокировку приглашения десятки миллисекунд.
  const passwordHash = await hashPassword(password);

  try {
    return await db.$transaction(async (tx) => {
      const invite = await claimInvite(tx, token, now);
      if (!invite) return err('INVITE_INVALID');
      const user = await tx.user.create({
        data: { name, email, role: 'STUDENT', passwordHash },
        select: publicUserSelect,
      });
      await tx.teacherStudent.create({
        data: { teacherId: invite.teacherId, studentId: user.id },
      });
      await tx.invite.update({ where: { id: invite.id }, data: { usedById: user.id } });
      return { ok: true as const, user };
    });
  } catch (error) {
    // Транзакция откатилась целиком — приглашение снова действует.
    if (isUniqueViolation(error)) return err('EMAIL_TAKEN');
    throw error;
  }
}

/** Уже зарегистрированный ученик принимает приглашение ещё одного учителя. */
export async function acceptInviteAsExistingStudent(
  db: Db,
  token: string,
  studentId: string,
  now: Date = new Date(),
): Promise<Result<undefined, 'INVITE_INVALID' | 'FORBIDDEN'>> {
  const student = await db.user.findUnique({ where: { id: studentId }, select: { role: true } });
  if (student?.role !== 'STUDENT') return err('FORBIDDEN');

  return db.$transaction(async (tx) => {
    const invite = await claimInvite(tx, token, now);
    if (!invite) return err('INVITE_INVALID');
    await tx.teacherStudent.createMany({
      data: [{ teacherId: invite.teacherId, studentId }],
      skipDuplicates: true,
    });
    await tx.invite.update({ where: { id: invite.id }, data: { usedById: studentId } });
    return { ok: true as const };
  });
}
