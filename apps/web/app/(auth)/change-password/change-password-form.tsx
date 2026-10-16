'use client';

import { PASSWORD_MIN_LENGTH } from '@me/shared';
import { useActionState } from 'react';

import { Button, Input } from '@/components/ui';
import { t } from '@/i18n';

import { changePasswordAction } from '../actions';
import { FormError } from '../form-parts';
import { initialFormState } from '../form-state';

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initialFormState);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormError message={state.error} />
      <Input
        id="current-password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        label={t('auth', 'currentPassword')}
        error={state.fieldErrors?.currentPassword}
        required
      />
      <Input
        id="new-password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        label={t('auth', 'newPassword')}
        hint={t('auth', 'passwordHint', { min: PASSWORD_MIN_LENGTH })}
        error={state.fieldErrors?.newPassword}
        minLength={PASSWORD_MIN_LENGTH}
        required
      />
      <Button type="submit" disabled={pending} className="w-full">
        {t('auth', 'submitChangePassword')}
      </Button>
    </form>
  );
}
