import { safeRedirectPath } from '@me/auth';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { t } from '@/i18n';
import { homePathFor } from '@/lib/access';
import { getCurrentUser } from '@/lib/server/dal';

import { AuthCard } from '../auth-card';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: t('auth', 'loginTitle') };

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role));

  const { next } = await searchParams;
  const nextPath = safeRedirectPath(typeof next === 'string' ? next : null, '');

  return (
    <AuthCard title={t('auth', 'loginTitle')} description={t('auth', 'tagline')} tab="login">
      <LoginForm next={nextPath} />
    </AuthCard>
  );
}
