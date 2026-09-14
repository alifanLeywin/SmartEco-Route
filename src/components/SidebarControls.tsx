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
  onToggleCritical: (value: boolean) => void;
  routeSummary: RouteSummary;
  isLoadingRoute: boolean;
  onGenerateSmartRoute: () => Promise<void>;
  onSimulateTimePassing: () => void;
  onResetSimulation?: () => void;
  routeError: string | null;
  routeGeneratedAt: string | null;
  simulationNotice: string | null;
}

export default function SidebarControls({
  bins,
  filteredBins,
  selectedBinId,
  onSelectBin,
  selectedType,
  onSelectType,
  onlyCritical,
  onToggleCritical,
  routeSummary,
  isLoadingRoute,
  onGenerateSmartRoute,
  onSimulateTimePassing,
  onResetSimulation,
  routeError,
  routeGeneratedAt,
  simulationNotice,
}: SidebarControlsProps): JSX.Element {
  const criticalBins = bins.filter((bin: BinLocation) => bin.fillLevel >= 75);
  const criticalCount = criticalBins.length;

  const getFillBadgeClass = (fillLevel: number): string => {
    if (fillLevel >= 75) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (fillLevel >= 40) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const getFillBarColor = (fillLevel: number): string => {
    if (fillLevel >= 75) return 'bg-rose-500';
    if (fillLevel >= 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getTypeBadgeClass = (type: WasteType): string => {
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
  };

  return (
    <section className="flex flex-col gap-5">
      {/* 4 Metric Cards Display */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
        {/* Metric 1: Total Bins */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Bins
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {bins.length}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Telemetry Monitored
          </span>
        </div>

        {/* Metric 2: Bins Needing Pickup */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
            Needing Pickup (&ge;75%)
          </span>
          <span className="text-2xl font-bold text-rose-600 mt-1 block">
            {criticalCount}
          </span>
          <span className="text-[10px] text-rose-400 mt-0.5 block">
            Critical Action Required
          </span>
        </div>

        {/* Metric 3: Total Route Distance */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider block">
            Route Distance
          </span>
          <span className="text-2xl font-bold text-teal-700 mt-1 block">
            {routeSummary.distanceKm}
            <span className="text-xs font-normal text-slate-500 ml-0.5">km</span>
          </span>
          <span className="text-[10px] text-teal-600/80 mt-0.5 block">
            ~{routeSummary.estimatedMinutes} mins transit
          </span>
        </div>

        {/* Metric 4: CO2 Prevented */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
            $CO_2$ Prevented
          </span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {routeSummary.carbonSavedKg}
            <span className="text-xs font-normal text-slate-500 ml-0.5">kg</span>
          </span>
          <span className="text-[10px] text-emerald-600/80 mt-0.5 block">
            Emissions offset
          </span>
        </div>
      </div>

      {/* Interactive Simulation Controls & OSRM Trigger Panel */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-xl p-4 shadow-md border border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Real-Time Fleet Simulation
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-emerald-300">
            Garut Live Telemetry
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Simulate real-time waste accumulation across Garut city bins, then compute the shortest OSRM driving route to minimize transit time and carbon footprint.
        </p>

        {/* Simulation Feedback Notification */}
        {simulationNotice && (
          <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-200 flex items-center justify-between animate-fadeIn">
            <span>{simulationNotice}</span>
            <span className="text-[10px] text-emerald-400 font-mono">Updated</span>
          </div>
        )}

        {/* Route Error Feedback */}
        {routeError && (
          <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-600/60 text-xs text-rose-200 flex items-start gap-2">
            <span className="text-rose-400 font-bold">⚠️</span>
            <span>{routeError}</span>
          </div>
        )}

        {/* Route Success Feedback */}
        {routeGeneratedAt && !routeError && (
          <div className="p-2.5 rounded-lg bg-teal-950/70 border border-teal-500/40 text-xs text-teal-200 flex items-center justify-between">
            <span>✓ Route optimized at {routeGeneratedAt}</span>
            <span className="font-semibold text-white">{criticalCount} critical stops</span>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {/* Button 1: Generate Smart Route */}
          <button
            type="button"
            onClick={(): void => {
              void onGenerateSmartRoute();
            }}
            disabled={isLoadingRoute || criticalCount < 2}
            className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            {isLoadingRoute ? (
              <>
                <svg
                  className="animate-spin h-3.5 w-3.5 text-slate-950"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Routing...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Generate Smart Route</span>
              </>
            )}
          </button>

          {/* Button 2: Simulate 5 Hours Passing */}
          <button
            type="button"
            onClick={onSimulateTimePassing}
            className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>🎲</span>
            <span>Simulate 5 Hours Passing</span>
          </button>
        </div>

        {onResetSimulation && (
          <button
            type="button"
            onClick={onResetSimulation}
            className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors text-center py-1 cursor-pointer"
          >
            ↺ Reset Bins to Default State
          </button>
        )}
      </div>

      {/* Filters & Monitoring Controls Panel */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">
            Filters & Category Controls
          </h2>
          <span className="text-xs text-slate-500">
            Showing {filteredBins.length} of {bins.length}
          </span>
        </div>

        {/* Waste Type Filter */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="waste-type-filter" className="text-xs font-medium text-slate-600">
            Waste Category
          </label>
          <div id="waste-type-filter" className="grid grid-cols-5 gap-1.5">
            {(['all', 'plastic', 'paper', 'organic', 'general'] as const).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={(): void => onSelectType(type)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all cursor-pointer text-center ${
                    selectedType === type
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {type}
                </button>
              )
            )}
          </div>
        </div>

        {/* Critical Filter Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <label
            htmlFor="critical-toggle-sidebar"
            className="text-xs font-medium text-slate-700 cursor-pointer select-none"
          >
            Highlight Critical Fill Only (&ge;75%)
          </label>
          <input
            id="critical-toggle-sidebar"
            type="checkbox"
            checked={onlyCritical}
            onChange={(e): void => onToggleCritical(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Bin List Telemetry Card */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">
            Garut City Bins Telemetry
          </h3>
          <span className="text-xs text-slate-400">Click bin to focus on map</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
          {filteredBins.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
              No bin locations match your current filter selection.
            </div>
          ) : (
            filteredBins.map((bin: BinLocation) => {
              const isSelected = bin.id === selectedBinId;
              return (
                <div
                  key={bin.id}
                  onClick={(): void => onSelectBin(bin.id)}
                  onKeyDown={(e): void => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectBin(bin.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer text-left ${
                    isSelected ? 'bg-emerald-50/60 ring-1 ring-inset ring-emerald-300' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {bin.name}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${getTypeBadgeClass(
                            bin.type
                          )}`}
                        >
                          {bin.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {bin.lat.toFixed(4)}, {bin.lng.toFixed(4)} • ID: {bin.id}
                      </p>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getFillBadgeClass(
                        bin.fillLevel
                      )}`}
                    >
                      {bin.fillLevel}%
                    </span>
                  </div>

                  {/* Fill Level Progress Bar */}
                  <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getFillBarColor(
                        bin.fillLevel
                      )}`}
                      style={{ width: `${bin.fillLevel}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
