import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import { Icon } from './icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'md' | 'sm';

// Цвета рамки и фона задаёт только вариант: два border-* утилиты в одном списке классов
// конфликтуют, и победу решает порядок в сгенерированном CSS, а не порядок в строке.
const base =
  'inline-flex items-center justify-center gap-2 rounded-md border text-label whitespace-nowrap ' +
  'cursor-pointer transition-colors disabled:cursor-not-allowed disabled:text-muted-text';

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-primary text-on-primary enabled:hover:bg-primary-hover ' +
    'disabled:border-border disabled:bg-bg',
  secondary:
    'border-border-strong bg-surface text-primary enabled:hover:bg-primary-tint ' +
    'disabled:border-border disabled:bg-bg',
  ghost: 'border-transparent bg-transparent text-primary enabled:hover:bg-primary-tint',
};

const sizeClass: Record<ButtonSize, string> = {
  md: 'h-10 px-4',
  sm: 'h-8 px-3',
};

/** Классы кнопки — для ссылок (`<a>`/`<Link>`), которые выглядят как кнопка. */
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(base, variantClass[variant], sizeClass[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Иконка Lucide перед текстом. */
  icon?: LucideIcon;
  /** Иконка Lucide после текста. */
  iconAfter?: LucideIcon;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconAfter,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {icon && <Icon icon={icon} size={20} />}
      {children}
      {iconAfter && <Icon icon={iconAfter} size={20} />}
    </button>
  );
}

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> & {
  icon: LucideIcon;
  /** Обязательная подпись: у кнопки без текста это единственное имя для скринридера. */
  label: string;
  variant?: Exclude<ButtonVariant, 'primary'>;
};

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  type = 'button',
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(base, variantClass[variant], 'size-10 p-0', className)}
      {...rest}
    >
      <Icon icon={icon} />
    </button>
  );
}
