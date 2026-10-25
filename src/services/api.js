import { decodeLineAndDirection, calculateBearing, determineUserRelativeDirection } from './lines';

let previousVehiclesMap = new Map();

export async function fetchLiveVehicles(userLocation = null) {
  let rawData = null;

  // 1. Try local proxy
  try {
    const res = await fetch('/api/live', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      rawData = await res.json();
    }
  } catch {
    // ignore
  }

  // 2. Direct fallback
  if (!rawData || !Array.isArray(rawData)) {
    try {
      const res = await fetch('https://navsa.spatias.com/live', {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        rawData = await res.json();
      }
    } catch {
      // ignore
    }
  }

  // 3. Fallback mock if completely offline or server down
  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    rawData = getMockSarajevoTransit();
  }

  // Process vehicles
  const updatedMap = new Map();
  const processed = rawData
    .filter(v => v.id !== 0 && v.latitude && v.longitude)
    .map(v => {
      const decoded = decodeLineAndDirection(v);
      const prev = previousVehiclesMap.get(v.id);

      let bearing = 0;
      let calculatedSpeedKmH = 0;

      if (prev) {
        const dist = Math.hypot(v.latitude - prev.latitude, v.longitude - prev.longitude) * 111000;
        if (dist > 5) {
          bearing = calculateBearing(prev.latitude, prev.longitude, v.latitude, v.longitude);
        } else {
          bearing = prev.bearing || 0;
        }
        calculatedSpeedKmH = Math.min(65, Math.round((dist / 10) * 3.6));
      } else {
        bearing = Math.round(Math.random() * 360);
        calculatedSpeedKmH = Math.floor(Math.random() * 25) + 10;
      }

      // Determine operator
      let operator = 'GRAS';
      if (v.operator_id === 2 || (v.vehicle_code && v.vehicle_code.includes('-'))) {
        operator = 'Centrotrans';
      }

      const vehicleObj = {
        id: v.id,
        vehicleCode: v.vehicle_code || `SA-${Math.abs(v.id)}`,
        vehicleTypeId: v.vehicle_type_id,
        latitude: v.latitude,
        longitude: v.longitude,
        directionRaw: v.direction,
        operator,
        bearing,
        speedKmH: calculatedSpeedKmH,
        lineId: decoded.lineId,
        origin: decoded.origin,
        destination: decoded.destination,
        headingText: decoded.headingText,
        headingTo: decoded.headingTo,
      };

      // Add user proximity details
      if (userLocation) {
        const proximity = determineUserRelativeDirection(vehicleObj, userLocation, prev);
        vehicleObj.proximity = proximity;
      } else {
        vehicleObj.proximity = null;
      }

      updatedMap.set(v.id, vehicleObj);
      return vehicleObj;
    });

  previousVehiclesMap = updatedMap;
  return processed;
}

function getMockSarajevoTransit() {
  return [
    { id: 101, vehicle_code: "557", vehicle_type_id: 4, operator_id: 1, latitude: 43.8542, longitude: 18.3965, direction: "Ilidža - Baščaršija" },
    { id: 102, vehicle_code: "558", vehicle_type_id: 4, operator_id: 1, latitude: 43.8512, longitude: 18.3688, direction: "Baščaršija - Ilidža" },
    { id: 201, vehicle_code: "M04-K-947", vehicle_type_id: 3, operator_id: 1, latitude: 43.8612, longitude: 18.4110, direction: "Dobrinja - Jezero" },
    { id: 202, vehicle_code: "M04-K-935", vehicle_type_id: 3, operator_id: 1, latitude: 43.8340, longitude: 18.3580, direction: "Jezero - Dobrinja" },
    { id: 203, vehicle_code: "612", vehicle_type_id: 3, operator_id: 1, latitude: 43.8490, longitude: 18.3640, direction: "Otoka - Trg Austrije" },
    { id: 301, vehicle_code: "A12-E-340", vehicle_type_id: 2, operator_id: 2, latitude: 43.8580, longitude: 18.4280, direction: "Dobrinja - Vijećnica T" },
    { id: 302, vehicle_code: "A12-E-341", vehicle_type_id: 2, operator_id: 2, latitude: 43.8310, longitude: 18.3510, direction: "Vijećnica T - Dobrinja" },
  ];
}
