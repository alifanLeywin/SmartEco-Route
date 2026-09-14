### Typescript interfaces, mock data, and layout structure for the **Garut Smart Waste Management Routing Dashboard** have been created and verified.

---

### 1. TypeScript Interface: [`src/types/waste.ts`](SmartEco-Route/src/types/waste.ts)

```typescript
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
```

---

### 2. Mock Data: [`src/data/mockBins.ts`](SmartEco-Route/src/data/mockBins.ts)

Includes 8 realistic bin locations around Garut city center (`lat: ~ -7.21`, `lng: ~ 107.90`) with varied fill levels and waste types:

```typescript
import type { BinLocation, RouteSummary } from '../types/waste';

export const mockBins: BinLocation[] = [
  {
    id: 'bin-garut-001',
    name: 'Alun-Alun Garut Central',
    fillLevel: 88,
    lat: -7.2163,
    lng: 107.9015,
    type: 'general',
  },
  {
    id: 'bin-garut-002',
    name: 'Simpang Lima Garut Hub',
    fillLevel: 94,
    lat: -7.2024,
    lng: 107.8932,
    type: 'plastic',
  },
  {
    id: 'bin-garut-003',
    name: 'Bundaran Tarogong Point',
    fillLevel: 42,
    lat: -7.1895,
    lng: 107.8864,
    type: 'paper',
  },
  {
    id: 'bin-garut-004',
    name: 'Pasar Baru Garut Trading Zone',
    fillLevel: 91,
    lat: -7.212,
    lng: 107.9048,
    type: 'organic',
  },
  {
    id: 'bin-garut-005',
    name: 'Lapang Merdeka (Kerkof)',
    fillLevel: 65,
    lat: -7.2241,
    lng: 107.9056,
    type: 'plastic',
  },
  {
    id: 'bin-garut-006',
    name: 'RSU dr. Slamet Public Access',
    fillLevel: 82,
    lat: -7.2198,
    lng: 107.892,
    type: 'general',
  },
  {
    id: 'bin-garut-007',
    name: 'Sentra Kuliner Cimanuk',
    fillLevel: 35,
    lat: -7.2085,
    lng: 107.9072,
    type: 'organic',
  },
  {
    id: 'bin-garut-008',
    name: 'IBC (Intan Business Center)',
    fillLevel: 78,
    lat: -7.2144,
    lng: 107.898,
    type: 'paper',
  },
];

export const initialRouteSummary: RouteSummary = {
  distanceKm: 14.8,
  estimatedMinutes: 38,
  carbonSavedKg: 4.2,
};
```

---

### 3. Application Layout: [`src/App.tsx`](SmartEco-Route/src/App.tsx)

- **Header**: Displays `"Garut Smart Waste - Tech For Waste"` with real-time status telemetry indicators and action triggers.
- **Two-Column Responsive Layout**:
  - **Left Sidebar**: Total bin counters, critical bin indicators ($\ge 75\%$), estimated route KPIs, waste type & critical status filter controls, and interactive bin telemetry list.
  - **Right Main Container**: Map container ready for map library integration (Leaflet/Mapbox/OSM), telemetry coordinate overlays, node markers, and route status legends.
- **Code Quality**: Full TypeScript typing, explicit function return types (`JSX.Element`, `string`, etc.), and 100% compliant with ESLint rules.

---

### Verification
- Ran `npm run lint` & `npm run build` — both succeeded with 0 errors.



Ran command: `npm install leaflet @types/leaflet react-leaflet`
Viewed main.tsx:1-11
Created WasteMap.tsx
Created App.tsx
Viewed index.css:1-25
Created index.css
Ran command: `npm run lint && npm run build`
Used tool: manage_task
Used tool: manage_task

Leaflet interactive map integration is complete with dynamic fill-level indicators, markers, popups, and full TypeScript typing.

---

### 1. Installed Dependencies
Installed `leaflet`, `@types/leaflet`, and `react-leaflet`.

---

### 2. Map Component: [`src/components/WasteMap.tsx`](SmartEco-Route/src/components/WasteMap.tsx)

Key features:
- **Garut Centering**: Centered at coordinates `[-7.214, 107.902]` with default zoom `14`.
- **Dynamic Fill-Level Markers**:
  - $\ge 75\%$: **Red / Rose marker** with active pulsing ring (Critical - Needs Immediate Pickup).
  - $40\% - 74\%$: **Yellow / Amber marker** (Moderate Fill).
  - $< 40\%$: **Green / Emerald marker** (Low / Normal).
