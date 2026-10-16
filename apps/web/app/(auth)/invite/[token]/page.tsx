import { findInvite } from '@me/auth';
import { APP_NAME } from '@me/shared';
import type { Metadata } from 'next';

import { t } from '@/i18n';
import { getDb } from '@/lib/server/db';
import { getCurrentUser } from '@/lib/server/dal';

import { AccountForm } from '../../account-form';
import { acceptInviteAction } from '../../actions';
import { AuthCard } from '../../auth-card';
import { FormError } from '../../form-parts';
import { JoinTeacherForm } from './join-teacher-form';

export const metadata: Metadata = {
  title: t('auth', 'inviteTitle'),
  // Токен в адресе: страницу не индексируем и не отдаём Referer на сторонние сайты.
  robots: { index: false },
  referrer: 'no-referrer',
};

export default async function InvitePage({ params }: PageProps<'/invite/[token]'>) {
  const { token } = await params;
  const [invite, user] = await Promise.all([findInvite(getDb(), token), getCurrentUser()]);
  const title = t('auth', 'inviteTitle');

  if (!invite) {
    return (
      <AuthCard title={title}>
        <FormError message={t('auth', 'inviteInvalid')} />
      </AuthCard>
    );
  }

  if (user?.role === 'TEACHER') {
    return (
      <AuthCard title={title}>
        <p>{t('auth', 'inviteTeacherSignedIn')}</p>
      </AuthCard>
    );
  }

  if (user) {
    return (
      <AuthCard
        title={title}
        description={t('auth', 'inviteJoinText', { teacher: invite.teacherName, name: user.name })}
      >
        <JoinTeacherForm token={token} />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={title}
      description={t('auth', 'inviteText', { teacher: invite.teacherName, appName: APP_NAME })}
    >
      <AccountForm
        idPrefix="invite"
        action={acceptInviteAction.bind(null, token)}
        submitLabel={t('auth', 'submitInvite')}
      />
    </AuthCard>
  );
}
