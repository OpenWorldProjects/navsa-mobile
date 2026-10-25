import React, { useRef, useEffect } from 'react';
import {
  Search,
  Train,
  Zap,
  Bus,
  Star,
  X,
  MapPin,
  Locate,
  Info,
  ChevronDown,
  ChevronUp,
  Layers,
  Radio,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function VehicleListSheet({
  vehicles = [],
  selectedVehicle = null,
  trackedVehicleId = null,
  onToggleTrackVehicle,
  onSelectVehicle,
  onClearSelectedVehicle,
  userLocation,
  isExpanded = false,
  setIsExpanded,
  activeFilter = 'tram',
  onFilterChange,
  preferredVehicle = 'tram',
  onSetPreferredVehicle,
  searchQuery = '',
  onSearchChange,
  approachingCount = 0,
  favorites = { lines: [], stations: [] },
  toggleFavoriteLine,
  toggleFavoriteStation,
  onRemoveFavoriteStation,
  onAddFavoriteStation,
  onOpenLocationModal,
  onSelectStation,
  onOpenDetailModal,
  onCenterVehicle
}) {
  const { t } = useI18n();
  const touchStartY = useRef(0);
  const touchDeltaY = useRef(0);
  const isDragging = useRef(false);

  // Smooth Apple Maps touch drag gesture
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchDeltaY.current = 0;
    isDragging.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (touchDeltaY.current > 35) {
      if (setIsExpanded) setIsExpanded(false);
    } else if (touchDeltaY.current < -35) {
      if (setIsExpanded) setIsExpanded(true);
    }
  };

  const filterTabs = [
    { id: 'tram', label: t('vehicles.tram'), icon: Train, color: '#facc15' },
    { id: 'trolley', label: t('vehicles.trolley'), icon: Zap, color: '#fb923c' },
    { id: 'bus', label: t('vehicles.bus'), icon: Bus, color: '#38bdf8' },
    { id: 'approaching', label: t('filters.approaching') || 'Dolaze', icon: Radio, color: '#22c55e' },
    { id: 'favorites', label: t('filters.favorites') || 'Favoriti', icon: Star, color: '#f59e0b' },
    { id: 'all', label: t('filters.all') || 'Sva', icon: Layers, color: '#94a3b8' }
  ];

  const filtersScrollRef = useRef(null);

  // Auto-scroll active filter chip into view so active category is always visible
  useEffect(() => {
    if (!filtersScrollRef.current) return;
    const activeChip = filtersScrollRef.current.querySelector('.apple-filter-chip.active');
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeFilter]);

  // The vehicle to showcase in the preview card (strictly matches current filtered category)
  const activeCardVehicle = (selectedVehicle && vehicles.some(v => v.id === selectedVehicle.id))
    ? selectedVehicle
    : (vehicles.find(v => v.isApproaching()) || vehicles[0]);

  return (
    <div
      className={`apple-floating-dock ${isExpanded ? 'dock-expanded' : 'dock-collapsed'}`}
    >
      {/* 1. Drag Handle Pill - Touch gestures isolated strictly to handle to prevent accidental expansion */}
      <div
        className="apple-dock-handle-bar"
        onClick={() => {
          if (setIsExpanded) setIsExpanded(!isExpanded);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={t('sheet.dismiss')}
      >
        <div className="apple-handle-pill" />
      </div>

      {/* 2. Apple Search Bar */}
      <div className="apple-search-row">
        <div
          className="apple-search-input-box"
          onClick={() => {
            if (!isExpanded && setIsExpanded) setIsExpanded(true);
          }}
        >
          <Search size={16} color="var(--text-muted)" className="apple-search-icon" />
          <input
            type="text"
            className="apple-search-field"
            placeholder={t('sheet.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (!isExpanded && setIsExpanded) setIsExpanded(true);
            }}
          />
          {searchQuery ? (
            <button
              className="apple-search-clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSearchChange('');
              }}
              aria-label={t('sheet.clear')}
            >
              <X size={14} />
            </button>
          ) : selectedVehicle ? (
            <button
              className="apple-search-clear-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onClearSelectedVehicle) onClearSelectedVehicle();
                else if (onSelectVehicle) onSelectVehicle(null);
              }}
              title={t('sheet.clearSelection')}
              aria-label={t('sheet.clearSelection')}
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        {/* Expand / Collapse Chevron Toggle */}
        <button
          className="apple-dock-toggle-btn"
          onClick={() => setIsExpanded && setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? t('sheet.collapse') : t('sheet.expand')}
        >
          {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {/* 3. Apple Filter Chips Row */}
      <div className="apple-dock-filters" ref={filtersScrollRef}>
        <button
          className="apple-dock-filter-btn icon-only"
          onClick={() => setIsExpanded && setIsExpanded(!isExpanded)}
          title={t('sheet.filters')}
        >
          <SlidersHorizontal size={13} color="var(--text-muted)" />
        </button>

        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              className={`apple-filter-chip ${isActive ? 'active' : ''}`}
              onClick={() => onFilterChange(tab.id)}
            >
              <Icon size={13} color={isActive ? '#ffffff' : tab.color} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ====================================================================
          4. INFORMATIVE FEATURED CARD (Option B style, Apple Maps place card)
          ==================================================================== */}
      {activeCardVehicle && !isExpanded && (
        <div
          className="apple-featured-card"
          onClick={() => {
            if (!selectedVehicle && onSelectVehicle) onSelectVehicle(activeCardVehicle);
          }}
        >
          <div className="featured-card-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                className="featured-line-pill"
                style={{
                  backgroundColor: activeCardVehicle.isTram()
                    ? '#facc15'
                    : activeCardVehicle.isTrolley()
                    ? '#fb923c'
                    : '#38bdf8'
                }}
              >
                {activeCardVehicle.isTram() ? (
                  <Train size={14} color="#000000" />
                ) : activeCardVehicle.isTrolley() ? (
                  <Zap size={14} color="#000000" />
                ) : (
                  <Bus size={14} color="#000000" />
                )}
                <span>
                  {activeCardVehicle.lineId === 'REMIZA'
                    ? t('sheet.forDepot')
                    : activeCardVehicle.lineId === 'TRAM'
                    ? t('vehicles.tram')
                    : t('sheet.line', { id: activeCardVehicle.lineId })}
                </span>
              </div>
              <span className="featured-operator">
                {activeCardVehicle.operator} #{activeCardVehicle.vehicleCode}
              </span>
            </div>

            {selectedVehicle ? (
              <button
                className="featured-close-circle"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClearSelectedVehicle) onClearSelectedVehicle();
                  else if (onSelectVehicle) onSelectVehicle(null);
                }}
                aria-label={t('directions.close')}
              >
                <X size={15} />
              </button>
            ) : (
              activeCardVehicle.proximity?.isApproaching && (
                <span className="featured-eta-badge">
                  <span className="live-dot" style={{ width: '6px', height: '6px' }} />
                  ~{activeCardVehicle.proximity.etaMinutes || 2} min
                </span>
              )
            )}
          </div>

          <div className="featured-route-title">
            {activeCardVehicle.destination || activeCardVehicle.headingText}
          </div>

          {/* If vehicle is explicitly selected: show full action buttons */}
          {selectedVehicle ? (
            <div className="featured-actions-row">
              <button
                className={`apple-action-button primary ${trackedVehicleId === selectedVehicle.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleTrackVehicle) onToggleTrackVehicle(selectedVehicle);
                  else if (onCenterVehicle) onCenterVehicle(selectedVehicle);
                }}
              >
                <Locate size={15} />
                <span>
                  {trackedVehicleId === selectedVehicle.id
                    ? t('sheet.trackingActive')
                    : t('sheet.trackOnMap')}
                </span>
              </button>

              <button
                className="apple-action-button secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  if (toggleFavoriteLine) toggleFavoriteLine(selectedVehicle.lineId);
                }}
              >
                <Star
                  size={15}
                  fill={favorites && favorites.lines.some(l => String(l) === String(selectedVehicle.lineId)) ? '#eab308' : 'none'}
                  color={favorites && favorites.lines.some(l => String(l) === String(selectedVehicle.lineId)) ? '#eab308' : 'currentColor'}
                />
                <span>
                  {favorites && favorites.lines.some(l => String(l) === String(selectedVehicle.lineId))
                    ? t('sheet.favorite')
                    : t('sheet.save')}
                </span>
              </button>

              {onOpenDetailModal && (
                <button
                  className="apple-action-button secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetailModal(selectedVehicle);
                  }}
                  title={t('sheet.allStops')}
                >
                  <Info size={15} />
                  <span>{t('sheet.route')}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="featured-meta-hint">
              <span>{activeCardVehicle.speedKmH} km/h</span>
              {activeCardVehicle.proximity?.distanceFormatted && (
                <span>{activeCardVehicle.proximity.distanceFormatted}</span>
              )}
              <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{t('sheet.tapToInspect')}</span>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          5. EXPANDED BODY (Favorite Stations + Full Departures List)
          ==================================================================== */}
      {isExpanded && (
        <div className="apple-dock-expanded-body">
          {/* Saved Favorite Stations Row */}
          <div className="apple-stations-block">
            <div className="apple-block-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={13} color="#eab308" fill="#eab308" />
                <span>{t('sheet.savedStations')}</span>
              </div>
            </div>
            <div className="apple-stations-strip">
              {favorites && favorites.stations.length > 0 ? (
                favorites.stations.map((st) => (
                  <div
                    key={st}
                    className="apple-station-pill"
                    onClick={() => onSelectStation && onSelectStation(st)}
                  >
                    <MapPin size={12} color="#38bdf8" />
                    <span className="station-pill-name">{st}</span>
                    {onRemoveFavoriteStation && (
                      <button
                        type="button"
                        className="station-pill-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFavoriteStation(st);
                        }}
                        title={t('location.removeFavorite', { name: st })}
                        aria-label={t('location.removeFavorite', { name: st })}
                      >
                        <X size={11} />
                      </button>
                    )}
                  </div>
                ))
              ) : null}
              {onOpenLocationModal && (
                <button
                  type="button"
                  className="apple-add-station-pill"
                  onClick={onOpenLocationModal}
                >
                  <Plus size={12} />
                  <span>{t('sheet.addStation')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Section Header */}
          <div className="apple-block-header departures-header">
            <span className="apple-block-title">{t('sheet.departuresAndVehicles')}</span>
            <span className="apple-block-counter">{t('sheet.available', { count: vehicles.length })}</span>
          </div>

          {/* Scrollable Vehicle Departures List */}
          <div className="apple-dock-departures-scroll">
            {vehicles.length === 0 ? (
              <div className="apple-dock-empty">
                <div className="apple-dock-empty-icon">
                  <Star size={20} color="#f59e0b" />
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                  {activeFilter === 'favorites' ? t('sheet.noFavorites') : t('sheet.noVehicles')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '280px', textAlign: 'center', lineHeight: 1.4 }}>
                  {activeFilter === 'favorites'
                    ? t('sheet.noFavoritesHint')
                    : t('sheet.filterHint')}
                </div>
              </div>
            ) : (
              vehicles.map((v) => {
                const isLineFav = favorites && favorites.lines.some(l => String(l) === String(v.lineId));
                const isComing = v.isApproaching();
                const isSelected = selectedVehicle && selectedVehicle.id === v.id;
                const lineBg = v.isTram()
                  ? '#facc15'
                  : v.isTrolley()
                  ? '#fb923c'
                  : '#38bdf8';

                return (
                  <div
                    key={v.id}
                    className={`apple-departure-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onSelectVehicle(v);
                      if (setIsExpanded) setIsExpanded(false);
                    }}
                  >
                    <div
                      className="apple-row-badge"
                      style={{ backgroundColor: lineBg }}
                    >
                      {v.lineId}
                    </div>

                    <div className="apple-row-info">
                      <div className="apple-row-dest">
                        {v.destination || v.headingText}
                      </div>
                      <div className="apple-row-meta">
                        <span>{v.operator} #{v.vehicleCode}</span>
                        <span className="apple-row-speed">{v.speedKmH} km/h</span>
                      </div>
                    </div>

                    <div className="apple-row-right">
                      {v.proximity && (
                        <span
                          className={`apple-row-eta ${isComing ? 'ingoing' : 'outgoing'}`}
                        >
                          {isComing ? (
                            <>~{v.proximity.etaMinutes || 2} min</>
                          ) : (
                            <>{t('sheet.departing')}</>
                          )}
                        </span>
                      )}

                      <button
                        className="apple-row-star-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (toggleFavoriteLine) toggleFavoriteLine(v.lineId);
                        }}
                        title={t('sheet.favorite')}
                        aria-label={t('sheet.favorite')}
                      >
                        <Star
                          size={16}
                          fill={isLineFav ? '#eab308' : 'none'}
                          color={isLineFav ? '#eab308' : 'var(--text-muted)'}
                        />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
