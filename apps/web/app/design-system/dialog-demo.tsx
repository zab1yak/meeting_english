'use client';

import { Play } from 'lucide-react';
import { useState } from 'react';

import { Button, Dialog } from '@/components/ui';

/** Демонстрация диалога на витрине дизайн-системы. Тексты — образец из макета. */
export function DialogDemo({ closeLabel }: { closeLabel: string }) {
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        icon={Play}
        onClick={() => {
          setOpen(true);
        }}
      >
        Запустить класс
      </Button>
      <Dialog
        open={open}
        onClose={close}
        title="Запустить виртуальный класс?"
        closeLabel={closeLabel}
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Отмена
            </Button>
            <Button onClick={close}>Запустить</Button>
          </>
        }
      >
        Ученик Анна Королёва получит приглашение. Урок «Present Perfect» откроется у обоих.
      </Dialog>
    </>
  );
}
