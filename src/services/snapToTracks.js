import tramlinesData from '../data/tramlines.json';

// Flatten all line segments from tramlines GeoJSON: [{ lat1, lng1, lat2, lng2 }, ...]
const tramSegments = [];

for (const feature of tramlinesData.features) {
  if (feature.geometry && feature.geometry.type === 'LineString') {
    const coords = feature.geometry.coordinates; // each is [lng, lat]
    for (let i = 0; i < coords.length - 1; i++) {
      tramSegments.push({
        lat1: coords[i][1],
        lng1: coords[i][0],
        lat2: coords[i + 1][1],
        lng2: coords[i + 1][0]
      });
    }
  }
}

/**
 * Projects a point onto a line segment
 */
function projectPointOnSegment(lat, lng, lat1, lng1, lat2, lng2) {
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return { lat: lat1, lng: lng1 };
  }

  let t = ((lng - lng1) * dx + (lat - lat1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  return {
    lat: lat1 + t * dy,
    lng: lng1 + t * dx
  };
}

/**
 * Snaps tram coordinates to the nearest point on the Sarajevo tram tracks.
 * If distance to the track exceeds maxDistanceMeters, the tram is deemed off-track (e.g. inside the depot yard).
 */
export function snapTramToTrack(lat, lng, maxDistanceMeters = 65) {
  let closestPoint = null;
  let minDistanceMeters = Infinity;

  for (const seg of tramSegments) {
    const proj = projectPointOnSegment(lat, lng, seg.lat1, seg.lng1, seg.lat2, seg.lng2);
    // Local meters conversion for Sarajevo (~43.85N, 18.4E)
    const dLat = (lat - proj.lat) * 111139;
    const dLng = (lng - proj.lng) * 80200;
    const dist = Math.hypot(dLat, dLng);

    if (dist < minDistanceMeters) {
      minDistanceMeters = dist;
      closestPoint = proj;
    }
  }

  if (minDistanceMeters <= maxDistanceMeters && closestPoint) {
    return {
      latitude: closestPoint.lat,
      longitude: closestPoint.lng,
      isOnTrack: true,
      distanceToTrack: minDistanceMeters
    };
  }

  return {
    latitude: lat,
    longitude: lng,
    isOnTrack: false,
    distanceToTrack: minDistanceMeters
  };
}
