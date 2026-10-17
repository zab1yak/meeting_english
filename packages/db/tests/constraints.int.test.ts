import { afterAll, beforeEach, expect, expectTypeOf, it } from 'vitest';

import { inTransaction, type DbTx } from '../src/index';
import { createTestDb, describeWithDb, resetDb } from '../src/testing';

/** Ограничения целостности из миграции init, которых нет в schema.prisma. */
describeWithDb('ограничения схемы', () => {
  const db = createTestDb();

  beforeEach(async () => {
    await resetDb(db);
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  let counter = 0;
  function user(role: 'TEACHER' | 'STUDENT') {
    counter += 1;
    return db.user.create({
      data: { email: `c${counter}@example.com`, passwordHash: 'h', name: 'U', role },
    });
  }

  async function snapshot() {
    const teacher = await user('TEACHER');
    const course = await db.course.create({
      data: { ownerId: teacher.id, title: 'C', position: 0 },
    });
    const lesson = await db.lesson.create({
      data: { courseId: course.id, title: 'L', position: 0 },
    });
    const snap = await db.lessonSnapshot.create({
      data: { lessonId: lesson.id, lessonVersion: 1, blocks: [], answerKeys: {} },
    });
    return { teacher, lesson, snap };
  }

  it('DbTx — клиент транзакции с моделями и тем же omit секретных полей', () => {
    expectTypeOf<DbTx>().toHaveProperty('user');
    expectTypeOf<DbTx>().toHaveProperty('authSession');
    type TxUser = Awaited<ReturnType<DbTx['user']['findFirstOrThrow']>>;
    type TxBlock = Awaited<ReturnType<DbTx['block']['findFirstOrThrow']>>;
    expectTypeOf<TxUser>().not.toHaveProperty('passwordHash');
    expectTypeOf<TxBlock>().not.toHaveProperty('answerKey');
  });

  it('inTransaction: секретные поля скрыты и внутри транзакции', async () => {
    const teacher = await user('TEACHER');
    const found = await inTransaction(db, (tx) =>
      tx.user.findUniqueOrThrow({ where: { id: teacher.id } }),
    );
    expect(found).not.toHaveProperty('passwordHash');
  });

  it('email с пробелами по краям отклоняется', async () => {
    await expect(
      db.user.create({
        data: { email: ' a@example.com', passwordHash: 'h', name: 'A', role: 'TEACHER' },
      }),
    ).rejects.toThrow();
  });

  it('учитель не может быть своим учеником', async () => {
    const teacher = await user('TEACHER');
    await expect(
      db.teacherStudent.create({ data: { teacherId: teacher.id, studentId: teacher.id } }),
    ).rejects.toThrow();
  });

  it('вид попытки согласован со ссылками', async () => {
    const { teacher, snap } = await snapshot();
    const student = await user('STUDENT');
    const homework = await db.homework.create({
      data: { teacherId: teacher.id, studentId: student.id, snapshotId: snap.id },
    });
    const base = { studentId: student.id, snapshotId: snap.id };

    await expect(
      db.attempt.create({ data: { ...base, kind: 'PRACTICE', homeworkId: homework.id } }),
    ).rejects.toThrow();
    await expect(db.attempt.create({ data: { ...base, kind: 'HOMEWORK' } })).rejects.toThrow();
    await expect(
      db.attempt.create({ data: { ...base, kind: 'HOMEWORK', homeworkId: homework.id } }),
    ).resolves.toMatchObject({ kind: 'HOMEWORK' });
  });

  it('попытка ДЗ не может ссылаться на чужой снимок или чужого ученика', async () => {
    const { teacher, lesson, snap } = await snapshot();
    const otherSnap = await db.lessonSnapshot.create({
      data: { lessonId: lesson.id, lessonVersion: 2, blocks: [], answerKeys: {} },
    });
    const student = await user('STUDENT');
    const stranger = await user('STUDENT');
    const homework = await db.homework.create({
      data: { teacherId: teacher.id, studentId: student.id, snapshotId: snap.id },
    });

    await expect(
      db.attempt.create({
        data: {
          studentId: student.id,
          snapshotId: otherSnap.id,
          kind: 'HOMEWORK',
          homeworkId: homework.id,
        },
      }),
    ).rejects.toThrow();
    await expect(
      db.attempt.create({
        data: {
          studentId: stranger.id,
          snapshotId: snap.id,
          kind: 'HOMEWORK',
          homeworkId: homework.id,
        },
      }),
    ).rejects.toThrow();
  });

  it('попытка класса — только участника и по снимку этого класса', async () => {
    const { teacher, snap } = await snapshot();
    const student = await user('STUDENT');
    const live = await db.liveSession.create({
      data: { teacherId: teacher.id, snapshotId: snap.id },
    });
    const data = {
      studentId: student.id,
      snapshotId: snap.id,
      kind: 'LIVE' as const,
      liveSessionId: live.id,
    };

    await expect(db.attempt.create({ data })).rejects.toThrow();

    await db.liveSessionParticipant.create({
      data: { liveSessionId: live.id, studentId: student.id },
    });
    await expect(db.attempt.create({ data })).resolves.toMatchObject({ kind: 'LIVE' });
  });

  it('оценка вне 2–5 отклоняется', async () => {
    const { teacher, snap } = await snapshot();
    const student = await user('STUDENT');
    const homework = await db.homework.create({
      data: { teacherId: teacher.id, studentId: student.id, snapshotId: snap.id },
    });
    const attempt = await db.attempt.create({
      data: {
        studentId: student.id,
        snapshotId: snap.id,
        kind: 'HOMEWORK',
        homeworkId: homework.id,
      },
    });

    await expect(
      db.homeworkSubmission.create({
        data: { homeworkId: homework.id, attemptId: attempt.id, grade: 6 },
      }),
    ).rejects.toThrow();
  });

  it('ученика с историей ДЗ удалить нельзя — история не стирается каскадом', async () => {
    const { teacher, snap } = await snapshot();
    const student = await user('STUDENT');
    await db.homework.create({
      data: { teacherId: teacher.id, studentId: student.id, snapshotId: snap.id },
    });

    await expect(db.user.delete({ where: { id: student.id } })).rejects.toThrow();
  });
});
