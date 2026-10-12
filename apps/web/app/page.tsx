import { APP_NAME } from '@me/shared';

import { t } from '@/i18n';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-3 px-6">
      <h1 className="text-3xl font-semibold">{t('home', 'title', { appName: APP_NAME })}</h1>
      <p>{t('home', 'subtitle')}</p>
    </main>
  );
}
