import React from 'react';
import { X, Navigation, Compass, Star, ShieldAlert, Train, Zap, Bus, Info } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function InspectionCard({
  vehicle,
  onClose,
  onCenterMap,
  onOpenDetails,
  isFavorite,
  onToggleFavorite,
  userLocation
}) {
  const { t } = useI18n();
  if (!vehicle) return null;

  const badgeBg = vehicle.getPrimaryColor();
  const isDepot = vehicle.isDepot ? vehicle.isDepot() : false;
  const proximity = !vehicle.isStale && vehicle.proximity?.isComing !== null ? vehicle.proximity : null;

  let TypeIcon = Bus;
  if (vehicle.isTram()) TypeIcon = Train;
  else if (vehicle.isTrolley()) TypeIcon = Zap;

  return (
    <div className="inspection-card-container">
      <div className="inspection-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Drag/Dismiss Handle */}
        <div className="inspection-handle" onClick={onClose} />

        {/* Header Row: Line Badge, Operator, Speed, Star, Close */}
        <div className="inspection-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="inspection-line-badge" style={{ background: badgeBg }}>
              <TypeIcon size={14} style={{ display: 'inline', marginRight: 4 }} />
              {vehicle.lineId || '?'}
            </span>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="inspection-operator">
                {vehicle.operator} • {vehicle.speedKmH} km/h
              </span>
              <span className="inspection-sub-meta">
                {vehicle.vehicleCode || 'SA-Transit'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="icon-btn"
              style={{ width: '34px', height: '34px' }}
              onClick={() => onToggleFavorite(vehicle.lineId)}
              title={t('sheet.favorite')}
              aria-label={t('sheet.favorite')}
            >
              <Star
                size={17}
                fill={isFavorite ? '#eab308' : 'none'}
                color={isFavorite ? '#eab308' : 'var(--text-muted)'}
              />
            </button>

            <button
              className="icon-btn"
              style={{ width: '34px', height: '34px' }}
              onClick={onClose}
              title={t('directions.close')}
              aria-label={t('directions.close')}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Destination Route */}
        <div className="inspection-destination">
          {isDepot && <ShieldAlert size={16} color="#f59e0b" style={{ flexShrink: 0 }} />}
          <span>{vehicle.headingText}</span>
        </div>

        {/* Live Proximity Banner (Dolazi prema vama / Odlazi) */}
        {proximity ? (
          <div className={`inspection-proximity-banner ${proximity.isComing ? 'ingoing' : 'outgoing'}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-dot" style={{ width: 7, height: 7 }} />
              <span style={{ fontWeight: 800 }}>
                {proximity.isComing
                  ? (userLocation?.isGps || !userLocation?.name
                      ? t('directions.ingoing')
                      : t('directions.approachingStation', { station: userLocation.name }))
                  : t('directions.outgoing')}
              </span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '13px' }}>
              {proximity.isComing && proximity.etaMinutes ? `${proximity.etaMinutes} min • ` : ''}
              {proximity.distanceMeters > 1000
                ? `${(proximity.distanceMeters / 1000).toFixed(1)} km`
                : `${proximity.distanceMeters}m`}
            </div>
          </div>
        ) : null}

        {/* Action Buttons: Center on Map & Full Details */}
        <div className="inspection-actions">
          <button className="inspection-btn primary" onClick={onCenterMap}>
            <Navigation size={15} />
            <span>{t('sheet.trackOnMap')}</span>
          </button>

          {onOpenDetails && (
            <button className="inspection-btn secondary" onClick={onOpenDetails}>
              <Info size={15} />
              <span>{t('sheet.moreDetails')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
