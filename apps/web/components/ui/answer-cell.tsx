import { Check, X } from 'lucide-react';

import { t } from '@/i18n';
import { cn } from '@/lib/cn';

import { Icon } from './icon';

export type AnswerState = 'empty' | 'selected' | 'correct' | 'incorrect';

/** Подпись ячейки для скринридера: номер пропуска, слово и состояние. */
export function answerCellLabel(index: number, state: AnswerState, word = ''): string {
  // Выбранный, но ещё пустой пропуск: без слова фраза «Пропуск 4: , выбран» ломается.
  if (state === 'selected' && !word) return t('answer', 'selectedEmpty', { index });
  return t('answer', state, { index, word });
}

const stateClass: Record<AnswerState, string> = {
  empty: 'min-w-24 border border-dashed border-border-strong bg-surface',
  selected: 'min-w-24 border-2 border-primary bg-primary-tint text-primary',
  correct: 'border border-success bg-success-tint text-text',
  incorrect: 'border border-error bg-error-tint text-text',
};

type AnswerCellProps = {
  /** Номер пропуска с 1. */
  index: number;
  state: AnswerState;
  word?: string;
  /** Если задан — ячейка кликабельна (плеер); без него — только показ (проверка ДЗ). */
  onSelect?: () => void;
  className?: string;
};

/**
 * Ячейка пропуска в тексте. «Верно» и «неверно» — тинт, рамка 1px и значок ✓/✕;
 * неверное слово ещё и зачёркнуто, так что цвет не единственный признак.
 */
export function AnswerCell({ index, state, word, onSelect, className }: AnswerCellProps) {
  const label = answerCellLabel(index, state, word);
  const classes = cn(
    'mx-0.5 inline-flex h-8 items-center gap-1 rounded-sm px-2.5 align-middle font-medium',
    stateClass[state],
    className,
  );
  const visual = (
    <>
      {state === 'correct' && <Icon icon={Check} size={16} tone="success" />}
      {state === 'incorrect' && <Icon icon={X} size={16} tone="error" />}
      {state === 'incorrect' ? <s>{word}</s> : word}
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        aria-label={label}
        aria-pressed={state === 'selected'}
        onClick={onSelect}
        className={cn(classes, 'cursor-pointer', state === 'empty' && 'hover:bg-primary-tint')}
      >
        {visual}
      </button>
    );
  }

  return (
    <span className={classes}>
      <span aria-hidden="true" className="contents">
        {visual}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
