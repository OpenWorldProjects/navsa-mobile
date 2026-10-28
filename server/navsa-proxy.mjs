import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const UPSTREAM = 'https://navsa.spatias.com';
const DEFAULT_ORIGINS = ['https://openworldprojects.github.io', 'http://localhost:5173', 'http://127.0.0.1:5173'];
const ROUTES = {
  '/live': { path: '/live', type: 'application/json', ttl: 8000 },
  '/source-status': { path: '/', type: 'text/html; charset=utf-8', ttl: 60000 }
};

export function createProxyServer({ fetchImpl = fetch, allowedOrigins = DEFAULT_ORIGINS } = {}) {
  const cache = new Map();
  const pending = new Map();
  return http.createServer(async (req, res) => {
    const origin = req.headers.origin;
    res.setHeader('Vary', 'Origin');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (origin && !allowedOrigins.includes(origin)) {
      res.writeHead(403).end('Origin not allowed');
      return;
    }
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Accept');
      res.writeHead(204).end();
      return;
    }
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET, OPTIONS');
      res.writeHead(405).end();
      return;
    }
    const path = new URL(req.url, 'http://localhost').pathname;
    if (path === '/health') {
      res.setHeader('Content-Type', 'application/json');
      res.end('{"ok":true}');
      return;
    }
    const route = ROUTES[path];
    if (!route) { res.writeHead(404).end(); return; }
    try {
      let result = cache.get(path);
      if (!result || Date.now() >= result.expiresAt) {
        if (!pending.has(path)) {
          const request = (async () => {
            const upstream = await fetchImpl(`${UPSTREAM}${route.path}`, {
              headers: {
                Accept: route.type,
                Referer: `${UPSTREAM}/`,
                'User-Agent': 'Mozilla/5.0 (compatible; NAVSA-Mobile/1.1)'
              },
              signal: AbortSignal.timeout(7000),
              redirect: 'error'
            });
            const body = upstream.status === 204 ? '' : await upstream.text();
            const value = { status: upstream.status, body, expiresAt: Date.now() + route.ttl };
            if (upstream.ok && upstream.status !== 204) cache.set(path, value);
            return value;
          })();
          pending.set(path, request);
        }
        try { result = await pending.get(path); } finally { pending.delete(path); }
      }
      res.setHeader('Content-Type', route.type);
      res.writeHead(result.status).end(result.body);
    } catch {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(502).end('{"error":"NAVSA upstream unavailable"}');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const allowedOrigins = process.env.NAVSA_ALLOWED_ORIGINS?.split(',').map(value => value.trim()).filter(Boolean);
  const server = createProxyServer({ ...(allowedOrigins ? { allowedOrigins } : {}) });
  const port = Number(process.env.NAVSA_PROXY_PORT || 8787);
  const host = process.env.NAVSA_PROXY_HOST || '127.0.0.1';
  server.listen(port, host, () => console.log(`NAVSA proxy listening on http://${host}:${port}`));
}