- **Interactive Popup**: Displays Bin Name, ID, Waste Category Badge, Capacity Fill Bar (%), Status Badge, and exact Coordinates.
- **Bi-directional Focus**: Selecting a bin from either the sidebar or the map smoothly focuses (`flyTo`) the camera on that marker.
- **Floating Telemetry Legend**: Bottom-left overlay showing the fill level thresholds.

```tsx
import { useEffect, type JSX } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BinLocation, WasteType } from '../types/waste';

export interface WasteMapProps {
  bins: BinLocation[];
  selectedBinId?: string | null;
  onSelectBin?: (binId: string) => void;
}

const GARUT_CENTER: [number, number] = [-7.214, 107.902];
const DEFAULT_ZOOM = 14;

function createBinIcon(fillLevel: number, isSelected: boolean): L.DivIcon {
  let colorClass = '#10b981'; // emerald (<40%)
  let pulseRing = '';
  let label = 'LOW';

  if (fillLevel >= 75) {
    colorClass = '#ef4444'; // rose/red (>=75%)
    pulseRing = 'animate-ping';
    label = 'CRITICAL';
  } else if (fillLevel >= 40) {
    colorClass = '#f59e0b'; // amber/yellow (40-74%)
    label = 'MODERATE';
  }

  const selectedRingStyle = isSelected
    ? 'border-2 border-white ring-4 ring-emerald-500 scale-110 shadow-lg'
    : 'border-2 border-white shadow-md hover:scale-110';

  const html = `
    <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200">
      ${
        fillLevel >= 75
          ? `<span class="absolute inline-flex h-8 w-8 rounded-full bg-rose-400 opacity-60 ${pulseRing}"></span>`
          : ''
      }
      <div style="background-color: ${colorClass};" class="relative z-10 flex flex-col items-center justify-center w-8 h-8 rounded-full text-white font-bold text-[10px] ${selectedRingStyle}">
        <span>${fillLevel}%</span>
      </div>
      <div class="absolute -bottom-1 z-20 px-1 py-0.2 bg-slate-900/90 text-[8px] font-bold text-white rounded shadow-xs tracking-wider">
        ${label}
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-bin-marker',
    html,
    iconSize: [32, 38],
    iconAnchor: [16, 24],
    popupAnchor: [0, -22],
  });
}

