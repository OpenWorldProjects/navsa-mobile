// Line decoder and definitions for Sarajevo Public Transport (Javni prevoz Sarajevo)
// Supports Trams, Trolleys, Buses (GRAS & Centrotrans)

export const VEHICLE_TYPES = {
  2: { id: 2, name: 'Autobus', kind: 'bus', color: '#06b6d4', bg: '#0891b2', icon: 'Bus' },
  3: { id: 3, name: 'Trolejbus', kind: 'trolley', color: '#f97316', bg: '#ea580c', icon: 'Zap' },
  4: { id: 4, name: 'Tramvaj', kind: 'tram', color: '#eab308', bg: '#ca8a04', icon: 'Train' },
};

export const TRAM_LINES = {
  "1": { line: "1", type: 4, name: "Linija 1", from: "Željeznička Stanica", to: "Baščaršija", stops: ["Željeznička Stanica", "Muzeji", "Marijin Dvor", "Skenderija", "Pošta", "Drvenija", "Latinska Ćuprija", "Vijećnica", "Baščaršija"] },
  "2": { line: "2", type: 4, name: "Linija 2", from: "Čengić Vila", to: "Baščaršija", stops: ["Čengić Vila", "Dolac Malta", "Socijalno", "Pofalići", "Univerzitet", "Zemaljski Muzej", "Marijin Dvor", "Skenderija", "Pošta", "Drvenija", "Latinska Ćuprija", "Vijećnica", "Baščaršija"] },
  "3": { line: "3", type: 4, name: "Linija 3", from: "Ilidža", to: "Baščaršija", stops: ["Ilidža", "Kasindolska", "Energoinvest", "Stup", "Nedžarići", "Alipašino Polje", "RTV Dom", "Alipašin Most", "Otoka", "Čengić Vila", "Dolac Malta", "Socijalno", "Pofalići", "Univerzitet", "Zemaljski Muzej", "Marijin Dvor", "Skenderija", "Pošta", "Drvenija", "Latinska Ćuprija", "Vijećnica", "Baščaršija"] },
  "4": { line: "4", type: 4, name: "Linija 4", from: "Ilidža", to: "Željeznička Stanica", stops: ["Ilidža", "Stup", "Nedžarići", "Alipašino Polje", "Otoka", "Čengić Vila", "Socijalno", "Pofalići", "Muzeji", "Željeznička Stanica"] },
  "5": { line: "5", type: 4, name: "Linija 5", from: "Nedžarići", to: "Baščaršija", stops: ["Nedžarići", "Alipašino Polje", "Otoka", "Čengić Vila", "Socijalno", "Pofalići", "Marijin Dvor", "Skenderija", "Baščaršija"] },
  "6": { line: "6", type: 4, name: "Linija 6", from: "Ilidža", to: "Skenderija", stops: ["Ilidža", "Stup", "Nedžarići", "Otoka", "Čengić Vila", "Pofalići", "Marijin Dvor", "Skenderija"] },
  "7": { line: "7", type: 4, name: "Linija 7", from: "Nedžarići", to: "Skenderija", stops: ["Nedžarići", "Otoka", "Čengić Vila", "Marijin Dvor", "Skenderija"] }
};

