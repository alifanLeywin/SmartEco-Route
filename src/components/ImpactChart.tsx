import type { JSX } from 'react';
import type { RouteSummary } from '../types/waste';

export interface ImpactChartProps {
  routeSummary: RouteSummary;
  totalBinsCount: number;
  criticalBinsCount: number;
}

export default function ImpactChart({
  routeSummary,
  totalBinsCount,
  criticalBinsCount,
}: ImpactChartProps): JSX.Element {
  // Baseline traditional route assumption (visiting all bins sequentially without dynamic optimization)
  const traditionalDistanceKm = Number((totalBinsCount * 3.4).toFixed(1)); // ~27.2 km for 8 bins
  const traditionalEmissionsKg = Number((traditionalDistanceKm * 0.21).toFixed(2)); // ~5.71 kg CO2

  const smartDistanceKm = routeSummary.distanceKm > 0 ? routeSummary.distanceKm : 14.8;
  const smartEmissionsKg = Number((smartDistanceKm * 0.21).toFixed(2));

  const distanceDifferenceKm = Math.max(0, Number((traditionalDistanceKm - smartDistanceKm).toFixed(1)));
  const emissionsSavedKg = Math.max(0, Number((traditionalEmissionsKg - smartEmissionsKg).toFixed(2)));
  const percentSaved = Math.round(((traditionalDistanceKm - smartDistanceKm) / traditionalDistanceKm) * 100);

  const maxDistance = Math.max(traditionalDistanceKm, smartDistanceKm) * 1.15;
  const maxEmissions = Math.max(traditionalEmissionsKg, smartEmissionsKg) * 1.15;

  const traditionalDistPercent = Math.min(100, Math.round((traditionalDistanceKm / maxDistance) * 100));
  const smartDistPercent = Math.min(100, Math.round((smartDistanceKm / maxDistance) * 100));

  const traditionalEmitPercent = Math.min(100, Math.round((traditionalEmissionsKg / maxEmissions) * 100));
  const smartEmitPercent = Math.min(100, Math.round((smartEmissionsKg / maxEmissions) * 100));

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col gap-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Environmental Impact & Routing Efficiency
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              -{percentSaved}% Emissions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparing conventional fixed routing vs. Smart IoT-triggered OSRM dynamic routing
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Target Focus
          </span>
          <span className="text-xs font-bold text-slate-700">
            {criticalBinsCount} of {totalBinsCount} Bins Active
          </span>
        </div>
      </div>

      {/* Metric Cards Comparison Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Distance Reduction
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-extrabold text-emerald-600">
              -{distanceDifferenceKm}
            </span>
            <span className="text-xs font-semibold text-slate-500">km saved</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            From {traditionalDistanceKm} km down to {smartDistanceKm} km
          </span>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Carbon Prevented ($CO_2$)
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-extrabold text-teal-600">
              -{emissionsSavedKg}
            </span>
            <span className="text-xs font-semibold text-slate-500">kg prevented</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Based on 0.21 kg $CO_2$/km diesel factor
          </span>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Fleet Fuel Efficiency
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-extrabold text-indigo-600">
              +{percentSaved}%
            </span>
            <span className="text-xs font-semibold text-slate-500">efficiency gain</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Eliminates empty-bin collection stops
          </span>
        </div>
      </div>

      {/* Visual Comparative Progress Bars Chart */}
      <div className="flex flex-col gap-4 pt-1">
        {/* Metric 1: Distance Comparison */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Total Route Distance (km)</span>
            <span className="font-mono text-slate-500 text-[11px]">
              Traditional: {traditionalDistanceKm} km | Smart: {smartDistanceKm} km
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-slate-500 w-24">Traditional:</span>
              <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-slate-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${traditionalDistPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-600 w-14 text-right">
                {traditionalDistanceKm} km
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-emerald-700 w-24">Smart Route:</span>
              <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${smartDistPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 w-14 text-right">
                {smartDistanceKm} km
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: CO2 Emissions Comparison */}
        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">$CO_2$ Emissions Generated (kg)</span>
            <span className="font-mono text-slate-500 text-[11px]">
              Traditional: {traditionalEmissionsKg} kg | Smart: {smartEmissionsKg} kg
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium text-slate-500 w-24">Traditional:</span>
              <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-rose-300 h-full rounded-full transition-all duration-700"
                  style={{ width: `${traditionalEmitPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-semibold text-slate-600 w-14 text-right">
                {traditionalEmissionsKg} kg
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-teal-700 w-24">Smart Route:</span>
              <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${smartEmitPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-teal-700 w-14 text-right">
                {smartEmissionsKg} kg
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
