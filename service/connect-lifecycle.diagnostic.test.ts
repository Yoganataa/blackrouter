import { test } from 'bun:test';
import http from 'node:http';
import https from 'node:https';
import type { Socket } from 'node:net';

import { createTunnelAgent } from './upstream.ts';

test('TEMP diagnostic: CONNECT socket lifecycle trace (remove after collecting CI logs)', async () => {
  const events: string[] = [];
  let proxySocket: Socket | undefined;
  const server = http.createServer();
  server.on('connect', (_request, rawSocket) => {
    const socket = rawSocket as Socket;
    proxySocket = socket;
    events.push('proxy:connect');
    socket.on('end', () => events.push('proxy-socket:end'));
    socket.on('close', (hadError) => events.push(`proxy-socket:close:${hadError}`));
    socket.on('error', (error) => events.push(`proxy-socket:error:${error.message}`));
    // Intentionally leave CONNECT unanswered.
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No proxy listen address');

  const agent = createTunnelAgent(`http://127.0.0.1:${address.port}`);
  const request = https.request({ host: 'example.com', port: 443, path: '/', agent });
  request.on('socket', (socket) => {
    events.push('upstream-request:socket-assigned');
    socket.on('close', (hadError) => events.push(`upstream-request-socket:close:${hadError}`));
    socket.on('error', (error) => events.push(`upstream-request-socket:error:${error.message}`));
  });
  request.on('error', (error) => events.push(`upstream-request:error:${error.message}`));
  request.end();
  await new Promise((resolve) => setTimeout(resolve, 100));
  events.push(`before-destroy:proxySocket=${Boolean(proxySocket)}:destroyed=${Boolean(proxySocket?.destroyed)}`);
  request.destroy();
  events.push('upstream-request:destroy-called');
  agent.destroy();
  events.push('agent:destroy-called');
  await new Promise((resolve) => setTimeout(resolve, 250));
  events.push(`after-destroy:proxySocketDestroyed=${Boolean(proxySocket?.destroyed)}:writable=${Boolean(proxySocket?.writable)}:readable=${Boolean(proxySocket?.readable)}`);
  console.log('CONNECT_LIFECYCLE_DIAGNOSTIC', JSON.stringify(events));
  proxySocket?.destroy();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});