export const TROLLEY_LINES = {
  "101": { line: "101", type: 3, name: "Linija 101", from: "Otoka", to: "Trg Austrije", stops: ["Otoka", "Aneks", "Švrakino Selo", "Alipašino Polje", "Čengić Vila", "Grbavica", "Zagrebačka", "Skenderija", "Hamdije Kreševljakovića", "Trg Austrije"] },
  "102": { line: "102", type: 3, name: "Linija 102", from: "Otoka", to: "Jezero", stops: ["Otoka", "Čengić Vila", "Pofalići", "Velešići", "Koševo", "Stadion Koševo", "Jezero"] },
  "103": { line: "103", type: 3, name: "Linija 103", from: "Dobrinja", to: "Trg Austrije", stops: ["Dobrinja", "Mojmilo", "Švrakino Selo", "Alipašino Polje", "Grbavica", "Skenderija", "Trg Austrije"] },
  "104": { line: "104", type: 3, name: "Linija 104", from: "Alipašino Polje", to: "Trg Austrije", stops: ["Alipašino Polje", "Švrakino Selo", "Grbavica", "Trg Austrije"] },
  "105": { line: "105", type: 3, name: "Linija 105", from: "Trg Austrije", to: "Vogošća", stops: ["Trg Austrije", "Skenderija", "Koševo", "Jezero", "Kobilja Glava", "Hotonj", "Vogošća"] },
  "106": { line: "106", type: 3, name: "Linija 106", from: "Otoka", to: "Vogošća", stops: ["Otoka", "Buća Potok", "Velešići", "Kobilja Glava", "Vogošća"] },
  "107": { line: "107", type: 3, name: "Linija 107", from: "Dobrinja", to: "Jezero", stops: ["Dobrinja", "Mojmilo", "Švrakino Selo", "Grbavica", "Zagrebačka", "Hamdije Čemerlića", "Pofalići", "Velešići", "Koševo", "Stadion Koševo", "Jezero"] },
  "108": { line: "108", type: 3, name: "Linija 108", from: "Otoka", to: "Dobrinja", stops: ["Otoka", "Aneks", "Švrakino Selo", "Mojmilo", "Dobrinja"] },
};

export const BUS_LINES = {
  "14": { line: "14", type: 2, name: "Linija 14", from: "Dom Armije", to: "Podhrastovi" },
  "15": { line: "15", type: 2, name: "Linija 15", from: "Željeznička Stanica", to: "Buća Potok" },
  "15B": { line: "15B", type: 2, name: "Linija 15B", from: "Otoka", to: "Buća Potok" },
  "16B": { line: "16B", type: 2, name: "Linija 16B", from: "Dom Armije", to: "Koševsko Brdo" },
  "17": { line: "17", type: 2, name: "Linija 17", from: "Dom Armije", to: "Breka" },
  "17B": { line: "17B", type: 2, name: "Linija 17B", from: "Dom Armije", to: "Breka 2" },
  "18": { line: "18", type: 2, name: "Linija 18", from: "Drvenija", to: "Pofalići" },
  "21": { line: "21", type: 2, name: "Linija 21", from: "Sutjeska", to: "Vogošća" },
  "22A": { line: "22A", type: 2, name: "Linija 22A", from: "Stup", to: "Vogošća" },
  "23": { line: "23", type: 2, name: "Linija 23", from: "Željeznička Stanica", to: "Rajlovac" },
  "23C": { line: "23C", type: 2, name: "Linija 23C", from: "Otoka", to: "Boljakov Potok" },
  "24": { line: "24", type: 2, name: "Linija 24", from: "Stup", to: "Smiljevići" },
  "26A": { line: "26A", type: 2, name: "Linija 26A", from: "Stup", to: "Dobroševići" },
  "27": { line: "27", type: 2, name: "Linija 27", from: "Ilidža", to: "Hrasnica (Famos)" },
  "27E": { line: "27E", type: 2, name: "Linija 27E", from: "Baščaršija", to: "Hrasnica (Famos)" },
  "31": { line: "31", type: 2, name: "Linija 31", from: "Nedžarići", to: "Dobrinja" },
  "31E": { line: "31E", type: 2, name: "Linija 31E", from: "Dobrinja", to: "Vijećnica" },
  "32": { line: "32", type: 2, name: "Linija 32", from: "Ilidža", to: "Butmir" },
  "41": { line: "41", type: 2, name: "Linija 41", from: "Drvenija", to: "Gornji Velešići" },
  "49": { line: "49", type: 2, name: "Linija 49", from: "Ilidža", to: "Doglodi" },
  "51": { line: "51", type: 2, name: "Linija 51", from: "Baščaršija", to: "Vratnik" },
  "55": { line: "55", type: 2, name: "Linija 55", from: "Baščaršija", to: "Sedrenik" },
  "56": { line: "56", type: 2, name: "Linija 56", from: "Latinska Ćuprija", to: "Jarčedoli" },
  "58": { line: "58", type: 2, name: "Linija 58", from: "Baščaršija", to: "Mihrivode" },
  "59": { line: "59", type: 2, name: "Linija 59", from: "Latinska Ćuprija", to: "Komatin" },
  "63": { line: "63", type: 2, name: "Linija 63", from: "Latinska Ćuprija", to: "Mahmutovac" },
  "180": { line: "180", type: 2, name: "Linija 180", from: "Otoka", to: "Sokolje" },
  "200": { line: "200", type: 2, name: "Linija 200", from: "Aerodrom Sarajevo", to: "Bentbaša" },
};

