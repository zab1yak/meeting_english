import {
  createServer,
  type IncomingMessage,
  type Server as HttpServer,
  type ServerResponse,
} from 'node:http';

import type { HealthResponse } from '@me/shared';
import { Server } from 'socket.io';

export type RedisStatus = NonNullable<HealthResponse['redis']>;

export interface RealtimeServerOptions {
  webOrigin: string;
  getRedisStatus: () => RedisStatus;
}

export interface RealtimeServer {
  httpServer: HttpServer;
  io: Server;
}

function handleHttp(
  req: IncomingMessage,
  res: ServerResponse,
  getRedisStatus: () => RedisStatus,
): void {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');
  if (req.method !== 'GET' || pathname !== '/health') {
    res.writeHead(404).end();
    return;
  }
  try {
    const body: HealthResponse = { status: 'ok', service: 'realtime', redis: getRedisStatus() };
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
  } catch (err) {
    console.error('health check failed', err);
    res.writeHead(500).end();
  }
}

export function createRealtimeServer({
  webOrigin,
  getRedisStatus,
}: RealtimeServerOptions): RealtimeServer {
  const httpServer = createServer((req, res) => {
    handleHttp(req, res, getRedisStatus);
  });

  const io = new Server(httpServer, {
    cors: { origin: webOrigin, credentials: true },
  });

  return { httpServer, io };
}
