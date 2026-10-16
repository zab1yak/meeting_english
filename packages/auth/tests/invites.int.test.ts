import { createTestDb, describeWithDb, resetDb } from '@me/db/testing';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { authenticate } from '../src/accounts';
import {
  INVITE_TTL_MS,
  acceptInviteAsExistingStudent,
  acceptInviteAsNewStudent,
  createInvite,
  findInvite,
} from '../src/invites';
import { isTeacherOfStudent, listStudents } from '../src/permissions';
import { hashToken } from '../src/token';
import { createUser } from './helpers';

const t0 = new Date('2026-03-01T10:00:00Z');
const newStudent = { name: 'Иван', email: 'Ivan@Mail.ru', password: 'student-pass' };

describeWithDb('приглашения и права', () => {
  const db = createTestDb();

  beforeEach(async () => {
    await resetDb(db);
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  describe('createInvite', () => {
    it('учитель создаёт приглашение на 7 дней; в БД только хэш токена', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const result = await createInvite(db, teacher.id, t0);

      if (!result.ok) throw new Error(result.code);
      expect(INVITE_TTL_MS).toBe(7 * 24 * 60 * 60 * 1000);
      expect(result.expiresAt).toEqual(new Date(t0.getTime() + INVITE_TTL_MS));
      const row = await db.invite.findFirstOrThrow();
      expect(row.tokenHash).toBe(hashToken(result.token));
      expect(row.teacherId).toBe(teacher.id);
    });

    it('ученик приглашать не может — FORBIDDEN', async () => {
      const student = await createUser(db, 'STUDENT');
      expect(await createInvite(db, student.id, t0)).toEqual({ ok: false, code: 'FORBIDDEN' });
      expect(await db.invite.count()).toBe(0);
    });
  });

  describe('findInvite', () => {
    it('действующее приглашение показывает имя учителя', async () => {
      const teacher = await createUser(db, 'TEACHER', { name: 'Анна Королёва' });
      const invite = await createInvite(db, teacher.id, t0);
      if (!invite.ok) throw new Error(invite.code);

      expect(await findInvite(db, invite.token, t0)).toEqual({
        teacherId: teacher.id,
        teacherName: 'Анна Королёва',
      });
    });

    it('неизвестное, истёкшее и использованное — null', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const invite = await createInvite(db, teacher.id, t0);
      if (!invite.ok) throw new Error(invite.code);

      expect(await findInvite(db, 'nope', t0)).toBeNull();
      expect(await findInvite(db, invite.token, invite.expiresAt)).toBeNull();
      await acceptInviteAsNewStudent(db, invite.token, newStudent, t0);
      expect(await findInvite(db, invite.token, t0)).toBeNull();
    });
  });

  describe('acceptInviteAsNewStudent', () => {
    it('создаёт ученика, привязывает к учителю и гасит приглашение', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const invite = await createInvite(db, teacher.id, t0);
      if (!invite.ok) throw new Error(invite.code);

      const result = await acceptInviteAsNewStudent(db, invite.token, newStudent, t0);

      if (!result.ok) throw new Error(result.code);
      expect(result.user).toMatchObject({ email: 'ivan@mail.ru', role: 'STUDENT' });
      expect(await isTeacherOfStudent(db, teacher.id, result.user.id)).toBe(true);
      const row = await db.invite.findFirstOrThrow();
      expect(row.usedAt).toEqual(t0);
      expect(row.usedById).toBe(result.user.id);
      expect(
        await authenticate(db, { email: 'ivan@mail.ru', password: 'student-pass' }),
      ).not.toBeNull();
    });

    it('истёкшее приглашение — INVITE_INVALID, ученик не создаётся', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const invite = await createInvite(db, teacher.id, t0);
      if (!invite.ok) throw new Error(invite.code);

      expect(
        await acceptInviteAsNewStudent(db, invite.token, newStudent, invite.expiresAt),
      ).toEqual({ ok: false, code: 'INVITE_INVALID' });
      expect(await db.user.count({ where: { role: 'STUDENT' } })).toBe(0);
    });

    it('занятый email — EMAIL_TAKEN, приглашение остаётся действующим', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const existing = await createUser(db, 'STUDENT');
      const invite = await createInvite(db, teacher.id, t0);
      if (!invite.ok) throw new Error(invite.code);

      expect(
        await acceptInviteAsNewStudent(
          db,
          invite.token,
          { ...newStudent, email: existing.email.toUpperCase() },
          t0,
        ),
      ).toEqual({ ok: false, code: 'EMAIL_TAKEN' });
      expect(await findInvite(db, invite.token, t0)).not.toBeNull();
    });

    it('невалидный ввод — INVALID_INPUT', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const invite = await createInvite(db, teacher.id, t0);
      if (!invite.ok) throw new Error(invite.code);

      expect(
        await acceptInviteAsNewStudent(db, invite.token, { ...newStudent, password: 'x' }, t0),
      ).toEqual({ ok: false, code: 'INVALID_INPUT' });
    });

    it('гонка: из двух одновременных погашений проходит ровно одно', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const invite = await createInvite(db, teacher.id, t0);
      if (!invite.ok) throw new Error(invite.code);

      const results = await Promise.all([
        acceptInviteAsNewStudent(db, invite.token, newStudent, t0),
        acceptInviteAsNewStudent(db, invite.token, { ...newStudent, email: 'petr@mail.ru' }, t0),
      ]);

      expect(results.filter((r) => r.ok)).toHaveLength(1);
      expect(results.find((r) => !r.ok)).toEqual({ ok: false, code: 'INVITE_INVALID' });
      expect(await db.user.count({ where: { role: 'STUDENT' } })).toBe(1);
    });
  });

  describe('acceptInviteAsExistingStudent', () => {
    it('вошедший ученик привязывается ко второму учителю', async () => {
      const first = await createUser(db, 'TEACHER');
      const second = await createUser(db, 'TEACHER');
      const student = await createUser(db, 'STUDENT');
      await db.teacherStudent.create({ data: { teacherId: first.id, studentId: student.id } });
      const invite = await createInvite(db, second.id, t0);
      if (!invite.ok) throw new Error(invite.code);

      expect(await acceptInviteAsExistingStudent(db, invite.token, student.id, t0)).toEqual({
        ok: true,
      });
      expect(await isTeacherOfStudent(db, second.id, student.id)).toBe(true);
      expect(await isTeacherOfStudent(db, first.id, student.id)).toBe(true);
    });

    it('повторная привязка к тому же учителю не падает и гасит приглашение', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const student = await createUser(db, 'STUDENT');
      await db.teacherStudent.create({ data: { teacherId: teacher.id, studentId: student.id } });
      const invite = await createInvite(db, teacher.id, t0);
      if (!invite.ok) throw new Error(invite.code);

      expect(await acceptInviteAsExistingStudent(db, invite.token, student.id, t0)).toEqual({
        ok: true,
      });
      expect(await db.teacherStudent.count()).toBe(1);
      expect(await findInvite(db, invite.token, t0)).toBeNull();
    });

    it('учитель по приглашению не привязывается — FORBIDDEN, приглашение не тратится', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const otherTeacher = await createUser(db, 'TEACHER');
      const invite = await createInvite(db, teacher.id, t0);
      if (!invite.ok) throw new Error(invite.code);

      expect(await acceptInviteAsExistingStudent(db, invite.token, otherTeacher.id, t0)).toEqual({
        ok: false,
        code: 'FORBIDDEN',
      });
      expect(await findInvite(db, invite.token, t0)).not.toBeNull();
    });

    it('использованное приглашение — INVITE_INVALID', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const student = await createUser(db, 'STUDENT');
      const invite = await createInvite(db, teacher.id, t0);
      if (!invite.ok) throw new Error(invite.code);
      await acceptInviteAsNewStudent(db, invite.token, newStudent, t0);

      expect(await acceptInviteAsExistingStudent(db, invite.token, student.id, t0)).toEqual({
        ok: false,
        code: 'INVITE_INVALID',
      });
    });
  });

  describe('права учителя на ученика', () => {
    it('isTeacherOfStudent: только при связи и только в эту сторону', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const student = await createUser(db, 'STUDENT');
      const stranger = await createUser(db, 'STUDENT');
      await db.teacherStudent.create({ data: { teacherId: teacher.id, studentId: student.id } });

      expect(await isTeacherOfStudent(db, teacher.id, student.id)).toBe(true);
      expect(await isTeacherOfStudent(db, teacher.id, stranger.id)).toBe(false);
      expect(await isTeacherOfStudent(db, student.id, teacher.id)).toBe(false);
    });

    it('listStudents возвращает только своих учеников, без секретов, по имени', async () => {
      const teacher = await createUser(db, 'TEACHER');
      const other = await createUser(db, 'TEACHER');
      const b = await createUser(db, 'STUDENT', { name: 'Борис' });
      const a = await createUser(db, 'STUDENT', { name: 'Алла' });
      const foreign = await createUser(db, 'STUDENT', { name: 'Чужой' });
      await db.teacherStudent.createMany({
        data: [
          { teacherId: teacher.id, studentId: b.id },
          { teacherId: teacher.id, studentId: a.id },
          { teacherId: other.id, studentId: foreign.id },
        ],
      });

      const students = await listStudents(db, teacher.id);
      expect(students.map((s) => s.name)).toEqual(['Алла', 'Борис']);
      expect(JSON.stringify(students)).not.toContain('hash');
    });
  });
});
