import { describe, expect, it } from 'vitest';

import { t } from './i18n';

describe('t', () => {
  it('подставляет параметры', () => {
    expect(t('home', 'title', { appName: 'X' })).toBe('X');
  });

  it('оставляет плейсхолдер без параметра', () => {
    expect(t('home', 'title')).toBe('{appName}');
  });
});
