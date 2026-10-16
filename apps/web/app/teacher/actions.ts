'use server';

import { createInvite, resetStudentPassword } from '@me/auth';
import { headers } from 'next/headers';

import { t } from '@/i18n';
import { getDb } from '@/lib/server/db';
import { requireTeacher } from '@/lib/server/dal';

export type InviteState = { link?: string; expiresAt?: string; error?: string };

/** Адрес сайта для ссылки: APP_ORIGIN в продакшне, иначе из заголовков запроса (локально). */
async function appOrigin(): Promise<string> {
  const configured = process.env['APP_ORIGIN'];
  if (configured) return configured.replace(/\/+$/, '');
  const list = await headers();
  const host = list.get('x-forwarded-host') ?? list.get('host') ?? 'localhost:3000';
  const proto = list.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

export async function createInviteAction(): Promise<InviteState> {
  const teacher = await requireTeacher();
  const result = await createInvite(getDb(), teacher.id);
  if (!result.ok) return { error: t('auth', 'genericError') };
  return {
    link: `${await appOrigin()}/invite/${result.token}`,
    expiresAt: result.expiresAt.toISOString(),
  };
}

export type ResetPasswordState = { tempPassword?: string; error?: string };

export async function resetStudentPasswordAction(studentId: string): Promise<ResetPasswordState> {
  const teacher = await requireTeacher();
  const result = await resetStudentPassword(getDb(), teacher.id, studentId);
  if (!result.ok) return { error: t('auth', 'genericError') };
  return { tempPassword: result.tempPassword };
}
