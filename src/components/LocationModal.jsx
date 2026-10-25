import React from 'react';
import { X, Navigation, MapPin, Check, Star } from 'lucide-react';
import { POPULAR_STATIONS } from '../services/stations';
import { useI18n } from '../context/I18nContext';

export default function LocationModal({
  isOpen,
  onClose,
  onRequestGps,
  onSelectStation,
  currentLocationName,
  isGps = false,
  favorites = { stations: [] },
  toggleFavoriteStation
}) {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={22} color="var(--accent-blue)" />
            <span>{t('location.title')}</span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label={t('directions.close')}>
            <X size={18} />
          </button>
        </div>

        <p className="modal-desc">
          {t('location.desc')}
        </p>

        {/* GPS Live Selection Card */}
        <div
          className="station-item"
          style={{
            borderColor: isGps ? '#38bdf8' : 'var(--border-glass)',
            background: isGps ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-glass-card)',
            cursor: 'pointer',
            marginBottom: '6px'
          }}
          onClick={() => {
            onRequestGps();
            onClose();
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} color="#38bdf8" />
              <span className="station-name" style={{ color: isGps ? '#38bdf8' : 'var(--text-main)', fontWeight: 700 }}>
                {t('location.enableGps')}
              </span>
            </div>
            {isGps && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>
                <Check size={16} color="#22c55e" /> Aktivno
              </span>
            )}
          </div>
          <span className="station-desc">
            Automatsko praćenje vaših koordinata u stvarnom vremenu
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 4px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {t('location.orSelectStation')}
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }} />
        </div>

        {/* Popular Stations List */}
        <div className="stations-list">
          {POPULAR_STATIONS.map((st) => {
            const isCurrent = !isGps && currentLocationName === st.name;
            const isFavStation = favorites && favorites.stations && favorites.stations.includes(st.name);
            return (
              <div
                key={st.id}
                className="station-item"
                style={isCurrent ? { borderColor: 'var(--accent-blue)', background: 'var(--bg-glass-card-hover)' } : {}}
                onClick={() => {
                  onSelectStation(st);
                  onClose();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="station-name">{st.name}</span>
                    {isCurrent && <Check size={16} color="var(--accent-blue)" />}
                  </div>
                  {toggleFavoriteStation && (
                    <button
                      className="icon-btn"
                      style={{ width: '28px', height: '28px', padding: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteStation(st.name);
                      }}
                      title={isFavStation ? 'Ukloni iz omiljenih' : 'Dodaj u omiljene'}
                      aria-label="Favorit stanica"
                    >
                      <Star
                        size={15}
                        fill={isFavStation ? '#eab308' : 'none'}
                        color={isFavStation ? '#eab308' : 'var(--text-muted)'}
                      />
                    </button>
                  )}
                </div>
                <span className="station-desc">{st.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
