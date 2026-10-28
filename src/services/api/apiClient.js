import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { API_CONFIG } from '../../config/api.config';

export class ApiClient {
  constructor(http = CapacitorHttp) {
    this.http = http;
  }

  async get(url, options = {}) {
    const timeout = options.timeout || API_CONFIG.REQUEST_TIMEOUT_MS;
    const headers = { Accept: 'application/json', ...(options.headers || {}) };
    if (Capacitor.isNativePlatform()) {
      // APKs have no Vite proxy. Use the native HTTP transport, outside WebView CORS.
      const response = await this.http.get({
        url, headers, connectTimeout: timeout, readTimeout: timeout, responseType: 'json'
      });
      return this.readResponse(response.status, response.data);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { method: 'GET', headers, signal: controller.signal });
      if (response.status === 204 || response.status === 503) return null;
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  readResponse(status, data) {
    if (status === 204 || status === 503) return null;
    if (status < 200 || status >= 300) throw new Error(`HTTP Error ${status}`);
    return typeof data === 'string' ? JSON.parse(data) : data;
  }

  getLiveVehicles() {
    const upstream = `${API_CONFIG.NAVSA_LIVE_BASE}${API_CONFIG.NAVSA_LIVE_ENDPOINT}`;
    const url = Capacitor.isNativePlatform() ? upstream
      : API_CONFIG.WEB_LIVE_URL || (import.meta.env.DEV ? API_CONFIG.LOCAL_PROXY_ENDPOINT : upstream);
    return this.get(url, Capacitor.isNativePlatform()
      ? { headers: { Referer: `${API_CONFIG.NAVSA_LIVE_BASE}/` } } : {});
  }
}

export const apiClient = new ApiClient();
