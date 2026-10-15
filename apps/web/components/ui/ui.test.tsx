import { BookOpen, X } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  AnswerCell,
  answerCellLabel,
  Avatar,
  Badge,
  Button,
  getInitials,
  Icon,
  IconButton,
  Input,
  nextTabIndex,
  Progress,
  Tabs,
  toPercent,
} from './index';

describe('Icon', () => {
  it('декоративная по умолчанию: aria-hidden, 24px, обводка 1.5', () => {
    const html = renderToStaticMarkup(<Icon icon={BookOpen} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('width="24"');
    expect(html).toContain('stroke-width="1.5"');
  });

  it('с label — role="img" и подпись, без aria-hidden', () => {
    const html = renderToStaticMarkup(<Icon icon={BookOpen} label="Урок" />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Урок"');
    expect(html).not.toContain('aria-hidden');
  });

  it('при 16px обводка остаётся 1.5px на экране (масштаб viewBox учтён)', () => {
    const html = renderToStaticMarkup(<Icon icon={BookOpen} size={16} />);
    expect(html).toContain('width="16"');
    expect(html).toContain('stroke-width="1.5"');
    expect(html).toContain('vector-effect="non-scaling-stroke"');
  });

  it('цвет только из ролей', () => {
    expect(renderToStaticMarkup(<Icon icon={BookOpen} tone="muted" />)).toContain(
      'text-muted-icon',
    );
  });
});

describe('Button', () => {
  it('по умолчанию type="button" и primary', () => {
    const html = renderToStaticMarkup(<Button>Войти</Button>);
    expect(html).toContain('type="button"');
    expect(html).toContain('bg-primary');
  });

  it('disabled — без прозрачности, на токенах bg/border/muted-text', () => {
    const html = renderToStaticMarkup(
      <Button variant="secondary" disabled>
        Открыть
      </Button>,
    );
    expect(html).toContain('disabled=""');
    expect(html).toContain('disabled:bg-bg');
    expect(html).not.toContain('opacity');
  });

  it('у каждого варианта ровно один цвет рамки (иначе победу решает порядок CSS)', () => {
    for (const variant of ['primary', 'secondary', 'ghost'] as const) {
      const html = renderToStaticMarkup(<Button variant={variant}>Кнопка</Button>);
      const classes = /class="([^"]*)"/.exec(html)?.[1]?.split(/\s+/) ?? [];
      // Без префиксов-вариантов (hover:, disabled:) и без ширины/стиля рамки.
      const borderColors = classes.filter(
        (c) => c.startsWith('border-') && !c.includes(':') && c !== 'border-dashed',
      );
      expect(borderColors, variant).toHaveLength(1);
    }
  });

  it('IconButton всегда с aria-label', () => {
    const html = renderToStaticMarkup(<IconButton icon={X} label="Закрыть" />);
    expect(html).toContain('aria-label="Закрыть"');
  });
});

describe('Input', () => {
  it('связывает метку и подсказку с полем', () => {
    const html = renderToStaticMarkup(<Input id="email" label="Почта" hint="Подсказка" />);
    expect(html).toContain('for="email"');
    expect(html).toContain('aria-describedby="email-hint"');
    expect(html).not.toContain('aria-invalid=');
  });

  it('ошибка: aria-invalid, текст и иконка', () => {
    const html = renderToStaticMarkup(
      <Input id="email" label="Почта" hint="Подсказка" error="Неверный адрес" />,
    );
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('aria-describedby="email-error email-hint"');
    expect(html).toContain('Неверный адрес');
    expect(html).toContain('<svg');
  });
});

describe('Badge', () => {
  it.each([
    ['assigned', 'Назначено'],
    ['submitted', 'Сдано'],
    ['checked', 'Проверено'],
    ['overdue', 'Просрочено'],
  ] as const)('статус %s подписан словом «%s»', (status, text) => {
    expect(renderToStaticMarkup(<Badge status={status} />)).toContain(text);
  });
});

