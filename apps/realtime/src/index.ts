import { z } from 'zod';

import { parseEnv } from './env';
import { attachRedisAdapter } from './redis';
import { createRealtimeServer } from './server';

const envResult = parseEnv(process.env);
if (!envResult.success) {
  console.error(`Неверные переменные окружения:\n${z.prettifyError(envResult.error)}`);
  process.exit(1);
}
const env = envResult.data;

const { httpServer, io } = createRealtimeServer({
  webOrigin: env.WEB_ORIGIN,
  // Вызывается только на запросах /health, то есть после инициализации redis ниже
  getRedisStatus: () => redis.getStatus(),
});
const redis = attachRedisAdapter(io, env.REDIS_URL);

httpServer.listen(env.REALTIME_PORT, () => {
  console.log(`realtime listening on :${env.REALTIME_PORT}`);
});

const SHUTDOWN_TIMEOUT_MS = 10_000;
let shuttingDown = false;

async function shutdown(): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  // Страховка: если закрытие зависнет, процесс всё равно завершится
  const forceExit = setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();
  try {
    await io.close();
    await redis.close();
    process.exitCode = 0;
  } catch (err) {
    console.error('Ошибка при остановке', err);
    process.exitCode = 1;
  } finally {
    clearTimeout(forceExit);
  }
}

process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());
