# NAVSA map comparison — 2026-10-28

Reference: https://navsa.spatias.com/

Inspected the live map, close zoom, route legend, source JavaScript, `/live`, and the tram/trolley GeoJSON files. The local route GeoJSON files exactly match the current upstream files.

The captured `/live` response contains 19 trams, 15 trolleybuses and 58 buses. The original renders 34 vehicles: it explicitly disables buses because the ministry's bus data is stale. Availability and the source notification are now read from the original homepage once a minute. When upstream re-enables buses, they return without a rebuild. A failed status read retains a recent confirmed status for at most five minutes, marks it unverified, and then expires it. No vehicle is rejected for a negative ID, unknown line, distance from a track or being outside the previous city/tram bounds.

The previous local service rendered 18 trams and 15 trolleybuses on that same response. It rejected tram 2021 in Hrasnica (43.7931451, 18.3304025) and labelled Hrasnica–Baščaršija as line 3 instead of upstream line 11. It also changed GPS coordinates by snapping to track geometry, guessed initial headings and replaced failed feeds with mock vehicles.

The revised service matches every upstream rendered ID and line on the captured response. Initial coordinates are preserved. A 10 m movement threshold holds small GPS jitter; no heading is claimed until movement is observed. CSS no longer animates a long rotation across north, and zoom-dependent marker scaling uses the geographic arrow anchor. Retained positions during an outage are marked stale, with live indicators and ETAs disabled. A successful empty response clears the map.

Browser verification covered 34 markers, overview/detail/Hrasnica views, selection, intermediate animated wheel-zoom frames, heading updates, outage retention, empty feeds, and a fresh mobile live load. No JavaScript exceptions were recorded. Screenshots were saved as review artifacts, including original overview/detail/legend and local before/after views.

Android now selects the real `/live` endpoint and uses the built-in CapacitorHttp transport rather than the nonexistent packaged `/api/live` proxy or WebView cross-origin fetch. Automated tests cover request selection and response parsing; this change has not yet been verified on a physical Android device.

Hosted browsers still need a CORS-enabled telemetry endpoint. The original `/live` does not expose CORS for GitHub Pages, which cannot host the Vite proxy. Configure `VITE_NAVSA_LIVE_URL` and `VITE_NAVSA_STATUS_URL` with a deployed public proxy for hosted live data and source status; an unavailable feed no longer silently substitutes fake vehicles.

Run `npm test` for regression tests based on the captured reference and `npm run build` for the production build.

## Hosted proxy

`npm run proxy` starts the included Node 20+ read-only proxy on port 8787. It serves `/live`, `/source-status`, and `/health`. Upstream paths are fixed; arbitrary URL forwarding is not supported. It shares short upstream caches across viewers and allows the configured website origins via CORS.

For production, host it behind HTTPS. Set `NAVSA_PROXY_HOST=0.0.0.0` if the hosting platform requires a public bind address, `NAVSA_PROXY_PORT` for its assigned port, and `NAVSA_ALLOWED_ORIGINS` for a comma-separated origin allowlist. The defaults include `https://openworldprojects.github.io` and local Vite origins.

Then set GitHub repository variables `VITE_NAVSA_LIVE_URL=https://YOUR-HOST/live` and `VITE_NAVSA_STATUS_URL=https://YOUR-HOST/source-status` and rerun Pages deployment. No hosting account or public endpoint has been configured by these code changes.

The older service contained fallback mock vehicles and random initial speeds/headings. Its visible map alone cannot establish that GitHub Pages successfully received real live data in the past. The current original API response was checked again and has no `Access-Control-Allow-Origin` for Pages.
