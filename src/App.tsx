import { useState, useMemo, type JSX } from 'react';
import { mockBins, initialRouteSummary } from './data/mockBins';
import type { BinLocation, WasteType, RouteSummary, WaypointCoordinate } from './types/waste';
import WasteMap from './components/WasteMap';
import SidebarControls from './components/SidebarControls';
import ImpactChart from './components/ImpactChart';
import { fetchOptimalRoute } from './services/osrmService';

export default function App(): JSX.Element {
  const [bins, setBins] = useState<BinLocation[]>(mockBins);
  const [selectedType, setSelectedType] = useState<WasteType | 'all'>('all');
  const [onlyCritical, setOnlyCritical] = useState<boolean>(false);
  const [selectedBinId, setSelectedBinId] = useState<string | null>(null);
  const [routeSummary, setRouteSummary] = useState<RouteSummary>(initialRouteSummary);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeGeneratedAt, setRouteGeneratedAt] = useState<string | null>(null);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);

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

  /**
   * Simulates 5 hours passing by realistically increasing fill levels,
   * or resetting emptied bins to simulate collection cycles.
   */
  const handleSimulateTimePassing = (): void => {
    setBins((prevBins: BinLocation[]) => {
      return prevBins.map((bin: BinLocation) => {
        // If bin was already very full (>=90%), simulate 30% chance it got collected, otherwise fill further
        if (bin.fillLevel >= 90 && Math.random() > 0.6) {
          return {
            ...bin,
            fillLevel: Math.floor(Math.random() * 20) + 10, // emptied to 10-30%
          };
        }

        // Random accumulation increment between +12% and +28%
        const increment = Math.floor(Math.random() * 17) + 12;
        const newFillLevel = Math.min(100, bin.fillLevel + increment);

        return {
          ...bin,
          fillLevel: newFillLevel,
        };
      });
    });

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSimulationNotice(`Simulated +5 hours at ${timeString}: Waste accumulation updated across Garut sectors.`);
    setRouteError(null);
  };

  const handleResetSimulation = (): void => {
    setBins(mockBins);
    setRouteCoordinates([]);
    setRouteSummary(initialRouteSummary);
    setRouteGeneratedAt(null);
    setRouteError(null);
    setSimulationNotice('Simulation reset to initial telemetry values.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header with Tech For Waste Branding */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-bold text-lg">
              ♻️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                  Garut Smart Waste
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                  Tech For Waste
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                AI & IoT-Driven Municipal Fleet Optimization • Garut Regency
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
              onClick={handleSimulateTimePassing}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>🎲</span>
              <span>+5h Sim</span>
            </button>
            <button
              type="button"
              onClick={(): void => {
                void handleGenerateSmartRoute();
              }}
              disabled={isLoadingRoute || criticalBins.length < 2}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
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
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Generate Smart Route</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Two-Column Responsive Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Modular Sidebar Controls & Telemetry (5 cols) */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <SidebarControls
            bins={bins}
            filteredBins={filteredBins}
            selectedBinId={selectedBinId}
            onSelectBin={handleSelectBin}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            onlyCritical={onlyCritical}
            onToggleCritical={setOnlyCritical}
            routeSummary={routeSummary}
            isLoadingRoute={isLoadingRoute}
            onGenerateSmartRoute={handleGenerateSmartRoute}
            onSimulateTimePassing={handleSimulateTimePassing}
            onResetSimulation={handleResetSimulation}
            routeError={routeError}
            routeGeneratedAt={routeGeneratedAt}
            simulationNotice={simulationNotice}
          />
        </div>

        {/* Right Column: Interactive Map & Impact Chart (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-2">
          {/* Map Card */}
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
                    OSRM Polyline Active ({routeCoordinates.length} nodes)
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

          {/* Environmental Impact & Routing Efficiency Comparison Chart */}
          <ImpactChart
            routeSummary={routeSummary}
            totalBinsCount={bins.length}
            criticalBinsCount={criticalBins.length}
          />
        </section>
      </main>
    </div>
  );
}
