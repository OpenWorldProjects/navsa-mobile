import { apiClient } from './apiClient';
import { API_CONFIG } from '../../config/api.config';
import { Vehicle } from '../../models/Vehicle';
import { decodeLineAndDirection, calculateBearing, determineUserRelativeDirection } from '../lines';
import { snapTramToTrack } from '../snapToTracks';

// Urban Sarajevo bounding box (rejects intercity buses heading to Kakanj, Fojnica, Visoko, Tarčin, etc.)
const SARAJEVO_BOUNDS = {
  minLat: 43.780,
  maxLat: 43.925,
  minLng: 18.240,
  maxLng: 18.460
};

// Precise Tram line corridor (Ilidža to Baščaršija + Željeznička stanica loop)
// Sarajevo tram routes are strictly fixed on tracks within this corridor
const TRAM_CORRIDOR = {
  minLat: 43.818,
  maxLat: 43.868,
  minLng: 18.295,
  maxLng: 18.445
};

export class TransitService {
  constructor() {
    this.previousPositionsMap = new Map();
    this.isServerStale = false;
    this.staleMessage = '';
    this.lastSuccessfulSync = Date.now();
  }

  isCoordinateValid(lat, lng, typeId) {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return false;
    }
    // Greater Sarajevo urban boundary
    if (
      lat < SARAJEVO_BOUNDS.minLat ||
      lat > SARAJEVO_BOUNDS.maxLat ||
      lng < SARAJEVO_BOUNDS.minLng ||
      lng > SARAJEVO_BOUNDS.maxLng
    ) {
      return false;
    }
    // Strict tram corridor: Trams cannot physically be off the tram track corridor
    if (typeId === 4) {
      if (
        lat < TRAM_CORRIDOR.minLat ||
        lat > TRAM_CORRIDOR.maxLat ||
        lng < TRAM_CORRIDOR.minLng ||
        lng > TRAM_CORRIDOR.maxLng
      ) {
        return false;
      }
    }
    return true;
  }

  async fetchLiveVehicles(userLocation = null) {
    let rawVehicles = null;
    let isStaleFeed = false;

    // 1. Try local dev proxy endpoint
    try {
      const res = await apiClient.get(API_CONFIG.LOCAL_PROXY_ENDPOINT);
      if (res && res.isStale) {
        isStaleFeed = true;
      } else if (Array.isArray(res)) {
        rawVehicles = res;
      }
    } catch {
      // 2. Fallback to direct public endpoint
      try {
        const fullUrl = `${API_CONFIG.NAVSA_LIVE_BASE}${API_CONFIG.NAVSA_LIVE_ENDPOINT}`;
        const res = await apiClient.get(fullUrl);
        if (res && res.isStale) {
          isStaleFeed = true;
        } else if (Array.isArray(res)) {
          rawVehicles = res;
        }
      } catch {
        isStaleFeed = true;
      }
    }

    if (isStaleFeed || !Array.isArray(rawVehicles) || rawVehicles.length === 0) {
      this.isServerStale = true;
      this.staleMessage =
        'Pozicije vozila sa sistema Ministarstva saobraćaja KS se trenutno ne osvježavaju ili su nedostupne.';
      if (!rawVehicles || rawVehicles.length === 0) {
        rawVehicles = this.getFallbackMockData();
      }
    } else {
      this.isServerStale = false;
      this.staleMessage = '';
      this.lastSuccessfulSync = Date.now();
    }

    const updatedPositions = new Map();
    const now = Date.now();

    const vehicleModels = rawVehicles
      .filter(v => {
        // Drop invalid IDs
        if (!v || v.id === 0) return false;
        // Validate coordinates within Sarajevo and strict tram corridor
        if (!this.isCoordinateValid(v.latitude, v.longitude, v.vehicle_type_id)) {
          return false;
        }
        // If it's a tram (vehicle_type_id === 4), snap to tracks or drop if off-track (e.g. inside GRAS Remiza depot yard)
        if (v.vehicle_type_id === 4) {
          const snapped = snapTramToTrack(v.latitude, v.longitude, 70);
          if (!snapped.isOnTrack) {
            // Tram is off the commercial track (e.g. parked inside depot yard north of Bulevar)
            return false;
          }
          v.latitude = snapped.latitude;
          v.longitude = snapped.longitude;
        }
        return true;
      })
      .map(v => {
        const decoded = decodeLineAndDirection(v);

        // Remove unknown bus lines or intercity negative IDs (matches navsa.spatias.com)
        if (v.vehicle_type_id === 2 && (decoded.lineId === '?' || v.id < 0)) {
          return null;
        }

        const prev = this.previousPositionsMap.get(v.id);

        let bearing = 0;
        let speedKmH = 0;
        let isStale = this.isServerStale;
        let lastUpdated = now;

        if (prev) {
          const distMeters =
            Math.hypot(v.latitude - prev.latitude, v.longitude - prev.longitude) * 111000;
          if (distMeters > 5) {
            bearing = calculateBearing(prev.latitude, prev.longitude, v.latitude, v.longitude);
            speedKmH = Math.min(
              65,
              Math.round((distMeters / API_CONFIG.REFRESH_INTERVAL_SECONDS) * 3.6)
            );
            lastUpdated = now;
          } else {
            bearing = prev.bearing || 0;
            speedKmH = 0;
            lastUpdated = prev.lastUpdated || now;
            // If stationary for more than 4 minutes, flag vehicle as stale
            if (now - lastUpdated > 240000) {
              isStale = true;
            }
          }
        } else {
          // Initial natural bearing based on destination corridor
          const destUpper = (decoded.destination || '').toUpperCase();
          if (destUpper.includes('BAŠČARŠ') || destUpper.includes('BASCARS') || destUpper.includes('VIJEĆ') || destUpper.includes('VIJEC')) {
            bearing = 85; // Heading East towards Baščaršija
          } else if (destUpper.includes('ILIDŽ') || destUpper.includes('ILIDZ') || destUpper.includes('HRASN') || destUpper.includes('NEDŽ') || destUpper.includes('DOBRINJ')) {
            bearing = 265; // Heading West towards Ilidža/Dobrinja
          } else if (destUpper.includes('JEZERO') || destUpper.includes('KOŠEV') || destUpper.includes('VOGOŠĆ')) {
            bearing = 15; // Heading North towards Jezero/Vogošća
          } else if (destUpper.includes('AUSTRIJ') || destUpper.includes('DRVENIJ')) {
            bearing = 105; // Heading East towards Trg Austrije
          } else {
            bearing = 90;
          }
          speedKmH = 0;
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
          operator,
          isStale,
          lastUpdated
        });

        if (userLocation) {
          vehicleModel.proximity = determineUserRelativeDirection(vehicleModel, userLocation, prev);
        }

        updatedPositions.set(v.id, vehicleModel);
        return vehicleModel;
      })
      .filter(Boolean);

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
