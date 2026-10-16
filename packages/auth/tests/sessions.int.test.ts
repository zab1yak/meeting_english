import { createTestDb, describeWithDb, resetDb } from '@me/db/testing';
import { afterAll, beforeEach, expect, it } from 'vitest';

import { hashToken } from '../src/token';
import {
  MAX_SESSIONS_PER_USER,
  createSession,
  revokeAllSessions,
  revokeSession,
  validateSession,
} from '../src/sessions';
import { createUser } from './helpers';

const DAY = 24 * 60 * 60 * 1000;
const t0 = new Date('2026-03-01T10:00:00Z');
const at = (days: number) => new Date(t0.getTime() + days * DAY);

describeWithDb('сессии', () => {
  const db = createTestDb();

  beforeEach(async () => {
    await resetDb(db);
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it('создаёт сессию: в БД лежит только хэш токена', async () => {
    const user = await createUser(db, 'TEACHER');
    const { token, expiresAt } = await createSession(
      db,
      user.id,
      { ip: '1.2.3.4', userAgent: 'test' },
      t0,
    );

    expect(expiresAt).toEqual(at(30));
    const rows = await db.authSession.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe(hashToken(token));
    expect(rows[0]?.id).not.toBe(token);
    expect(rows[0]).toMatchObject({ userId: user.id, ip: '1.2.3.4', userAgent: 'test' });
  });

  it('по токену возвращает пользователя без секретов', async () => {
    const user = await createUser(db, 'STUDENT');
    const { token } = await createSession(db, user.id, {}, t0);

    const current = await validateSession(db, token, at(1));
    expect(current).toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'STUDENT',
      mustChangePassword: false,
      sessionId: hashToken(token),
    });
    expect(JSON.stringify(current)).not.toContain('argon2');
  });

  it('неизвестный и пустой токен — null', async () => {
    expect(await validateSession(db, 'unknown-token', t0)).toBeNull();
    expect(await validateSession(db, '', t0)).toBeNull();
  });

  it('истёкшая сессия — null и удаляется', async () => {
    const user = await createUser(db, 'TEACHER');
    const { token } = await createSession(db, user.id, {}, t0);

    expect(await validateSession(db, token, at(30))).toBeNull();
    expect(await db.authSession.count()).toBe(0);
  });

  it('продлевается при использовании во второй половине срока', async () => {
    const user = await createUser(db, 'TEACHER');
    const { token } = await createSession(db, user.id, {}, t0);

    await validateSession(db, token, at(5));
    expect((await db.authSession.findFirstOrThrow()).expiresAt).toEqual(at(30));

    await validateSession(db, token, at(20));
    expect((await db.authSession.findFirstOrThrow()).expiresAt).toEqual(at(50));
  });

  it('не живёт дольше 90 дней даже при ежедневном использовании', async () => {
    const user = await createUser(db, 'TEACHER');
    const { token } = await createSession(db, user.id, {}, t0);

    for (let day = 20; day < 90; day += 20) {
      expect(await validateSession(db, token, at(day))).not.toBeNull();
    }
    expect(await validateSession(db, token, at(90))).toBeNull();
  });

  it('выход удаляет только текущую сессию', async () => {
    const user = await createUser(db, 'TEACHER');
    const first = await createSession(db, user.id, {}, t0);
    const second = await createSession(db, user.id, {}, t0);

    await revokeSession(db, first.token);

    expect(await validateSession(db, first.token, t0)).toBeNull();
    expect(await validateSession(db, second.token, t0)).not.toBeNull();
  });

  it('revokeAllSessions удаляет все сессии пользователя, кроме указанной, и не трогает чужие', async () => {
    const user = await createUser(db, 'STUDENT');
    const other = await createUser(db, 'STUDENT');
    const keep = await createSession(db, user.id, {}, t0);
    const drop = await createSession(db, user.id, {}, t0);
    const foreign = await createSession(db, other.id, {}, t0);

    await revokeAllSessions(db, user.id, { exceptSessionId: hashToken(keep.token) });

    expect(await validateSession(db, keep.token, t0)).not.toBeNull();
    expect(await validateSession(db, drop.token, t0)).toBeNull();
    expect(await validateSession(db, foreign.token, t0)).not.toBeNull();

    await revokeAllSessions(db, user.id);
    expect(await validateSession(db, keep.token, t0)).toBeNull();
  });

  it(`держит не больше ${MAX_SESSIONS_PER_USER} сессий: старейшие вытесняются`, async () => {
    const user = await createUser(db, 'TEACHER');
    const tokens: string[] = [];
    for (let i = 0; i <= MAX_SESSIONS_PER_USER; i++) {
      tokens.push((await createSession(db, user.id, {}, new Date(t0.getTime() + i * 1000))).token);
    }

    expect(await db.authSession.count({ where: { userId: user.id } })).toBe(MAX_SESSIONS_PER_USER);
    expect(await validateSession(db, tokens[0] ?? '', t0)).toBeNull();
    expect(await validateSession(db, tokens.at(-1) ?? '', t0)).not.toBeNull();
  });

  it('длинный ip и user-agent обрезаются, а не роняют вход', async () => {
    const user = await createUser(db, 'TEACHER');
    await createSession(db, user.id, { ip: '9'.repeat(200), userAgent: 'x'.repeat(5000) }, t0);
    const row = await db.authSession.findFirstOrThrow();
    expect(row.ip?.length).toBeLessThanOrEqual(64);
    expect(row.userAgent?.length).toBeLessThanOrEqual(512);
  });
});
