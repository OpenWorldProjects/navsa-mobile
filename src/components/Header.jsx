import React from 'react';
import { RefreshCw, Moon, Sun, MapPin, Navigation, Languages, Minimize2, Smartphone } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export default function Header({
  totalVehicles,
  isRefreshing,
  onRefresh,
  theme,
  themeMode,
  onThemeModeChange,
  userLocationName,
  onOpenStationPicker,
  refreshProgress,
  onToggleFloatingMode,
  onOpenWidgetModal
}) {
  const { t, language, setLanguage } = useI18n();

  const toggleLanguage = () => {
    setLanguage(language === 'bhs' ? 'en' : 'bhs');
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo-badge">
            <Navigation size={20} />
          </div>
          <div className="app-titles">
            <div className="app-title-main">
              <span className="app-brand-name">Sarajevo<span className="brand-suffix"> Transit</span></span>
              <span className="live-indicator">
                <span className="live-dot" />
                <span className="live-text">{t('app.live')}</span>
              </span>
            </div>
            <div className="app-subtitle">
              {t('app.activeVehicles', { count: totalVehicles })}
            </div>
          </div>
        </div>

        <div className="header-actions">
          {/* Home Screen Live Card Button */}
          <button
            className="icon-btn"
            title={t('settings.quickGlance')}
            onClick={onOpenWidgetModal}
            aria-label={t('settings.quickGlance')}
          >
            <Smartphone size={16} color="#38bdf8" />
          </button>

          {/* Floating Mode Button */}
          <button
            className="icon-btn"
            title={t('settings.floatingMode')}
            onClick={onToggleFloatingMode}
            aria-label={t('settings.floatingMode')}
          >
            <Minimize2 size={16} color="#a855f7" />
          </button>

          {/* Language Switcher */}
          <button
            className="icon-btn"
            title={t('settings.language')}
            onClick={toggleLanguage}
            aria-label={t('settings.language')}
            style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}
          >
            {language === 'bhs' ? 'EN' : 'BS'}
          </button>

          {/* Station / Location Quick Selector (shown on wider screens, mobile uses location pill) */}
          <button
            className="icon-btn header-loc-btn"
            title={t('location.title')}
            onClick={onOpenStationPicker}
            aria-label={t('location.title')}
          >
            <MapPin size={17} color="#38bdf8" />
          </button>

          {/* Refresh Button */}
          <button
            className={`icon-btn ${isRefreshing ? 'spinning' : ''}`}
            onClick={onRefresh}
            title={t('settings.refresh')}
            aria-label={t('settings.refresh')}
          >
            <RefreshCw size={17} />
          </button>

          {[
            { mode: 'auto', label: t('settings.themeAuto'), icon: <span className="theme-auto-icon">A</span> },
            { mode: 'light', label: t('settings.themeLight'), icon: <Sun size={17} /> },
            { mode: 'dark', label: t('settings.themeDark'), icon: <Moon size={17} /> }
          ].map(({ mode, label, icon }) => (
            <button
              key={mode}
              type="button"
              className={`icon-btn theme-mode-btn ${themeMode === mode ? 'active' : ''}`}
              title={label}
              aria-label={label}
              aria-pressed={themeMode === mode}
              onClick={() => onThemeModeChange(mode)}
            >
              {icon}
            </button>
          ))}
        </div>
      </header>
    </>
  );
}
