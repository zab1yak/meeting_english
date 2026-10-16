import type { Metadata } from 'next';

import { CabinetHeader } from '@/components/cabinet-header';
import { Card } from '@/components/ui';
import { t } from '@/i18n';
import { requireStudent } from '@/lib/server/dal';

export const metadata: Metadata = { title: t('cabinet', 'studentTitle') };

/** Кабинет ученика. Уроки и ДЗ появятся в задачах 5–8. */
export default async function StudentPage() {
  const student = await requireStudent();

  return (
    <>
      <CabinetHeader userName={student.name} />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1">{t('cabinet', 'studentTitle')}</h1>
          <p className="text-muted-text">{t('cabinet', 'greeting', { name: student.name })}</p>
        </div>
        <Card>
          <p className="text-muted-text">{t('cabinet', 'comingSoon')}</p>
        </Card>
      </main>
    </>
  );
}
