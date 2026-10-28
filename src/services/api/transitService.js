import { apiClient } from './apiClient';
import { API_CONFIG } from '../../config/api.config';
import { Vehicle } from '../../models/Vehicle';
import { decodeLineAndDirection, calculateBearing, calculateDistanceMeters, determineUserRelativeDirection } from '../lines';

export class TransitService {
  constructor() {
    this.previousPositionsMap = new Map();
    this.isServerStale = true;
    this.staleMessage = '';
    this.lastSuccessfulSync = null;
  }

  isCoordinateValid(lat, lng) {
    return Number.isFinite(lat) && Number.isFinite(lng)
      && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);
  }

  async fetchLiveVehicles(userLocation = null) {
    let rawVehicles;
    try {
      rawVehicles = await apiClient.getLiveVehicles();
      if (!Array.isArray(rawVehicles)) throw new Error('Live feed unavailable');
    } catch {
      this.isServerStale = true;
      this.staleMessage = 'Podaci uživo trenutno nisu dostupni. Prikazane su samo posljednje primljene pozicije, ako postoje.';
      // Never replace real telemetry with made-up vehicles or refresh its timestamp.
      const retained = [...this.previousPositionsMap.values()].map(previous => {
        const vehicle = new Vehicle({ ...previous, isStale: true, speedKmH: 0 });
        vehicle.proximity = userLocation
          ? determineUserRelativeDirection(vehicle, userLocation, previous) : null;
        return vehicle;
      });
      this.previousPositionsMap = new Map(retained.map(vehicle => [vehicle.id, vehicle]));
      return retained;
    }

    this.isServerStale = false;
    this.staleMessage = '';
    const now = Date.now();
    this.lastSuccessfulSync = now;
    const updatedPositions = new Map();

    for (const raw of rawVehicles) {
      if (!raw || !Number.isFinite(raw.id) || raw.id === 0
        || ![2, 3, 4].includes(raw.vehicle_type_id)
        || !this.isCoordinateValid(raw.latitude, raw.longitude)) continue;
      // NAVSA currently disables buses because the ministry feed is stale.
      // Negative IDs are valid provider IDs, not a reason to reject a vehicle.
      if (API_CONFIG.UNAVAILABLE_VEHICLE_TYPES.includes(raw.vehicle_type_id)) continue;
      const decoded = decodeLineAndDirection(raw);
      const previous = this.previousPositionsMap.get(raw.id);
      let latitude = raw.latitude;
      let longitude = raw.longitude;
      let bearing = previous?.bearing ?? null;
      let speedKmH = 0;
      let lastUpdated = now;

      if (previous && !previous.isStale) {
        const distance = calculateDistanceMeters(previous.latitude, previous.longitude, latitude, longitude);
        const elapsedSeconds = (now - previous.sampledAt) / 1000;
        if (distance > 10) {
          bearing = calculateBearing(previous.latitude, previous.longitude, latitude, longitude);
          speedKmH = elapsedSeconds > 0 ? Math.min(65, Math.round(distance / elapsedSeconds * 3.6)) : 0;
        } else {
          // Hold a stable GPS anchor until movement exceeds the same 10 m threshold as NAVSA.
          latitude = previous.latitude;
          longitude = previous.longitude;
          lastUpdated = previous.lastUpdated;
        }
      } else if (previous) {
        // A long gap cannot establish a reliable current heading or speed.
        bearing = null;
      }

      const vehicle = new Vehicle({
        id: raw.id,
        vehicleCode: raw.vehicle_code || `SA-${Math.abs(raw.id)}`,
        vehicleTypeId: raw.vehicle_type_id,
        latitude, longitude, bearing, speedKmH,
        lineId: decoded.lineId,
        origin: decoded.origin,
        destination: decoded.destination,
        headingText: decoded.headingText,
        headingTo: decoded.headingTo,
        operator: raw.operator_id === 2 ? 'Centrotrans' : 'GRAS',
        isStale: false,
        lastUpdated,
        sampledAt: lastUpdated
      });
      if (userLocation) vehicle.proximity = determineUserRelativeDirection(vehicle, userLocation, previous);
      updatedPositions.set(raw.id, vehicle);
    }
    this.previousPositionsMap = updatedPositions;
    return [...updatedPositions.values()];
  }
}

export const transitService = new TransitService();
