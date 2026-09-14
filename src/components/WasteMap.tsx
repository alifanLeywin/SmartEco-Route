import { useEffect, type JSX } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BinLocation, WasteType } from '../types/waste';

export interface WasteMapProps {
  bins: BinLocation[];
  selectedBinId?: string | null;
  onSelectBin?: (binId: string) => void;
  routeCoordinates?: [number, number][];
}

const GARUT_CENTER: [number, number] = [-7.214, 107.902];
const DEFAULT_ZOOM = 14;

// Helper to generate dynamic styled DivIcon for each bin status
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

function MapController({
  selectedBin,
  routeCoordinates,
}: {
  selectedBin?: BinLocation;
  routeCoordinates?: [number, number][];
}): null {
  const map = useMap();

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 1) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, {
        padding: [40, 40],
        animate: true,
        duration: 1.0,
      });
    } else if (selectedBin) {
      map.flyTo([selectedBin.lat, selectedBin.lng], 16, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedBin, routeCoordinates, map]);

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
  routeCoordinates,
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

        <MapController selectedBin={selectedBin} routeCoordinates={routeCoordinates} />

        {/* OSRM Route Polyline Renderer */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <>
            {/* Outer polyline shadow/glow */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#0284c7', // Sky blue shadow glow
                weight: 8,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Main high-contrast route path */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#2563eb', // Vivid Blue line
                weight: 4.5,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* Bin Location Markers */}
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
                  {/* Bin Header */}
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

                  {/* Fill Level Meter */}
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

                  {/* Status Badge */}
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

      {/* Floating Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-slate-200/90 shadow-md text-xs pointer-events-auto">
        <span className="font-bold text-slate-800 block mb-1 text-[11px] uppercase tracking-wider">
          Telemetry & Routing Legend
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
          {routeCoordinates && routeCoordinates.length > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <span className="h-1.5 w-4 rounded-full bg-blue-600 inline-block" />
              <span className="text-blue-700 font-semibold">OSRM Active Driving Path</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
