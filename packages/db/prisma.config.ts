import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Команды prisma запускаются из packages/db, а .env лежит в корне монорепо
config({ path: '../../.env', quiet: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // generate работает и без БД, поэтому переменная может отсутствовать
    url: process.env['DATABASE_URL'] ?? '',
  },
});
