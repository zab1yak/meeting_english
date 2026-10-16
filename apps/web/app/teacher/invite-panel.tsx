'use client';

import { Plus } from 'lucide-react';
import { useActionState } from 'react';

import { Button, Card, Input } from '@/components/ui';
import { t } from '@/i18n';

import { createInviteAction, type InviteState } from './actions';

const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' });

export function InvitePanel() {
  const [state, action, pending] = useActionState<InviteState>(createInviteAction, {});

  return (
    <Card as="section" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-h2">{t('cabinet', 'inviteTitle')}</h2>
        <p className="text-muted-text">{t('cabinet', 'inviteText')}</p>
      </div>
      <form action={action}>
        <Button type="submit" icon={Plus} disabled={pending}>
          {t('cabinet', 'inviteCreate')}
        </Button>
      </form>
      {state.error && (
        <p role="alert" className="text-error">
          {state.error}
        </p>
      )}
      {state.link && state.expiresAt && (
        <Input
          id="invite-link"
          label={t('cabinet', 'inviteLinkLabel')}
          value={state.link}
          readOnly
          hint={t('cabinet', 'inviteExpires', {
            date: dateFormat.format(new Date(state.expiresAt)),
          })}
          onFocus={(event) => {
            event.currentTarget.select();
          }}
        />
      )}
    </Card>
  );
}
