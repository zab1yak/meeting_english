import { describe, expect, it } from 'vitest';

import { generateTempPassword, hashPassword, verifyPassword } from './password';

describe('hashPassword / verifyPassword', () => {
  it('хэш argon2id проверяется исходным паролем', async () => {
    const hash = await hashPassword('correct horse');
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(hash, 'correct horse')).toBe(true);
  });

  it('неверный пароль не проходит', async () => {
    const hash = await hashPassword('correct horse');
    expect(await verifyPassword(hash, 'wrong horse')).toBe(false);
  });

  it('соль случайная: два хэша одного пароля различаются', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
  });

  it('без хэша (пользователь не найден) возвращает false, проверяя фиктивный хэш', async () => {
    expect(await verifyPassword(null, 'anything')).toBe(false);
  });

  it('битый хэш не роняет вход, а даёт false', async () => {
    expect(await verifyPassword('not-a-hash', 'anything')).toBe(false);
  });
});

describe('generateTempPassword', () => {
  it('12 символов без похожих букв и цифр (0/O, 1/l/I)', () => {
    const password = generateTempPassword();
    expect(password).toHaveLength(12);
    expect(password).toMatch(/^[a-km-zA-HJ-NP-Z2-9]+$/);
  });

  it('не повторяется', () => {
    const passwords = new Set(Array.from({ length: 200 }, generateTempPassword));
    expect(passwords.size).toBe(200);
  });
});
