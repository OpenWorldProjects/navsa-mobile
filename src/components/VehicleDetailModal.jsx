import React from 'react';
import { X, Navigation, Gauge, Shield, MapPin, Compass, Train, Zap, Bus } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function VehicleDetailModal({
  vehicle,
  onClose,
  onFocusMap
}) {
  const { t } = useI18n();
  if (!vehicle) return null;

  let TypeIcon = Bus;
  if (vehicle.isTram()) TypeIcon = Train;
  else if (vehicle.isTrolley()) TypeIcon = Zap;

  const typeColor = vehicle.getPrimaryColor();
  const isComing = vehicle.isApproaching();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: typeColor,
                color: '#000',
                fontWeight: 800,
                fontSize: '14px'
              }}
            >
              <TypeIcon size={16} />
              <span>{t('sheet.line', { id: vehicle.lineId })}</span>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {t(`vehicles.${vehicle.getTypeKey()}`)}
            </span>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label={t('directions.close')}>
            <X size={18} />
          </button>
        </div>

        {/* Direction & Destination display */}
        <div
          style={{
            background: 'var(--bg-glass-card)',
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid var(--border-glass)'
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t('directions.headingAndDestination')}
          </div>
          <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{vehicle.headingText}</span>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {t('directions.destination')}: <strong>{vehicle.headingTo}</strong>
            </span>
          </div>
        </div>

        {/* Ingoing vs Outgoing badge & distance */}
        {vehicle.proximity && vehicle.proximity.isComing !== null && !vehicle.isStale && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '14px',
              background: isComing ? 'var(--badge-ingoing-bg)' : 'var(--badge-outgoing-bg)',
              border: `1px solid ${isComing ? 'var(--badge-ingoing-border)' : 'var(--badge-outgoing-border)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: isComing ? 'var(--badge-ingoing-text)' : 'var(--badge-outgoing-text)'
                }}
              >
                {isComing ? `🟢 ${t('directions.ingoing')}` : `🔴 ${t('directions.outgoing')}`}
              </span>
              {vehicle.proximity.etaMinutes && (
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#22c55e',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}
                >
                  {t('directions.etaMinutes', { min: vehicle.proximity.etaMinutes })}
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', opacity: 0.9 }}>
              {isComing
                ? t('directions.approachingSub', {
                    dist: vehicle.proximity.distanceMeters > 1000
                      ? `${(vehicle.proximity.distanceMeters / 1000).toFixed(1)} km`
                      : `${vehicle.proximity.distanceMeters}m`,
                    eta: vehicle.proximity.etaMinutes || 1
                  })
                : t('directions.outgoingSub', {
                    dist: vehicle.proximity.distanceMeters > 1000
                      ? `${(vehicle.proximity.distanceMeters / 1000).toFixed(1)} km`
                      : `${vehicle.proximity.distanceMeters}m`
                  })}
            </div>
          </div>
        )}

        {/* Telemetry info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div
            style={{
              background: 'var(--bg-glass-card)',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Shield size={16} color="var(--accent-blue)" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t('directions.operator')}</div>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>{vehicle.operator}</div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-glass-card)',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Gauge size={16} color="#eab308" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t('directions.speed')}</div>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>{vehicle.speedKmH} km/h</div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-glass-card)',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Compass size={16} color="#fb923c" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t('directions.compassBearing')}</div>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>{Number.isFinite(vehicle.bearing) ? `${Math.round(vehicle.bearing)}°` : '—'}</div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-glass-card)',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <MapPin size={16} color="#a855f7" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t('directions.garageNumber')}</div>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>{vehicle.vehicleCode}</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            className="btn-primary"
            style={{ flex: 1 }}
            onClick={() => {
              onFocusMap(vehicle);
              onClose();
            }}
          >
            <Navigation size={16} />
            {t('directions.showOnMap')}
          </button>
        </div>
      </div>
    </div>
  );
}
