'use client';

import { useActionState } from 'react';

import { Button, Input } from '@/components/ui';
import { t } from '@/i18n';

import { loginAction } from '../actions';
import { FormError } from '../form-parts';
import { initialFormState } from '../form-state';

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, initialFormState);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormError message={state.error} />
      <input type="hidden" name="next" value={next} />
      <Input
        id="login-email"
        name="email"
        type="email"
        autoComplete="email"
        label={t('auth', 'email')}
        defaultValue={state.values?.email}
        required
      />
      <Input
        id="login-password"
        name="password"
        type="password"
        autoComplete="current-password"
        label={t('auth', 'password')}
        hint={t('auth', 'forgotPassword')}
        required
      />
      <Button type="submit" disabled={pending} className="w-full">
        {t('auth', 'submitLogin')}
      </Button>
    </form>
  );
}
