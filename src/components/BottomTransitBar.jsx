import React, { useRef } from 'react';
import {
  Train,
  Zap,
  Bus,
  Star,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Layers,
  MapPin,
  Radio
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function BottomTransitBar({
  vehicles = [],
  approachingVehicle,
  totalVehicles = 0,
  approachingCount = 0,
  activeFilter = 'tram',
  onFilterChange,
  searchQuery = '',
  onSearchChange,
  selectedVehicle,
  onSelectVehicle,
  userLocation,
  favorites = { lines: [], stations: [] },
  toggleFavoriteLine,
  toggleFavoriteStation,
  onSelectStation,
  isExpanded = false,
  setIsExpanded
}) {
  const { t } = useI18n();
  const touchStartY = useRef(0);
  const touchDeltaY = useRef(0);

  const filterTabs = [
    { id: 'tram', label: t('vehicles.tram'), icon: Train, color: '#facc15' },
    { id: 'trolley', label: t('vehicles.trolley'), icon: Zap, color: '#fb923c' },
    { id: 'bus', label: t('vehicles.bus'), icon: Bus, color: '#38bdf8' },
    { id: 'approaching', label: 'Dolaze', icon: Radio, color: '#22c55e' },
    { id: 'favorites', label: 'Favoriti', icon: Star, color: '#f59e0b' },
    { id: 'all', label: 'Sva', icon: Layers, color: '#94a3b8' }
  ];

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchDeltaY.current = 0;
  };

  const handleTouchMove = (e) => {
    touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
  };

  const handleTouchEnd = () => {
    if (touchDeltaY.current < -30 && !isExpanded) {
      if (setIsExpanded) setIsExpanded(true);
    } else if (touchDeltaY.current > 30 && isExpanded) {
      if (setIsExpanded) setIsExpanded(false);
    }
  };

  return (
    <div
      className={`bottom-dock-container ${isExpanded ? 'dock-expanded' : 'dock-collapsed'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bottom-dock-card">
        {/* Drag Handle Bar */}
        <div
          className="dock-handle-bar"
          onClick={() => setIsExpanded && setIsExpanded(!isExpanded)}
          role="button"
          tabIndex={0}
          aria-label="Proširi ili zatvori listu"
        >
          <div className="dock-handle-pill" />
        </div>

        {/* Collapsed Mode: Quick Arrival Glance + Filters */}
        {!isExpanded && (
          <>
            <div
              className="bottom-bar-glance"
              onClick={() => setIsExpanded && setIsExpanded(true)}
              role="button"
              tabIndex={0}
            >
              {approachingVehicle ? (
                <div className="glance-vehicle-row">
                  <div
                    className="glance-line-badge"
                    style={{
                      background: approachingVehicle.isTram()
                        ? 'rgba(234, 179, 8, 0.22)'
                        : approachingVehicle.isTrolley()
                        ? 'rgba(249, 115, 22, 0.22)'
                        : 'rgba(56, 189, 248, 0.22)',
                      borderColor: approachingVehicle.isTram()
                        ? '#eab308'
                        : approachingVehicle.isTrolley()
                        ? '#f97316'
                        : '#38bdf8'
                    }}
                  >
                    {approachingVehicle.isTram() ? (
                      <Train size={13} color="#facc15" />
                    ) : approachingVehicle.isTrolley() ? (
                      <Zap size={13} color="#fb923c" />
                    ) : (
                      <Bus size={13} color="#38bdf8" />
                    )}
                    <span className="glance-line-number">{approachingVehicle.lineId}</span>
                  </div>

                  <div className="glance-vehicle-info">
                    <div className="glance-dest-row">
                      <span className="glance-direction-arrow">➔</span>
                      <span className="glance-destination">
                        {approachingVehicle.destination || approachingVehicle.headingText}
                      </span>
                    </div>
                    <div className="glance-meta-row">
                      {approachingVehicle.proximity?.isApproaching ? (
                        <span className="glance-eta-tag">
                          <span className="live-dot" style={{ width: '6px', height: '6px' }} />
                          Dolazak ~{approachingVehicle.proximity.etaMinutes} min
                        </span>
                      ) : (
                        <span className="glance-dist-tag">
                          Udaljenost {approachingVehicle.proximity?.distanceFormatted || ''}
                        </span>
                      )}
                      <span className="glance-dot-sep">•</span>
                      <span className="glance-speed">{approachingVehicle.speedKmH} km/h</span>
                    </div>
                  </div>

                  <div className="dock-chevron-hint">
                    <ChevronUp size={18} color="var(--accent-blue)" />
                  </div>
                </div>
              ) : (
                <div className="glance-vehicle-row">
                  <div className="glance-idle-icon">
                    <Radio size={16} color="var(--accent-blue)" />
                  </div>
                  <div className="glance-vehicle-info">
                    <div className="glance-destination">
                      Sarajevo Uživo • {userLocation?.name || 'Prevoz'}
                    </div>
                    <div className="glance-meta-row">
                      <span className="glance-dist-tag">{totalVehicles} vozila u prometu</span>
                    </div>
                  </div>
                  <div className="dock-chevron-hint">
                    <ChevronUp size={18} color="var(--text-muted)" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Filter Chips */}
            <div className="bottom-bar-filters">
              {filterTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`filter-chip ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilterChange(tab.id);
                    }}
                  >
                    <Icon size={13} color={isActive ? '#ffffff' : tab.color} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Expanded Mode: Search + Station chips + Full Departures List */}
        {isExpanded && (
          <div className="dock-expanded-content">
            {/* Header: Title + Collapse button */}
            <div className="dock-expanded-header">
              <div className="dock-header-titles">
                <span className="dock-main-title">{t('sheet.nearbyTransit')}</span>
                <span className="dock-count-badge">{vehicles.length} na mapi</span>
                {approachingCount > 0 && (
                  <span className="dock-live-badge">
                    <span className="live-dot" style={{ width: '6px', height: '6px' }} />
                    {approachingCount} stiže
                  </span>
                )}
              </div>
              <button
                className="icon-btn"
                style={{ width: '32px', height: '32px' }}
                onClick={() => setIsExpanded && setIsExpanded(false)}
                aria-label="Spusti panel"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Search Input Box */}
            <div className="dock-search-wrapper">
              <Search size={15} color="var(--text-muted)" className="dock-search-icon" />
              <input
                type="text"
                className="dock-search-input"
                placeholder={t('sheet.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="dock-search-clear"
                  onClick={() => onSearchChange('')}
                  aria-label="Očisti pretragu"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Tabs in Expanded view */}
            <div className="bottom-bar-filters expanded-filters">
              {filterTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`filter-chip ${isActive ? 'active' : ''}`}
                    onClick={() => onFilterChange(tab.id)}
                  >
                    <Icon size={13} color={isActive ? '#ffffff' : tab.color} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Saved Favorite Stations Quick Selector */}
            {favorites && favorites.stations.length > 0 && (
              <div className="dock-stations-row">
                <span className="dock-stations-label">⭐ Stanice:</span>
                <div className="dock-stations-scroll">
                  {favorites.stations.map((st) => (
                    <button
                      key={st}
                      className="dock-station-pill"
                      onClick={() => onSelectStation && onSelectStation({ name: st, lat: 43.8563, lng: 18.4082 })}
                    >
                      <MapPin size={11} color="#38bdf8" />
                      <span>{st}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scrollable Vehicle List */}
            <div className="dock-vehicles-list">
              {vehicles.length === 0 ? (
                <div className="dock-empty-hint">
                  {t('sheet.noVehicles')}
                </div>
              ) : (
                vehicles.map((v) => {
                  const isSelected = selectedVehicle && selectedVehicle.id === v.id;
                  const isLineFav = favorites && favorites.lines.includes(v.lineId);
                  const isComing = v.isApproaching();

                  return (
                    <div
                      key={v.id}
                      className={`dock-vehicle-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => onSelectVehicle(v)}
                    >
                      {/* Top Card Row */}
                      <div className="dock-card-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            className="dock-line-badge"
                            style={{
                              background: v.isTram()
                                ? '#facc15'
                                : v.isTrolley()
                                ? '#fb923c'
                                : '#38bdf8'
                            }}
                          >
                            <span>Linija {v.lineId}</span>
                          </div>

                          <button
                            className="dock-fav-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (toggleFavoriteLine) toggleFavoriteLine(v.lineId);
                            }}
                            title="Dodaj u favorite"
                            aria-label="Favorit"
                          >
                            <Star
                              size={15}
                              fill={isLineFav ? '#eab308' : 'none'}
                              color={isLineFav ? '#eab308' : 'var(--text-muted)'}
                            />
                          </button>
                        </div>

                        {v.proximity && (
                          <span
                            className={`dock-direction-tag ${isComing ? 'ingoing' : 'outgoing'}`}
                          >
                            {isComing ? (
                              <>
                                <span className="live-dot" style={{ width: '6px', height: '6px' }} />
                                Dolazi ~{v.proximity.etaMinutes || 2} min
                              </>
                            ) : (
                              <>
                                <span style={{ opacity: 0.6 }}>🔴</span> Odlazi
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      {/* Destination and Meta */}
                      <div className="dock-card-mid">
                        <div className="dock-card-dest">
                          <span style={{ color: 'var(--accent-blue)', marginRight: '4px' }}>➔</span>
                          <span>{v.destination || v.headingText}</span>
                        </div>
                        <div className="dock-card-meta">
                          <span>{v.operator}</span>
                          <span>•</span>
                          <span>Garažni {v.vehicleCode}</span>
                          <span>•</span>
                          <span>{v.speedKmH} km/h</span>
                          {v.proximity?.distanceFormatted && (
                            <>
                              <span>•</span>
                              <span>{v.proximity.distanceFormatted}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
