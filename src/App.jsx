import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import VehicleListSheet from './components/VehicleListSheet';
import VehicleDetailModal from './components/VehicleDetailModal';
import LocationModal from './components/LocationModal';
import FloatingHud from './components/FloatingHud';
import HomeScreenWidgetModal from './components/HomeScreenWidgetModal';
import { useTransitViewModel } from './viewmodels/useTransitViewModel';
import { I18nProvider, useI18n } from './context/I18nContext';
import { API_CONFIG } from './config/api.config';
import { Locate, Layers, MapPin, Eye } from 'lucide-react';
import { syncWidgetData } from './services/widgetBridge';

function TransitApp() {
  const { t } = useI18n();
  const vm = useTransitViewModel();

  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  };

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(API_CONFIG.STORAGE_KEYS.THEME);
    if (saved) return saved;
    return getSystemTheme();
  });
  const [showLines, setShowLines] = useState(true);
  const [showStops, setShowStops] = useState(true);

  // Auto-switch with system theme (Day/Night schedule on iOS and Android)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      // Auto-adapt if user hasn't explicitly locked a preference
      const saved = localStorage.getItem(API_CONFIG.STORAGE_KEYS.THEME);
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, []);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Global station callbacks for Leaflet popups
  useEffect(() => {
    window.__selectStation = (name, lat, lng) => {
      vm.setStation({ name, lat, lng });
    };
    window.__toggleFavStation = (name) => {
      vm.toggleFavoriteStation(name);
    };
    return () => {
      delete window.__selectStation;
      delete window.__toggleFavStation;
    };
  }, [vm]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const closestApproachingVehicle = 
    vm.selectedVehicle || 
    vm.filteredVehicles.find(v => v.isApproaching()) || 
    vm.filteredVehicles[0];

  // Sync live approaching vehicle and station to native Android home screen widget
  useEffect(() => {
    if (closestApproachingVehicle) {
      syncWidgetData(closestApproachingVehicle, vm.userLocation);
    }
  }, [closestApproachingVehicle, vm.userLocation]);

  const userDisplayName = vm.userLocation.isGps
    ? t('location.gpsActive')
    : (vm.userLocation.name || t('location.youAreHere'));

  return (
    <div className="app-container">
      {/* Interactive Map (Background layer) */}
      <MapComponent
        vehicles={vm.filteredVehicles}
        userLocation={vm.userLocation}
        selectedVehicle={vm.selectedVehicle}
        onSelectVehicle={vm.selectVehicle}
        onMapClick={vm.dismissSheet}
        theme={theme}
        showLines={showLines}
        showStops={showStops}
        mapCenterTrigger={vm.mapCenterTrigger}
      />

      {/* Top Header (Hidden in Floating Mode) */}
      {!vm.isFloatingMode && (
        <Header
          totalVehicles={vm.vehicles.length}
          isRefreshing={vm.isRefreshing}
          onRefresh={vm.loadData}
          theme={theme}
          onToggleTheme={toggleTheme}
          userLocationName={userDisplayName}
          onOpenStationPicker={() => vm.setIsLocationModalOpen(true)}
          refreshProgress={vm.refreshProgress}
          onToggleFloatingMode={() => vm.setIsFloatingMode(true)}
          onOpenWidgetModal={() => vm.setIsWidgetModalOpen(true)}
        />
      )}

      {/* Bandwidth & Inactivity Guard Notice */}
      {vm.isPausedDueToInactivity && (
        <div
          className="user-status-pill"
          style={{
            top: '76px',
            background: 'rgba(234, 88, 12, 0.9)',
            color: '#fff',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 14px rgba(234,88,12,0.4)',
            zIndex: 1000
          }}
          onClick={vm.resumeTracking}
        >
          <span>⏸️ {t('quota.pausedTitle')} &bull; <strong>{t('quota.resume')}</strong></span>
        </div>
      )}

      {vm.isDailyQuotaReached && (
        <div
          className="user-status-pill"
          style={{
            top: '76px',
            background: 'rgba(220, 38, 38, 0.9)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 4px 14px rgba(220,38,38,0.4)',
            zIndex: 1000
          }}
        >
          <span>🛑 {t('quota.dailyLimitReached')}</span>
        </div>
      )}

      {/* User Location Status Pill (Hidden in Floating Mode) */}
      {!vm.isFloatingMode && !vm.isPausedDueToInactivity && !vm.isDailyQuotaReached && (
        <div
          className="user-status-pill"
          onClick={() => vm.setIsLocationModalOpen(true)}
        >
          <MapPin size={13} color="#38bdf8" />
          <span>{t('location.currentLocation')}: {userDisplayName}</span>
        </div>
      )}

      {/* Floating Map Controls */}
      <div
        className={`map-floating-controls ${vm.isSheetExpanded ? 'dock-expanded' : ''}`}
        style={vm.isFloatingMode ? { top: '16px', bottom: 'auto' } : undefined}
      >
        <button
          className="floating-btn"
          title={t('location.centerOnMe')}
          onClick={vm.centerOnUser}
          aria-label={t('location.centerOnMe')}
        >
          <Locate size={20} color="var(--accent-blue)" />
        </button>

        <button
          className={`floating-btn ${showLines ? 'active' : ''}`}
          title={t('controls.toggleLines')}
          onClick={() => setShowLines(!showLines)}
          aria-label={t('controls.toggleLines')}
        >
          <Layers size={20} />
        </button>

        <button
          className={`floating-btn ${showStops ? 'active' : ''}`}
          title={t('controls.toggleStops')}
          onClick={() => setShowStops(!showStops)}
          aria-label={t('controls.toggleStops')}
        >
          <Eye size={20} />
        </button>
      </div>

      {/* Floating Mini-Player HUD */}
      {vm.isFloatingMode && (
        <FloatingHud
          vehicle={closestApproachingVehicle}
          onRestore={() => vm.setIsFloatingMode(false)}
          onFocusVehicle={vm.selectVehicle}
        />
      )}

      {/* Apple Maps Style Transit Sheet (Multi-snap: Peek, Expanded, or Selected Vehicle Place Card) */}
      {!vm.isFloatingMode && (
        <VehicleListSheet
          vehicles={vm.filteredVehicles}
          selectedVehicle={vm.selectedVehicle}
          trackedVehicleId={vm.trackedVehicleId}
          onToggleTrackVehicle={vm.toggleTrackVehicle}
          onSelectVehicle={vm.selectVehicle}
          onClearSelectedVehicle={vm.clearSelectedVehicle}
          onCenterVehicle={(v) => vm.setMapCenterTrigger({ lat: v.latitude, lng: v.longitude, zoom: 16 })}
          onOpenDetailModal={vm.openDetailModal}
          userLocation={vm.userLocation}
          isExpanded={vm.isSheetExpanded}
          setIsExpanded={vm.setIsSheetExpanded}
          activeFilter={vm.activeFilter}
          onFilterChange={vm.setActiveFilter}
          preferredVehicle={vm.preferredVehicle}
          onSetPreferredVehicle={vm.setPreferredVehicle}
          searchQuery={vm.searchQuery}
          onSearchChange={vm.setSearchQuery}
          approachingCount={vm.approachingCount}
          favorites={vm.favorites}
          toggleFavoriteLine={vm.toggleFavoriteLine}
          toggleFavoriteStation={vm.toggleFavoriteStation}
          onRemoveFavoriteStation={vm.removeFavoriteStation}
          onAddFavoriteStation={vm.addFavoriteStation}
          onOpenLocationModal={() => vm.setIsLocationModalOpen(true)}
          onSelectStation={vm.setStation}
        />
      )}

      {/* Vehicle Detail Modal */}
      <VehicleDetailModal
        vehicle={vm.detailModalVehicle}
        onClose={vm.closeDetailModal}
        onFocusMap={vm.selectVehicle}
      />

      {/* Location / Station Picker Modal */}
      <LocationModal
        isOpen={vm.isLocationModalOpen}
        onClose={() => vm.setIsLocationModalOpen(false)}
        onRequestGps={vm.requestGps}
        onSelectStation={vm.setStation}
        currentLocationName={userDisplayName}
        isGps={vm.userLocation.isGps}
        favorites={vm.favorites}
        toggleFavoriteStation={vm.toggleFavoriteStation}
      />

      {/* Home Screen & Live Activity Widget Modal */}
      <HomeScreenWidgetModal
        isOpen={vm.isWidgetModalOpen}
        onClose={() => vm.setIsWidgetModalOpen(false)}
        approachingVehicle={closestApproachingVehicle}
        userLocation={vm.userLocation}
      />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <TransitApp />
    </I18nProvider>
  );
}
