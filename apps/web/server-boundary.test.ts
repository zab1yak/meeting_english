import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * Сторож границы клиент/сервер: клиентские компоненты не импортируют БД и серверную
 * авторизацию — иначе в бандл браузера попали бы запросы с ключами ответов.
 * (lib/server защищён ещё и пакетом server-only, но @me/db и @me/auth — нет:
 * их использует realtime, где server-only недоступен.)
 */
const SERVER_ONLY = /from\s+['"](@me\/db|@me\/auth|@\/lib\/server)(\/[^'"]*)?['"]/;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (['node_modules', '.next'].includes(entry.name)) return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });
}

describe('граница клиент/сервер', () => {
  const root = import.meta.dirname;
  const clientFiles = ['app', 'components', 'lib']
    .flatMap((dir) => sourceFiles(path.join(root, dir)))
    .filter((file) => /^\s*['"]use client['"]/.test(readFileSync(file, 'utf8')));

  it('клиентские компоненты найдены (сторож не пустой)', () => {
    expect(clientFiles.length).toBeGreaterThan(0);
  });

  it('ни один клиентский компонент не импортирует @me/db, @me/auth и lib/server', () => {
    const offenders = clientFiles.filter((file) => SERVER_ONLY.test(readFileSync(file, 'utf8')));
    expect(offenders.map((file) => path.relative(root, file))).toEqual([]);
  });
});
