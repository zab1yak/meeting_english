import { APP_NAME } from '@me/shared';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { buttonClasses } from '@/components/ui';
import { t } from '@/i18n';
import { homePathFor } from '@/lib/access';
import { getCurrentUser } from '@/lib/server/dal';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user.role));

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-h1">{t('home', 'title', { appName: APP_NAME })}</h1>
        <p className="text-muted-text">{t('auth', 'tagline')}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/login" className={buttonClasses('primary')}>
          {t('auth', 'submitLogin')}
        </Link>
        <Link href="/register" className={buttonClasses('secondary')}>
          {t('auth', 'tabRegister')}
        </Link>
      </div>
    </main>
  );
}
