import Link from 'next/link';
import type { ReactNode } from 'react';

import { Card } from '@/components/ui';
import { t } from '@/i18n';
import { cn } from '@/lib/cn';

type AuthCardProps = {
  title: string;
  description?: string;
  /** Переключатель «Вход / Регистрация» для этих двух экранов. */
  tab?: 'login' | 'register';
  children: ReactNode;
};

export function AuthCard({ title, description, tab, children }: AuthCardProps) {
  return (
    <Card className="flex flex-col gap-6 p-6 sm:p-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1">{title}</h1>
        {description && <p className="text-muted-text">{description}</p>}
      </div>
      {tab && (
        <nav aria-label={t('auth', 'tabsLabel')} className="flex gap-1 border-b border-border">
          <TabLink href="/login" current={tab === 'login'}>
            {t('auth', 'tabLogin')}
          </TabLink>
          <TabLink href="/register" current={tab === 'register'}>
            {t('auth', 'tabRegister')}
          </TabLink>
        </nav>
      )}
      {children}
    </Card>
  );
}

function TabLink({
  href,
  current,
  children,
}: {
  href: string;
  current: boolean;
  children: string;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={cn(
        'px-4 py-3 text-body transition-colors',
        current
          ? 'font-medium text-primary shadow-[inset_0_-2px_0_var(--color-primary)]'
          : 'text-muted-text hover:text-text',
      )}
    >
      {children}
    </Link>
  );
}
