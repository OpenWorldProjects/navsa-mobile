import React, { useState } from 'react';
import { X, Smartphone, Share2, PlusSquare, Train, Zap, Bus, Star, CheckCircle2, Clock } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function HomeScreenWidgetModal({
  isOpen,
  onClose,
  approachingVehicle,
  userLocation,
  favoriteLine
}) {
  const { t } = useI18n();
  const [selectedWidgetSize, setSelectedWidgetSize] = useState('medium'); // 'small', 'medium', 'lockscreen'

  if (!isOpen) return null;

  const vehicle = approachingVehicle || {
    lineId: '3',
    headingText: 'Ilidža ➔ Baščaršija',
    proximity: { isComing: true, etaMinutes: 2, distanceMeters: 640 },
    operator: 'GRAS',
    speedKmH: 38,
    isTram: () => true,
    isTrolley: () => false,
    isBus: () => false,
    getPrimaryColor: () => '#facc15'
  };

  const typeColor = vehicle.getPrimaryColor ? vehicle.getPrimaryColor() : '#facc15';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content widget-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="widget-header-badge">
              <Smartphone size={18} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Brzi Pregled na Početnom Ekranu
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Praćenje dolazaka uživo za iOS & Android
              </div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Zatvori">
            <X size={18} />
          </button>
        </div>

        {/* Card Style Selector */}
        <div className="widget-size-tabs">
          <button
            className={`widget-tab ${selectedWidgetSize === 'small' ? 'active' : ''}`}
            onClick={() => setSelectedWidgetSize('small')}
          >
            Kompaktni (2x2)
          </button>
          <button
            className={`widget-tab ${selectedWidgetSize === 'medium' ? 'active' : ''}`}
            onClick={() => setSelectedWidgetSize('medium')}
          >
            Detaljni (4x2)
          </button>
          <button
            className={`widget-tab ${selectedWidgetSize === 'lockscreen' ? 'active' : ''}`}
            onClick={() => setSelectedWidgetSize('lockscreen')}
          >
            Zaključani Ekran
          </button>
        </div>

        {/* Interactive iOS/Android Live Widget Preview */}
        <div className="widget-preview-stage">
          {selectedWidgetSize === 'small' && (
            <div className="ios-widget-card small">
              <div className="widget-top-row">
                <span className="widget-line-pill" style={{ background: typeColor, color: '#000000' }}>
                  Linija {vehicle.lineId}
                </span>
                <span className="widget-pulse-dot"></span>
              </div>
              <div className="widget-dest-small">
                {vehicle.headingText.split('➔')[1] || vehicle.headingText}
              </div>
              <div className="widget-eta-big">
                {vehicle.proximity?.etaMinutes || 2} <span style={{ fontSize: '13px', fontWeight: 600 }}>min</span>
              </div>
              <div className="widget-sub-small">
                🟢 Dolazi • {vehicle.proximity?.distanceMeters || 600}m
              </div>
            </div>
          )}

          {selectedWidgetSize === 'medium' && (
            <div className="ios-widget-card medium">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="widget-line-pill" style={{ background: typeColor, color: '#000000' }}>
                    Linija {vehicle.lineId}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{vehicle.operator}</span>
                </div>
                <div className="widget-live-tag">
                  <span className="widget-pulse-dot"></span>
                  <span>UŽIVO</span>
                </div>
              </div>

              <div className="widget-dest-medium">
                {vehicle.headingText}
              </div>

              {/* Progress Track */}
              <div className="widget-progress-track">
                <div className="widget-progress-fill" style={{ width: '70%', background: typeColor }}></div>
                <div className="widget-tram-icon-indicator" style={{ left: '70%' }}>🚊</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 700 }}>
                  🟢 Dolazi prema {userLocation?.name || 'vama'}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                  ~{vehicle.proximity?.etaMinutes || 2} min ({vehicle.proximity?.distanceMeters || 600}m)
                </span>
              </div>
            </div>
          )}

          {selectedWidgetSize === 'lockscreen' && (
            <div className="ios-widget-card lockscreen">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="widget-line-pill" style={{ background: typeColor, color: '#000000', fontSize: '12px', padding: '3px 8px' }}>
                  {vehicle.lineId}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                    {vehicle.headingText}
                  </span>
                  <span style={{ fontSize: '11px', color: '#22c55e' }}>
                    🟢 Dolazi prema vama • ~{vehicle.proximity?.etaMinutes || 2} min
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 800, color: '#38bdf8' }}>
                <Clock size={13} />
                <span>2m</span>
              </div>
            </div>
          )}
        </div>

        {/* How to install on iOS / Android */}
        <div className="widget-install-guide">
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            📱 Kako postaviti na početni ekran:
          </div>

          <div className="guide-step-item">
            <div className="guide-step-num">iOS</div>
            <div className="guide-step-text">
              U <strong>Safariju</strong> pritisnite ikonu <strong>Podijeli</strong> (Share <Share2 size={12} style={{ display: 'inline' }} />), a zatim <strong>"Na početni ekran"</strong> (<PlusSquare size={12} style={{ display: 'inline' }} /> Dodaj na ekran).
            </div>
          </div>

          <div className="guide-step-item">
            <div className="guide-step-num">Android</div>
            <div className="guide-step-text">
              U <strong>Chromeu</strong> pritisnite <strong>Meni sa 3 tačke</strong> u gornjem desnom uglu ➔ <strong>"Dodaj na početni ekran"</strong> / "Instaliraj aplikaciju".
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', marginTop: '14px' }}
          onClick={onClose}
        >
          <CheckCircle2 size={16} />
          <span>Spremno za početni ekran</span>
        </button>
      </div>
    </div>
  );
}
