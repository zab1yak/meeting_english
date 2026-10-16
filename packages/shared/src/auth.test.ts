import { describe, expect, it } from 'vitest';

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  acceptInviteInputSchema,
  changePasswordInputSchema,
  emailSchema,
  loginInputSchema,
  passwordSchema,
  registerTeacherInputSchema,
} from './auth';

describe('emailSchema', () => {
  it('обрезает пробелы и приводит к нижнему регистру', () => {
    expect(emailSchema.parse('  Anna.Koroleva@Mail.RU ')).toBe('anna.koroleva@mail.ru');
  });

  it.each(['', 'anna', 'anna@', '@mail.ru', 'a b@mail.ru'])('отклоняет «%s»', (value) => {
    expect(emailSchema.safeParse(value).success).toBe(false);
  });

  it('отклоняет слишком длинный адрес', () => {
    expect(emailSchema.safeParse(`${'a'.repeat(250)}@mail.ru`).success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('принимает пароль минимальной длины', () => {
    expect(passwordSchema.safeParse('x'.repeat(PASSWORD_MIN_LENGTH)).success).toBe(true);
  });

  it('отклоняет пароль короче минимума', () => {
    expect(passwordSchema.safeParse('x'.repeat(PASSWORD_MIN_LENGTH - 1)).success).toBe(false);
  });

  it('отклоняет пароль длиннее максимума (защита argon2 от огромного ввода)', () => {
    expect(passwordSchema.safeParse('x'.repeat(PASSWORD_MAX_LENGTH + 1)).success).toBe(false);
  });

  it('не обрезает пробелы: они часть пароля', () => {
    expect(passwordSchema.parse(' pass word ')).toBe(' pass word ');
  });
});

describe('схемы форм', () => {
  it('регистрация учителя: имя обрезается и не может быть пустым', () => {
    const ok = registerTeacherInputSchema.parse({
      name: '  Анна ',
      email: 'A@B.ru',
      password: 'secret-pass',
    });
    expect(ok).toEqual({ name: 'Анна', email: 'a@b.ru', password: 'secret-pass' });
    expect(
      registerTeacherInputSchema.safeParse({
        name: '   ',
        email: 'a@b.ru',
        password: 'secret-pass',
      }).success,
    ).toBe(false);
  });

  it('вход: пароль не проверяется на длину (старые пароли не должны блокироваться)', () => {
    expect(loginInputSchema.safeParse({ email: 'a@b.ru', password: 'x' }).success).toBe(true);
    expect(loginInputSchema.safeParse({ email: 'a@b.ru', password: '' }).success).toBe(false);
  });

  it('приглашение: те же правила, что у регистрации', () => {
    expect(
      acceptInviteInputSchema.safeParse({ name: 'Иван', email: 'i@b.ru', password: 'short' })
        .success,
    ).toBe(false);
  });

  it('смена пароля: новый должен отличаться от текущего', () => {
    expect(
      changePasswordInputSchema.safeParse({
        currentPassword: 'old-password',
        newPassword: 'old-password',
      }).success,
    ).toBe(false);
    expect(
      changePasswordInputSchema.safeParse({
        currentPassword: 'old-password',
        newPassword: 'new-password',
      }).success,
    ).toBe(true);
  });
});
