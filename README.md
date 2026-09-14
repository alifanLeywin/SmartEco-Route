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