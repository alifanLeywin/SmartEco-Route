import { useState, useMemo, type JSX } from 'react';
import { mockBins, initialRouteSummary } from './data/mockBins';
import type { BinLocation, WasteType, RouteSummary } from './types/waste';

export default function App(): JSX.Element {
  const [bins] = useState<BinLocation[]>(mockBins);
  const [selectedType, setSelectedType] = useState<WasteType | 'all'>('all');
  const [onlyCritical, setOnlyCritical] = useState<boolean>(false);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [routeSummary] = useState<RouteSummary>(initialRouteSummary);

  const filteredBins = useMemo<BinLocation[]>(() => {
    return bins.filter((bin: BinLocation): boolean => {
      const matchesType = selectedType === 'all' || bin.type === selectedType;
      const matchesCritical = !onlyCritical || bin.fillLevel >= 75;
      return matchesType && matchesCritical;
    });
  }, [bins, selectedType, onlyCritical]);

  const criticalCount = useMemo<number>(() => {
    return bins.filter((bin: BinLocation): boolean => bin.fillLevel >= 75).length;
  }, [bins]);

  const getFillBadgeClass = (fillLevel: number): string => {
    if (fillLevel >= 80) return 'bg-rose-100 text-rose-700 border-rose-200';
    if (fillLevel >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const getFillBarColor = (fillLevel: number): string => {
    if (fillLevel >= 80) return 'bg-rose-500';
    if (fillLevel >= 60) return 'bg-amber-500';
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

  const selectedBin = useMemo<BinLocation | undefined>(() => {
    return bins.find((bin: BinLocation) => bin.id === selectedBinId);
  }, [bins, selectedBinId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-bold text-lg">
              ♻️
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                Garut Smart Waste - Tech For Waste
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Real-time Route & Sensor Telemetry Dashboard • Garut Regency
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live Telemetry Active
            </span>
            <button
              type="button"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              Generate Optimized Route
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Two-Column Responsive Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sidebar for controls & analytics (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-5 order-2 lg:order-1">
          {/* Analytics Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Total Bins
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                {bins.length}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                All monitoring points
              </span>
            </div>

            <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-medium text-rose-600 uppercase tracking-wider block">
                Critical (&ge;75%)
              </span>
              <span className="text-2xl font-bold text-rose-600 mt-1 block">
                {criticalCount}
              </span>
              <span className="text-[10px] text-rose-400 mt-0.5 block">
                Immediate dispatch
              </span>
            </div>

            <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-medium text-teal-600 uppercase tracking-wider block">
                Est. Route
              </span>
              <span className="text-2xl font-bold text-teal-700 mt-1 block">
                {routeSummary.distanceKm}
                <span className="text-xs font-normal text-slate-500 ml-0.5">km</span>
              </span>
              <span className="text-[10px] text-teal-600/80 mt-0.5 block">
                ~{routeSummary.estimatedMinutes} mins ({routeSummary.carbonSavedKg} kg CO2 saved)
              </span>
            </div>
          </div>

          {/* Controls & Filter Panel */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">
                Filters & Monitoring Controls
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
                      onClick={(): void => setSelectedType(type)}
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
                htmlFor="critical-toggle"
                className="text-xs font-medium text-slate-700 cursor-pointer select-none"
              >
                Highlight Critical Fill Only (&ge;75%)
              </label>
              <input
                id="critical-toggle"
                type="checkbox"
                checked={onlyCritical}
                onChange={(e): void => setOnlyCritical(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Bin List Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                Garut City Bins Telemetry
              </h3>
              <span className="text-xs text-slate-400">Click bin to view details</span>
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
                      onClick={(): void =>
                        setSelectedBinId(isSelected ? null : bin.id)
                      }
                      onKeyDown={(e): void => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedBinId(isSelected ? null : bin.id);
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

        {/* Right Column: Main container for map (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4 order-1 lg:order-2">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col min-h-[580px]">
            {/* Map Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Interactive Fleet Route & Sensor Map
                </h2>
                <p className="text-xs text-slate-500">
                  Geographical view centered around Garut City Center (-7.216, 107.901)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono font-medium">
                  Garut Core Sector
                </span>
              </div>
            </div>

            {/* Map Viewport Area (Container for map integration like Leaflet/Mapbox/OSM) */}
            <div className="relative flex-1 bg-slate-900 rounded-lg overflow-hidden my-3 border border-slate-800 flex flex-col items-center justify-center p-6 text-white min-h-[420px]">
              {/* Background decorative grid/map styling */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(#10b981 1px, transparent 1px), radial-gradient(#38bdf8 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                  backgroundPosition: '0 0, 16px 16px',
                }}
              />

              {/* Simulated Map Markers and Routing Path */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between">
                {/* Top overlay telemetry badge */}
                <div className="flex items-center justify-between w-full">
                  <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                    <span className="text-emerald-400 font-semibold mr-1">GPS Center:</span>
                    Lat -7.2100° • Lng 107.8950°
                  </div>
                  <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                    <span>{criticalCount} Overfilled Bins Alert</span>
                  </div>
                </div>

                {/* Map Center Display / Marker Network Representation */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-auto py-6">
                  {filteredBins.slice(0, 8).map((bin: BinLocation) => {
                    const isSelected = bin.id === selectedBinId;
                    const isCritical = bin.fillLevel >= 75;
                    return (
                      <button
                        key={bin.id}
                        type="button"
                        onClick={(): void => setSelectedBinId(bin.id)}
                        className={`p-3 rounded-lg border text-left transition-all backdrop-blur-sm cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/90 border-emerald-400 ring-2 ring-emerald-400/50 scale-102'
                            : isCritical
                            ? 'bg-slate-950/80 border-rose-500/50 hover:border-rose-400'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono text-slate-400">
                            {bin.id.replace('bin-garut-', 'ID-')}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isCritical
                                ? 'bg-rose-900/80 text-rose-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {bin.fillLevel}%
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {bin.name}
                        </p>
                        <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                          {bin.type}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom map status & route indicator */}
                <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
                    <span className="text-slate-300">
                      Smart Eco-Routing Path active: <strong>{routeSummary.distanceKm} km</strong> across Garut
                    </span>
                  </div>
                  {selectedBin ? (
                    <span className="text-emerald-400 font-medium">
                      Focused: {selectedBin.name} ({selectedBin.fillLevel}% filled)
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">
                      Select any node to view routing waypoint
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Map Legend & Footer details */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-700">Fill Legend:</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Normal (&lt;60%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  Moderate (60-74%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  Critical (&ge;75%)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-mono">
                  Garut Routing Engine v1.0
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
