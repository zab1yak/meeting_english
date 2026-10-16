import path from 'node:path';

import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';

const repoRoot = path.join(import.meta.dirname, '../..');

// Общий .env лежит в корне монорепо, а Next по умолчанию читает только apps/web.
// forceReload: Next уже вызвал loadEnvConfig для apps/web, и без него повторный вызов
// вернул бы закэшированный результат, не прочитав корневой .env.
loadEnvConfig(repoRoot, process.env['NODE_ENV'] !== 'production', undefined, true);

const nextConfig: NextConfig = {
  output: 'standalone',
  // Корень монорепо: нужен, чтобы standalone-сборка подхватила пакеты workspace
  outputFileTracingRoot: repoRoot,
  transpilePackages: ['@me/shared', '@me/db', '@me/auth'],
};

export default nextConfig;
