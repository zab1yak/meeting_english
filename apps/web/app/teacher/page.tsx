import { listStudents } from '@me/auth';
import type { Metadata } from 'next';

import { CabinetHeader } from '@/components/cabinet-header';
import { Avatar, Card } from '@/components/ui';
import { t } from '@/i18n';
import { getDb } from '@/lib/server/db';
import { requireTeacher } from '@/lib/server/dal';

import { InvitePanel } from './invite-panel';
import { ResetPasswordButton } from './reset-password-button';

export const metadata: Metadata = { title: t('cabinet', 'teacherTitle') };

/** Кабинет учителя. Полная версия — в задаче 8; здесь приглашения и ученики. */
export default async function TeacherPage() {
  const teacher = await requireTeacher();
  const students = await listStudents(getDb(), teacher.id);

  return (
    <>
      <CabinetHeader userName={teacher.name} />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1">{t('cabinet', 'teacherTitle')}</h1>
          <p className="text-muted-text">{t('cabinet', 'greeting', { name: teacher.name })}</p>
        </div>

        <InvitePanel />

        <Card as="section" className="flex flex-col gap-4">
          <h2 className="text-h2">{t('cabinet', 'studentsTitle')}</h2>
          {students.length === 0 ? (
            <p className="text-muted-text">{t('cabinet', 'studentsEmpty')}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {students.map((student) => (
                <li
                  key={student.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar name={student.name} />
                    <span className="flex min-w-0 flex-col">
                      <span className="text-label">{student.name}</span>
                      <span className="truncate text-caption text-muted-text">{student.email}</span>
                    </span>
                  </span>
                  <ResetPasswordButton studentId={student.id} studentName={student.name} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </>
  );
}