describe('getInitials / Avatar', () => {
  it.each([
    ['Анна Королёва', 'АК'],
    ['  ирина   смирнова  ', 'ИС'],
    ['Максим', 'М'],
    ['Анна Мария Петрова', 'АМ'],
    ['', ''],
  ])('%j → %j', (name, initials) => {
    expect(getInitials(name)).toBe(initials);
  });

  it('аватар озвучивается полным именем', () => {
    expect(renderToStaticMarkup(<Avatar name="Анна Королёва" />)).toContain(
      'aria-label="Анна Королёва"',
    );
  });

  it('decorative: скрыт от скринридера, имя не звучит дважды', () => {
    const html = renderToStaticMarkup(<Avatar name="Анна Королёва" decorative />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).not.toContain('aria-label');
  });
});

describe('toPercent / Progress', () => {
  it.each([
    [7, 12, 58],
    [12, 12, 100],
    [0, 10, 0],
    [5, 0, 0],
    [15, 10, 100],
    [-1, 10, 0],
    [Number.NaN, 10, 0],
  ])('%d из %d → %d%%', (done, total, percent) => {
    expect(toPercent(done, total)).toBe(percent);
  });

  it('progressbar с подписью и значением', () => {
    const html = renderToStaticMarkup(<Progress value={58} label="Прогресс урока" />);
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="58"');
    expect(html).toContain('aria-label="Прогресс урока"');
  });
});

describe('AnswerCell', () => {
  it.each([
    ['empty', undefined, 'Пропуск 3: пусто'],
    ['selected', 'tried', 'Пропуск 3: tried, выбран'],
    ['selected', undefined, 'Пропуск 3: пусто, выбран'],
    ['correct', 'have been', 'Пропуск 3: have been — верно'],
    ['incorrect', 'has gone', 'Пропуск 3: has gone — неверно'],
  ] as const)('подпись для %s', (state, word, label) => {
    expect(answerCellLabel(3, state, word)).toBe(label);
  });

  it('неверный ответ: значок ✕ и зачёркнутое слово, а не только цвет', () => {
    const html = renderToStaticMarkup(<AnswerCell index={2} state="incorrect" word="has gone" />);
    expect(html).toContain('<s>has gone</s>');
    expect(html).toContain('<svg');
    expect(html).toContain('Пропуск 2: has gone — неверно');
  });

  it('с onSelect — кнопка с aria-label и aria-pressed', () => {
    const html = renderToStaticMarkup(
      <AnswerCell index={1} state="selected" word="tried" onSelect={() => {}} />,
    );
    expect(html).toContain('<button');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-label="Пропуск 1: tried, выбран"');
  });
});

describe('Tabs', () => {
  it.each([
    [0, 'ArrowRight', 3, 1],
    [2, 'ArrowRight', 3, 0],
    [0, 'ArrowLeft', 3, 2],
    [1, 'Home', 3, 0],
    [0, 'End', 3, 2],
    [1, 'Enter', 3, null],
    [0, 'ArrowRight', 0, null],
  ])('с %d по %s при %d вкладках → %s', (current, key, count, expected) => {
    expect(nextTabIndex(current, key, count)).toBe(expected);
  });

  it('разметка WAI-ARIA: tablist, выбранная вкладка в порядке Tab, панель связана', () => {
    const html = renderToStaticMarkup(
      <Tabs
        label="Разделы"
        defaultValue="hw"
        items={[
          { value: 'lessons', label: 'Уроки', content: 'Список уроков' },
          { value: 'hw', label: 'ДЗ', content: 'Список ДЗ' },
        ]}
      />,
    );
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-label="Разделы"');
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-selected="true"[^>]*tabindex="0"/);
    // Все панели в DOM (aria-controls не висит в пустоте), неактивная скрыта.
    expect(html).toMatch(/role="tabpanel"[^>]*hidden=""[^>]*>Список уроков/);
    expect(html).toMatch(/role="tabpanel"(?![^>]*hidden)[^>]*>Список ДЗ/);
  });
});
