import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const webRoot = path.resolve(import.meta.dirname, '..');
const css = readFileSync(path.join(webRoot, 'app/globals.css'), 'utf8');

function readTokens(): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const match of css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6});/gi)) {
    const [, name, hex] = match;
    if (name && hex) tokens[name] = hex.toLowerCase();
  }
  return tokens;
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((v) =>
    v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const tokens = readTokens();
const color = (name: string): string => {
  const value = tokens[name];
  if (!value) throw new Error(`Нет токена --color-${name}`);
  return value;
};

describe('дизайн-токены', () => {
  it('содержат все роли из плана', () => {
    for (const name of [
      'bg',
      'surface',
      'text',
      'muted-text',
      'muted-icon',
      'primary',
      'primary-hover',
      'on-primary',
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
    ]) {
      expect(tokens[name], name).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(color('bg')).toBe('#f6f7f8');
  });

  it('объявлены через @theme static — CSS-переменные доступны всегда, не только через утилиты', () => {
    expect(css).toMatch(/@theme static\s*\{/);
  });

  // Пары текст/фон, которые используются в интерфейсе: WCAG AA 4.5:1.
  const textPairs: Array<[string, string]> = [
    ['text', 'bg'],
    ['text', 'surface'],
    ['muted-text', 'bg'],
    ['muted-text', 'surface'],
    ['primary', 'surface'],
    ['primary', 'bg'],
    ['primary', 'primary-tint'],
    ['on-primary', 'primary'],
    ['on-primary', 'primary-hover'],
    ['on-primary', 'accent'],
    ['on-primary', 'dark'],
    ['text', 'highlight'],
    ['text', 'success-tint'],
    ['text', 'error-tint'],
    ['success', 'surface'],
    ['success', 'success-tint'],
    ['error', 'surface'],
    ['error', 'error-tint'],
  ];

  it.each(textPairs)('текст %s на %s — не ниже 4.5:1', (fg, bg) => {
    expect(contrast(color(fg), color(bg))).toBeGreaterThanOrEqual(4.5);
  });

  // Иконки и границы полей — нетекстовые элементы: WCAG 1.4.11, 3:1.
  const uiPairs: Array<[string, string]> = [
    ['muted-icon', 'bg'],
    ['muted-icon', 'surface'],
    ['border-strong', 'surface'],
    ['primary', 'surface'],
  ];

  it.each(uiPairs)('элемент %s на %s — не ниже 3:1', (fg, bg) => {
    expect(contrast(color(fg), color(bg))).toBeGreaterThanOrEqual(3);
  });
});

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(tsx?|css)$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [full] : [];
  });
}

describe('цвета только из токенов', () => {
  it('в компонентах и страницах нет «сырых» цветов', () => {
    const offenders = ['app', 'components', 'lib']
      .flatMap((dir) => sourceFiles(path.join(webRoot, dir)))
      .filter((file) => !file.endsWith('globals.css'))
      .filter((file) =>
        /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/i.test(readFileSync(file, 'utf8')),
      )
      .map((file) => path.relative(webRoot, file));
    expect(offenders).toEqual([]);
  });

  it('нет классов стандартной палитры Tailwind (с --color-*: initial они молча пустые)', () => {
    const palette =
      /\b(?:bg|text|border|ring|outline|fill|stroke|divide|from|via|to|shadow|accent|caret|decoration)-(?:white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)\b/;
    const offenders = ['app', 'components', 'lib']
      .flatMap((dir) => sourceFiles(path.join(webRoot, dir)))
      .filter((file) => file.endsWith('.tsx') && palette.test(readFileSync(file, 'utf8')))
      .map((file) => path.relative(webRoot, file));
    expect(offenders).toEqual([]);
  });
});
