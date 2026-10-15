import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'section' | 'article';
};

/** Белая карточка с тонкой границей на фоне страницы. */
export function Card({ as: Tag = 'div', className, ...rest }: CardProps) {
  return (
    <Tag className={cn('rounded-lg border border-border bg-surface p-6', className)} {...rest} />
  );
}
