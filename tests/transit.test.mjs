import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
after(() => server.close());
const { TransitService } = await server.ssrLoadModule('/src/services/api/transitService.js');
const { apiClient, ApiClient } = await server.ssrLoadModule('/src/services/api/apiClient.js');
const { API_CONFIG } = await server.ssrLoadModule('/src/config/api.config.js');
const { parseSourceStatus } = await server.ssrLoadModule('/src/services/api/sourceStatus.js');
const sourceHtml = await readFile(new URL('./fixtures/navsa-source-2026-10-28.html', import.meta.url), 'utf8');
const sourcePolicy = parseSourceStatus(sourceHtml);
const { decodeLineAndDirection, determineUserRelativeDirection } = await server.ssrLoadModule('/src/services/lines.js');
const { Capacitor } = await import('@capacitor/core');
const raw = JSON.parse(await readFile(new URL('./fixtures/navsa-live-2026-10-28.json', import.meta.url)));
const reference = JSON.parse(await readFile(new URL('./fixtures/navsa-rendered-2026-10-28.json', import.meta.url)));
const sample = { id: 1, vehicle_type_id: 4, latitude: 43.85, longitude: 18.38, direction: 'Ilidža - Baščaršija', operator_id: 1 };

function feed(t, value, availability = sourcePolicy.availability) {
  t.mock.method(apiClient, 'getFeedStatus', async () => ({ availability, notice: '', isStale: false }));
  t.mock.method(apiClient, 'getLiveVehicles', async () => typeof value === 'function' ? value() : structuredClone(value));
}

test('matches every vehicle and line rendered by NAVSA on the captured feed', async t => {
  feed(t, raw);
  const vehicles = await new TransitService().fetchLiveVehicles();
  assert.equal(vehicles.length, 34);
  assert.equal(vehicles.filter(v => v.isTram()).length, 19);
  assert.equal(vehicles.filter(v => v.isTrolley()).length, 15);
  for (const expected of reference) {
    const vehicle = vehicles.find(v => v.id === expected.id);
    assert.ok(vehicle, `missing NAVSA vehicle ${expected.id}`);
    assert.equal(vehicle.lineId, expected.lineId);
    const original = raw.find(v => v.id === vehicle.id);
    assert.equal(vehicle.latitude, original.latitude);
    assert.equal(vehicle.longitude, original.longitude);
  }
  assert.equal(vehicles.find(v => v.id === 2021).lineId, '11');
});

test('retains negative IDs, unknown routes and locations outside the old corridor', async t => {
  const data = [
    { ...sample, id: -1, vehicle_type_id: 2, direction: 'Unknown - Route', latitude: 43.96 },
    { ...sample, id: 2, latitude: 43.7931451, longitude: 18.3304025, direction: 'Hrasnica - Baščaršija' },
    { ...sample, id: 3, direction: null, latitude: 44.1 }
  ];
  feed(t, data, { tram: true, trolley: true, bus: true });
  const vehicles = await new TransitService().fetchLiveVehicles();
  assert.deepEqual(vehicles.map(v => v.id), [-1, 2, 3]);
  assert.equal(vehicles[0].lineId, '?');
  assert.equal(vehicles[1].lineId, '11');
  assert.equal(decodeLineAndDirection({ ...sample, direction: 'Unknown - Route' }).lineId, '?');
});

test('does not invent a heading and holds GPS jitter until real movement accumulates', async t => {
  let now = 100000;
  let position = { ...sample };
  t.mock.method(Date, 'now', () => now);
  feed(t, () => [{ ...position }]);
  const service = new TransitService();
  const [initial] = await service.fetchLiveVehicles();
  assert.equal(initial.bearing, null);
  now += 10000;
  position.longitude += 0.00003;
  const [jitter] = await service.fetchLiveVehicles();
  assert.equal(jitter.longitude, initial.longitude);
  assert.equal(jitter.bearing, null);
  now += 10000;
  position.longitude = sample.longitude + 0.0004;
  const [moving] = await service.fetchLiveVehicles();
  assert.ok(moving.bearing > 89 && moving.bearing < 91);
  assert.equal(moving.longitude, position.longitude);
  assert.ok(moving.speedKmH >= 5 && moving.speedKmH <= 7);
  now += 300000;
  const [stationary] = await service.fetchLiveVehicles();
  assert.equal(stationary.bearing, moving.bearing);
  assert.equal(stationary.isStale, false, 'a stopped vehicle is not a failed feed');
});

test('outages never invent vehicles and preserve last real positions as stale', async t => {
  let response = null;
  feed(t, () => response);
  const service = new TransitService();
  assert.deepEqual(await service.fetchLiveVehicles(), []);
  assert.equal(service.isServerStale, true);
  response = [{ ...sample }];
  const [live] = await service.fetchLiveVehicles();
  const successfulSync = service.lastSuccessfulSync;
  response = null;
  const [stale] = await service.fetchLiveVehicles({ latitude: 43.85, longitude: 18.39 });
  assert.equal(stale.id, live.id);
  assert.equal(stale.longitude, live.longitude);
  assert.equal(stale.lastUpdated, live.lastUpdated);
  assert.equal(stale.isStale, true);
  assert.equal(stale.isApproaching(), false);
  assert.equal(stale.proximity.etaMinutes, null);
  assert.equal(service.lastSuccessfulSync, successfulSync);
  response = [];
  assert.deepEqual(await service.fetchLiveVehicles(), []);
  assert.equal(service.isServerStale, false);
});

