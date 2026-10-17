'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui';
import { t } from '@/i18n';

import { resetStudentPasswordAction, type ResetPasswordState } from './actions';

type Props = { studentId: string; studentName: string };

export function ResetPasswordButton({ studentId, studentName }: Props) {
  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(
    resetStudentPasswordAction.bind(null, studentId),
    {},
  );

  return (
    <form action={action} className="flex flex-col items-end gap-2">
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {t('cabinet', 'resetPassword')}
      </Button>
      {state.tempPassword && (
        <p role="status" className="max-w-sm text-caption">
          {t('cabinet', 'resetPasswordDone', {
            name: studentName,
            password: state.tempPassword,
          })}
        </p>
      )}
      {state.error && (
        <p role="alert" className="text-caption text-error">
          {state.error}
        </p>
      )}
    </form>
  );
}
