// globalSetup Vitest: загружает корневой .env и применяет миграции к тестовой БД.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

import { config } from 'dotenv';

const dbPackageDir = path.resolve(import.meta.dirname, '..');

export default function setup(): void {
  config({ path: path.join(dbPackageDir, '../../.env'), quiet: true });
  const url = process.env['TEST_DATABASE_URL'];
  if (!url) {
    console.warn('TEST_DATABASE_URL не задан — интеграционные тесты с БД пропущены');
    return;
  }
  const prismaCli = createRequire(path.join(dbPackageDir, 'package.json')).resolve(
    'prisma/build/index.js',
  );
  execFileSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
    cwd: dbPackageDir,
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe',
  });
}
