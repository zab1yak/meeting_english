import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', 'src/generated/**'],
    globalSetup: ['./src/testing-setup.ts'],
    // Тесты с БД чистят общие таблицы — файлы выполняются по очереди.
    fileParallelism: false,
  },
});
