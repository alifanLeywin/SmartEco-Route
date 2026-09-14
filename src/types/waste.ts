export type WasteType = 'plastic' | 'paper' | 'organic' | 'general';

export interface BinLocation {
  id: string;
  name: string;
  fillLevel: number; // 0-100 percentage
  lat: number;
  lng: number;
  type: WasteType;
}

export interface RouteSummary {
  distanceKm: number;
  estimatedMinutes: number;
  carbonSavedKg: number;
}

export interface WaypointCoordinate {
  lat: number;
  lng: number;
}

export interface OptimalRouteResult {
  coordinates: [number, number][]; // [lat, lng] pairs for Leaflet Polyline
  distanceMeters: number;
  durationSeconds: number;
  distanceKm: number;
  durationMinutes: number;
  carbonSavedKg: number;
}
