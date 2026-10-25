import tramstopsData from '../data/tramstops.json';
import trolleystopsData from '../data/trolleystops.json';

// Popular station presets for Sarajevo Public Transport
export const POPULAR_STATIONS = [
  { id: 'marijin_dvor', name: 'Marijin Dvor', desc: 'Centar (Tramvaj & Trolejbus)', lat: 43.8557, lng: 18.4082 },
  { id: 'bascarsija', name: 'Baščaršija', desc: 'Stari Grad - Glavna tramvajska okretaljka', lat: 43.8598, lng: 18.4312 },
  { id: 'cengic_vila', name: 'Čengić Vila', desc: 'Novo Sarajevo (Tramvaj)', lat: 43.8504, lng: 18.3752 },
  { id: 'otoka', name: 'Otoka', desc: 'Čvorište Tramvaj & Trolejbus 101/102', lat: 43.8501, lng: 18.3647 },
  { id: 'dobrinja', name: 'Dobrinja', desc: 'Trolejbuska okretaljka 103/107 & Autobus 31E', lat: 43.8249, lng: 18.3496 },
  { id: 'jezero', name: 'Jezero / Stadion Koševo', desc: 'Trolejbuska okretaljka 102/107', lat: 43.8732, lng: 18.4124 },
  { id: 'ilidza', name: 'Ilidža Terminal', desc: 'Glavni terminal Tramvaj 3 & Autobusi', lat: 43.8308, lng: 18.3101 },
  { id: 'trg_austrije', name: 'Trg Austrije (Bistrik)', desc: 'Trolejbuska okretaljka 101/103', lat: 43.8559, lng: 18.4319 },
  { id: 'zeljeznicka', name: 'Željeznička Stanica', desc: 'Tramvaj 1/4 & Autobusi 15/23', lat: 43.8601, lng: 18.3976 },
  { id: 'vogosca', name: 'Vogošća Centar', desc: 'Autobusi 21/22A & Trolejbus 105', lat: 43.9015, lng: 18.3440 },
];

export function getStationCoordinates(stationName) {
  if (!stationName) return null;
  const q = stationName.toLowerCase().trim();

  // 1. Check popular stations
  const pop = POPULAR_STATIONS.find(s => 
    s.name.toLowerCase() === q || 
    s.name.toLowerCase().includes(q) || 
    q.includes(s.name.toLowerCase())
  );
  if (pop) return { name: pop.name, lat: pop.lat, lng: pop.lng };

  // 2. Check tram stops
  for (const f of tramstopsData.features) {
    const sName = f.properties?.name;
    if (sName && (sName.toLowerCase() === q || sName.toLowerCase().includes(q) || q.includes(sName.toLowerCase()))) {
      return { name: sName, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
    }
  }

  // 3. Check trolley stops
  for (const f of trolleystopsData.features) {
    const sName = f.properties?.name;
    if (sName && (sName.toLowerCase() === q || sName.toLowerCase().includes(q) || q.includes(sName.toLowerCase()))) {
      return { name: sName, lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
    }
  }

  return { name: stationName, lat: 43.8563, lng: 18.4082 };
}
