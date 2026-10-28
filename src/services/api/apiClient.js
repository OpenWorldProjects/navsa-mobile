import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { API_CONFIG } from '../../config/api.config';
import { parseSourceStatus } from './sourceStatus';

export class ApiClient {
  constructor(http = CapacitorHttp) {
    this.http = http;
    this.sourceStatus = null;
    this.sourceStatusRequest = null;
    this.lastStatusResult = null;
    this.statusNextCheckAt = 0;
  }

  async get(url, options = {}) {
    const timeout = options.timeout || API_CONFIG.REQUEST_TIMEOUT_MS;
    const headers = { Accept: 'application/json', ...(options.headers || {}) };
    if (Capacitor.isNativePlatform()) {
      // APKs have no Vite proxy. Use the native HTTP transport, outside WebView CORS.
      const response = await this.http.get({
        url, headers, connectTimeout: timeout, readTimeout: timeout, responseType: options.responseType || 'json'
      });
      return this.readResponse(response.status, response.data, options.responseType);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { method: 'GET', headers, signal: controller.signal });
      if (response.status === 204 || response.status === 503) return null;
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      return options.responseType === 'text' ? await response.text() : await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  readResponse(status, data, responseType) {
    if (status === 204 || status === 503) return null;
    if (status < 200 || status >= 300) throw new Error(`HTTP Error ${status}`);
    return responseType === 'text' ? data : typeof data === 'string' ? JSON.parse(data) : data;
  }

  async getFeedStatus() {
    if (this.lastStatusResult && Date.now() < this.statusNextCheckAt) {
      return this.lastStatusResult;
    }
    if (this.sourceStatusRequest) return this.sourceStatusRequest;
    this.sourceStatusRequest = (async () => {
      try {
        const native = Capacitor.isNativePlatform();
        const url = native ? `${API_CONFIG.NAVSA_LIVE_BASE}/`
          : API_CONFIG.WEB_STATUS_URL || (import.meta.env.DEV
            ? API_CONFIG.LOCAL_STATUS_ENDPOINT : `${API_CONFIG.NAVSA_LIVE_BASE}/`);
        const html = await this.get(url, {
          responseType: 'text',
          headers: { Accept: 'text/html', ...(native ? { Referer: `${API_CONFIG.NAVSA_LIVE_BASE}/` } : {}) }
        });
        this.sourceStatus = { ...parseSourceStatus(html), checkedAt: Date.now(), isStale: false };
        return this.sourceStatus;
      } catch {
        // A short outage may retain a recent upstream decision, never a permanent hardcoded ban.
        if (this.sourceStatus && Date.now() - this.sourceStatus.checkedAt < API_CONFIG.SOURCE_STATUS_MAX_AGE_MS) {
          return { ...this.sourceStatus, isStale: true };
        }
        return { availability: {}, notice: '', checkedAt: null, isStale: true };
      }
    })();
    try {
      this.lastStatusResult = await this.sourceStatusRequest;
      this.statusNextCheckAt = Date.now() + API_CONFIG.SOURCE_STATUS_REFRESH_MS;
      return this.lastStatusResult;
    } finally {
      this.sourceStatusRequest = null;
    }
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
