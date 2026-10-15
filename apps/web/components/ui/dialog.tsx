'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { IconButton } from './button';

type DialogProps = {
  /** Управляемое состояние: родитель обязан выставить false в onClose. */
  open: boolean;
  /**
   * Закрытие изнутри: крестик или Esc. Вызывается один раз и не вызывается,
   * если диалог закрыл сам родитель, выставив open = false.
   */
  onClose: () => void;
  title: string;
  /** Подпись кнопки-крестика, например t('ui', 'close'). */
  closeLabel: string;
  children: ReactNode;
  /** Кнопки действий, выравниваются вправо. */
  footer?: ReactNode;
  className?: string;
};

/**
 * Модальный диалог на нативном <dialog>: фокус-ловушка, Esc и подложка — силами браузера.
 * Плоский: рамка border без тени. Все пути закрытия идут через нативное событие close.
 */
export function Dialog({
  open,
  onClose,
  title,
  closeLabel,
  children,
  footer,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  // Актуальное значение open для обработчика close: закрытие по open=false — решение родителя,
  // сообщать ему об этом через onClose не нужно.
  const openRef = useRef(open);
  const titleId = useId();

  useEffect(() => {
    openRef.current = open;
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={() => {
        if (openRef.current) onClose();
      }}
      className={cn(
        'm-auto max-h-[calc(100dvh-32px)] w-[480px] max-w-[calc(100%-32px)] overflow-y-auto overscroll-contain',
        'rounded-lg border border-border bg-surface p-6 text-text',
        'backdrop:bg-text/50',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id={titleId} className="pt-2 text-h3">
          {title}
        </h2>
        <IconButton
          icon={X}
          label={closeLabel}
          onClick={() => {
            ref.current?.close();
          }}
        />
      </div>
      <div className="mt-2 text-muted-text">{children}</div>
      {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
    </dialog>
  );
}
