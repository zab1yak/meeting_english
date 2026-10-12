import { healthResponseSchema } from '@me/shared';
import { io as connect } from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createRealtimeServer } from '../src/server';

describe('realtime server', () => {
  const { httpServer, io } = createRealtimeServer({
    webOrigin: 'http://localhost:3000',
    getRedisStatus: () => 'disabled',
  });
  let baseUrl = '';

  beforeAll(async () => {
    await new Promise<void>((resolve, reject) => {
      httpServer.once('error', reject);
      httpServer.listen(0, resolve);
    });
    const address = httpServer.address();
    if (address === null || typeof address === 'string') {
      throw new Error('Сервер не получил TCP-порт');
    }
    baseUrl = `http://localhost:${address.port}`;
  });

  afterAll(async () => {
    await io.close();
  });

  it('GET /health отвечает 200 и валидным телом (и с query-строкой)', async () => {
    const res = await fetch(`${baseUrl}/health?probe=1`);
    expect(res.status).toBe(200);
    const body = healthResponseSchema.parse(await res.json());
    expect(body).toEqual({ status: 'ok', service: 'realtime', redis: 'disabled' });
  });

  it('неизвестный путь — 404', async () => {
    const res = await fetch(`${baseUrl}/nope`);
    expect(res.status).toBe(404);
  });

  it('принимает Socket.IO-подключение', async () => {
    const client = connect(baseUrl, { transports: ['websocket'] });
    try {
      await new Promise<void>((resolve, reject) => {
        client.on('connect', resolve);
        client.on('connect_error', reject);
      });
      expect(client.connected).toBe(true);
    } finally {
      client.close();
    }
  });
});
