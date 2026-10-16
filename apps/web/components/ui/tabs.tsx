'use client';

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/lib/cn';

export type TabItem = {
  /** Уникальный в пределах Tabs; попадает в id, поэтому только латиница, цифры и дефис. */
  value: string;
  label: string;
  content: ReactNode;
};

/** Индекс вкладки после нажатия клавиши (стрелки, Home, End) или null, если клавиша не наша. */
export function nextTabIndex(current: number, key: string, count: number): number | null {
  if (count <= 0) return null;
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % count;
    case 'ArrowLeft':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

type TabsProps = {
  items: readonly TabItem[];
  /** Подпись группы вкладок для скринридера. */
  label: string;
  defaultValue?: string;
  className?: string;
};

/** Вкладки по паттерну WAI-ARIA: стрелки переключают, Tab уходит в панель. */
export function Tabs({ items, label, defaultValue, className }: TabsProps) {
  const baseId = useId();
  // Храним значение, а не индекс: при перестановке вкладок выбор не «переезжает».
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const found = items.findIndex((item) => item.value === selectedValue);
  // Выбранной вкладки больше нет в списке — активна первая, чтобы tablist не потерял фокусируемую вкладку.
  const active = found === -1 ? 0 : found;
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next = nextTabIndex(active, event.key, items.length);
    if (next === null) return;
    event.preventDefault();
    setSelectedValue(items[next]?.value);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={className}>
      {/* На узком экране вкладки прокручиваются, а не растягивают страницу. */}
      <div
        role="tablist"
        aria-label={label}
        className="flex gap-1 overflow-x-auto border-b border-border"
      >
        {items.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.value}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.value}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.value}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                setSelectedValue(item.value);
              }}
              onKeyDown={onKeyDown}
              className={cn(
                'cursor-pointer px-4 py-3 text-body whitespace-nowrap transition-colors',
                selected
                  ? 'font-medium text-primary shadow-[inset_0_-2px_0_var(--color-primary)]'
                  : 'text-muted-text hover:text-text',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {/* Все панели в DOM: aria-controls каждой вкладки указывает на существующий элемент. */}
      {items.map((item, index) => (
        <div
          key={item.value}
          role="tabpanel"
          id={`${baseId}-panel-${item.value}`}
          aria-labelledby={`${baseId}-tab-${item.value}`}
          hidden={index !== active}
          tabIndex={0}
          className="pt-6"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
