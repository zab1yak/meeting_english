import { APP_NAME } from '@me/shared';
import { BookOpen, LogOut } from 'lucide-react';

import { logoutAction } from '@/app/(auth)/actions';
import { Avatar, Button, Icon } from '@/components/ui';
import { t } from '@/i18n';

/** Шапка кабинета: бренд, пользователь и выход (POST-форма — выход не срабатывает от ссылки). */
export function CabinetHeader({ userName }: { userName: string }) {
  return (
    <header className="flex items-center justify-between gap-4 bg-primary px-4 py-3 text-on-primary sm:px-10">
      <span className="flex items-center gap-2 text-label whitespace-nowrap">
        <Icon icon={BookOpen} tone="on-primary" />
        {APP_NAME}
      </span>
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={userName} decorative />
        {/* На телефоне имя видит только скринридер: рядом аватар с инициалами. */}
        <span className="sr-only truncate text-label sm:not-sr-only">{userName}</span>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary" size="sm" icon={LogOut}>
            {t('auth', 'logout')}
          </Button>
        </form>
      </div>
    </header>
  );
}
