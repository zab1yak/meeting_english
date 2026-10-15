import { cn } from '@/lib/cn';

/** Доля выполненного в процентах 0–100; при total ≤ 0 — 0. */
export function toPercent(done: number, total: number): number {
  if (!Number.isFinite(done) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
}

type ProgressProps = {
  value: number;
  /** Подпись для скринридера, например «Прогресс урока». */
  label: string;
  className?: string;
};

export function Progress({ value, label, className }: ProgressProps) {
  const percent = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1.5 overflow-hidden rounded-full bg-border', className)}
    >
      <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
    </div>
  );
}
