// Domain Model: Vehicle
export class Vehicle {
  constructor({
    id,
    vehicleCode,
    vehicleTypeId,
    latitude,
    longitude,
    bearing = 0,
    speedKmH = 0,
    lineId = '?',
    origin = '',
    destination = '',
    headingText = '',
    headingTo = '',
    operator = 'GRAS',
    proximity = null
  }) {
    this.id = id;
    this.vehicleCode = vehicleCode;
    this.vehicleTypeId = vehicleTypeId; // 4: Tram, 3: Trolley, 2: Bus
    this.latitude = latitude;
    this.longitude = longitude;
    this.bearing = bearing;
    this.speedKmH = speedKmH;
    this.lineId = lineId;
    this.origin = origin;
    this.destination = destination;
    this.headingText = headingText;
    this.headingTo = headingTo;
    this.operator = operator;
    this.proximity = proximity;
  }

  isTram() {
    return this.vehicleTypeId === 4;
  }

  isTrolley() {
    return this.vehicleTypeId === 3;
  }

  isBus() {
    return this.vehicleTypeId === 2;
  }

  isApproaching() {
    return !!(this.proximity && this.proximity.isComing);
  }

  isDepot() {
    return this.lineId === 'REMIZA';
  }

  getTypeKey() {
    if (this.isDepot()) return 'depot';
    if (this.isTram()) return 'tram';
    if (this.isTrolley()) return 'trolley';
    return 'bus';
  }

  getPrimaryColor() {
    if (this.isDepot()) return '#94a3b8'; // Slate Gray for Depot
    if (this.isTram()) return '#facc15'; // Vibrant Yellow
    if (this.isTrolley()) return '#fb923c'; // Vibrant Orange
    return '#06b6d4'; // Vibrant Cyan
  }
}
