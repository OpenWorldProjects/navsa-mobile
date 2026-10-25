import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { transitService } from '../services/api/transitService';
import { API_CONFIG } from '../config/api.config';
import { POPULAR_STATIONS, getStationCoordinates } from '../services/stations';

export function useTransitViewModel() {
  const [vehicles, setVehicles] = useState([]);
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('navsa_user_location');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      latitude: 43.8557,
      longitude: 18.4082,
      accuracy: 30,
      name: 'Marijin Dvor',
      isGps: false
    };
  });
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [detailModalVehicle, setDetailModalVehicle] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  
  // Favorites state: Saved favorite lines and stations
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('navsa_favorites');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { lines: [], stations: [] };
  });

  const toggleFavoriteLine = useCallback((lineId) => {
    if (!lineId) return;
    const strLine = String(lineId);
    setFavorites(prev => {
      const exists = prev.lines.some(l => String(l) === strLine);
      const next = {
        ...prev,
        lines: exists ? prev.lines.filter(l => String(l) !== strLine) : [...prev.lines, strLine]
      };
      try {
        localStorage.setItem('navsa_favorites', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  const toggleFavoriteStation = useCallback((stationName) => {
    setFavorites(prev => {
      const exists = prev.stations.includes(stationName);
      const next = {
        ...prev,
        stations: exists ? prev.stations.filter(s => s !== stationName) : [...prev.stations, stationName]
      };
      localStorage.setItem('navsa_favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFavoriteStation = useCallback((stationName) => {
    setFavorites(prev => {
      const next = {
        ...prev,
        stations: prev.stations.filter(s => s !== stationName)
      };
      localStorage.setItem('navsa_favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  const addFavoriteStation = useCallback((stationName) => {
    setFavorites(prev => {
      if (prev.stations.includes(stationName)) return prev;
      const next = {
        ...prev,
        stations: [...prev.stations, stationName]
      };
      localStorage.setItem('navsa_favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavoriteLine = useCallback((lineId) => {
    if (!lineId) return false;
    const strLine = String(lineId);
    return favorites.lines.some(l => String(l) === strLine);
  }, [favorites.lines]);

  const isFavoriteStation = useCallback((stationName) => {
    return favorites.stations.includes(stationName);
  }, [favorites.stations]);

  // Tracked vehicle (Follow on Map live)
  const [trackedVehicleId, setTrackedVehicleId] = useState(null);

  const toggleTrackVehicle = useCallback((vehicle) => {
    if (!vehicle) return;
    setTrackedVehicleId(prev => {
      const isCurrentlyTracked = prev === vehicle.id;
      if (isCurrentlyTracked) {
        return null;
      } else {
        setSelectedVehicle(vehicle);
        setMapCenterTrigger({ lat: vehicle.latitude, lng: vehicle.longitude, zoom: 16 });
        return vehicle.id;
      }
    });
  }, []);

  // Floating HUD mode & Home Screen Widget Modal state
  const [isFloatingMode, setIsFloatingMode] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);

  // Preferred vehicle filter (Default: 'tram' as requested by user)
  const [preferredVehicle, setPreferredVehicleState] = useState(() => {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.PREFERRED_VEHICLE) || 'tram';
  });
  const [activeFilter, setActiveFilter] = useState(() => {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.PREFERRED_VEHICLE) || 'tram';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [mapCenterTrigger, setMapCenterTrigger] = useState(null);

  const watchIdRef = useRef(null);
  const userLocationRef = useRef(userLocation);

  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  // Filter change handler: switches category and clears stale selected vehicle
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
    setSelectedVehicle(null);
    setTrackedVehicleId(null);
  }, []);

  // Set & persist preferred vehicle
  const setPreferredVehicle = (vehicleType) => {
    setPreferredVehicleState(vehicleType);
    handleFilterChange(vehicleType);
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.PREFERRED_VEHICLE, vehicleType);
  };

  // Request GPS Location & persist selection
  const requestGps = useCallback((forceCenter = false) => {
    // Immediately persist GPS preference so it is NEVER forgotten or reset to Marin Dvor
    setUserLocation(prev => {
      const immediateGps = {
        ...prev,
        name: 'GPS Lokacija',
        isGps: true
      };
      userLocationRef.current = immediateGps;
      try {
        localStorage.setItem('navsa_user_location', JSON.stringify(immediateGps));
      } catch (e) {}
      return immediateGps;
    });

    if (!navigator.geolocation) {
      console.warn('Geolocation not supported by browser/device');
      return;
    }

    const applyLocation = (pos, shouldCenter = false) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = pos.coords.accuracy || 15;

      // Deadband check: ignore micro-jitter when not explicitly centering
      const prev = userLocationRef.current;
      if (prev && prev.isGps && prev.latitude && prev.longitude) {
        const dist = Math.hypot(lat - prev.latitude, lng - prev.longitude) * 111000;
        if (dist < 15 && !shouldCenter) {
          return;
        }
      }

      const liveLoc = {
        latitude: lat,
        longitude: lng,
        accuracy,
        name: 'GPS Lokacija',
        isGps: true
      };
      userLocationRef.current = liveLoc;
      setUserLocation(liveLoc);
      try {
        localStorage.setItem('navsa_user_location', JSON.stringify(liveLoc));
      } catch (e) {}

      // ONLY center when explicitly requested (e.g. user pressed Locate), never on background watch
      if (shouldCenter) {
        setMapCenterTrigger({ lat, lng, zoom: 16 });
      }
    };

    const handleFallback = (shouldCenter) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => applyLocation(pos, shouldCenter),
        (err) => {
          console.warn('Network location also failed:', err);
        },
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
      );
    };

    // Stage 1: Try high accuracy GPS (satellite lock) with centering ONLY if forceCenter is true
    navigator.geolocation.getCurrentPosition(
      (pos) => applyLocation(pos, forceCenter),
      () => handleFallback(forceCenter),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
    );

    // Watch position in background WITHOUT triggering map.flyTo (prevents map shaking!)
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => applyLocation(pos, false),
      () => {},
      { enableHighAccuracy: false, maximumAge: 10000 }
    );
  }, []);

  // Auto-connect to GPS on startup if user previously selected GPS (without flyTo shaking)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('navsa_user_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isGps) {
          requestGps(false);
        }
      }
    } catch (e) {}
  }, [requestGps]);

  // Fetch live vehicle telemetry
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await transitService.fetchLiveVehicles(userLocationRef.current);
      setVehicles(data);

      setSelectedVehicle(curr => {
        if (!curr) return null;
        return data.find(v => v.id === curr.id) || curr;
      });

      setDetailModalVehicle(curr => {
        if (!curr) return null;
        return data.find(v => v.id === curr.id) || curr;
      });

      // If user is actively following a vehicle on the map, glide camera to its new telemetry position
      if (trackedVehicleId) {
        const tracked = data.find(v => v.id === trackedVehicleId);
        if (tracked) {
          setMapCenterTrigger({ lat: tracked.latitude, lng: tracked.longitude, zoom: 16 });
        }
      }
    } catch (err) {
      console.error('Failed to load live transit telemetry:', err);
    } finally {
      setIsRefreshing(false);
      setRefreshProgress(0);
    }
  }, [trackedVehicleId]);

  // Auto-refresh timer loop
  useEffect(() => {
    loadData();

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      const progress = Math.min(100, (step / (API_CONFIG.REFRESH_INTERVAL_SECONDS * 10)) * 100);
      setRefreshProgress(progress);

      if (step >= API_CONFIG.REFRESH_INTERVAL_SECONDS * 10) {
        step = 0;
        loadData();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [loadData]);

  // Select vehicle and focus map
  const selectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    if (vehicle) {
      setMapCenterTrigger({ lat: vehicle.latitude, lng: vehicle.longitude, zoom: 16 });
      // Auto-collapse bottom sheet when vehicle is selected so it doesn't block the screen
      setIsSheetExpanded(false);
    }
  };

  // Open detail modal explicitly
  const openDetailModal = (vehicle) => {
    setDetailModalVehicle(vehicle);
    selectVehicle(vehicle);
  };

  const closeDetailModal = () => {
    setDetailModalVehicle(null);
  };

  // Select station with real coordinates
  const setStation = (station) => {
    if (watchIdRef.current && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    const stationName = typeof station === 'string' ? station : (station.name || 'Stanica');
    const coords = getStationCoordinates(stationName) || station;
    const newLoc = {
      latitude: coords.lat,
      longitude: coords.lng,
      accuracy: 30,
      name: coords.name || stationName,
      isGps: false
    };
    setUserLocation(newLoc);
    userLocationRef.current = newLoc;
    try {
      localStorage.setItem('navsa_user_location', JSON.stringify(newLoc));
    } catch (e) {}
    setMapCenterTrigger({ lat: coords.lat, lng: coords.lng, zoom: 16 });
  };

  // Center on user (immediately centers map and requests fresh GPS)
  const centerOnUser = () => {
    if (userLocationRef.current) {
      setMapCenterTrigger({
        lat: userLocationRef.current.latitude,
        lng: userLocationRef.current.longitude,
        zoom: 16
      });
    }
    requestGps(false);
  };

  // Filtered and sorted vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      if (activeFilter === 'favorites') {
        const isLineFav = favorites.lines.some(l => String(l) === String(v.lineId));
        if (!isLineFav) return false;
      } else if (activeFilter === 'approaching') {
        if (!v.isApproaching()) return false;
      } else if (activeFilter === 'tram' && !v.isTram()) return false;
      else if (activeFilter === 'trolley' && !v.isTrolley()) return false;
      else if (activeFilter === 'bus' && !v.isBus()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesLine = v.lineId && v.lineId.toString().toLowerCase().includes(q);
        const matchesDest = v.destination && v.destination.toLowerCase().includes(q);
        const matchesOrigin = v.origin && v.origin.toLowerCase().includes(q);
        const matchesCode = v.vehicleCode && v.vehicleCode.toLowerCase().includes(q);
        return matchesLine || matchesDest || matchesOrigin || matchesCode;
      }

      return true;
    }).sort((a, b) => {
      const distA = a.proximity?.distanceMeters ?? 999999;
      const distB = b.proximity?.distanceMeters ?? 999999;
      const isComingA = a.isApproaching() ? 1 : 0;
      const isComingB = b.isApproaching() ? 1 : 0;

      if (isComingA !== isComingB) return isComingB - isComingA;
      return distA - distB;
    });
  }, [vehicles, activeFilter, searchQuery, favorites.lines]);

  const approachingCount = useMemo(() => {
    return vehicles.filter(v => v.isApproaching()).length;
  }, [vehicles]);

  return {
    vehicles,
    filteredVehicles,
    approachingCount,
    userLocation,
    selectedVehicle,
    detailModalVehicle,
    isRefreshing,
    refreshProgress,
    activeFilter,
    preferredVehicle,
    searchQuery,
    isSheetExpanded,
    isLocationModalOpen,
    mapCenterTrigger,
    // Favorites & Modes
    favorites,
    toggleFavoriteLine,
    toggleFavoriteStation,
    removeFavoriteStation,
    addFavoriteStation,
    isFavoriteLine,
    isFavoriteStation,
    trackedVehicleId,
    toggleTrackVehicle,
    isFloatingMode,
    setIsFloatingMode,
    isWidgetModalOpen,
    setIsWidgetModalOpen,
    // Actions
    loadData,
    selectVehicle,
    clearSelectedVehicle: () => {
      setSelectedVehicle(null);
      setTrackedVehicleId(null);
    },
    openDetailModal,
    closeDetailModal,
    setActiveFilter: handleFilterChange,
    setPreferredVehicle,
    setSearchQuery,
    setIsSheetExpanded,
    dismissSheet: () => setIsSheetExpanded(false),
    setIsLocationModalOpen,
    requestGps,
    setStation,
    centerOnUser
  };
}
