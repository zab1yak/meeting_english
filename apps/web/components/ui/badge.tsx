import { t } from '@/i18n';
import { cn } from '@/lib/cn';

export type HomeworkStatus = 'assigned' | 'submitted' | 'checked' | 'overdue';

/** highlight — только фон, текст на нём основной (11.8:1). */
const statusClass: Record<HomeworkStatus, string> = {
  assigned: 'bg-primary-tint text-primary',
  submitted: 'bg-highlight text-text',
  checked: 'bg-success-tint text-success',
  overdue: 'bg-error-tint text-error',
};

type BadgeProps = {
  status: HomeworkStatus;
  /** Свой текст вместо стандартного названия статуса. */
  children?: string;
  className?: string;
};

/** Бейдж статуса ДЗ. Статус всегда назван словом, цвет — дополнительный признак. */
export function Badge({ status, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-2.5 text-caption whitespace-nowrap',
        statusClass[status],
        className,
      )}
    >
      {children ?? t('status', status)}
    </span>
  );
}
