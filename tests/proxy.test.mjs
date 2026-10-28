import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createProxyServer } from '../server/navsa-proxy.mjs';

async function start(t, fetchImpl) {
  const server = createProxyServer({ fetchImpl, allowedOrigins: ['https://openworldprojects.github.io'] });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  return `http://127.0.0.1:${server.address().port}`;
}
const origin = { Origin: 'https://openworldprojects.github.io' };

test('proxy serves live vehicles and source status with CORS for the configured site', async t => {
  const calls = [];
  const base = await start(t, async (url, options) => {
    calls.push({ url, options });
    return new Response(url.endsWith('/live') ? '[{"id":-1}]' : '<script>source status</script>');
  });
  const live = await fetch(`${base}/live`, { headers: origin });
  assert.equal(live.headers.get('Access-Control-Allow-Origin'), origin.Origin);
  assert.deepEqual(await live.json(), [{ id: -1 }]);
  await fetch(`${base}/live`, { headers: origin });
  assert.equal(calls.length, 1, 'shared cache avoids one upstream request per viewer');
  const status = await fetch(`${base}/source-status`, { headers: origin });
  assert.equal(await status.text(), '<script>source status</script>');
  assert.equal(calls[1].url, 'https://navsa.spatias.com/');
  assert.equal(calls[0].options.headers.Referer, 'https://navsa.spatias.com/');
  const blocked = await fetch(`${base}/live`, { headers: { Origin: 'https://unrelated.example' } });
  assert.equal(blocked.status, 403);
  assert.equal(calls.length, 2);
  assert.equal((await fetch(`${base}/anything?url=https://unrelated.example`)).status, 404);
});

test('proxy preserves unavailable responses and does not create replacement vehicles', async t => {
  let status = 204;
  const base = await start(t, async () => new Response(status === 204 ? null : 'Unavailable', { status }));
  assert.equal((await fetch(`${base}/live`, { headers: origin })).status, 204);
  status = 503;
  const unavailable = await fetch(`${base}/live`, { headers: origin });
  assert.equal(unavailable.status, 503);
  assert.equal(await unavailable.text(), 'Unavailable');
});
