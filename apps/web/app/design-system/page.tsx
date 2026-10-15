import { ArrowRight, BookOpen, Plus, Settings, X } from 'lucide-react';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import {
  AnswerCell,
  Avatar,
  Badge,
  Button,
  Card,
  Icon,
  IconButton,
  Input,
  LessonCard,
  Progress,
  Tabs,
} from '@/components/ui';
import { t } from '@/i18n';

import { DialogDemo } from './dialog-demo';

export const metadata: Metadata = {
  title: t('designSystem', 'title'),
  robots: { index: false },
};

const COLORS = [
  'bg',
  'surface',
  'text',
  'muted-text',
  'muted-icon',
  'primary',
  'primary-hover',
  'primary-tint',
  'accent',
  'highlight',
  'dark',
  'success',
  'success-tint',
  'error',
  'error-tint',
  'border',
  'border-strong',
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card as="section" className="flex flex-col gap-6">
      <h2 className="text-h2">{title}</h2>
      {children}
    </Card>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-4">{children}</div>;
}

/** Витрина токенов и базовых компонентов. Служебная страница, не для пользователей. */
export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-10 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-h1">{t('designSystem', 'title')}</h1>
        <p className="text-muted-text">{t('designSystem', 'subtitle')}</p>
      </header>

      <Section title="Цвета">
        <div className="grid grid-cols-3 gap-4 lg:grid-cols-6">
          {COLORS.map((name) => (
            <div key={name} className="overflow-hidden rounded-lg border border-border">
              <div className="h-14" style={{ background: `var(--color-${name})` }} />
              <p className="px-3 py-2 text-caption text-text">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Типографика">
        <div className="flex flex-col gap-3">
          <p className="text-h1">H1 — Добрый день, Ирина</p>
          <p className="text-h2">H2 — Ученики и прогресс</p>
          <p className="text-h3">H3 — Present Perfect: опыт и результат</p>
          <p className="text-body">Body — Текст с пропусками и выбор формы глагола.</p>
          <p className="text-label">Label — Электронная почта</p>
          <p className="text-caption text-muted-text">Caption — до 14 октября</p>
        </div>
      </Section>

      <Section title="Иконки и кнопки">
        <Row>
          <Icon icon={BookOpen} tone="primary" />
          <Icon icon={Settings} tone="muted" />
          <Icon icon={BookOpen} size={20} tone="primary" />
          <Icon icon={BookOpen} size={16} tone="primary" />
        </Row>
        <Row>
          <Button icon={Plus}>Добавить блок</Button>
          <Button variant="secondary">Открыть урок</Button>
          <Button variant="ghost">Пропустить</Button>
          <Button iconAfter={ArrowRight}>Проверить</Button>
          <Button size="sm">Начать</Button>
          <IconButton icon={X} label="Закрыть" />
        </Row>
        <Row>
          <Button disabled icon={Plus}>
            Добавить блок
          </Button>
          <Button variant="secondary" disabled>
            Открыть урок
          </Button>
          <Button variant="ghost" disabled>
            Пропустить
          </Button>
          <IconButton icon={X} label="Закрыть" disabled />
        </Row>
      </Section>

      <Section title="Поля ввода">
        <div className="grid gap-6 md:grid-cols-3">
          <Input
            id="ds-email"
            label="Электронная почта"
            placeholder="name@school.ru"
            hint="Мы отправим ссылку для входа"
          />
          <Input
            id="ds-email-error"
            label="Электронная почта"
            defaultValue="anna@school"
            error="Введите адрес полностью, например anna@school.ru"
          />
          <Input
            id="ds-email-disabled"
            label="Электронная почта"
            placeholder="name@school.ru"
            disabled
          />
        </div>
      </Section>

      <Section title="Бейджи, аватары, прогресс">
        <Row>
          <Badge status="assigned" />
          <Badge status="submitted" />
          <Badge status="checked" />
          <Badge status="overdue" />
        </Row>
        <Row>
          <Avatar name="Анна Королёва" />
          <Avatar name="Ирина Смирнова" size="md" />
          <Avatar name="Максим" size="lg" />
        </Row>
        <Progress value={58} label="Прогресс урока" className="w-60" />
      </Section>

      <Section title="Ячейки ответа">
        <p className="text-[18px] leading-[44px]">
          I <AnswerCell index={1} state="correct" word="have been" /> to London twice. My sister{' '}
          <AnswerCell index={2} state="incorrect" word="has gone" /> never{' '}
          <AnswerCell index={3} state="selected" word="tried" /> sushi. We{' '}
          <AnswerCell index={4} state="empty" /> in this flat since 2019.
        </p>
      </Section>

      <Section title="Вкладки и диалог">
        <Tabs
          label="Разделы кабинета"
          items={[
            { value: 'lessons', label: 'Уроки', content: <p>Список уроков.</p> },
            { value: 'homework', label: 'Домашние задания · 2', content: <p>Список ДЗ.</p> },
            { value: 'results', label: 'Результаты', content: <p>Результаты.</p> },
          ]}
        />
        <div>
          <DialogDemo closeLabel={t('ui', 'close')} />
        </div>
      </Section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <LessonCard
          number="Урок 5"
          level="B1"
          title="Present Perfect: опыт и результат"
          description="Текст с пропусками и выбор формы глагола."
          date="12 октября, 16:00"
          done={7}
          total={12}
          status="assigned"
          href="/design-system"
        />
      </div>
    </main>
  );
}
