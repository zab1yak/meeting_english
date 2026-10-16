import { APP_NAME } from '@me/shared';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icon } from '@/components/ui';

/** Оболочка экранов входа: бренд сверху, карточка по центру, тёмный футер (макет 01). */
export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center px-4 py-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2 text-label text-primary">
          <Icon icon={BookOpen} tone="primary" />
          {APP_NAME}
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-6">
        <div className="w-full max-w-[440px]">{children}</div>
      </main>
      <footer className="bg-dark px-4 py-5 text-caption text-on-primary sm:px-10">
        © {new Date().getFullYear()} {APP_NAME}
      </footer>
    </div>
  );
}
