import type { Metadata } from 'next';

import { t } from '@/i18n';
import { requireUser } from '@/lib/server/dal';

import { AuthCard } from '../auth-card';
import { ChangePasswordForm } from './change-password-form';

export const metadata: Metadata = { title: t('auth', 'changePasswordTitle') };

export default async function ChangePasswordPage() {
  const user = await requireUser({ allowPasswordChange: true });

  return (
    <AuthCard
      title={t('auth', 'changePasswordTitle')}
      description={user.mustChangePassword ? t('auth', 'changePasswordTemp') : undefined}
    >
      <ChangePasswordForm />
    </AuthCard>
  );
}
