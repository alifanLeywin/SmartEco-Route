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

  const handleGenerateSmartRoute = async (): Promise<void> => {
    if (criticalBins.length < 2) {
      setRouteError('At least 2 critical bins (fill ≥ 75%) are required to compute an optimal route.');
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

  const handleSimulateTimePassing = (): void => {
    setBins((prevBins: BinLocation[]) => {
      return prevBins.map((bin: BinLocation) => {
        if (bin.fillLevel >= 90 && Math.random() > 0.6) {
          return {
            ...bin,
            fillLevel: Math.floor(Math.random() * 20) + 10,
          };
        }
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
    setSimulationNotice('Simulation reset to initial baseline values.');
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col font-sans pb-12">
      {/* ── Top Floating Navigation (Matching Dribbble Clay Mockup) ── */}
      <header className="px-4 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Menu / Brand Pill */}
          <div className="flex items-center gap-3">
            {/* 4-dot menu squircle icon like in reference image */}
            <div className="clay-card-white h-11 w-11 flex items-center justify-center text-slate-700 font-bold text-lg cursor-pointer hover:scale-105 transition-transform">
              <span className="grid grid-cols-2 gap-1 w-4 h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Garut Smart Waste
                </h1>
                <span className="clay-badge clay-badge-purple text-[10px] uppercase font-bold tracking-wider">
                  Tech For Waste
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Autonomous Route & Carbon Optimization
              </p>
            </div>
          </div>

          {/* Right Profile & Quick Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="clay-pill text-xs text-slate-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>OSRM Live</span>
              </span>
            </div>

            {/* Profile Avatar with Clay Ring */}
            <div className="clay-card-white h-11 w-11 p-0.5 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform">
              <div className="h-full w-full rounded-full bg-gradient-to-tr from-indigo-500 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Simulation Notification Banner ── */}
      {simulationNotice && (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 mb-4 w-full">
          <div className="clay-card-white p-3.5 flex items-center justify-between border-l-4 border-indigo-500 bg-indigo-50/40">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🕒</span>
              <span className="text-xs font-semibold text-indigo-900">{simulationNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setSimulationNotice(null)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-0.5 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Main Dashboard Layout ── */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Column: Sidebar Controls & Real-time Telemetry (5 cols) */}
          <div className="lg:col-span-5">
            <SidebarControls
              bins={bins}
              filteredBins={filteredBins}
              selectedBinId={selectedBinId}
              onSelectBin={handleSelectBin}
              selectedType={selectedType}
              onSelectType={setSelectedType}
              onlyCritical={onlyCritical}
              onToggleOnlyCritical={() => setOnlyCritical((prev) => !prev)}
              onGenerateRoute={() => {
                void handleGenerateSmartRoute();
              }}
              isLoadingRoute={isLoadingRoute}
              onSimulateTime={handleSimulateTimePassing}
              onResetSimulation={handleResetSimulation}
              routeSummary={routeSummary}
              routeGeneratedAt={routeGeneratedAt}
              routeError={routeError}
            />
          </div>

          {/* Right Column: Interactive Map & 3D Analytics Chart (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* 1. Map Section wrapped in Clay Map Frame */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="clay-squircle clay-squircle-green h-8 w-8 text-xs font-bold">
                    📍
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Garut City Center Telemetry</h2>
                    <p className="text-[11px] text-slate-400">
                      Live IoT Bin Sensors & Optimal Dispatch Polyline
                    </p>
                  </div>
                </div>
                <span className="clay-badge clay-badge-purple text-[10px]">
                  OSRM Connected
                </span>
              </div>

              {/* Interactive Waste Map */}
              <WasteMap
                bins={filteredBins}
                selectedBinId={selectedBinId}
                onSelectBin={handleSelectBin}
                routeCoordinates={routeCoordinates}
              />
            </div>

            {/* 2. 3D Clay Impact Chart Section */}
            <ImpactChart
              routeSummary={routeSummary}
              totalBinsCount={bins.length}
              criticalBinsCount={criticalBins.length}
            />
          </div>
        </div>
      </main>

      {/* ── Floating Mobile-Style Bottom Action Bar ── */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-6 px-7 py-3.5 clay-nav-float">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-indigo-200 transition-colors cursor-pointer"
        >
          <span>🏠</span>
          <span>Dashboard</span>
        </button>

        {/* Center Floating Raised Button */}
        <button
          type="button"
          onClick={() => {
            void handleGenerateSmartRoute();
          }}
          disabled={isLoadingRoute || criticalBins.length < 2}
          className="clay-btn-purple px-4 py-2 text-xs font-extrabold flex items-center gap-1.5 rounded-full shadow-lg"
        >
          <span>⚡</span>
          <span>{isLoadingRoute ? 'Routing...' : 'Smart Route'}</span>
        </button>

        <button
          type="button"
          onClick={handleSimulateTimePassing}
          className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-indigo-200 transition-colors cursor-pointer"
        >
          <span>🎲</span>
          <span>Simulate</span>
        </button>
      </div>
    </div>
  );
}
