import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**'],
    globalSetup: ['@me/db/testing-setup'],
    // Тесты с БД чистят общие таблицы — файлы выполняются по очереди.
    fileParallelism: false,
  },
});
