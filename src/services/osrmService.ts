import type { OptimalRouteResult, WaypointCoordinate } from '../types/waste';

interface OSRMRouteResponse {
  code: string;
  message?: string;
  routes?: Array<{
    geometry: {
      coordinates: [number, number][]; // [longitude, latitude]
      type: string;
    };
    distance: number; // in meters
    duration: number; // in seconds
  }>;
}

/**
 * Fetches the optimal driving route between waypoints using the OSRM Public Routing API.
 * Formats coordinates for OSRM URL as `lng,lat;lng,lat;...`
 * Converts returned GeoJSON [lng, lat] coordinates to Leaflet [lat, lng] format.
 */
export async function fetchOptimalRoute(
  waypoints: WaypointCoordinate[]
): Promise<OptimalRouteResult> {
  if (waypoints.length < 2) {
    throw new Error('At least 2 waypoints are required to generate a route.');
  }

  // OSRM format requires "lng,lat;lng,lat;..."
  const coordinatesString = waypoints
    .map((wp: WaypointCoordinate) => `${wp.lng},${wp.lat}`)
    .join(';');

  const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM API responded with status ${response.status} (${response.statusText})`);
    }

    const data = (await response.json()) as OSRMRouteResponse;

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error(data.message || 'No valid route found between the provided waypoints.');
    }

    const bestRoute = data.routes[0];
    const distanceMeters = bestRoute.distance;
    const durationSeconds = bestRoute.duration;

    // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
    const leafletCoordinates: [number, number][] = bestRoute.geometry.coordinates.map(
      ([lng, lat]: [number, number]): [number, number] => [lat, lng]
    );

    const distanceKm = Number((distanceMeters / 1000).toFixed(2));
    const durationMinutes = Math.round(durationSeconds / 60);
    // Estimated carbon saved = distance in km * 0.21 kg/km factor
    const carbonSavedKg = Number((distanceKm * 0.21).toFixed(2));

    return {
      coordinates: leafletCoordinates,
      distanceMeters,
      durationSeconds,
      distanceKm,
      durationMinutes,
      carbonSavedKg,
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Routing request timed out. Please check your internet connection.', {
        cause: error,
      });
    }
    if (error instanceof Error) {
      throw new Error(`Failed to fetch optimal route: ${error.message}`, {
        cause: error,
      });
    }
    throw new Error('An unexpected error occurred while calculating the route.', {
      cause: error,
    });
  }
}

