import { useState, type JSX } from 'react';
import type { RouteSummary } from '../types/waste';

export interface ImpactChartProps {
  routeSummary: RouteSummary;
  totalBinsCount: number;
  criticalBinsCount: number;
}

type ChartMetricMode = 'distance' | 'emissions' | 'efficiency';

export default function ImpactChart({
  routeSummary,
  totalBinsCount,
  criticalBinsCount,
}: ImpactChartProps): JSX.Element {
  const [metricMode, setMetricMode] = useState<ChartMetricMode>('distance');
  const [timeframe, setTimeframe] = useState<'today' | 'weekly'>('today');

  // Baseline metrics
  const baselineDistanceKm = Math.max(12.5, Number((routeSummary.distanceKm * 1.85).toFixed(1)));
  const smartDistanceKm = Math.max(1.2, routeSummary.distanceKm);
  const distanceSaved = Number((baselineDistanceKm - smartDistanceKm).toFixed(1));
  const distanceReductionPct = Math.round(((baselineDistanceKm - smartDistanceKm) / baselineDistanceKm) * 100);

  const baselineCo2Kg = Number((baselineDistanceKm * 0.171).toFixed(2));
  const smartCo2Kg = Math.max(0.1, Number((smartDistanceKm * 0.171).toFixed(2)));
  const co2SavedKg = Math.max(0.2, Number((baselineCo2Kg - smartCo2Kg).toFixed(2)));
  const co2ReductionPct = Math.round(((baselineCo2Kg - smartCo2Kg) / baselineCo2Kg) * 100);

  // 7-day mock bars for the 3D clay cylinder chart (matching reference image)
  const weeklyData = [
    { day: 'M', value: 45, label: 'Mon' },
    { day: 'T', value: 65, label: 'Tue' },
    { day: 'W', value: 88, label: 'Wed' },
    { day: 'T', value: 72, label: 'Thu' },
    { day: 'F', value: 95, label: 'Fri' },
    { day: 'S', value: 60, label: 'Sat' },
    { day: 'S', value: 80, label: 'Sun' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* ── 1. Top Section Header with Clay Selector Pills ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <div className="clay-squircle clay-squircle-purple h-9 w-9 text-white font-bold text-sm">
            📊
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Impact & Analytics</h3>
            <p className="text-xs text-slate-500">Environmental fleet diagnostics</p>
          </div>
        </div>

        {/* Clay Dropdown / Pill Switchers (styled like "Outcome v" and "Weekly v") */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMetricMode(metricMode === 'distance' ? 'emissions' : 'distance')}
            className="clay-pill text-slate-700 hover:text-indigo-600 cursor-pointer"
          >
            <span>{metricMode === 'distance' ? '🛣️ Distance' : '🌱 Emissions'}</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </button>
          <button
            type="button"
            onClick={() => setTimeframe(timeframe === 'today' ? 'weekly' : 'today')}
            className="clay-pill text-slate-700 hover:text-indigo-600 cursor-pointer"
          >
            <span>{timeframe === 'today' ? 'Today' : 'Weekly'}</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </button>
        </div>
      </div>

      {/* ── 2. Primary Clay Hero Chart Card (Matching "Outcome Transactions" Card) ── */}
      <div className="clay-card-purple p-6 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
        {/* Subtle decorative background glow circles */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-900/30 rounded-full blur-xl pointer-events-none -ml-8 -mb-8" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-lg font-bold text-white tracking-tight">
              {metricMode === 'distance' ? 'Route Distance Analysis' : 'CO₂ Emission Prevention'}
            </h4>
            <span className="clay-pill-dark px-3 py-1 text-xs font-bold">
              {distanceReductionPct}% Saved
            </span>
          </div>
          <p className="text-xs text-indigo-100/80">
            {timeframe === 'today' ? 'Live Telemetry • Garut Central Sector' : 'Weekly Average • 7 Days Trend'}
          </p>
        </div>

        {/* ── 3D Cylindrical Clay Bars (Identical to reference image) ── */}
        <div className="relative z-10 py-6 my-auto">
          <div className="flex items-end justify-between gap-3 h-36 px-3">
            {weeklyData.map((item, idx) => {
              // Calculate dynamic height based on metric mode
              const barHeightPct =
                metricMode === 'distance'
                  ? Math.min(100, Math.max(25, item.value))
                  : Math.min(100, Math.max(30, item.value * 0.9));

              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                  <div className="relative w-full flex justify-center items-end h-32">
                    <div
                      className={`clay-bar-cylinder w-4 sm:w-5 group-hover:scale-110 transition-transform ${
                        idx === 4 ? 'ring-2 ring-white/60' : ''
                      }`}
                      style={{ height: `${barHeightPct}%` }}
                    >
                      {/* Top glossy cap */}
                      <div className="w-full h-3 rounded-full bg-white/50 absolute top-0 left-0 blur-[0.5px]" />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-200 group-hover:text-white transition-colors">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Chart Footer Pill Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-3 pt-3 border-t border-white/15">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-pink-400 shadow-sm shadow-pink-500/50" />
            <span className="text-xs text-indigo-100">
              Smart Route: <strong className="text-white font-bold">{smartDistanceKm} km</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="h-2.5 w-2.5 rounded-full bg-white/40 shadow-sm" />
            <span className="text-xs text-indigo-100">
              Traditional: <strong className="text-white font-bold">{baselineDistanceKm} km</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. History / Breakdown List (Matching bottom list in reference image) ── */}
      <div className="clay-card-white p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="font-bold text-slate-800 text-sm">Efficiency Metrics</h4>
          <span className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
            View Details
          </span>
        </div>

        {/* List Item 1: Distance Reduction */}
        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="clay-squircle clay-squircle-pink h-11 w-11 text-white text-base">
              🚗
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">Distance Avoided</div>
              <div className="text-xs text-slate-400">Route path optimization</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-extrabold text-rose-500">-{distanceSaved} km</div>
            <div className="text-[11px] font-semibold text-slate-400">{distanceReductionPct}% cut</div>
          </div>
        </div>

        {/* List Item 2: CO2 Prevention */}
        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="clay-squircle clay-squircle-green h-11 w-11 text-white text-base">
              🌱
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">CO₂ Prevented</div>
              <div className="text-xs text-slate-400">Greenhouse gas reduction</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-extrabold text-emerald-600">-{co2SavedKg} kg</div>
            <div className="text-[11px] font-semibold text-slate-400">{co2ReductionPct}% cleaner</div>
          </div>
        </div>

        {/* List Item 3: Operational Time Saved */}
        <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="clay-squircle clay-squircle-purple h-11 w-11 text-white text-base">
              ⏱️
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">Fleet Drive Time</div>
              <div className="text-xs text-slate-400">
                {criticalBinsCount} target bins ({totalBinsCount} total)
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-extrabold text-indigo-600">
              {routeSummary.estimatedMinutes} mins
            </div>
            <div className="text-[11px] font-semibold text-emerald-600">Optimized</div>
          </div>
        </div>
      </div>
    </div>
  );
}
