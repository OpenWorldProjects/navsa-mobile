import { registerPlugin, Capacitor } from '@capacitor/core';

export const TransitWidget = registerPlugin('TransitWidget');

/**
 * Synchronize live vehicle or favorite status to native Android/iOS home screen widget
 */
export async function syncWidgetData(vehicle, userLocation) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    if (!vehicle) return;

    const lineType = vehicle.isTram && vehicle.isTram()
      ? 'tram'
      : vehicle.isTrolley && vehicle.isTrolley()
      ? 'trolley'
      : 'bus';

    const isApproaching = vehicle.proximity?.isApproaching ?? vehicle.isApproaching?.() ?? true;
    const eta = vehicle.proximity?.etaMinutes || 2;
    const dist = vehicle.proximity?.distanceFormatted || (vehicle.proximity?.distanceMeters ? `${vehicle.proximity.distanceMeters}m` : '');

    const etaText = isApproaching
      ? `🟢 Stiže za ~${eta} min ${dist ? `(${dist})` : ''}`
      : `🔴 Odlazi od stanice ${dist ? `(${dist})` : ''}`;

    const statusText = isApproaching
      ? `🟢 Dolazi ${userLocation?.name ? `prema ${userLocation.name}` : 'prema vama'}`
      : `Odlazi ${dist ? `• ${dist}` : ''}`;

    await TransitWidget.updateWidgetData({
      lineId: String(vehicle.lineId || '3'),
      lineType: lineType,
      destination: vehicle.destination || vehicle.headingText || 'Sarajevo',
      operator: `${vehicle.operator || 'GRAS'} #${vehicle.vehicleCode || '557'}`,
      etaText: etaText,
      statusText: statusText
    });
  } catch (e) {
    console.debug('Widget sync notice:', e);
  }
}

/**
 * Request system prompt to pin the widget to the Home Screen (Android 8.0+)
 */
export async function pinHomeScreenWidget() {
  if (!Capacitor.isNativePlatform()) {
    return { supported: false, message: 'web' };
  }

  try {
    const res = await TransitWidget.requestPinWidget();
    return res;
  } catch (e) {
    console.warn('Failed to pin widget:', e);
    return { supported: false, error: e };
  }
}