function MapController({ selectedBin }: { selectedBin?: BinLocation }): null {
  const map = useMap();

  useEffect(() => {
    if (selectedBin) {
      map.flyTo([selectedBin.lat, selectedBin.lng], 16, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedBin, map]);

  return null;
}

function getStatusBadge(fillLevel: number): { label: string; badgeClass: string } {
  if (fillLevel >= 75) {
    return {
      label: 'Critical - Needs Immediate Pickup',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    };
  }
  if (fillLevel >= 40) {
    return {
      label: 'Moderate Fill',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    };
  }
  return {
    label: 'Low / Normal',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };
}

function getTypeBadgeStyle(type: WasteType): string {
  switch (type) {
    case 'plastic':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'paper':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'organic':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'general':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export default function WasteMap({
  bins,
  selectedBinId,
  onSelectBin,
}: WasteMapProps): JSX.Element {
  const selectedBin = bins.find((b: BinLocation) => b.id === selectedBinId);

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 shadow-inner z-0">
      <MapContainer
        center={GARUT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className="w-full h-full"
        style={{ minHeight: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedBin={selectedBin} />

        {bins.map((bin: BinLocation) => {
          const isSelected = bin.id === selectedBinId;
          const status = getStatusBadge(bin.fillLevel);
          const icon = createBinIcon(bin.fillLevel, isSelected);

          return (
            <Marker
              key={bin.id}
              position={[bin.lat, bin.lng]}
              icon={icon}
              eventHandlers={{
                click: (): void => {
                  if (onSelectBin) {
                    onSelectBin(bin.id);
                  }
                },
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1 min-w-[210px] font-sans">
                  <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        {bin.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {bin.id}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border capitalize ${getTypeBadgeStyle(
                        bin.type
                      )}`}
                    >
                      {bin.type}
                    </span>
                  </div>

                  <div className="my-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-600">Capacity Fill:</span>
                      <span className="font-bold text-slate-900">{bin.fillLevel}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          bin.fillLevel >= 75
                            ? 'bg-rose-500'
                            : bin.fillLevel >= 40
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${bin.fillLevel}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex flex-col gap-1.5">
                    <span
                      className={`text-[11px] font-semibold px-2 py-1 rounded border text-center ${status.badgeClass}`}
                    >
                      {status.label}
                    </span>
                    <div className="text-[10px] text-slate-500 text-center font-mono">
                      {bin.lat.toFixed(5)}, {bin.lng.toFixed(5)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-slate-200/90 shadow-md text-xs pointer-events-auto">
        <span className="font-bold text-slate-800 block mb-1 text-[11px] uppercase tracking-wider">
          Telemetry Fill Level
        </span>
        <div className="flex flex-col gap-1 text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500 border border-white shadow-xs ring-1 ring-rose-200" />
            <span>&ge; 75% (Critical - Pickup Required)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500 border border-white shadow-xs ring-1 ring-amber-200" />
            <span>40% - 74% (Moderate)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 border border-white shadow-xs ring-1 ring-emerald-200" />
            <span>&lt; 40% (Low / Normal)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 3. Integrated into [`src/App.tsx`](SmartEco-Route/src/App.tsx) & Leaflet CSS in [`src/index.css`](SmartEco-Route/src/index.css)

- Rendered `WasteMap` inside the right column.
- Connected bin selection and category filters so clicking either the list item or marker synchronizes selection and triggers smooth map centering.
- Added CSS container styling and popup styling overrides in [`src/index.css`](SmartEco-Route/src/index.css).

---

### Verification
- Ran `npm run lint && npm run build` — both succeeded with **0 errors**, strict typing, and full ESLint compliance.

Viewed waste.ts:1-17
Created waste.ts
Created osrmService.ts
Created WasteMap.tsx
Created App.tsx
Ran command: `npm run lint && npm run build`
Viewed osrmService.ts:1-91
Edited osrmService.ts
Ran command: `npm run lint && npm run build`
Used tool: manage_task

OSRM Public API integration is complete, allowing real-time fetching and dynamic Leaflet polyline rendering of the optimal driving route for critical waste bins ($\ge 75\%$).

---

### 1. OSRM Service: [`src/services/osrmService.ts`](SmartEco-Route/src/services/osrmService.ts)

- **Endpoint**: `https://router.project-osrm.org/route/v1/driving/{coordinates}?overview=full&geometries=geojson`
- **Format Handling**: Automatically formats `WaypointCoordinate[]` (`{lat, lng}`) into OSRM's required `lng,lat;lng,lat;...` URL format.
- **Leaflet Coordinate Conversion**: Converts GeoJSON `[lng, lat]` returned by OSRM to Leaflet-compatible `[lat, lng]` pairs.
- **Eco Metrics**: Calculates distance in km, duration in minutes, and estimated carbon saved ($CO_2\text{ in kg} = \text{distance in km} \times 0.21$).
- **Robust Error Handling**: Handles network failures, empty routes, and timeouts via `AbortController`.

```typescript
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

export async function fetchOptimalRoute(
  waypoints: WaypointCoordinate[]
): Promise<OptimalRouteResult> {
  if (waypoints.length < 2) {
    throw new Error('At least 2 waypoints are required to generate a route.');
  }

  const coordinatesString = waypoints
    .map((wp: WaypointCoordinate) => `${wp.lng},${wp.lat}`)
    .join(';');

  const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
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

    const leafletCoordinates: [number, number][] = bestRoute.geometry.coordinates.map(
      ([lng, lat]: [number, number]): [number, number] => [lat, lng]
    );

    const distanceKm = Number((distanceMeters / 1000).toFixed(2));
    const durationMinutes = Math.round(durationSeconds / 60);
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
```

---

### 2. Polyline Renderer in Map: [`src/components/WasteMap.tsx`](SmartEco-Route/src/components/WasteMap.tsx)

- Accepts `routeCoordinates?: [number, number][]`.
- Renders high-visibility layered Leaflet `Polyline` with outer glow and vivid blue driving path.
- Automatically fits map bounds (`fitBounds`) to the route when calculated.

---

### 3. Route Generation UI & State: [`src/App.tsx`](SmartEco-Route/src/App.tsx)

- **Smart Route Trigger**: Action buttons in header and sidebar trigger `handleGenerateSmartRoute`.
- **Target Filtering**: Automatically targets bins with `fillLevel >= 75%`.
- **Dynamic Metrics**: Updates the estimated duration, total distance, and carbon saved ($CO_2$).
- **State Feedback**: Displays loading spinners during API calls, banner alerts for errors, and active route timestamps.

---

### Verification
- Ran `npm run lint && npm run build` — both succeeded with **0 errors**, strict typing, and full ESLint compliance.