// Sets for matching endpoints regardless of order
const tramLineSets = {
  "1": new Set(["BAŠČARŠIJA", "ŽELJEZNIČKA STANICA"]),
  "2": new Set(["BAŠČARŠIJA", "ČENGIĆ VILA"]),
  "3": new Set(["BAŠČARŠIJA", "ILIDŽA", "HRASNICA"]),
  "4": new Set(["ŽELJEZNIČKA STANICA", "ILIDŽA"]),
  "5": new Set(["BAŠČARŠIJA", "NEDŽARIĆI"]),
  "6": new Set(["SKENDERIJA", "ILIDŽA"]),
  "7": new Set(["SKENDERIJA", "NEDŽARIĆI"]),
};

const trolleyLineSets = {
  "101": new Set(["OTOKA", "TRG AUSTRIJE"]),
  "102": new Set(["OTOKA", "JEZERO"]),
  "103": new Set(["DOBRINJA", "TRG AUSTRIJE"]),
  "104": new Set(["ALIPAŠINO POLJE", "TRG AUSTRIJE"]),
  "105": new Set(["TRG AUSTRIJE", "VOGOŠĆA"]),
  "106": new Set(["OTOKA", "VOGOŠĆA"]),
  "107": new Set(["DOBRINJA", "JEZERO"]),
  "108": new Set(["OTOKA", "DOBRINJA"]),
};

const busLineSets = {
  "14": new Set(["DOM ARMIJE", "PODHRASTOVI"]),
  "15": new Set(["ŽELJEZNIČKA STANICA SA", "BUČA POTOK (OKRETALJKA)", "BUČA POTOK"]),
  "15B": new Set(["OTOKA", "BUĆA POTOK", "BUČA POTOK", "BUČA POTOK (OKRETALJKA)"]),
  "16B": new Set(["DOM ARMIJE", "KOŠEVSKO BRDO", "KOŠEVSKO BRDO (NASELJE)"]),
  "17": new Set(["DOM ARMIJE", "BREKA"]),
  "17B": new Set(["DOM ARMIJE", "BREKA 2"]),
  "18": new Set(["DRVENIJA", "POFALIĆI", "POFALIĆI (OKRETALJKA)"]),
  "21": new Set(["SUTJESKA", "VOGOŠĆA"]),
  "22A": new Set(["STUP", "STUP (TERMINAL)", "VOGOŠĆA", "VOGOŠCA (TERMINAL)"]),
  "23": new Set(["ŽELJEZNIČKA STANICA SA", "RAJLOVAC"]),
  "23C": new Set(["OTOKA", "BOLJAKOV POTOK"]),
  "24": new Set(["STUP", "STUP (TERMINAL)", "SMILJEVIĆI 1", "SMILJEVIĆI"]),
  "26A": new Set(["STUP", "STUP (TERMINAL)", "DOBROŠEVIĆI (OKRETALJKA)", "DOBROŠEVIĆI"]),
  "27": new Set(["ILIDŽA", "FAMOS", "HRASNICA (TERMINUS)", "HRASNICA"]),
  "27E": new Set(["BAŠČARŠIJA", "HRASNICA (FAMOS)", "HRASNICA"]),
  "31": new Set(["NEDŽARIĆI", "DOBRINJA"]),
  "31E": new Set(["DOBRINJA", "VIJEĆNICA"]),
  "32": new Set(["ILIDŽA", "BUTMIR"]),
  "41": new Set(["DRVENIJA", "GORNJI VELEŠIĆI (HUM)", "GORNJI VELEŠIĆI I", "GORNJI VELEŠIĆI"]),
  "49": new Set(["ILIDŽA", "DOGLODI"]),
  "51": new Set(["BAŠČARŠIJA", "VRATNIK I"]),
  "55": new Set(["BAŠČARŠIJA", "SEDRENIK (SAM.)"]),
  "56": new Set(["LATINSKA ĆUPRIJA", "JARČEDOLI"]),
  "58": new Set(["BAŠČARŠIJA", "MIHRIVODE"]),
  "59": new Set(["LATINSKA ĆUPRIJA", "KOMATIN"]),
  "63": new Set(["LATINSKA ĆUPRIJA", "MAHMUTOVAC"]),
  "180": new Set(["OTOKA", "SOKOLJE (OKRETNICA)", "SOKOLJE"]),
  "200": new Set(["AERODROM SARAJEVO", "BENTBAŠA"]),
};

