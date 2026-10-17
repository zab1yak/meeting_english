'use server';

import { createInvite, resetStudentPassword } from '@me/auth';
import { headers } from 'next/headers';

import { t } from '@/i18n';
import { appOrigin } from '@/lib/app-origin';
import { getDb } from '@/lib/server/db';
import { requireTeacher } from '@/lib/server/dal';

export type InviteState = { link?: string; expiresAt?: string; error?: string };

export async function createInviteAction(): Promise<InviteState> {
  const teacher = await requireTeacher();
  const origin = appOrigin(process.env, (await headers()).get('host'));
  const result = await createInvite(getDb(), teacher.id);
  if (!result.ok) return { error: t('auth', 'genericError') };
  return {
    link: `${origin}/invite/${result.token}`,
    expiresAt: result.expiresAt.toISOString(),
  };
}

export type ResetPasswordState = { tempPassword?: string; error?: string };

/** Вызывается через bind(null, studentId): форма работает и без JavaScript. */
export async function resetStudentPasswordAction(
  studentId: string,
  _prev: ResetPasswordState,
): Promise<ResetPasswordState> {
  const teacher = await requireTeacher();
  const result = await resetStudentPassword(getDb(), teacher.id, studentId);
  if (result.ok) return { tempPassword: result.tempPassword };
  return {
    error:
      result.code === 'SHARED_STUDENT'
        ? t('cabinet', 'resetPasswordShared')
        : t('auth', 'genericError'),
  };
}
