import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { t } from '@/i18n';
import { homePathFor } from '@/lib/access';
import { getCurrentUser } from '@/lib/server/dal';

import { AccountForm } from '../account-form';
import { registerTeacherAction } from '../actions';
import { AuthCard } from '../auth-card';

export const metadata: Metadata = { title: t('auth', 'registerTitle') };

/** Регистрация открыта только учителям; ученики приходят по ссылке-приглашению. */
export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role));

  return (
    <AuthCard
      title={t('auth', 'registerTitle')}
      description={t('auth', 'studentHint')}
      tab="register"
    >
      <AccountForm
        idPrefix="register"
        action={registerTeacherAction}
        submitLabel={t('auth', 'submitRegister')}
      />
    </AuthCard>
  );
}
