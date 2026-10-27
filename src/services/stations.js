import tramstopsData from '../data/tramstops.json';
import trolleystopsData from '../data/trolleystops.json';

// Utility for robust Bosnian / Balkan diacritic-insensitive normalization
// e.g. "cengic vila" <-> "Čengić Vila", "zeljeznicka" <-> "Željeznička"
export function normalizeText(str) {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .replace(/[čć]/g, 'c')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[đ]/g, 'd')
    .replace(/dj/g, 'd')
    .trim();
}

// Popular station presets for Sarajevo Public Transport
export const POPULAR_STATIONS = [
  { id: 'marijin_dvor', name: 'Marijin Dvor', desc: 'Centar (Tramvaj & Trolejbus)', lat: 43.8557, lng: 18.4082 },
  { id: 'bascarsija', name: 'Baščaršija', desc: 'Stari Grad - Glavna tramvajska okretaljka', lat: 43.8598, lng: 18.4312 },
  { id: 'cengic_vila', name: 'Čengić Vila', desc: 'Novo Sarajevo (Tramvaj 2, 3 & Trolejbus 102)', lat: 43.8504, lng: 18.3752 },
  { id: 'otoka', name: 'Otoka', desc: 'Čvorište Tramvaj & Trolejbus 101/102', lat: 43.8501, lng: 18.3647 },
  { id: 'dobrinja', name: 'Dobrinja', desc: 'Trolejbuska okretaljka 103/107 & Autobus 31E', lat: 43.8249, lng: 18.3496 },
  { id: 'jezero', name: 'Jezero / Stadion Koševo', desc: 'Trolejbuska okretaljka 102/107 & 105', lat: 43.8732, lng: 18.4124 },
  { id: 'ilidza', name: 'Ilidža Terminal', desc: 'Glavni terminal Tramvaj 3 & Autobusi', lat: 43.8308, lng: 18.3101 },
  { id: 'trg_austrije', name: 'Trg Austrije (Bistrik)', desc: 'Trolejbuska okretaljka 101/103', lat: 43.8559, lng: 18.4319 },
  { id: 'zeljeznicka', name: 'Željeznička Stanica', desc: 'Tramvaj 1/4 & Autobusi 15/23', lat: 43.8601, lng: 18.3976 },
  { id: 'vogosca', name: 'Vogošća Centar', desc: 'Autobusi 21/22A & Trolejbus 105', lat: 43.9015, lng: 18.3440 },
];

export function getStationCoordinates(stationName) {
  if (!stationName) return null;
  const q = normalizeText(stationName);

  // 1. Check popular stations
  const pop = POPULAR_STATIONS.find(s => {
    const sNorm = normalizeText(s.name);
    return sNorm === q || sNorm.includes(q) || q.includes(sNorm);
  });
  if (pop) return { name: pop.name, lat: pop.lat, lng: pop.lng };

  // 2. Check tram stops
  for (const f of tramstopsData.features) {
    const sName = f.properties?.name;
    if (sName) {
      const sNorm = normalizeText(sName);
      if (sNorm === q || sNorm.includes(q) || q.includes(sNorm)) {
        return { name: sName, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
      }
    }
  }

  // 3. Check trolley stops
  for (const f of trolleystopsData.features) {
    const sName = f.properties?.name;
    if (sName) {
      const sNorm = normalizeText(sName);
      if (sNorm === q || sNorm.includes(q) || q.includes(sNorm)) {
        return { name: sName, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
      }
    }
  }

  return { name: stationName, lat: 43.8563, lng: 18.4082 };
}

export function searchStations(query) {
  if (!query || !query.trim()) return [];
  const q = normalizeText(query);
  const matched = [];
  const seenNames = new Set();

  for (const s of POPULAR_STATIONS) {
    if (normalizeText(s.name).includes(q) || normalizeText(s.desc).includes(q)) {
      matched.push(s);
      seenNames.add(normalizeText(s.name));
    }
  }

  for (const f of tramstopsData.features) {
    const sName = f.properties?.name;
    if (sName && !seenNames.has(normalizeText(sName)) && normalizeText(sName).includes(q)) {
      matched.push({
        id: `tram_${sName}`,
        name: sName,
        desc: 'Tramvajska stanica',
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0]
      });
      seenNames.add(normalizeText(sName));
    }
  }

  for (const f of trolleystopsData.features) {
    const sName = f.properties?.name;
    if (sName && !seenNames.has(normalizeText(sName)) && normalizeText(sName).includes(q)) {
      matched.push({
        id: `trolley_${sName}`,
        name: sName,
        desc: 'Trolejbuska stanica',
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0]
      });
      seenNames.add(normalizeText(sName));
    }
  }

  return matched;
}
