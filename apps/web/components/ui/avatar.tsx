import { cn } from '@/lib/cn';

export type AvatarSize = 'sm' | 'md' | 'lg';

const sizeClass: Record<AvatarSize, string> = {
  sm: 'size-8 text-caption',
  md: 'size-10 text-label',
  lg: 'size-14 text-h3',
};

/** Инициалы: первые буквы первых двух слов, «Анна Королёва» → «АК». */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((word) => Array.from(word)[0] ?? '');
  return letters.join('').toLocaleUpperCase('ru');
}

type AvatarProps = {
  name: string;
  size?: AvatarSize;
  /** true, если имя уже написано рядом: аватар скрыт от скринридера, чтобы имя не звучало дважды. */
  decorative?: boolean;
  className?: string;
};

export function Avatar({ name, size = 'sm', decorative = false, className }: AvatarProps) {
  const a11y = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': name };
  return (
    <span
      {...a11y}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-primary-tint font-semibold text-primary',
        sizeClass[size],
        className,
      )}
    >
      <span aria-hidden="true">{getInitials(name)}</span>
    </span>
  );
}
