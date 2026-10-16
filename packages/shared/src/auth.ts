import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;
/** Верхний предел защищает argon2 от мегабайтных паролей. */
export const PASSWORD_MAX_LENGTH = 128;

/** Email хранится нормализованным: без пробелов по краям и в нижнем регистре. */
export const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());

export const passwordSchema = z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH);

export const nameSchema = z.string().trim().min(1).max(100);

export const registerTeacherInputSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterTeacherInput = z.input<typeof registerTeacherInputSchema>;

/** При входе длину не проверяем: правила могли поменяться после регистрации. */
export const loginInputSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
});
export type LoginInput = z.input<typeof loginInputSchema>;

export const acceptInviteInputSchema = registerTeacherInputSchema;
export type AcceptInviteInput = z.input<typeof acceptInviteInputSchema>;

export const changePasswordInputSchema = z
  .object({
    currentPassword: z.string().min(1).max(PASSWORD_MAX_LENGTH),
    newPassword: passwordSchema,
  })
  .refine(({ currentPassword, newPassword }) => currentPassword !== newPassword, {
    path: ['newPassword'],
    message: 'Новый пароль должен отличаться от текущего',
  });
export type ChangePasswordInput = z.input<typeof changePasswordInputSchema>;
