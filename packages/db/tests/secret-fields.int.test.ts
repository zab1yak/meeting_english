import { afterAll, beforeEach, expect, expectTypeOf, it } from 'vitest';

import { createTestDb, describeWithDb, resetDb } from '../src/testing';

/**
 * Сторож: секретные поля не попадают в обычные запросы. Если кто-то уберёт
 * глобальный omit или поле переименуют, тест упадёт раньше, чем ключ утечёт ученику.
 */
const KEY_SENTINEL = '__ANSWER_KEY_SENTINEL__';

describeWithDb('секретные поля скрыты глобальным omit', () => {
  const db = createTestDb();

  beforeEach(async () => {
    await resetDb(db);
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  async function seedLesson() {
    const teacher = await db.user.create({
      data: { email: 't@example.com', passwordHash: 'hash', name: 'T', role: 'TEACHER' },
    });
    const course = await db.course.create({
      data: { ownerId: teacher.id, title: 'C', position: 0 },
    });
    const lesson = await db.lesson.create({
      data: { courseId: course.id, title: 'L', position: 0 },
    });
    const block = await db.block.create({
      data: {
        lessonId: lesson.id,
        type: 'GAP_SELECT',
        position: 0,
        content: { text: 'I [go|goes] home' },
        answerKey: { items: { g1: KEY_SENTINEL } },
      },
    });
    const snapshot = await db.lessonSnapshot.create({
      data: {
        lessonId: lesson.id,
        lessonVersion: 1,
        blocks: [{ id: block.id, content: {} }],
        answerKeys: { [block.id]: KEY_SENTINEL },
      },
    });
    return { teacher, lesson, block, snapshot };
  }

  it('Block.answerKey нет ни в create, ни в find*, ни в include', async () => {
    const { lesson, block } = await seedLesson();

    const results = [
      block,
      await db.block.findUnique({ where: { id: block.id } }),
      await db.block.findMany({ where: { lessonId: lesson.id } }),
      await db.lesson.findUnique({ where: { id: lesson.id }, include: { blocks: true } }),
      await db.course.findMany({ include: { lessons: { include: { blocks: true } } } }),
    ];
    for (const result of results) {
      expect(JSON.stringify(result)).not.toContain(KEY_SENTINEL);
      expect(JSON.stringify(result)).not.toContain('answerKey');
    }
  });

  it('LessonSnapshot.answerKeys скрыт', async () => {
    const { lesson, snapshot } = await seedLesson();
    const results = [
      snapshot,
      await db.lessonSnapshot.findUnique({ where: { id: snapshot.id } }),
      await db.lesson.findUnique({ where: { id: lesson.id }, include: { snapshots: true } }),
    ];
    for (const result of results) {
      expect(JSON.stringify(result)).not.toContain(KEY_SENTINEL);
    }
  });

  it('User.passwordHash скрыт', async () => {
    const { teacher } = await seedLesson();
    expect(teacher).not.toHaveProperty('passwordHash');
    expect(await db.user.findUnique({ where: { id: teacher.id } })).not.toHaveProperty(
      'passwordHash',
    );
  });

  it('ключ доступен только при явном запросе', async () => {
    const { block } = await seedLesson();
    const withKey = await db.block.findUniqueOrThrow({
      where: { id: block.id },
      omit: { answerKey: false },
    });
    expect(JSON.stringify(withKey.answerKey)).toContain(KEY_SENTINEL);
  });

  it('типы результатов тоже без секретных полей', () => {
    type BlockRow = Awaited<ReturnType<typeof db.block.findFirstOrThrow>>;
    type SnapshotRow = Awaited<ReturnType<typeof db.lessonSnapshot.findFirstOrThrow>>;
    type UserRow = Awaited<ReturnType<typeof db.user.findFirstOrThrow>>;
    expectTypeOf<BlockRow>().not.toHaveProperty('answerKey');
    expectTypeOf<SnapshotRow>().not.toHaveProperty('answerKeys');
    expectTypeOf<UserRow>().not.toHaveProperty('passwordHash');
  });

  it('снимок урока нельзя изменить', async () => {
    const { snapshot } = await seedLesson();
    await expect(
      db.lessonSnapshot.update({ where: { id: snapshot.id }, data: { lessonVersion: 2 } }),
    ).rejects.toThrow(/immutable/);
  });

  it('при удалении урока снимок остаётся с lessonId = null', async () => {
    const { lesson, snapshot } = await seedLesson();
    await db.lesson.delete({ where: { id: lesson.id } });
    const kept = await db.lessonSnapshot.findUniqueOrThrow({ where: { id: snapshot.id } });
    expect(kept.lessonId).toBeNull();
  });

  it('email в верхнем регистре отклоняется базой', async () => {
    await expect(
      db.user.create({
        data: { email: 'Mixed@Example.com', passwordHash: 'h', name: 'M', role: 'TEACHER' },
      }),
    ).rejects.toThrow();
  });

  it('у учителя только один активный класс', async () => {
    const { teacher, snapshot } = await seedLesson();
    await db.liveSession.create({ data: { teacherId: teacher.id, snapshotId: snapshot.id } });
    await expect(
      db.liveSession.create({ data: { teacherId: teacher.id, snapshotId: snapshot.id } }),
    ).rejects.toThrow();
  });
});
