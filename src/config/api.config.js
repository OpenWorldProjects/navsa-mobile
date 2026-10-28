// Centralized API configuration
export const API_CONFIG = {
  NAVSA_LIVE_BASE: 'https://navsa.spatias.com',
  NAVSA_LIVE_ENDPOINT: '/live',
  LOCAL_PROXY_ENDPOINT: '/api/live',
  WEB_LIVE_URL: import.meta.env.VITE_NAVSA_LIVE_URL || '',
  WEB_STATUS_URL: import.meta.env.VITE_NAVSA_STATUS_URL || '',
  LOCAL_STATUS_ENDPOINT: '/api/source-status',
  SOURCE_STATUS_REFRESH_MS: 60000,
  SOURCE_STATUS_MAX_AGE_MS: 300000,
  REFRESH_INTERVAL_SECONDS: 10,
  REQUEST_TIMEOUT_MS: 7000,
  DEFAULT_MAP_CENTER: {
    lat: 43.8563,
    lng: 18.4082, // Marijin Dvor, Sarajevo
    zoom: 14
  },
  STORAGE_KEYS: {
    THEME: 'sarajevo_transit_theme',
    LANGUAGE: 'sarajevo_transit_lang',
    PREFERRED_VEHICLE: 'sarajevo_transit_preferred_vehicle', // tram, trolley, bus, all
    RECENT_STATION: 'sarajevo_transit_recent_station'
  }
};
