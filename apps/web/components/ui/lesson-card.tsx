import { BookOpen, Calendar } from 'lucide-react';
import Link from 'next/link';

import { t } from '@/i18n';
import { cn } from '@/lib/cn';

import { Badge, type HomeworkStatus } from './badge';
import { buttonClasses } from './button';
import { Card } from './card';
import { Icon } from './icon';
import { Progress, toPercent } from './progress';

type LessonCardProps = {
  /** «Урок 5». */
  number: string;
  level: string;
  title: string;
  description: string;
  /** Уже отформатированная дата, например «12 октября, 16:00». */
  date: string;
  done: number;
  total: number;
  status: HomeworkStatus;
  href: string;
  className?: string;
};

export function LessonCard({
  number,
  level,
  title,
  description,
  date,
  done,
  total,
  status,
  href,
  className,
}: LessonCardProps) {
  return (
    <Card as="article" className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-caption text-muted-text">
          <Icon icon={BookOpen} tone="primary" />
          {t('ui', 'lessonMeta', { number, level })}
        </span>
        <Badge status={status} />
      </div>
      <h3 className="text-h3">{title}</h3>
      <p className="text-muted-text">{description}</p>
      <span className="flex items-center gap-2 text-caption text-muted-text">
        <Icon icon={Calendar} size={20} tone="muted" />
        {date}
      </span>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-caption">
          <span className="text-muted-text">{t('ui', 'progress')}</span>
          <span className="text-text">{t('ui', 'progressValue', { done, total })}</span>
        </div>
        <Progress value={toPercent(done, total)} label={t('ui', 'progressOf', { title })} />
      </div>
      <Link href={href} className={buttonClasses('secondary', 'md', 'mt-auto')}>
        {t('ui', 'openLesson')}
      </Link>
    </Card>
  );
}
