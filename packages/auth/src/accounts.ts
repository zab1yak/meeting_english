import { Prisma, inTransaction, type Db, type Role } from '@me/db';
import {
  changePasswordInputSchema,
  loginInputSchema,
  registerTeacherInputSchema,
  type ChangePasswordInput,
  type LoginInput,
  type RegisterTeacherInput,
} from '@me/shared';

import { isUuid } from './ids';
import { generateTempPassword, hashPassword, verifyPassword } from './password';
import { err, type Result } from './result';
import { revokeAllSessions } from './sessions';

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
};

export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  mustChangePassword: true,
} as const;

/**
 * Нарушение уникальности User.email. Другие P2002 (например, гонка на связи
 * учитель–ученик) не должны превращаться в «почта занята».
 * С адаптером pg в meta приходит имя ограничения, без адаптера — список полей.
 */
export function isEmailTaken(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
    return false;
  }
  const meta = JSON.stringify(error.meta ?? {});
  return meta.includes('User_email_key') || meta.includes('"email"');
}

/** Регистрация открыта только учителям; ученики приходят по приглашению. */
export async function registerTeacher(
  db: Db,
  input: RegisterTeacherInput,
): Promise<Result<{ user: PublicUser }, 'INVALID_INPUT' | 'EMAIL_TAKEN'>> {
  const parsed = registerTeacherInputSchema.safeParse(input);
  if (!parsed.success) return err('INVALID_INPUT');
  const { name, email, password } = parsed.data;

  try {
    const user = await db.user.create({
      data: { name, email, role: 'TEACHER', passwordHash: await hashPassword(password) },
      select: publicUserSelect,
    });
    return { ok: true, user };
  } catch (error) {
    if (isEmailTaken(error)) return err('EMAIL_TAKEN');
    throw error;
  }
}

/**
 * Пользователь по email и паролю или null. Ответ одинаков для неизвестного email
 * и неверного пароля, время проверки тоже (см. verifyPassword).
 */
export async function authenticate(db: Db, input: LoginInput): Promise<PublicUser | null> {
  const parsed = loginInputSchema.safeParse(input);
  if (!parsed.success) {
    await verifyPassword(null, '');
    return null;
  }
  const found = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { ...publicUserSelect, passwordHash: true },
  });
  const valid = await verifyPassword(found?.passwordHash ?? null, parsed.data.password);
  if (!found || !valid) return null;
  const { passwordHash: _hash, ...user } = found;
  return user;
}

/** Смена пароля самим пользователем. Все его сессии отзываются — после смены нужно войти заново. */
export async function changePassword(
  db: Db,
  userId: string,
  input: ChangePasswordInput,
  now: Date = new Date(),
): Promise<Result<undefined, 'INVALID_INPUT' | 'INVALID_CREDENTIALS'>> {
  const parsed = changePasswordInputSchema.safeParse(input);
  if (!parsed.success) return err('INVALID_INPUT');

  const found = await db.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!(await verifyPassword(found?.passwordHash ?? null, parsed.data.currentPassword))) {
    return err('INVALID_CREDENTIALS');
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await inTransaction(db, async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false, passwordChangedAt: now },
    });
    await revokeAllSessions(tx, userId);
  });
  return { ok: true };
}

/**
 * Сброс пароля ученику его учителем (почты в MVP нет). Учитель получает временный
 * пароль один раз; ученик обязан сменить его после входа. Все сессии ученика отзываются.
 *
 * Только единственный учитель ученика: иначе любой из нескольких учителей мог бы
 * войти в общий аккаунт и увидеть работы у других учителей (SHARED_STUDENT).
 */
export async function resetStudentPassword(
  db: Db,
  teacherId: string,
  studentId: string,
  now: Date = new Date(),
): Promise<Result<{ tempPassword: string }, 'FORBIDDEN' | 'SHARED_STUDENT'>> {
  if (!isUuid(teacherId) || !isUuid(studentId)) return err('FORBIDDEN');
  const link = await db.teacherStudent.findUnique({
    where: { teacherId_studentId: { teacherId, studentId } },
    select: { teacher: { select: { role: true } }, student: { select: { role: true } } },
  });
  if (link?.teacher.role !== 'TEACHER' || link.student.role !== 'STUDENT') {
    return err('FORBIDDEN');
  }
  if ((await db.teacherStudent.count({ where: { studentId } })) > 1) {
    return err('SHARED_STUDENT');
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  await inTransaction(db, async (tx) => {
    await tx.user.update({
      where: { id: studentId },
      data: { passwordHash, mustChangePassword: true, passwordChangedAt: now },
    });
    await revokeAllSessions(tx, studentId);
  });
  return { ok: true, tempPassword };
}
