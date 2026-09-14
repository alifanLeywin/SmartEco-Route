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
