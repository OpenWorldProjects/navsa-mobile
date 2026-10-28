# NAVSA map comparison — 2026-10-28

Reference: https://navsa.spatias.com/

Inspected the live map, close zoom, route legend, source JavaScript, `/live`, and the tram/trolley GeoJSON files. The local route GeoJSON files exactly match the current upstream files.

The captured `/live` response contains 19 trams, 15 trolleybuses and 58 buses. The original renders 34 vehicles: it explicitly disables buses because the ministry's bus data is stale. This policy is mirrored in `API_CONFIG.UNAVAILABLE_VEHICLE_TYPES`; it must be updated when upstream availability changes. No vehicle is rejected for a negative ID, unknown line, distance from a track or being outside the previous city/tram bounds.

The previous local service rendered 18 trams and 15 trolleybuses on that same response. It rejected tram 2021 in Hrasnica (43.7931451, 18.3304025) and labelled Hrasnica–Baščaršija as line 3 instead of upstream line 11. It also changed GPS coordinates by snapping to track geometry, guessed initial headings and replaced failed feeds with mock vehicles.

The revised service matches every upstream rendered ID and line on the captured response. Initial coordinates are preserved. A 10 m movement threshold holds small GPS jitter; no heading is claimed until movement is observed. CSS no longer animates a long rotation across north, and zoom-dependent marker scaling uses the geographic arrow anchor. Retained positions during an outage are marked stale, with live indicators and ETAs disabled. A successful empty response clears the map.

Browser verification covered 34 markers, overview/detail/Hrasnica views, selection, intermediate animated wheel-zoom frames, heading updates, outage retention, empty feeds, and a fresh mobile live load. No JavaScript exceptions were recorded. Screenshots were saved as review artifacts, including original overview/detail/legend and local before/after views.

Android now selects the real `/live` endpoint and uses the built-in CapacitorHttp transport rather than the nonexistent packaged `/api/live` proxy or WebView cross-origin fetch. Automated tests cover request selection and response parsing; this change has not yet been verified on a physical Android device.

Hosted browsers still need a CORS-enabled telemetry endpoint. The original `/live` does not expose CORS for GitHub Pages, which cannot host the Vite proxy. Configure `VITE_NAVSA_LIVE_URL` with a deployed public proxy for hosted live data; an unavailable feed no longer silently substitutes fake vehicles.

Run `npm test` for regression tests based on the captured reference and `npm run build` for the production build.
