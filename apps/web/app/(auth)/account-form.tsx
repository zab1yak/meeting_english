'use client';

import { PASSWORD_MIN_LENGTH } from '@me/shared';
import { useActionState } from 'react';

import { Button, Input } from '@/components/ui';
import { t } from '@/i18n';

import { FormError } from './form-parts';
import { initialFormState, type FormState } from './form-state';

type AccountFormProps = {
  /** Префикс id полей: на странице может быть только одна такая форма, но id должны быть осмысленными. */
  idPrefix: string;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
};

/** Имя, почта и пароль: регистрация учителя и ученика по приглашению. */
export function AccountForm({ idPrefix, action: serverAction, submitLabel }: AccountFormProps) {
  const [state, action, pending] = useActionState(serverAction, initialFormState);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormError message={state.error} />
      <Input
        id={`${idPrefix}-name`}
        name="name"
        autoComplete="name"
        label={t('auth', 'name')}
        defaultValue={state.values?.name}
        error={state.fieldErrors?.name}
        required
      />
      <Input
        id={`${idPrefix}-email`}
        name="email"
        type="email"
        autoComplete="email"
        label={t('auth', 'email')}
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
        required
      />
      <Input
        id={`${idPrefix}-password`}
        name="password"
        type="password"
        autoComplete="new-password"
        label={t('auth', 'password')}
        hint={t('auth', 'passwordHint', { min: PASSWORD_MIN_LENGTH })}
        error={state.fieldErrors?.password}
        minLength={PASSWORD_MIN_LENGTH}
        required
      />
      <Button type="submit" disabled={pending} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
