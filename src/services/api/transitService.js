import { apiClient } from './apiClient';
import { API_CONFIG } from '../../config/api.config';
import { Vehicle } from '../../models/Vehicle';
import { decodeLineAndDirection, calculateBearing, determineUserRelativeDirection } from '../lines';

class TransitService {
  constructor() {
    this.previousPositionsMap = new Map();
  }

  async fetchLiveVehicles(userLocation = null) {
    let rawVehicles = null;

    // 1. Try local dev proxy endpoint
    try {
      rawVehicles = await apiClient.get(API_CONFIG.LOCAL_PROXY_ENDPOINT);
    } catch {
      // 2. Fallback to direct public endpoint
      try {
        const fullUrl = `${API_CONFIG.NAVSA_LIVE_BASE}${API_CONFIG.NAVSA_LIVE_ENDPOINT}`;
        rawVehicles = await apiClient.get(fullUrl);
      } catch {
        // 3. Fallback mock if completely unreachable
        rawVehicles = this.getFallbackMockData();
      }
    }

    if (!Array.isArray(rawVehicles) || rawVehicles.length === 0) {
      rawVehicles = this.getFallbackMockData();
    }

    const updatedPositions = new Map();

    const vehicleModels = rawVehicles
      .filter(v => v.id !== 0 && v.latitude && v.longitude)
      .map(v => {
        const decoded = decodeLineAndDirection(v);
        const prev = this.previousPositionsMap.get(v.id);

        let bearing = 0;
        let speedKmH = 0;

        if (prev) {
          const distMeters = Math.hypot(v.latitude - prev.latitude, v.longitude - prev.longitude) * 111000;
          if (distMeters > 5) {
            bearing = calculateBearing(prev.latitude, prev.longitude, v.latitude, v.longitude);
          } else {
            bearing = prev.bearing || 0;
          }
          speedKmH = Math.min(65, Math.round((distMeters / API_CONFIG.REFRESH_INTERVAL_SECONDS) * 3.6));
        } else {
          bearing = Math.round(Math.random() * 360);
          speedKmH = Math.floor(Math.random() * 20) + 12;
        }

        let operator = 'GRAS';
        if (v.operator_id === 2 || (v.vehicle_code && v.vehicle_code.includes('-'))) {
          operator = 'Centrotrans';
        }

        const vehicleModel = new Vehicle({
          id: v.id,
          vehicleCode: v.vehicle_code || `SA-${Math.abs(v.id)}`,
          vehicleTypeId: v.vehicle_type_id,
          latitude: v.latitude,
          longitude: v.longitude,
          bearing,
          speedKmH,
          lineId: decoded.lineId,
          origin: decoded.origin,
          destination: decoded.destination,
          headingText: decoded.headingText,
          headingTo: decoded.headingTo,
          operator
        });

        if (userLocation) {
          vehicleModel.proximity = determineUserRelativeDirection(vehicleModel, userLocation, prev);
        }

        updatedPositions.set(v.id, vehicleModel);
        return vehicleModel;
      });

    this.previousPositionsMap = updatedPositions;
    return vehicleModels;
  }

  getFallbackMockData() {
    return [
      { id: 41, vehicle_code: "557", vehicle_type_id: 4, operator_id: 1, latitude: 43.8542, longitude: 18.3965, direction: "Ilidža - Baščaršija" },
      { id: 42, vehicle_code: "558", vehicle_type_id: 4, operator_id: 1, latitude: 43.8512, longitude: 18.3688, direction: "Baščaršija - Ilidža" },
      { id: 101, vehicle_code: "M04-K-947", vehicle_type_id: 3, operator_id: 1, latitude: 43.8612, longitude: 18.4110, direction: "Dobrinja - Jezero" },
      { id: 102, vehicle_code: "M04-K-935", vehicle_type_id: 3, operator_id: 1, latitude: 43.8340, longitude: 18.3580, direction: "Jezero - Dobrinja" },
      { id: 103, vehicle_code: "612", vehicle_type_id: 3, operator_id: 1, latitude: 43.8490, longitude: 18.3640, direction: "Otoka - Trg Austrije" },
      { id: 201, vehicle_code: "A12-E-340", vehicle_type_id: 2, operator_id: 2, latitude: 43.8580, longitude: 18.4280, direction: "Dobrinja - Vijećnica T" },
      { id: 202, vehicle_code: "A12-E-341", vehicle_type_id: 2, operator_id: 2, latitude: 43.8310, longitude: 18.3510, direction: "Vijećnica T - Dobrinja" }
    ];
  }
}

export const transitService = new TransitService();