test('native live requests use the real endpoint and native HTTP, never /api/live', async t => {
  t.mock.method(Capacitor, 'isNativePlatform', () => true);
  let request;
  const client = new ApiClient({ get: async options => {
    request = options;
    return { status: 200, data: JSON.stringify([sample]) };
  } });
  const data = await client.getLiveVehicles();
  assert.equal(request.url, 'https://navsa.spatias.com/live');
  assert.equal(request.headers.Referer, 'https://navsa.spatias.com/');
  assert.deepEqual(data, [sample]);
});

test('web request timeouts are cleared on successful responses as well as errors', async t => {
  t.mock.method(Capacitor, 'isNativePlatform', () => false);
  t.mock.method(globalThis, 'fetch', async () => ({ status: 200, ok: true, json: async () => [sample] }));
  const cleanup = t.mock.method(globalThis, 'clearTimeout');
  assert.deepEqual(await new ApiClient().get('/api/live'), [sample]);
  assert.equal(cleanup.mock.callCount(), 1);
  const client = new ApiClient();
  assert.equal(client.readResponse(204), null);
  assert.equal(client.readResponse(503), null);
  assert.throws(() => client.readResponse(403, 'Forbidden'), /403/);
});

test('direction comparison wraps north correctly for bearings across 0°', () => {
  const proximity = determineUserRelativeDirection({
    vehicleTypeId: 3, latitude: 43.85, longitude: 18.38, bearing: 1
  }, { latitude: 43.86, longitude: 18.379 });
  assert.equal(proximity.isComing, true);
});

test('an unobserved heading does not claim a trolley is departing', () => {
  const proximity = determineUserRelativeDirection({
    vehicleTypeId: 3, latitude: 43.85, longitude: 18.38, bearing: null
  }, { latitude: 43.86, longitude: 18.38 });
  assert.equal(proximity.isComing, null);
  assert.equal(proximity.etaMinutes, null);
});

test('reads upstream availability and notification as data without executing its scripts', () => {
  assert.deepEqual(sourcePolicy.availability, { tram: true, trolley: true, bus: false });
  assert.ok(sourcePolicy.notice.includes('Pozicije autobusa trenutno nisu dostupne'));
  assert.ok(sourcePolicy.notice.includes('Ministarstva saobraćaja KS'));
  assert.ok(!sourcePolicy.notice.includes('<a'));
  assert.throws(() => parseSourceStatus('<html>unexpected page</html>'), /not found/);
  assert.throws(() => parseSourceStatus('const SHOW_VEHICLES = {bus:false};'), /missing/);
});

test('buses return and the warning disappears automatically when the source re-enables them', async t => {
  let now = 100000;
  let html = sourceHtml;
  let statusRequests = 0;
  t.mock.method(Date, 'now', () => now);
  t.mock.method(Capacitor, 'isNativePlatform', () => false);
  const client = new ApiClient();
  t.mock.method(client, 'get', async () => { statusRequests++; return html; });
  const bus = { ...sample, id: -17, vehicle_type_id: 2, direction: 'Dobrinja - Vijećnica T' };
  t.mock.method(apiClient, 'getLiveVehicles', async () => [bus]);
  t.mock.method(apiClient, 'getFeedStatus', () => client.getFeedStatus());
  const service = new TransitService();
  assert.equal((await service.fetchLiveVehicles()).length, 0);
  assert.ok(service.sourceStatus.notice.length > 0);
  html = sourceHtml.replace('bus: false', 'bus: true').replace(/const NOTIFICATION\s*=\s*("(?:\\.|[^"\\])*")\s*;/, 'const NOTIFICATION = "";');
  now += 10000;
  assert.equal((await service.fetchLiveVehicles()).length, 0, 'status reads are cached for one minute');
  assert.equal(statusRequests, 1);
  now += API_CONFIG.SOURCE_STATUS_REFRESH_MS;
  const vehicles = await service.fetchLiveVehicles();
  assert.equal(vehicles.length, 1);
  assert.equal(vehicles[0].id, -17);
  assert.equal(vehicles[0].lineId, '31E');
  assert.equal(service.sourceStatus.notice, '');
  assert.equal(statusRequests, 2);
});

test('temporary status failures are labelled stale and cannot disable buses permanently', async t => {
  let now = 100000;
  let reachable = true;
  let requests = 0;
  t.mock.method(Date, 'now', () => now);
  const client = new ApiClient();
  t.mock.method(client, 'get', async () => {
    requests++;
    if (!reachable) throw new Error('offline');
    return sourceHtml;
  });
  const current = await client.getFeedStatus();
  assert.equal(current.availability.bus, false);
  reachable = false;
  now += API_CONFIG.SOURCE_STATUS_REFRESH_MS;
  const recent = await client.getFeedStatus();
  assert.equal(recent.isStale, true);
  assert.equal(recent.checkedAt, current.checkedAt);
  assert.equal(recent.availability.bus, false);
  await client.getFeedStatus();
  assert.equal(requests, 2, 'failed status requests are throttled too');
  now += API_CONFIG.SOURCE_STATUS_MAX_AGE_MS;
  const expired = await client.getFeedStatus();
  assert.equal(expired.isStale, true);
  assert.deepEqual(expired.availability, {});
  assert.equal(expired.notice, '');
});

test('native source-status reads use HTTP text and refresh from the original homepage', async t => {
  t.mock.method(Capacitor, 'isNativePlatform', () => true);
  let request;
  const client = new ApiClient({ get: async options => {
    request = options;
    return { status: 200, data: sourceHtml };
  } });
  const status = await client.getFeedStatus();
  assert.equal(request.url, 'https://navsa.spatias.com/');
  assert.equal(request.responseType, 'text');
  assert.equal(status.availability.bus, false);
  assert.equal(status.isStale, false);
});
