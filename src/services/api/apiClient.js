import { API_CONFIG } from '../../config/api.config';

class ApiClient {
  async get(url, options = {}) {
    const timeoutMs = options.timeout || API_CONFIG.REQUEST_TIMEOUT_MS;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(options.headers || {})
        },
        signal: controller.signal
      });

      // Upstream 204 No Content means telemetry server has no fresh updates
      if (response.status === 204) {
        return { isStale: true, status: 204, data: [] };
      }

      if (response.status === 503) {
        return { isStale: true, status: 503, data: [] };
      }

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
