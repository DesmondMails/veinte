/**
 * Starts Astro on localhost, then opens a Cloudflare Quick Tunnel.
 * Prints a https://*.trycloudflare.com URL when the tunnel is ready.
 *
 * Requires the cloudflared CLI: `brew install cloudflared`
 */
import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';

const PORT = Number(process.env.PORT ?? 4321);
const ORIGIN = `http://127.0.0.1:${PORT}`;

function commandExists(name) {
  return new Promise((resolve) => {
    const child = spawn('which', [name], { stdio: 'ignore' });
    child.on('exit', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

function waitForPort(port, timeoutMs = 30_000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = createConnection({ port, host: '127.0.0.1' }, () => {
        socket.end();
        resolve();
      });

      socket.on('error', () => {
        socket.destroy();

        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Astro did not start on ${ORIGIN}`));
          return;
        }

        setTimeout(attempt, 300);
      });
    };

    attempt();
  });
}

const children = [];

function stopAll() {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
}

process.on('SIGINT', () => {
  stopAll();
  process.exit(130);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(143);
});

if (!(await commandExists('cloudflared'))) {
  console.error('cloudflared is not installed. Install it with:\n  brew install cloudflared');
  process.exit(1);
}

const astro = spawn('npx', ['astro', 'dev', '--host', '--port', String(PORT)], {
  stdio: 'inherit',
  shell: false,
});
children.push(astro);

astro.on('exit', (code) => {
  if (code && code !== 0) {
    stopAll();
    process.exit(code);
  }
});

await waitForPort(PORT);
console.log(`\nLocal server is up at ${ORIGIN}. Opening Cloudflare tunnel…\n`);

const tunnel = spawn('cloudflared', ['tunnel', '--url', ORIGIN], {
  stdio: ['ignore', 'inherit', 'inherit'],
});
children.push(tunnel);

tunnel.on('exit', (code) => {
  stopAll();
  process.exit(code ?? 0);
});
