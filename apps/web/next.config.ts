import path from 'node:path';

import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';

const repoRoot = path.join(import.meta.dirname, '../..');

// Общий .env лежит в корне монорепо, а Next по умолчанию читает только apps/web
loadEnvConfig(repoRoot);

const nextConfig: NextConfig = {
  output: 'standalone',
  // Корень монорепо: нужен, чтобы standalone-сборка подхватила пакеты workspace
  outputFileTracingRoot: repoRoot,
  transpilePackages: ['@me/shared', '@me/db'],
};

export default nextConfig;
