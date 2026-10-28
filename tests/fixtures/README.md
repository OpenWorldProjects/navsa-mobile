# NAVSA comparison fixtures

Captured from https://navsa.spatias.com/ on 2026-10-28.

- `navsa-live-2026-10-28.json`: the public `/live` response (19 trams, 15 trolleybuses, 58 buses).
- `navsa-rendered-2026-10-28.json`: vehicle IDs, types and decoded lines from the original map's `vehicles` GeoJSON source (34 rendered vehicles).

At capture time the original site's `SHOW_VEHICLES` has tram/trolley enabled and bus disabled. Its notice explains that the ministry's bus telemetry is stale. This is an explicit upstream availability decision, not evidence that negative vehicle IDs are invalid. `API_CONFIG.UNAVAILABLE_VEHICLE_TYPES` mirrors that decision; update it when the source restores bus availability.

Tests compare IDs and line numbers rather than totals alone. They also cover an unknown bus route with availability restored, Hrasnica, unmodified initial GPS coordinates, jitter, outages, and native HTTP endpoint selection.
