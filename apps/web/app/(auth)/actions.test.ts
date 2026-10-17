import type * as Auth from '@me/auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Слой Server Actions: какие решения он принимает поверх @me/auth.
 * БД, cookie и редирект Next подменены — сами сервисы покрыты интеграционными тестами.
 */
class Redirect extends Error {
  constructor(readonly url: string) {
    super(`redirect ${url}`);
  }
}

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(),
  changePassword: vi.fn(),
  registerTeacher: vi.fn(),
  resetStudentPassword: vi.fn(),
  startSession: vi.fn(),
  requireUser: vi.fn(),
  requireTeacher: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Redirect(url);
  },
}));
vi.mock('next/headers', () => ({ headers: () => Promise.resolve(new Headers()) }));
vi.mock('@/lib/server/db', () => ({ getDb: () => ({}) }));
vi.mock('@/lib/server/session', () => ({ startSession: mocks.startSession, endSession: vi.fn() }));
vi.mock('@/lib/server/dal', () => ({
  requireUser: mocks.requireUser,
  requireStudent: vi.fn(),
  requireTeacher: mocks.requireTeacher,
}));
vi.mock('@me/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof Auth>()),
  authenticate: mocks.authenticate,
  changePassword: mocks.changePassword,
  registerTeacher: mocks.registerTeacher,
  resetStudentPassword: mocks.resetStudentPassword,
}));

const { changePasswordAction, loginAction, registerTeacherAction } = await import('./actions');
const { resetStudentPasswordAction } = await import('../teacher/actions');

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

async function redirectOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof Redirect) return error.url;
    throw error;
  }
  throw new Error('ожидался редирект');
}

const teacher = { id: 't1', role: 'TEACHER', mustChangePassword: false };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('loginAction', () => {
  it('неверные данные: общая ошибка, почта сохраняется, сессия не создаётся', async () => {
    mocks.authenticate.mockResolvedValue(null);
    const state = await loginAction({}, form({ email: 'a@b.ru', password: 'x' }));
    expect(state.error).toBeTruthy();
    expect(state.values).toEqual({ email: 'a@b.ru' });
    expect(mocks.startSession).not.toHaveBeenCalled();
  });

  it('временный пароль — на смену пароля, даже если передан next', async () => {
    mocks.authenticate.mockResolvedValue({ ...teacher, mustChangePassword: true });
    const url = await redirectOf(
      loginAction({}, form({ email: 'a@b.ru', password: 'x', next: '/teacher/x' })),
    );
    expect(url).toBe('/change-password');
    expect(mocks.startSession).toHaveBeenCalledWith('t1');
  });

  it('внутренний next соблюдается, внешний — заменяется кабинетом роли', async () => {
    mocks.authenticate.mockResolvedValue(teacher);
    expect(
      await redirectOf(
        loginAction({}, form({ email: 'a@b.ru', password: 'x', next: '/teacher/x' })),
      ),
    ).toBe('/teacher/x');
    expect(
      await redirectOf(
        loginAction({}, form({ email: 'a@b.ru', password: 'x', next: '//evil.example' })),
      ),
    ).toBe('/teacher');
  });
});

describe('registerTeacherAction', () => {
  it('ошибки полей возвращаются без обращения к сервису', async () => {
    const state = await registerTeacherAction(
      {},
      form({ name: '', email: 'bad', password: 'short' }),
    );
    expect(Object.keys(state.fieldErrors ?? {}).sort()).toEqual(['email', 'name', 'password']);
    expect(mocks.registerTeacher).not.toHaveBeenCalled();
  });

  it('занятая почта — ошибка у поля email', async () => {
    mocks.registerTeacher.mockResolvedValue({ ok: false, code: 'EMAIL_TAKEN' });
    const state = await registerTeacherAction(
      {},
      form({ name: 'Анна', email: 'a@b.ru', password: 'secret-pass' }),
    );
    expect(state.fieldErrors?.email).toBeTruthy();
    expect(mocks.startSession).not.toHaveBeenCalled();
  });
});

describe('changePasswordAction', () => {
  beforeEach(() => {
    mocks.requireUser.mockResolvedValue(teacher);
  });

  it('после смены пароля открывается новая сессия и редирект в кабинет', async () => {
    mocks.changePassword.mockResolvedValue({ ok: true });
    const url = await redirectOf(
      changePasswordAction({}, form({ currentPassword: 'old-pass-1', newPassword: 'new-pass-1' })),
    );
    expect(url).toBe('/teacher');
    expect(mocks.startSession).toHaveBeenCalledWith('t1');
    expect(mocks.requireUser).toHaveBeenCalledWith({ allowPasswordChange: true });
  });

  it('сбой новой сессии после смены пароля — на вход, а не ошибка', async () => {
    mocks.changePassword.mockResolvedValue({ ok: true });
    mocks.startSession.mockRejectedValue(new Error('db down'));
    const url = await redirectOf(
      changePasswordAction({}, form({ currentPassword: 'old-pass-1', newPassword: 'new-pass-1' })),
    );
    expect(url).toBe('/login');
  });

  it('неверный текущий пароль — ошибка у поля, сессия не трогается', async () => {
    mocks.changePassword.mockResolvedValue({ ok: false, code: 'INVALID_CREDENTIALS' });
    const state = await changePasswordAction(
      {},
      form({ currentPassword: 'wrong-pass', newPassword: 'new-pass-1' }),
    );
    expect(state.fieldErrors?.currentPassword).toBeTruthy();
    expect(mocks.startSession).not.toHaveBeenCalled();
  });
});

describe('resetStudentPasswordAction', () => {
  it('общий ученик — понятное объяснение вместо общей ошибки', async () => {
    mocks.requireTeacher.mockResolvedValue(teacher);
    mocks.resetStudentPassword.mockResolvedValue({ ok: false, code: 'SHARED_STUDENT' });
    const state = await resetStudentPasswordAction('s1', {});
    expect(state.error).toMatch(/нескольк/);
  });
});
