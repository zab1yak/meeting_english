import type { LucideIcon, LucideProps } from 'lucide-react';

import { cn } from '@/lib/cn';

/** Цвет иконки — только роли из дизайн-системы. current — наследовать цвет текста. */
export type IconTone = 'primary' | 'muted' | 'on-primary' | 'success' | 'error' | 'current';

const toneClass: Record<IconTone, string> = {
  primary: 'text-primary',
  muted: 'text-muted-icon',
  'on-primary': 'text-on-primary',
  success: 'text-success',
  error: 'text-error',
  current: '',
};

type IconProps = Omit<
  LucideProps,
  'ref' | 'size' | 'strokeWidth' | 'color' | 'absoluteStrokeWidth' | 'nonScalingStroke'
> & {
  /** Иконка Lucide, например `import { BookOpen } from 'lucide-react'`. */
  icon: LucideIcon;
  /** 24 — основной размер; 16 и 20 — только внутри плотных элементов (ячейки, бейджи, кнопки). */
  size?: 16 | 20 | 24;
  tone?: IconTone;
  /** Текст для скринридера. Без него иконка декоративная и скрыта от него. */
  label?: string;
};

/** Единая обёртка над Lucide: обводка 1.5px при любом размере. */
export function Icon({
  icon: LucideComponent,
  size = 24,
  tone = 'current',
  label,
  className,
  ...rest
}: IconProps) {
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const };
  return (
    <LucideComponent
      size={size}
      strokeWidth={1.5}
      nonScalingStroke
      focusable="false"
      className={cn('shrink-0', toneClass[tone], className)}
      {...rest}
      {...a11y}
    />
  );
}
