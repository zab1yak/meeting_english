'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui';
import { t } from '@/i18n';

import { joinTeacherAction } from '../../actions';
import { FormError } from '../../form-parts';
import { initialFormState } from '../../form-state';

export function JoinTeacherForm({ token }: { token: string }) {
  // bind, а не замыкание: Server Action со связанным токеном работает и без JavaScript.
  const [state, action, pending] = useActionState(
    joinTeacherAction.bind(null, token),
    initialFormState,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormError message={state.error} />
      <Button type="submit" disabled={pending} className="w-full">
        {t('auth', 'inviteJoin')}
      </Button>
    </form>
  );
}
