import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import tramlinesData from '../data/tramlines.json';
import trolleylinesData from '../data/trolleylines.json';
import tramstopsData from '../data/tramstops.json';
import trolleystopsData from '../data/trolleystops.json';
import { useI18n } from '../context/I18nContext';

export default function MapComponent({
  vehicles,
  userLocation,
  selectedVehicle,
  onSelectVehicle,
  onMapClick,
  theme,
  showLines,
  showStops,
  mapCenterTrigger
}) {
  const { t } = useI18n();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const vehiclesLayerGroupRef = useRef(null);
  const tracksLayerGroupRef = useRef(null);
  const stopsLayerGroupRef = useRef(null);
  const userLayerGroupRef = useRef(null);
  const userMarkerRef = useRef(null);
  const userCircleRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = userLocation ? userLocation.latitude : 43.8563;
    const initialLng = userLocation ? userLocation.longitude : 18.4082;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: true,
      maxBounds: [
        [43.50, 17.80],
        [44.25, 18.90]
      ],
      maxBoundsViscosity: 0.4,
      minZoom: 10,
      maxZoom: 19
    });

    map.attributionControl.setPrefix(false);
    map.attributionControl.addAttribution(
      '<a href="https://navsa.spatias.com" target="_blank">NAVSA</a> • Javni Prevoz KS'
    );

    // Clicking anywhere on map dismisses bottom sheet or overlays
    map.on('click', () => {
      if (onMapClick) onMapClick();
    });

    tracksLayerGroupRef.current = L.layerGroup().addTo(map);
    stopsLayerGroupRef.current = L.layerGroup().addTo(map);
    userLayerGroupRef.current = L.layerGroup().addTo(map);
    vehiclesLayerGroupRef.current = L.layerGroup().addTo(map);

    const updateMarkerScale = () => {
      const zoom = map.getZoom();
      mapContainerRef.current?.style.setProperty('--vehicle-scale', String(Math.max(0.65, Math.min(1.05, 0.8 + (zoom - 14) * 0.1))));
    };
    map.on('zoomend', updateMarkerScale);
    updateMarkerScale();
    mapInstanceRef.current = map;

    // Invalidate size on any container or orientation change to eliminate black void
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ debounceMoveend: true });
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      vehiclesLayerGroupRef.current = null;
      vehicleMarkersMapRef.current.clear();
      tracksLayerGroupRef.current = null;
      stopsLayerGroupRef.current = null;
      userLayerGroupRef.current = null;
      userMarkerRef.current = null;
      userCircleRef.current = null;
    };
  }, []);

  // Use the same Esri basemaps as the published app for both themes.
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl =
      theme === 'dark'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      maxNativeZoom: 16,
      attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [theme]);

  // Update Tracks (Tram & Trolley lines)
  useEffect(() => {
    const tracksGroup = tracksLayerGroupRef.current;
    if (!tracksGroup) return;

    tracksGroup.clearLayers();
    if (!showLines) return;

    // Tram lines: Vivid Yellow
    L.geoJSON(tramlinesData, {
      style: {
        color: '#facc15',
        weight: 4.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }
    }).addTo(tracksGroup);

    // Trolley lines: Solid Vivid Orange continuous transit path
    L.geoJSON(trolleylinesData, {
      style: {
        color: '#fb923c',
        weight: 3.5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }
    }).addTo(tracksGroup);
  }, [showLines, theme]);

  // Update Stops (Tram & Trolley stations with comfortable 36px touch targets)
  useEffect(() => {
    const stopsGroup = stopsLayerGroupRef.current;
    if (!stopsGroup) return;

    stopsGroup.clearLayers();
    if (!showStops) return;

    const stopIcon = L.divIcon({
      className: 'station-touch-icon',
      html: `
        <div class="station-touch-target">
          <div class="station-badge-dot"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const createStopMarker = (feature, latlng) => {
      const marker = L.marker(latlng, { icon: stopIcon, zIndexOffset: 400 });
      const stationName = feature.properties?.name || 'Stanica';

      marker.bindPopup(`
        <div class="station-map-popup">
          <div class="station-popup-header">
            <span class="station-popup-icon">🚏</span>
            <span class="station-popup-title">${stationName}</span>
          </div>
          <div class="station-popup-sub">Sarajevo Javni Prevoz • KS</div>
          <div class="station-popup-actions">
            <button class="station-action-btn primary" onclick="window.__selectStation && window.__selectStation('${stationName}', ${latlng.lat}, ${latlng.lng})">
              📍 Postavi kao lokaciju
            </button>
            <button class="station-action-btn fav" onclick="window.__toggleFavStation && window.__toggleFavStation('${stationName}')">
              ⭐ Favorit
            </button>
          </div>
        </div>
      `, {
        offset: [0, -12],
        className: 'custom-map-popup',
        closeButton: false
      });

      return marker;
    };

    L.geoJSON(tramstopsData, { pointToLayer: createStopMarker }).addTo(stopsGroup);
    L.geoJSON(trolleystopsData, { pointToLayer: createStopMarker }).addTo(stopsGroup);
  }, [showStops]);

  // Update User Location Marker (Standard GPS Pinpoint + Radar Accuracy Halo)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const userGroup = userLayerGroupRef.current;
    if (!map || !userGroup || !userLocation) return;

    const userLatLng = [userLocation.latitude, userLocation.longitude];
    const accuracyRadius = Math.max(userLocation.accuracy || 30, 20);

    // 1. Universal Precision GPS Pinpoint Marker Icon with dynamic translated label
    const userIcon = L.divIcon({
      className: 'user-pinpoint-marker-container',
      html: `
        <div class="user-pinpoint-marker">
          <div class="user-pinpoint-pulse"></div>
          <div class="user-pinpoint-head">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <!-- Location Beacon / Pinpoint Needle -->
              <circle cx="12" cy="12" r="11" fill="#0284c7" stroke="#ffffff" stroke-width="2.5" />
              <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
            </svg>
            <div class="user-pinpoint-tip"></div>
          </div>
          <div class="user-pinpoint-label">${t('location.youAreHere')}</div>
        </div>
      `,
      iconSize: [44, 56],
      iconAnchor: [22, 28]
    });

    const popupHtml = `
      <div class="user-map-popup">
        <div class="user-popup-tag">📍 ${t('location.currentLocation')}</div>
        <div class="user-popup-name">${userLocation.isGps ? t('location.gpsActive') : (userLocation.name || t('location.youAreHere'))}</div>
        <div class="user-popup-coords">${userLocation.latitude.toFixed(5)}°N, ${userLocation.longitude.toFixed(5)}°E</div>
      </div>
    `;

    // Reuse existing user marker and circle smoothly without tearing down layers
    if (userMarkerRef.current && userCircleRef.current) {
      userMarkerRef.current.setLatLng(userLatLng);
      userMarkerRef.current.setIcon(userIcon);
      userMarkerRef.current.setPopupContent(popupHtml);
      userCircleRef.current.setLatLng(userLatLng);
      userCircleRef.current.setRadius(accuracyRadius);
      if (!userGroup.hasLayer(userMarkerRef.current)) {
        userMarkerRef.current.addTo(userGroup);
      }
      if (!userGroup.hasLayer(userCircleRef.current)) {
        userCircleRef.current.addTo(userGroup);
      }
      return;
    }

    userGroup.clearLayers();

    // Radar Accuracy Circle (Soft pulsating translucent blue)
    const accuracyCircle = L.circle(userLatLng, {
      radius: accuracyRadius,
      color: '#0284c7',
      fillColor: '#38bdf8',
      fillOpacity: 0.16,
      weight: 1.5,
      dashArray: '4, 6'
    }).addTo(userGroup);

    const marker = L.marker(userLatLng, {
      icon: userIcon,
      zIndexOffset: 3000
    }).addTo(userGroup);

    marker.bindPopup(popupHtml, {
      offset: [0, -24],
      className: 'custom-map-popup',
      closeButton: false
    });

    userMarkerRef.current = marker;
    userCircleRef.current = accuracyCircle;
  }, [userLocation, t]);

  // Pan to map trigger
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapCenterTrigger) return;
    map.stop(); // Stop any pending camera animations
    map.flyTo([mapCenterTrigger.lat, mapCenterTrigger.lng], mapCenterTrigger.zoom || 15, {
      duration: 0.6,
      easeLinearity: 0.25
    });
  }, [mapCenterTrigger]);

  const vehicleMarkersMapRef = useRef(new Map());

  // Helper to create DivIcon for vehicle
  const createVehicleIcon = (vehicle, badgeBg, isSelected, isApproaching) => {
    const markerHtml = `
      <div class="vehicle-marker-stack ${isSelected ? 'selected' : ''} ${vehicle.isStale ? 'stale' : ''}" data-vehicle-id="${vehicle.id}">
        <!-- Line number pill -->
        <div class="vehicle-marker-badge" style="background-color: ${badgeBg};">
          ${vehicle.lineId || '?'}
        </div>
        <!-- Direction Arrow rotated to bearing -->
        <div class="vehicle-arrow-box" style="transform: rotate(${vehicle.bearing || 0}deg);">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            ${Number.isFinite(vehicle.bearing)
              ? `<path d="M16 2 L28 28 L16 21 L4 28 Z" fill="${badgeBg}" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"/>`
              : `<circle cx="16" cy="16" r="7" fill="${badgeBg}" stroke="#000000" stroke-width="2.5"/>`}

          </svg>
        </div>
        ${isApproaching ? '<div class="approach-pulse-ring"></div>' : ''}
      </div>
    `;

    return L.divIcon({
      className: 'vehicle-div-icon',
      html: markerHtml,
      iconSize: [48, 54],
      iconAnchor: [24, 40]
    });
  };

  // Helper to create popup HTML
  const createPopupContent = (vehicle, badgeBg) => {
    const proximityBadge = vehicle.proximity && vehicle.proximity.isComing !== null && !vehicle.isStale ? `
      <div class="popup-status-badge ${vehicle.proximity.badgeClass}">
        ${vehicle.proximity.isComing ? '🟢 ' + t('directions.ingoing') : '🔴 ' + t('directions.outgoing')}
        ${vehicle.proximity.etaMinutes ? ` • ${vehicle.proximity.etaMinutes} min` : ''}
      </div>
    ` : '';

    return `
      <div class="vehicle-map-popup">
        <div class="popup-header">
          <span class="popup-line-pill" style="background: ${badgeBg};">
            ${t('sheet.line', { id: vehicle.lineId })}
          </span>
          <span class="popup-operator">${vehicle.operator} • ${vehicle.isStale ? t('feed.lastKnown') : vehicle.speedKmH + ' km/h'}</span>
        </div>
        <div class="popup-route-title">
          ${vehicle.headingText}
        </div>
        ${proximityBadge}
        <div class="popup-meta">
          ${vehicle.proximity && vehicle.proximity.sublabel ? vehicle.proximity.sublabel : ''}
        </div>
      </div>
    `;
  };

  // Update Vehicle Markers with persistent instances to prevent blinking/flashing
  useEffect(() => {
    const vehiclesGroup = vehiclesLayerGroupRef.current;
    const map = mapInstanceRef.current;
    if (!vehiclesGroup || !map) return;

    const activeIds = new Set();

    vehicles.forEach(vehicle => {
      activeIds.add(vehicle.id);
      const badgeBg = vehicle.getPrimaryColor();
      const isSelected = selectedVehicle && selectedVehicle.id === vehicle.id;
      const isApproaching = vehicle.isApproaching();
      const stateKey = `${badgeBg}_${Number.isFinite(vehicle.bearing)}_${isSelected}_${isApproaching}_${vehicle.lineId}_${vehicle.isStale}`;

      const existing = vehicleMarkersMapRef.current.get(vehicle.id);

      if (existing) {
        existing.vehicle = vehicle;
        // Smoothly glide marker to new coordinates without recreating DOM node!
        existing.marker.setLatLng([vehicle.latitude, vehicle.longitude]);
        existing.marker.setZIndexOffset(isSelected ? 900 : (isApproaching ? 600 : 300));

        // Only update icon if state actually changed (bearing, selected, approaching)
        if (existing.stateKey !== stateKey) {
          existing.marker.setIcon(createVehicleIcon(vehicle, badgeBg, isSelected, isApproaching));
          existing.stateKey = stateKey;
        }
        const arrow = existing.marker.getElement()?.querySelector('.vehicle-arrow-box');
        if (arrow) arrow.style.transform = `rotate(${vehicle.bearing ?? 0}deg)`;

        existing.marker.setPopupContent(createPopupContent(vehicle, badgeBg));
      } else {
        // New vehicle marker
        const vehicleIcon = createVehicleIcon(vehicle, badgeBg, isSelected, isApproaching);
        const marker = L.marker([vehicle.latitude, vehicle.longitude], {
          icon: vehicleIcon,
          zIndexOffset: isSelected ? 900 : (isApproaching ? 600 : 300)
        });

        marker.bindPopup(createPopupContent(vehicle, badgeBg), {
          offset: [0, -28],
          closeButton: false,
          autoPan: false,
          className: 'custom-map-popup'
        });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectVehicle(vehicleMarkersMapRef.current.get(vehicle.id)?.vehicle || vehicle);
        });

        marker.addTo(vehiclesGroup);
        vehicleMarkersMapRef.current.set(vehicle.id, { marker, stateKey, vehicle });
      }
    });

    // Remove any markers that disappeared from telemetry
    for (const [id, item] of vehicleMarkersMapRef.current.entries()) {
      if (!activeIds.has(id)) {
        vehiclesGroup.removeLayer(item.marker);
        vehicleMarkersMapRef.current.delete(id);
      }
    }
  }, [vehicles, selectedVehicle, onSelectVehicle, t]);

  return (
    <div className="map-viewport" ref={mapContainerRef} />
  );
}
