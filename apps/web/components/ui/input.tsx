import { CircleX } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

import { Icon } from './icon';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  /** Обязателен: связывает метку, подсказку и ошибку с полем. */
  id: string;
  label: string;
  hint?: string;
  /** Текст ошибки. Ошибка показывается рамкой, иконкой и текстом — не только цветом. */
  error?: string;
};

export function Input({
  id,
  label,
  hint,
  error,
  className,
  disabled,
  'aria-describedby': extraDescribedBy,
  ...rest
}: InputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId, extraDescribedBy].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className={cn('text-label', disabled ? 'text-muted-text' : 'text-text')}>
        {label}
      </label>
      {/* rest идёт первым: вычисленные id, aria-* и классы не должны перетираться снаружи. */}
      <input
        {...rest}
        id={id}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-body text-text',
          'placeholder:text-muted-text not-aria-invalid:enabled:hover:border-muted-text',
          'disabled:cursor-not-allowed disabled:border-border disabled:bg-bg disabled:text-muted-text',
          'aria-invalid:border-error',
        )}
      />
      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1 text-caption text-error">
          <Icon icon={CircleX} size={16} tone="error" className="mt-px" />
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-caption text-muted-text">
          {hint}
        </p>
      )}
    </div>
  );
}
