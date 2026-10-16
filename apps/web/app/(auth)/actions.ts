'use server';

import {
  acceptInviteAsExistingStudent,
  acceptInviteAsNewStudent,
  authenticate,
  changePassword,
  registerTeacher,
  safeRedirectPath,
} from '@me/auth';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  passwordSchema,
  registerTeacherInputSchema,
} from '@me/shared';
import { redirect } from 'next/navigation';

import { t } from '@/i18n';
import { homePathFor } from '@/lib/access';
import { getDb } from '@/lib/server/db';
import { requireStudent, requireUser } from '@/lib/server/dal';
import { endSession, startSession } from '@/lib/server/session';

import type { FormState } from './form-state';

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

const passwordError = () =>
  t('auth', 'invalidPassword', { min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH });

/** Ошибки полей регистрации и приглашения по общей схеме @me/shared, или null. */
function accountFieldErrors(input: { name: string; email: string; password: string }) {
  const parsed = registerTeacherInputSchema.safeParse(input);
  if (parsed.success) return null;
  const fields = new Set(parsed.error.issues.map((issue) => issue.path[0]));
  const errors: NonNullable<FormState['fieldErrors']> = {};
  if (fields.has('name')) errors.name = t('auth', 'invalidName');
  if (fields.has('email')) errors.email = t('auth', 'invalidEmail');
  if (fields.has('password')) errors.password = passwordError();
  return errors;
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = field(formData, 'email');
  const user = await authenticate(getDb(), { email, password: field(formData, 'password') });
  if (!user) return { error: t('auth', 'invalidCredentials'), values: { email } };

  await startSession(user.id);
  if (user.mustChangePassword) redirect('/change-password');
  redirect(safeRedirectPath(field(formData, 'next'), homePathFor(user.role)));
}

export async function registerTeacherAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const input = {
    name: field(formData, 'name'),
    email: field(formData, 'email'),
    password: field(formData, 'password'),
  };
  const values = { name: input.name, email: input.email };

  const fieldErrors = accountFieldErrors(input);
  if (fieldErrors) return { fieldErrors, values };

  const result = await registerTeacher(getDb(), input);
  if (!result.ok) {
    return result.code === 'EMAIL_TAKEN'
      ? { fieldErrors: { email: t('auth', 'emailTaken') }, values }
      : { error: t('auth', 'genericError'), values };
  }

  await startSession(result.user.id);
  redirect('/teacher');
}

export async function acceptInviteAction(
  token: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const input = {
    name: field(formData, 'name'),
    email: field(formData, 'email'),
    password: field(formData, 'password'),
  };
  const values = { name: input.name, email: input.email };

  const fieldErrors = accountFieldErrors(input);
  if (fieldErrors) return { fieldErrors, values };

  const result = await acceptInviteAsNewStudent(getDb(), token, input);
  if (!result.ok) {
    if (result.code === 'EMAIL_TAKEN') {
      return { fieldErrors: { email: t('auth', 'emailTaken') }, values };
    }
    if (result.code === 'INVITE_INVALID') return { error: t('auth', 'inviteInvalid'), values };
    return { error: t('auth', 'genericError'), values };
  }

  await startSession(result.user.id);
  redirect('/student');
}

/** Уже вошедший ученик принимает приглашение ещё одного учителя. */
export async function joinTeacherAction(token: string): Promise<FormState> {
  const student = await requireStudent();
  const result = await acceptInviteAsExistingStudent(getDb(), token, student.id);
  if (!result.ok) return { error: t('auth', 'inviteInvalid') };
  redirect('/student');
}

export async function changePasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser({ allowPasswordChange: true });
  const currentPassword = field(formData, 'currentPassword');
  const newPassword = field(formData, 'newPassword');

  if (!passwordSchema.safeParse(newPassword).success) {
    return { fieldErrors: { newPassword: passwordError() } };
  }
  if (newPassword === currentPassword) {
    return { fieldErrors: { newPassword: t('auth', 'newPasswordSame') } };
  }

  const result = await changePassword(getDb(), user.id, { currentPassword, newPassword });
  if (!result.ok) {
    return result.code === 'INVALID_CREDENTIALS'
      ? { fieldErrors: { currentPassword: t('auth', 'currentPasswordWrong') } }
      : { error: t('auth', 'genericError') };
  }

  // Смена пароля отозвала все сессии, включая эту, — открываем новую.
  await startSession(user.id);
  redirect(homePathFor(user.role));
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect('/login');
}
