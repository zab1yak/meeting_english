import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node22',
  clean: true,
  // Пакеты монорепо поставляются как исходники TS, поэтому их вшиваем в бандл
  noExternal: [/^@me\//],
});
