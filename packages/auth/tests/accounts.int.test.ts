import { createTestDb, describeWithDb, resetDb } from '@me/db/testing';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import {
  authenticate,
  changePassword,
  registerTeacher,
  resetStudentPassword,
} from '../src/accounts';
import { createSession, validateSession } from '../src/sessions';
import { createUser } from './helpers';

describeWithDb('аккаунты', () => {
  const db = createTestDb();

  beforeEach(async () => {
    await resetDb(db);
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  describe('registerTeacher', () => {
    it('создаёт учителя с хэшем argon2id, email в нижнем регистре', async () => {
      const result = await registerTeacher(db, {
        name: 'Анна',
        email: '  Anna@Mail.RU ',
        password: 'secret-pass',
      });

      expect(result).toMatchObject({
        ok: true,
        user: { email: 'anna@mail.ru', name: 'Анна', role: 'TEACHER' },
      });
      const row = await db.user.findUniqueOrThrow({
        where: { email: 'anna@mail.ru' },
        select: { passwordHash: true },
      });
      expect(row.passwordHash).toMatch(/^\$argon2id\$/);
      expect(JSON.stringify(result)).not.toContain('argon2');
    });

    it('занятый email (в любом регистре) — EMAIL_TAKEN', async () => {
      await registerTeacher(db, { name: 'А', email: 'a@b.ru', password: 'secret-pass' });
      expect(
        await registerTeacher(db, { name: 'Б', email: 'A@B.RU', password: 'secret-pass' }),
      ).toEqual({ ok: false, code: 'EMAIL_TAKEN' });
    });

    it('невалидный ввод — INVALID_INPUT, в БД ничего не пишется', async () => {
      expect(await registerTeacher(db, { name: 'А', email: 'a@b.ru', password: 'short' })).toEqual({
        ok: false,
        code: 'INVALID_INPUT',
      });
      expect(await db.user.count()).toBe(0);
    });
  });

  describe('authenticate', () => {
    it('верная пара — пользователь без хэша', async () => {
      await registerTeacher(db, { name: 'А', email: 'a@b.ru', password: 'secret-pass' });
      const user = await authenticate(db, { email: 'A@b.ru ', password: 'secret-pass' });
      expect(user).toMatchObject({ email: 'a@b.ru', role: 'TEACHER' });
      expect(user).not.toHaveProperty('passwordHash');
    });

    it('неверный пароль и несуществующий email неразличимы — null', async () => {
      await registerTeacher(db, { name: 'А', email: 'a@b.ru', password: 'secret-pass' });
      expect(await authenticate(db, { email: 'a@b.ru', password: 'wrong-pass' })).toBeNull();
      expect(await authenticate(db, { email: 'nobody@b.ru', password: 'secret-pass' })).toBeNull();
      expect(await authenticate(db, { email: 'not-an-email', password: 'x' })).toBeNull();
    });
  });

  describe('changePassword', () => {
    it('меняет пароль, снимает mustChangePassword и отзывает все сессии', async () => {
      const user = await createUser(db, 'STUDENT', { password: 'temp-password' });
      await db.user.update({ where: { id: user.id }, data: { mustChangePassword: true } });
      const { token } = await createSession(db, user.id, {});

      const result = await changePassword(db, user.id, {
        currentPassword: 'temp-password',
        newPassword: 'my-own-password',
      });

      expect(result).toEqual({ ok: true });
      expect(await validateSession(db, token)).toBeNull();
      const updated = await db.user.findUniqueOrThrow({ where: { id: user.id } });
      expect(updated.mustChangePassword).toBe(false);
      expect(updated.passwordChangedAt).not.toBeNull();
      expect(
        await authenticate(db, { email: user.email, password: 'my-own-password' }),
      ).not.toBeNull();
    });

    it('неверный текущий пароль — INVALID_CREDENTIALS, ничего не меняется', async () => {
      const user = await createUser(db, 'STUDENT', { password: 'temp-password' });
      const { token } = await createSession(db, user.id, {});

      expect(
        await changePassword(db, user.id, {
          currentPassword: 'wrong-password',
          newPassword: 'my-own-password',
        }),
      ).toEqual({ ok: false, code: 'INVALID_CREDENTIALS' });
      expect(await validateSession(db, token)).not.toBeNull();
    });
  });

  describe('resetStudentPassword', () => {
    it('учитель сбрасывает пароль своему ученику: временный пароль, все сессии ученика отозваны', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const student = await createUser(db, 'STUDENT', { password: 'forgotten-pass' });
      await db.teacherStudent.create({ data: { teacherId: teacher.id, studentId: student.id } });
      const { token } = await createSession(db, student.id, {});

      const result = await resetStudentPassword(db, teacher.id, student.id);

      if (!result.ok) throw new Error(result.code);
      expect(result.tempPassword).toHaveLength(12);
      expect(await validateSession(db, token)).toBeNull();
      expect(
        await authenticate(db, { email: student.email, password: 'forgotten-pass' }),
      ).toBeNull();
      const signedIn = await authenticate(db, {
        email: student.email,
        password: result.tempPassword,
      });
      expect(signedIn).toMatchObject({ id: student.id, mustChangePassword: true });
    });

    it('чужому ученику — FORBIDDEN, пароль не меняется', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const student = await createUser(db, 'STUDENT', { password: 'student-pass' });

      expect(await resetStudentPassword(db, teacher.id, student.id)).toEqual({
        ok: false,
        code: 'FORBIDDEN',
      });
      expect(
        await authenticate(db, { email: student.email, password: 'student-pass' }),
      ).not.toBeNull();
    });

    it('учителю (не ученику) через эту функцию сбросить нельзя, даже при связи', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const otherTeacher = await createUser(db, 'TEACHER');
      await db.teacherStudent.create({
        data: { teacherId: teacher.id, studentId: otherTeacher.id },
      });

      expect(await resetStudentPassword(db, teacher.id, otherTeacher.id)).toEqual({
        ok: false,
        code: 'FORBIDDEN',
      });
    });
  });
});
