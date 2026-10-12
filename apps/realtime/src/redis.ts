import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import type { Server } from 'socket.io';

import type { RedisStatus } from './server';

export interface RedisHandle {
  getStatus: () => RedisStatus;
  close: () => Promise<void>;
}

/**
 * Подключает Redis-адаптер Socket.IO. Без REDIS_URL сервер работает
 * в одном процессе, и статус Redis — disabled.
 */
export function attachRedisAdapter(io: Server, redisUrl: string | undefined): RedisHandle {
  if (!redisUrl) {
    return { getStatus: () => 'disabled', close: () => Promise.resolve() };
  }

  const pub = new Redis(redisUrl, { maxRetriesPerRequest: null });
  const sub = pub.duplicate();
  pub.on('error', (err: Error) => {
    console.error('[redis:pub]', err.message);
  });
  sub.on('error', (err: Error) => {
    console.error('[redis:sub]', err.message);
  });
  io.adapter(createAdapter(pub, sub));

  return {
    getStatus: () => (pub.status === 'ready' && sub.status === 'ready' ? 'connected' : 'error'),
    close: async () => {
      await Promise.allSettled([pub.quit(), sub.quit()]);
    },
  };
}
