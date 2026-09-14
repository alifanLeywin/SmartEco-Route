import { useEffect, type JSX } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { BinLocation, WasteType } from '../types/waste';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icon URLs in Vite/Webpack environments
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Override the default prototype icon paths to avoid broken 404 images
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export interface WasteMapProps {
  bins: BinLocation[];
  selectedBinId?: string | null;
  onSelectBin?: (id: string) => void;
  routeCoordinates?: [number, number][];
}

// Center coordinate for Garut City Center
const GARUT_CENTER: [number, number] = [-7.214, 107.902];
const DEFAULT_ZOOM = 14;

// Dynamic SVG Marker creator with 3D puffy clay glow
function createBinIcon(fillLevel: number, isSelected: boolean): L.DivIcon {
  let color = '#10b981'; // Green (Low)
  let shadowColor = 'rgba(16, 185, 129, 0.4)';

  if (fillLevel >= 75) {
    color = '#f43f5e'; // Pink / Rose (Critical)
    shadowColor = 'rgba(244, 63, 94, 0.5)';
  } else if (fillLevel >= 40) {
    color = '#f59e0b'; // Amber (Moderate)
    shadowColor = 'rgba(245, 158, 11, 0.4)';
  }

  const pulseEffect = fillLevel >= 75 ? 'animate-bounce' : '';
  const scaleEffect = isSelected ? 'scale-125' : 'hover:scale-110';

  const html = `
    <div class="relative flex items-center justify-center transition-all duration-300 ${scaleEffect} ${pulseEffect}">
      <div 
        style="
          background: ${color};
          border: 3px solid #ffffff;
          box-shadow: 0 8px 16px ${shadowColor}, inset 2px 2px 4px rgba(255,255,255,0.8), inset -2px -2px 4px rgba(0,0,0,0.2);
          border-color: ${isSelected ? '#6366f1' : '#ffffff'};
        "
        class="w-10 h-10 rounded-2xl flex flex-col items-center justify-center text-white font-extrabold text-[10px] tracking-tighter"
      >
        <span>${fillLevel}%</span>
      </div>
      ${
        fillLevel >= 75
          ? `<span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 border border-white"></span>
            </span>`
          : ''
      }
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-bin-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

function getStatusBadge(fillLevel: number): { label: string; badgeClass: string } {
  if (fillLevel >= 75) {
    return {
      label: 'Critical - Immediate Pickup Required',
      badgeClass: 'clay-badge-red text-rose-700',
    };
  }
  if (fillLevel >= 40) {
    return {
      label: 'Moderate - Monitor Fill Rate',
      badgeClass: 'clay-badge-yellow text-amber-700',
    };
  }
  return {
    label: 'Optimal - Regular Capacity',
    badgeClass: 'clay-badge-green text-emerald-700',
  };
}

function getTypeBadgeStyle(type: WasteType): string {
  switch (type) {
    case 'plastic':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case 'paper':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'organic':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'general':
      return 'bg-amber-100 text-amber-800 border-amber-200';
  }
}

// Controller component to automatically pan and fit bounds
function MapController({
  selectedBin,
  routeCoordinates,
}: {
  selectedBin?: BinLocation;
  routeCoordinates?: [number, number][];
}): null {
  const map = useMap();

  useEffect(() => {
    if (selectedBin) {
      map.flyTo([selectedBin.lat, selectedBin.lng], 16, { duration: 1.2 });
    }
  }, [selectedBin, map]);

  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 1) {
      const bounds = L.latLngBounds(routeCoordinates);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [routeCoordinates, map]);

  return null;
}

export default function WasteMap({
  bins,
  selectedBinId,
  onSelectBin,
  routeCoordinates,
}: WasteMapProps): JSX.Element {
  const selectedBin = bins.find((b: BinLocation) => b.id === selectedBinId);

  return (
    <div className="relative w-full h-[520px] clay-map-frame z-0">
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
            {/* Outer polyline shadow glow */}
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#6366f1',
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
                color: '#4f46e5',
                weight: 5,
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
                <div className="p-3 min-w-[220px] font-sans">
                  {/* Bin Header */}
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {bin.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {bin.id}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border capitalize ${getTypeBadgeStyle(
                        bin.type
                      )}`}
                    >
                      {bin.type}
                    </span>
                  </div>

                  {/* Fill Level Meter */}
                  <div className="my-2.5">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-600">Capacity Fill:</span>
                      <span className="font-extrabold text-slate-900">{bin.fillLevel}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all ${
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
                      className={`text-[10px] font-bold px-2 py-1 rounded-full text-center ${status.badgeClass}`}
                    >
                      {status.label}
                    </span>
                    <div className="text-[10px] text-slate-400 text-center font-mono">
                      {bin.lat.toFixed(5)}, {bin.lng.toFixed(5)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend Overlay – Clay Card */}
      <div className="absolute bottom-4 left-4 z-[1000] p-3.5 clay-card-white pointer-events-auto max-w-xs">
        <span className="font-extrabold text-slate-800 block mb-2 text-[11px] uppercase tracking-wider">
          Telemetry & Routing Legend
        </span>
        <div className="flex flex-col gap-1.5 text-slate-600 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500 shadow-sm" />
            <span>&ge; 75% (Critical - Pickup Required)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500 shadow-sm" />
            <span>40% - 74% (Moderate)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
            <span>&lt; 40% (Low / Normal)</span>
          </div>
          {routeCoordinates && routeCoordinates.length > 0 && (
            <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100">
              <span className="h-2 w-4 rounded-full bg-indigo-600 inline-block" />
              <span className="text-indigo-600 font-bold">OSRM Active Driving Path</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
