import React, { useState, useRef } from 'react';
import { Maximize2, Train, Zap, Bus, ChevronRight, Star } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function FloatingHud({
  vehicle,
  onRestore,
  onFocusVehicle
}) {
  const { t } = useI18n();
  const [position, setPosition] = useState({ x: 16, y: 80 });
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 16, y: 80 });

  if (!vehicle) return null;

  const typeColor = vehicle.getPrimaryColor();
  let TypeIcon = Bus;
  if (vehicle.isTram()) TypeIcon = Train;
  else if (vehicle.isTrolley()) TypeIcon = Zap;

  const onTouchStart = (e) => {
    isDragging.current = true;
    dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    initialPos.current = { ...position };
  };

  const onTouchMove = (e) => {
    if (!isDragging.current) return;
    const deltaX = e.touches[0].clientX - dragStartPos.current.x;
    const deltaY = e.touches[0].clientY - dragStartPos.current.y;
    setPosition({
      x: Math.max(10, Math.min(window.innerWidth - 300, initialPos.current.x + deltaX)),
      y: Math.max(20, Math.min(window.innerHeight - 100, initialPos.current.y + deltaY))
    });
  };

  const onTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <div
      className="floating-transit-hud"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Line Badge */}
      <div
        className="hud-line-badge"
        style={{ background: typeColor }}
        onClick={() => onFocusVehicle && onFocusVehicle(vehicle)}
      >
        <TypeIcon size={14} color="#000000" />
        <span style={{ color: '#000000', fontWeight: 800 }}>{vehicle.lineId}</span>
      </div>

      {/* Info Content */}
      <div
        className="hud-info"
        onClick={() => onFocusVehicle && onFocusVehicle(vehicle)}
      >
        <div className="hud-dest">{vehicle.headingText}</div>
        <div className="hud-sub">
          {vehicle.proximity && (
            <span className={vehicle.proximity.isComing ? 'hud-ingoing' : 'hud-outgoing'}>
              {vehicle.proximity.isComing ? `🟢 ${t('filters.approaching')}` : `🔴 ${t('sheet.departing')}`}
              {vehicle.proximity.etaMinutes ? ` • ~${vehicle.proximity.etaMinutes} min` : ''}
            </span>
          )}
          {vehicle.speedKmH > 0 && <span> • {vehicle.speedKmH} km/h</span>}
        </div>
      </div>

      {/* Restore Button */}
      <button
        className="hud-restore-btn"
        onClick={onRestore}
        title={t('controls.restore')}
        aria-label={t('controls.restore')}
      >
        <Maximize2 size={16} />
      </button>
    </div>
  );
}
