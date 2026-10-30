import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LabelList,
} from 'recharts';
import { TelemetryTrendPoint, NISRBenchmarks, FeatureImportanceItem } from '@/types';
import { API_BASE, CHART, SERIES } from '@/lib/theme';

// Shared Y-axis width keeps the plot areas of stacked panels horizontally aligned.
const Y_WIDTH = 44;
const MARGIN = { top: 8, right: 16, left: 0, bottom: 0 };

const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
  fontSize: 12,
  color: '#0f172a',
};

function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-0.5 w-4"
            style={{ background: i.dashed ? 'none' : i.color, borderTop: i.dashed ? `2px dashed ${i.color}` : undefined }}
          />
          {i.label}
        </span>
      ))}
    </div>
  );
}

function Panel({ title, subtitle, legend, children }: { title: string; subtitle: string; legend?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        {legend}
      </div>
      {children}
    </div>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

export default function TelemetryCharts() {
  const [trends, setTrends] = useState<TelemetryTrendPoint[]>([]);
  const [benchmarks, setBenchmarks] = useState<NISRBenchmarks | null>(null);
  const [importance, setImportance] = useState<FeatureImportanceItem[]>([]);
  const [sector, setSector] = useState<'Rwaza' | 'Nkotsi'>('Rwaza');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    fetch(`${API_BASE}/api/v1/analytics/trends?hours=48&sector=${sector}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => setTrends(d.data || []))
      .catch((err) => setError(`Telemetry unavailable (${err.message}).`));

    fetch(`${API_BASE}/api/v1/analytics/nisr-benchmarks`)
      .then((r) => r.json())
      .then(setBenchmarks)
      .catch(() => setError('NISR benchmarks unavailable.'));

    fetch(`${API_BASE}/api/v1/analytics/feature-importance`)
      .then((r) => r.json())
      .then(setImportance)
      .catch(() => setError('Feature importances unavailable.'));
  }, [sector]);

  const rhAbove85 = trends.filter((t) => t.humidity_pct >= 85).length;
  const meanTemp = trends.length ? trends.reduce((s, t) => s + t.temp_c, 0) / trends.length : 0;
  const peakRisk = trends.length ? Math.max(...trends.map((t) => t.late_blight_risk)) : 0;
  const xTick = (t: string) => t.slice(5, 16);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Telemetry & NISR Data</h1>
          <p className="mt-1 text-sm text-slate-500">
            48-hour field observations (NASA POWER, Musanze) alongside official NISR SAS 2026 Season A baselines.
          </p>
        </div>
        <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 text-xs font-medium">
          {(['Rwaza', 'Nkotsi'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSector(s)}
              className={`rounded px-3 py-1.5 transition ${sector === s ? 'bg-field-700 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {s === 'Rwaza' ? 'Rwaza · Wetland' : 'Nkotsi · Hillside'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>
      )}

      {/* KPI summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label="Readings at ≥85% RH" value={`${rhAbove85} / ${trends.length}`} note="Pathogen humidity threshold" />
        <Kpi label="Mean air temperature" value={`${meanTemp.toFixed(1)} °C`} note="Compare with 18 °C Late Blight optimum" />
        <Kpi label="Peak 24h risk index" value={peakRisk.toFixed(2)} note="Cumulative risk, model feature" />
      </div>

      {/* Synchronized micro-climate panels */}
      <Panel
        title="Micro-climate dynamics (48 h)"
        subtitle="Three aligned panels share one time axis. Each has its own scale so units are never mixed."
      >
        <div className="space-y-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="timestamp" hide />
                <YAxis width={Y_WIDTH} domain={[0, 100]} tick={{ fill: CHART.tick, fontSize: 11 }} unit="%" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => String(l)} />
                <ReferenceLine y={85} stroke={SERIES.neutral}strokeDasharray="4 4" label={{ value: '85% RH threshold', position: 'insideTopRight', fill: CHART.tick, fontSize: 10 }} />
                <Line type="monotone" dataKey="humidity_pct" name="Humidity" stroke={SERIES.humidity} strokeWidth={2} dot={false}  isAnimationActive={false} />
                <Line type="monotone" dataKey="soil_moisture_pct" name="Soil moisture" stroke={SERIES.soil} strokeWidth={2} dot={false}  isAnimationActive={false} />
                <Line type="monotone" dataKey="leaf_wetness_pct" name="Leaf wetness" stroke={SERIES.neutral} strokeWidth={1.5} strokeDasharray="5 3" dot={false}  isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Legend
            items={[
              { label: 'Relative humidity (%)', color: SERIES.humidity },
              { label: 'Soil moisture (%)', color: SERIES.soil },
              { label: 'Leaf wetness (%)', color: SERIES.neutral, dashed: true },
            ]}
          />
        </div>

        <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="timestamp" tickFormatter={xTick} tick={{ fill: CHART.tick, fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis width={Y_WIDTH} domain={['auto', 'auto']} tick={{ fill: CHART.tick, fontSize: 11 }} unit="°" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine y={18} stroke={SERIES.neutral} strokeDasharray="4 4" label={{ value: '18 °C incubation optimum', position: 'insideTopRight', fill: CHART.tick, fontSize: 10 }} />
                <Line type="monotone" dataKey="temp_c" name="Temperature" stroke={SERIES.temperature} strokeWidth={2} dot={false}  isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Legend items={[{ label: 'Air temperature (°C)', color: SERIES.temperature }]} />
        </div>

        <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                <XAxis dataKey="timestamp" tickFormatter={xTick} tick={{ fill: CHART.tick, fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={24} />
                <YAxis width={Y_WIDTH} tick={{ fill: CHART.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="late_blight_risk" name="Cumulative risk (24h)" stroke={SERIES.risk} fill={SERIES.risk} fillOpacity={0.15} strokeWidth={2}  isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <Legend items={[{ label: 'Cumulative risk index (24 h)', color: SERIES.risk }]} />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* NISR chemical adoption */}
        {benchmarks && (
          <Panel
            title="Musanze chemical distribution"
            subtitle="NISR SAS 2026 Table 30: share of treated plots by product"
          >
            <div className="mb-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Adopting pesticides</p>
                <p className="text-lg font-semibold text-slate-900">{benchmarks.pesticide_adoption.musanze_district_pct}%</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Plots treated</p>
                <p className="text-lg font-semibold text-slate-900">{benchmarks.pesticide_adoption.musanze_plots_treated_pct}%</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[11px] text-slate-500">Late blight products</p>
                <p className="text-lg font-semibold text-slate-900">32.1%</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarks.fungicide_distribution_musanze} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
                  <XAxis type="number" unit="%" tick={{ fill: CHART.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="chemical" width={190} tick={{ fill: '#334155', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="share_pct" name="Share of treated plots" fill={SERIES.humidity} radius={[0, 4, 4, 0]} barSize={16} isAnimationActive={false}>
                    <LabelList dataKey="share_pct" position="right" formatter={(v: number) => `${v}%`} style={{ fill: '#334155', fontSize: 11 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}

        {/* Feature importance */}
        <Panel
          title="Model feature importance"
          subtitle="Gini importance ranking, Random Forest trained on 7,032 hourly records"
        >
          <div className="space-y-3">
            {importance.map((item) => (
              <div key={item.feature}>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-800">{item.feature}</span>
                  <span className="font-mono font-semibold tabular-nums text-slate-900">{item.importance_pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(item.importance_pct / 34.1) * 100}%`, background: SERIES.humidity }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{item.biological_significance}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
