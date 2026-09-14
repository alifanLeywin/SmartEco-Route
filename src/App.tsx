import { useState, useMemo, type JSX } from 'react';
import { mockBins, initialRouteSummary } from './data/mockBins';
import type { BinLocation, WasteType, RouteSummary } from './types/waste';
import WasteMap from './components/WasteMap';

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

  const handleSelectBin = (id: string): void => {
    setSelectedBinId((prev: string | null) => (prev === id ? null : id));
  };

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
                ~{routeSummary.estimatedMinutes} mins ({routeSummary.carbonSavedKg} kg CO2)
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
              <span className="text-xs text-slate-400">Click bin to focus on map</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
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
                      onClick={(): void => handleSelectBin(bin.id)}
                      onKeyDown={(e): void => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSelectBin(bin.id);
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
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col">
            {/* Map Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Interactive Fleet Route & Sensor Map
                </h2>
                <p className="text-xs text-slate-500">
                  Geographical view centered around Garut City Center (-7.214, 107.902)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono font-medium">
                  Garut Center Zone
                </span>
              </div>
            </div>

            {/* Render WasteMap Component */}
            <WasteMap
              bins={filteredBins}
              selectedBinId={selectedBinId}
              onSelectBin={handleSelectBin}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
