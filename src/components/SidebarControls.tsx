import type { JSX } from 'react';
import type { BinLocation, WasteType, RouteSummary } from '../types/waste';

export interface SidebarControlsProps {
  bins: BinLocation[];
  filteredBins: BinLocation[];
  selectedBinId: string | null;
  onSelectBin: (id: string) => void;
  selectedType: WasteType | 'all';
  onSelectType: (type: WasteType | 'all') => void;
  onlyCritical: boolean;
  onToggleOnlyCritical: () => void;
  onGenerateRoute: () => void;
  isLoadingRoute: boolean;
  onSimulateTime: () => void;
  onResetSimulation: () => void;
  routeSummary: RouteSummary;
  routeGeneratedAt: string | null;
  routeError: string | null;
}

export default function SidebarControls({
  bins,
  filteredBins,
  selectedBinId,
  onSelectBin,
  selectedType,
  onSelectType,
  onlyCritical,
  onToggleOnlyCritical,
  onGenerateRoute,
  isLoadingRoute,
  onSimulateTime,
  onResetSimulation,
  routeSummary,
  routeGeneratedAt,
  routeError,
}: SidebarControlsProps): JSX.Element {
  const criticalCount = bins.filter((b) => b.fillLevel >= 75).length;
  const normalCount = bins.filter((b) => b.fillLevel < 40).length;

  const categories: Array<{
    type: WasteType | 'all';
    label: string;
    icon: string;
    squircleClass: string;
  }> = [
    { type: 'all', label: 'All Bins', icon: '🌐', squircleClass: 'clay-squircle-purple' },
    { type: 'plastic', label: 'Plastic', icon: '🧴', squircleClass: 'clay-squircle-cyan' },
    { type: 'paper', label: 'Paper', icon: '📦', squircleClass: 'clay-squircle-pink' },
    { type: 'organic', label: 'Organic', icon: '🌿', squircleClass: 'clay-squircle-green' },
    { type: 'general', label: 'General', icon: '🗑️', squircleClass: 'clay-squircle-amber' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. Hero Clay Card (Matching the Balance Card in reference photo) ── */}
      <div className="clay-card-purple p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl">
        {/* Background decorative soft circles */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-indigo-900/40 rounded-full blur-xl pointer-events-none" />

        {/* Card Header with Status Chip */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-indigo-200 tracking-wider">
              Fleet Optimization Status
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
              {routeSummary.distanceKm > 0 ? `${routeSummary.distanceKm} km` : 'Standby'}
            </div>
          </div>
          {/* Card Chip Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{criticalCount} Critical Bins</span>
          </div>
        </div>

        {/* Card Body Subtext */}
        <div className="relative z-10 my-4 py-2 border-y border-white/15 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-indigo-200 block text-[11px]">Est. Drive Time</span>
            <strong className="text-white text-sm font-bold">{routeSummary.estimatedMinutes} mins</strong>
          </div>
          <div className="text-right">
            <span className="text-indigo-200 block text-[11px]">CO₂ Prevented</span>
            <strong className="text-emerald-300 text-sm font-bold">-{routeSummary.carbonSavedKg} kg</strong>
          </div>
        </div>

        {/* Card Action Buttons (Chunky, Pressable Clay Buttons) */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-2.5 mt-1">
          <button
            type="button"
            onClick={onGenerateRoute}
            disabled={isLoadingRoute || criticalCount < 2}
            className="clay-btn clay-btn-purple flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2"
          >
            {isLoadingRoute ? (
              <>
                <span className="animate-spin text-base">⏳</span>
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <span className="text-base">⚡</span>
                <span>Generate Smart Route</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onSimulateTime}
            className="clay-btn py-3 px-4 text-slate-800 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-50"
          >
            <span>🎲</span>
            <span>+5 Hours</span>
          </button>
        </div>

        {routeGeneratedAt && (
          <div className="relative z-10 text-[11px] text-indigo-200 text-center mt-3">
            ✓ Last computed at {routeGeneratedAt} via OSRM
          </div>
        )}
      </div>

      {/* ── 2. Category Action Squircles (Direct match to Transfer, Pay Bill, Shop in reference) ── */}
      <div className="clay-card-white p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">Waste Categories</h3>
          <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer">
            {filteredBins.length} visible
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 pt-1">
          {categories.map((cat) => {
            const isSelected = selectedType === cat.type;
            return (
              <button
                key={cat.type}
                type="button"
                onClick={() => onSelectType(cat.type)}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div
                  className={`clay-squircle ${cat.squircleClass} h-12 w-12 text-xl transition-all ${
                    isSelected ? 'ring-3 ring-indigo-500 ring-offset-2 scale-105' : 'opacity-85 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  {cat.icon}
                </div>
                <span
                  className={`text-[11px] font-semibold text-center leading-tight truncate w-full ${
                    isSelected ? 'text-indigo-600 font-bold' : 'text-slate-500'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Filter Pill for Only Critical */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Critical Bins Priority (≥ 75%)</span>
          <button
            type="button"
            onClick={onToggleOnlyCritical}
            className={`clay-pill text-xs cursor-pointer ${onlyCritical ? 'clay-pill-active' : 'text-slate-600'}`}
          >
            <span>🚨 {onlyCritical ? 'Showing Critical' : 'Filter Critical'}</span>
          </button>
        </div>
      </div>

      {/* ── 3. Quick Stats Cards (Matching the clean white cards in reference image) ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="clay-card-white p-3.5 flex flex-col items-center text-center">
          <div className="clay-squircle clay-squircle-purple h-9 w-9 text-sm mb-1.5">
            📦
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Total</span>
          <strong className="text-lg font-extrabold text-slate-800">{bins.length}</strong>
        </div>

        <div className="clay-card-white p-3.5 flex flex-col items-center text-center">
          <div className="clay-squircle clay-squircle-pink h-9 w-9 text-sm mb-1.5">
            🚨
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Critical</span>
          <strong className="text-lg font-extrabold text-rose-500">{criticalCount}</strong>
        </div>

        <div className="clay-card-white p-3.5 flex flex-col items-center text-center">
          <div className="clay-squircle clay-squircle-green h-9 w-9 text-sm mb-1.5">
            ✅
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Normal</span>
          <strong className="text-lg font-extrabold text-emerald-600">{normalCount}</strong>
        </div>
      </div>

      {/* ── 4. Telemetry Error or Notice ── */}
      {routeError && (
        <div className="clay-card-white p-4 border-l-4 border-rose-500 flex items-start gap-3 bg-rose-50/50">
          <div className="clay-squircle clay-squircle-pink h-8 w-8 text-xs shrink-0">⚠️</div>
          <div>
            <h4 className="text-xs font-bold text-rose-800">Routing Notice</h4>
            <p className="text-xs text-rose-600 mt-0.5">{routeError}</p>
          </div>
        </div>
      )}

      {/* ── 5. Bins Monitoring Queue (Matching the Recent Transactions list) ── */}
      <div className="clay-card-white p-5 flex flex-col gap-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">Telemetry Queue</span>
            <span className="clay-badge clay-badge-purple text-[10px]">
              {filteredBins.length} Bins
            </span>
          </div>
          <button
            type="button"
            onClick={onResetSimulation}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Reset
          </button>
        </div>

        <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto pr-1">
          {filteredBins.map((bin) => {
            const isSelected = selectedBinId === bin.id;
            const isCritical = bin.fillLevel >= 75;
            const isModerate = bin.fillLevel >= 40 && bin.fillLevel < 75;

            const squircleStyle = isCritical
              ? 'clay-squircle-pink'
              : isModerate
              ? 'clay-squircle-amber'
              : 'clay-squircle-green';

            return (
              <button
                key={bin.id}
                type="button"
                onClick={() => onSelectBin(bin.id)}
                className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/80 ring-2 ring-indigo-400 shadow-sm'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`clay-squircle ${squircleStyle} h-10 w-10 text-sm shrink-0`}>
                    {bin.type === 'plastic' && '🧴'}
                    {bin.type === 'paper' && '📦'}
                    {bin.type === 'organic' && '🌿'}
                    {bin.type === 'general' && '🗑️'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{bin.name}</div>
                    <div className="text-[11px] text-slate-400 capitalize">{bin.type} sector</div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`clay-badge ${
                      isCritical
                        ? 'clay-badge-red'
                        : isModerate
                        ? 'clay-badge-yellow'
                        : 'clay-badge-green'
                    }`}
                  >
                    {bin.fillLevel}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
