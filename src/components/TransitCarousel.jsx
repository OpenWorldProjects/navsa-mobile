import React, { useState, useRef, useEffect } from 'react';
import { Search, Star, Train, Zap, Bus, X, ChevronDown, ChevronUp, Navigation, Compass, ShieldAlert } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function TransitCarousel({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  approachingCount,
  favorites,
  toggleFavoriteLine,
  userLocation
}) {
  const { t } = useI18n();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const trackRef = useRef(null);

  // When a vehicle is selected from the map, scroll to its card in the carousel
  useEffect(() => {
    if (!selectedVehicle || !trackRef.current) return;
    const cardEl = trackRef.current.querySelector(`[data-vehicle-id="${selectedVehicle.id}"]`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedVehicle]);

  // Sort vehicles: approaching first (sorted by ETA), then others
  const sortedVehicles = [...vehicles].sort((a, b) => {
    const aComing = a.proximity?.isComing ? 1 : 0;
    const bComing = b.proximity?.isComing ? 1 : 0;
    if (aComing !== bComing) return bComing - aComing;

    if (aComing && bComing) {
      return (a.proximity?.etaMinutes || 99) - (b.proximity?.etaMinutes || 99);
    }
    return 0;
  });

  if (isMinimized) {
    return (
      <div className="carousel-minimized-pill" onClick={() => setIsMinimized(false)}>
        <span className="live-dot" />
        <span style={{ fontWeight: 800, fontSize: '12px' }}>
          {approachingCount > 0 ? `🟢 ${approachingCount} vozila dolazi` : `Javni prevoz KS (${vehicles.length})`}
        </span>
        <ChevronUp size={16} />
      </div>
    );
  }

  return (
    <div className="transit-carousel-wrapper">
      {/* Top Filter Chips Row */}
      <div className="carousel-filter-bar">
        <div className="carousel-chips-scroll">
          <button
            className={`carousel-chip ${activeFilter === 'favorites' ? 'active' : ''}`}
            onClick={() => onFilterChange('favorites')}
          >
            <Star size={12} fill={activeFilter === 'favorites' ? '#eab308' : 'none'} color="#eab308" />
            <span>Favoriti ({favorites ? favorites.lines.length : 0})</span>
          </button>

          <button
            className={`carousel-chip chip-ingoing ${activeFilter === 'approaching' ? 'active' : ''}`}
            onClick={() => onFilterChange('approaching')}
          >
            <span className="live-dot" style={{ width: 5, height: 5 }} />
            <span>Dolaze ({approachingCount})</span>
          </button>

          <button
            className={`carousel-chip ${activeFilter === 'tram' ? 'active' : ''}`}
            onClick={() => onFilterChange('tram')}
          >
            <Train size={12} color="#facc15" />
            <span>Tramvaj</span>
          </button>

          <button
            className={`carousel-chip ${activeFilter === 'trolley' ? 'active' : ''}`}
            onClick={() => onFilterChange('trolley')}
          >
            <Zap size={12} color="#fb923c" />
            <span>Trolejbus</span>
          </button>

          <button
            className={`carousel-chip ${activeFilter === 'bus' ? 'active' : ''}`}
            onClick={() => onFilterChange('bus')}
          >
            <Bus size={12} color="#06b6d4" />
            <span>Autobus</span>
          </button>

          <button
            className={`carousel-chip ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            <span>Sva ({vehicles.length})</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className={`carousel-icon-btn ${isSearchOpen ? 'active' : ''}`}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            title="Pretraži"
            aria-label="Pretraži"
          >
            <Search size={15} />
          </button>

          <button
            className="carousel-icon-btn"
            onClick={() => setIsMinimized(true)}
            title="Sakrij traku"
            aria-label="Sakrij traku"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Slide-down search input */}
      {isSearchOpen && (
        <div className="carousel-search-box">
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            className="carousel-search-input"
            placeholder="Pretraži liniju ili odredište (npr. 3, Baščaršija...)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button className="carousel-clear-btn" onClick={() => onSearchChange('')}>
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* Horizontal Snap Card Carousel */}
      <div className="transit-carousel-track" ref={trackRef}>
        {sortedVehicles.length === 0 ? (
          <div className="carousel-empty-card">
            <span>Nema vozila za odabrane filtere.</span>
          </div>
        ) : (
          sortedVehicles.map(vehicle => {
            const isSelected = selectedVehicle && selectedVehicle.id === vehicle.id;
            const badgeBg = vehicle.getPrimaryColor();
            const isDepot = vehicle.isDepot ? vehicle.isDepot() : false;
            const isFav = favorites ? favorites.lines.includes(vehicle.lineId) : false;
            const proximity = vehicle.proximity;

            return (
              <div
                key={vehicle.id}
                data-vehicle-id={vehicle.id}
                className={`transit-snap-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectVehicle(vehicle)}
              >
                {/* Card Top Row: Line badge, Favorite Star, Speed */}
                <div className="snap-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <span className="snap-line-pill" style={{ background: badgeBg }}>
                      {vehicle.isTram() ? '🚊 ' : vehicle.isTrolley() ? '🚎 ' : '🚌 '}
                      {vehicle.lineId}
                    </span>
                    <button
                      className="snap-star-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteLine(vehicle.lineId);
                      }}
                      title="Favorit"
                      aria-label="Favorit"
                    >
                      <Star
                        size={14}
                        fill={isFav ? '#eab308' : 'none'}
                        color={isFav ? '#eab308' : 'var(--text-muted)'}
                      />
                    </button>
                  </div>

                  <div className="snap-meta-group">
                    <span className="snap-operator-tag">{vehicle.operator}</span>
                    <span className="snap-speed-pill">{vehicle.speedKmH} km/h</span>
                  </div>
                </div>

                {/* Destination Heading */}
                <div className="snap-destination-row">
                  {isDepot && <ShieldAlert size={13} color="#f59e0b" style={{ flexShrink: 0 }} />}
                  <span className="snap-destination-text">{vehicle.headingText}</span>
                </div>

                {/* Proximity / Live ETA Badge */}
                <div className="snap-card-footer">
                  {proximity?.isComing ? (
                    <div className="snap-proximity-badge ingoing">
                      <span className="live-dot" style={{ width: 6, height: 6 }} />
                      <span>Dolazi ~{proximity.etaMinutes || 2} min</span>
                      <span className="snap-dist-text">({proximity.distanceMeters}m)</span>
                    </div>
                  ) : proximity ? (
                    <div className="snap-proximity-badge outgoing">
                      <span>🔴 Odlazi</span>
                      <span className="snap-dist-text">({proximity.distanceMeters ? `${(proximity.distanceMeters / 1000).toFixed(1)} km` : ''})</span>
                    </div>
                  ) : (
                    <div className="snap-proximity-badge neutral">
                      <span>U prometu</span>
                    </div>
                  )}
                  <span className="snap-tap-hint">Dodirni za prikaz</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
