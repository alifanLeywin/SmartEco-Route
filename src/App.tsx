import { useState, useMemo, type JSX } from 'react';
import { mockBins, initialRouteSummary } from './data/mockBins';
import type { BinLocation, WasteType, RouteSummary, WaypointCoordinate } from './types/waste';
import WasteMap from './components/WasteMap';
import { fetchOptimalRoute } from './services/osrmService';

export default function App(): JSX.Element {
  const [bins] = useState<BinLocation[]>(mockBins);
  const [selectedType, setSelectedType] = useState<WasteType | 'all'>('all');
  const [onlyCritical, setOnlyCritical] = useState<boolean>(false);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [routeSummary, setRouteSummary] = useState<RouteSummary>(initialRouteSummary);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeGeneratedAt, setRouteGeneratedAt] = useState<string | null>(null);

  const filteredBins = useMemo<BinLocation[]>(() => {
    return bins.filter((bin: BinLocation): boolean => {
      const matchesType = selectedType === 'all' || bin.type === selectedType;
      const matchesCritical = !onlyCritical || bin.fillLevel >= 75;
      return matchesType && matchesCritical;
    });
  }, [bins, selectedType, onlyCritical]);

  const criticalBins = useMemo<BinLocation[]>(() => {
    return bins.filter((bin: BinLocation): boolean => bin.fillLevel >= 75);
  }, [bins]);

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

  const handleSelectBin = (id: string): void => {
    setSelectedBinId((prev: string | null) => (prev === id ? null : id));
  };

  /**
   * Generates optimal smart route for critical bins (fillLevel >= 75%)
   * using the OSRM Public Routing API.
   */
  const handleGenerateSmartRoute = async (): Promise<void> => {
    if (criticalBins.length < 2) {
      setRouteError('At least 2 critical bins (fill >= 75%) are required to compute a route.');
      return;
    }

    setIsLoadingRoute(true);
    setRouteError(null);

    try {
      const waypoints: WaypointCoordinate[] = criticalBins.map((bin: BinLocation) => ({
        lat: bin.lat,
        lng: bin.lng,
      }));

      const result = await fetchOptimalRoute(waypoints);

      setRouteCoordinates(result.coordinates);
      setRouteSummary({
        distanceKm: result.distanceKm,
        estimatedMinutes: result.durationMinutes,
        carbonSavedKg: result.carbonSavedKg,
      });
      setRouteGeneratedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate optimal route.';
      setRouteError(message);
    } finally {
      setIsLoadingRoute(false);
    }
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
              OSRM Engine Connected
            </span>
            <button
              type="button"
              onClick={handleGenerateSmartRoute}
              disabled={isLoadingRoute}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {isLoadingRoute ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-white"
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
                  <span>Calculating Route...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Generate Smart Route</span>
                </>
              )}
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
                Needs Pickup Route
              </span>
            </div>

            <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-medium text-teal-600 uppercase tracking-wider block">
                Optimal Route
              </span>
              <span className="text-2xl font-bold text-teal-700 mt-1 block">
                {routeSummary.distanceKm}
                <span className="text-xs font-normal text-slate-500 ml-0.5">km</span>
              </span>
              <span className="text-[10px] text-teal-600/80 mt-0.5 block">
                ~{routeSummary.estimatedMinutes} mins • {routeSummary.carbonSavedKg} kg CO₂ saved
              </span>
            </div>
          </div>

          {/* Route Optimization Control & Status Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-xl p-4 shadow-md border border-emerald-800/60 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
                  OSRM Routing Engine
                </span>
                <h3 className="text-sm font-bold text-white">
                  Eco-Optimal Fleet Dispatch
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-semibold">
                {criticalCount} Pickup Nodes
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Calculates shortest road network path connecting all {criticalCount} bins with critical capacity (&ge;75%), reducing transit time and emissions.
            </p>

            {/* Error banner if any */}
            {routeError && (
              <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-600/60 text-xs text-rose-200 flex items-start gap-2">
                <span className="text-rose-400 font-bold">⚠️</span>
                <span>{routeError}</span>
              </div>
            )}

            {/* Active route info */}
            {routeGeneratedAt && !routeError && (
              <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-200 flex items-center justify-between">
                <span>✓ Active route calculated at {routeGeneratedAt}</span>
                <span className="font-semibold text-white">{routeCoordinates.length} waypoints</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerateSmartRoute}
              disabled={isLoadingRoute}
              className="w-full py-2 px-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoadingRoute ? 'Calculating Optimal Road Path...' : '⚡ Generate Smart Route for Critical Bins'}
            </button>
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
                  Live OpenStreetMap & OSRM Driving Engine • Garut Center (-7.214, 107.902)
                </p>
              </div>

              <div className="flex items-center gap-2">
                {routeCoordinates.length > 0 ? (
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                    OSRM Polyline ({routeCoordinates.length} pts)
                  </span>
                ) : (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono font-medium">
                    Standby Mode
                  </span>
                )}
              </div>
            </div>

            {/* Render WasteMap Component */}
            <WasteMap
              bins={filteredBins}
              selectedBinId={selectedBinId}
              onSelectBin={handleSelectBin}
              routeCoordinates={routeCoordinates}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