const regexDirection = /^(.+?\s*-\s*.+?)(?=\s*[(\-]|$)/u;

export function decodeLineAndDirection(vehicle) {
  if (!vehicle.direction) {
    return {
      lineId: '?',
      origin: 'Sarajevo',
      destination: 'Sarajevo',
      headingText: 'U pokretu',
      headingTo: 'Sarajevo'
    };
  }

  const match = vehicle.direction.match(regexDirection);
  let rawOrigin = '';
  let rawDest = '';

  if (match) {
    const parts = match[1].split('-').map(s => s.trim().replace(/ [PT]$/, ''));
    rawOrigin = parts[0] || '';
    rawDest = parts[1] || '';
  } else {
    const parts = vehicle.direction.split('-').map(s => s.trim());
    rawOrigin = parts[0] || '';
    rawDest = parts[1] || '';
  }

  const rawLineUpper = (vehicle.direction || '').toUpperCase();
  const fromUpper = rawOrigin.toUpperCase();
  const toUpper = rawDest.toUpperCase();

  let lineSet = {};
  if (vehicle.vehicle_type_id === 3) lineSet = trolleyLineSets;
  else if (vehicle.vehicle_type_id === 4) lineSet = tramLineSets;
  else if (vehicle.vehicle_type_id === 2) lineSet = busLineSets;

  let foundLineId = Object.keys(lineSet).find(line => {
    return lineSet[line].has(fromUpper) && lineSet[line].has(toUpper);
  });

  if (!foundLineId) {
    if (fromUpper.includes('HRASNICA') || toUpper.includes('HRASNICA')) {
      foundLineId = '7'; // Nova tramvajska linija Ilidža - Hrasnica
    } else if (fromUpper.includes('REMIZ') || toUpper.includes('REMIZ') || fromUpper.includes('GARA') || toUpper.includes('GARA')) {
      foundLineId = 'REMIZA';
    } else if (rawLineUpper === 'TRAM' || (!toUpper && vehicle.vehicle_type_id === 4)) {
      foundLineId = '3'; // Glavna tramvajska linija Ilidža - Baščaršija
    } else {
      foundLineId = vehicle.vehicle_type_id === 4 ? '3' : (vehicle.vehicle_type_id === 3 ? '107' : 'BUS');
    }
  }

  // Check if heading to or from depot (Remiza)
  const isDepot = 
    foundLineId === 'REMIZA' ||
    rawLineUpper === 'TRAM' ||
    fromUpper.includes('REMIZ') || 
    toUpper.includes('REMIZ') ||
    fromUpper.includes('GARA') ||
    toUpper.includes('GARA');

  if (isDepot) {
    const origin = rawOrigin ? capitalizeWords(rawOrigin) : 'Linija u prometu';
    return {
      lineId: 'REMIZA',
      origin,
      destination: 'Za Remizu',
      headingText: 'ZA REMIZU / GARAŽA (Depo GRAS)',
      headingTo: 'Garaža GRAS (Alipašin Most)',
      isDepot: true
    };
  }

  // The sign display: "ODREDISTE 1 - ODREDISTE 2"
  // When a vehicle is moving, lineItems[0] is the starting station/origin, lineItems[1] is destination!
  // e.g. "DOBRINJA - JEZERO" -> Heading to JEZERO!
  // "JEZERO - DOBRINJA" -> Heading to DOBRINJA!
  const origin = capitalizeWords(rawOrigin);
  const destination = capitalizeWords(rawDest);

  return {
    lineId: foundLineId,
    origin,
    destination,
    // Clear marker string requested by user:
    headingText: destination ? `${origin} ➔ ${destination}` : origin,
    headingTo: destination || origin,
    isDepot: false
  };
}

function capitalizeWords(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Distance in meters between two lat/lng points using Haversine formula
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Bearing in degrees from point 1 to point 2
export function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Relative direction determination: Is vehicle coming towards the user or moving away?
export function determineUserRelativeDirection(vehicle, userLocation, prevVehicle) {
  if (!userLocation) {
    return {
      status: 'unknown',
      label: 'Lokacija nepoznata',
      badgeClass: 'badge-neutral',
      isComing: null,
      distanceMeters: null,
      etaMinutes: null
    };
  }

  const distanceMeters = calculateDistanceMeters(
    vehicle.latitude,
    vehicle.longitude,
    userLocation.latitude,
    userLocation.longitude
  );

  let isComing = null;

  // 1. For trams on the linear Sarajevo corridor (Ilidža <-> Baščaršija):
  // Check exact corridor progression relative to station/user location
  if (vehicle.vehicleTypeId === 4) {
    const destUpper = (vehicle.destination || '').toUpperCase();
    const headingEast =
      destUpper.includes('BAŠČARŠ') ||
      destUpper.includes('BASCARS') ||
      destUpper.includes('VIJEĆ') ||
      destUpper.includes('VIJEC');
    const headingWest =
      destUpper.includes('ILIDŽ') ||
      destUpper.includes('ILIDZ') ||
      destUpper.includes('HRASN') ||
      destUpper.includes('NEDŽ') ||
      destUpper.includes('REMIZ') ||
      destUpper.includes('ČENGIĆ') ||
      destUpper.includes('CENGIC');

    if (headingEast) {
      // Eastbound: if vehicle is already east of user location by > 80m, it has PASSED the station!
      if (vehicle.longitude > userLocation.longitude + 0.001) {
        isComing = false;
      } else {
        isComing = true;
      }
    } else if (headingWest) {
      // Westbound: if vehicle is already west of user location by > 80m, it has PASSED the station!
      if (vehicle.longitude < userLocation.longitude - 0.001) {
        isComing = false;
      } else {
        isComing = true;
      }
    }
  }

  // 2. Check change in distance if previous position exists
  if (isComing === null && prevVehicle) {
    const prevDist = calculateDistanceMeters(
      prevVehicle.latitude,
      prevVehicle.longitude,
      userLocation.latitude,
      userLocation.longitude
    );
    const delta = prevDist - distanceMeters;
    if (delta > 6) isComing = true;
    else if (delta < -6) isComing = false;
  }

  // 3. Fallback to vector angle between vehicle bearing and direction to user
  if (isComing === null && vehicle.bearing !== undefined) {
    const bearingToUser = calculateBearing(
      vehicle.latitude,
      vehicle.longitude,
      userLocation.latitude,
      userLocation.longitude
    );
    const diff = Math.abs(((vehicle.bearing - bearingToUser + 180) % 360) - 180);
    isComing = diff < 80;
  }

  // Calculate rough ETA assuming average city speed ~ 20 km/h (5.5 m/s)
  const speedMps = 5.5;
  const etaMinutes = Math.max(1, Math.round(distanceMeters / speedMps / 60));

  if (distanceMeters < 50) {
    return {
      status: 'arriving_now',
      label: 'Stiže upravo na vašu stanicu',
      sublabel: 'Vozilo je u neposrednoj blizini',
      badgeClass: 'badge-arriving',
      isComing: true,
      distanceMeters,
      etaMinutes: 1
    };
  }

  if (isComing) {
    return {
      status: 'ingoing',
      label: 'Dolazi prema vama',
      sublabel: `Udaljenost ${distanceMeters < 1000 ? distanceMeters + ' m' : (distanceMeters / 1000).toFixed(1) + ' km'} • ${etaMinutes} min`,
      badgeClass: 'badge-ingoing',
      isComing: true,
      distanceMeters,
      etaMinutes
    };
  } else {
    return {
      status: 'outgoing',
      label: 'Odlazi od vas',
      sublabel: `Udaljenost ${distanceMeters < 1000 ? distanceMeters + ' m' : (distanceMeters/1000).toFixed(1) + ' km'}`,
      badgeClass: 'badge-outgoing',
      isComing: false,
      distanceMeters,
      etaMinutes: null
    };
  }
}
