import React, { useEffect, useState } from 'react';
import {
  Thermometer, Droplets, Wind, Waves, Send, AlertTriangle, CheckCircle2, XCircle,
  RefreshCw, Smartphone, MapPin, Signal, Info,
} from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { SimulationResponse, DiseaseRiskDetail } from '@/types';
import { API_BASE, CHART, toneFor } from '@/lib/theme';

type IconType = React.ComponentType<{ className?: string }>;

const PRESETS = [
  { id: 'crisis', label: 'Rwaza Marshland Mist (Crisis)', temp: 16.8, hum: 96, wet: 0.95, soil: 78, stratum: 1, dur: 10 },
  { id: 'warm', label: 'Nkotsi Warm-Wet Trigger', temp: 25.2, hum: 84, wet: 0.7, soil: 58, stratum: 0, dur: 8 },
  { id: 'safe', label: 'Sunny Afternoon (Safe)', temp: 26.5, hum: 42, wet: 0.0, soil: 42, stratum: 0, dur: 0 },
];

// Icon + label + colored dot: status is never conveyed by color alone.
function TierChip({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-800">
      <span className="h-2 w-2 rounded-full" style={{ background: toneFor(color) }} />
      {label}
    </span>
  );
}

function KpiCard({ title, value, sub, children }: { title: string; value: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums text-slate-900">{value}</span>
        {children}
      </div>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function Slider({
  icon: Icon, label, valueText, min, max, step, value, onChange, hints,
}: {
  icon: IconType; label: string; valueText: string; min: number; max: number; step: number;
  value: number; onChange: (v: number) => void; hints?: string[];
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          <Icon className="h-3.5 w-3.5 text-slate-500" /> {label}
        </span>
        <span className="font-mono font-semibold tabular-nums text-slate-900">{valueText}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer accent-field-700"
      />
      {hints && (
        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
          {hints.map((h) => <span key={h}>{h}</span>)}
        </div>
      )}
    </div>
  );
}

function RiskGauge({ detail, pathogen, scientific, title }: { detail: DiseaseRiskDetail; pathogen: string; scientific: string; title: string }) {
  const tone = toneFor(detail.status_color);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{pathogen}</p>
          <h4 className="text-base font-semibold text-slate-900">{title}</h4>
          <p className="text-xs italic text-slate-500">{scientific}</p>
        </div>
        <TierChip color={detail.status_color} label={detail.risk_tier} />
      </div>

      <div className="relative mt-2 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="72%" innerRadius="75%" outerRadius="100%"
            startAngle={180} endAngle={0} barSize={14} data={[{ name: title, value: detail.probability }]}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar dataKey="value" cornerRadius={7} fill={tone} background={{ fill: CHART.track }} isAnimationActive={false} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <div className="text-3xl font-semibold tabular-nums text-slate-900">{detail.probability.toFixed(1)}%</div>
          <div className="text-[11px] text-slate-500">Outbreak probability</div>
        </div>
      </div>

      <div className="mt-3 flex gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span><span className="font-semibold text-slate-900">Recommended action: </span>{detail.action_protocol}</span>
      </div>
    </div>
  );
}

export default function SimulatorConsole() {
  const [temp, setTemp] = useState(17.2);
  const [humidity, setHumidity] = useState(94.0);
  const [leafWetness, setLeafWetness] = useState(0.85);
  const [soilMoisture, setSoilMoisture] = useState(74.0);
  const [wetnessDuration, setWetnessDuration] = useState(9.0);
  const [stratum, setStratum] = useState(1);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [farmer, setFarmer] = useState('Mr. Burenti (Rwaza Marshland)');
  const [phone, setPhone] = useState('+250788123456');
  const [sendingSms, setSendingSms] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}/api/v1/predict/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        temp_c: temp,
        humidity_pct: humidity,
        leaf_wetness_norm: leafWetness,
        soil_moisture_pct: soilMoisture,
        wetness_duration_12h: wetnessDuration,
        stratum_type: stratum,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: SimulationResponse) => {
        if (!cancelled) {
          setResult(data);
          setApiError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setApiError(`Cannot reach the simulation API at ${API_BASE} (${err.message}).`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [temp, humidity, leafWetness, soilMoisture, wetnessDuration, stratum]);

  // Auto-dismiss the delivery toast.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setActivePreset(p.id);
    setTemp(p.temp);
    setHumidity(p.hum);
    setLeafWetness(p.wet);
    setSoilMoisture(p.soil);
    setStratum(p.stratum);
    setWetnessDuration(p.dur);
  };

  const handleDispatchSMS = async () => {
    if (!result) return;
    setSendingSms(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/alerts/dispatch-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer_name: farmer,
          phone_number: phone,
          sector: stratum === 1 ? 'Rwaza' : 'Nkotsi',
          sms_message: result.kinyarwanda_sms,
          risk_probability: result.late_blight.probability,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const receipt = await res.json();
      setToast({ ok: true, text: `Delivered to ${receipt.recipient} · Receipt ${receipt.dispatch_id}` });
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'unknown error';
      setToast({ ok: false, text: `Dispatch failed (${reason}). Check the API connection.` });
    } finally {
      setSendingSms(false);
    }
  };

  const lb = result?.late_blight;
  const eb = result?.early_blight;

  return (
    <div className="space-y-6">
      {/* Page header with scenario presets */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Risk Simulator</h1>
          <p className="mt-1 text-sm text-slate-500">
            Adjust micro-climate inputs to see the dual-pathogen outbreak forecast. Baseline: NISR SAS 2026 Season A, Musanze.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                activePreset === p.id
                  ? 'border-slate-900 bg-field-700 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {apiError && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{apiError} Start the backend with <code className="font-mono">python app.py</code>.</span>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Late Blight risk"
          value={lb ? `${lb.probability.toFixed(1)}%` : '—'}
          sub="Phytophthora infestans"
        >
          {lb && <TierChip color={lb.status_color} label={lb.risk_tier} />}
        </KpiCard>
        <KpiCard
          title="Early Blight risk"
          value={eb ? `${eb.probability.toFixed(1)}%` : '—'}
          sub="Alternaria solani"
        >
          {eb && <TierChip color={eb.status_color} label={eb.risk_tier} />}
        </KpiCard>
        <KpiCard title="Dew duration (12h)" value={`${wetnessDuration} h`} sub="Continuous foliar wetness" />
        <KpiCard
          title="Agro-stratum"
          value={stratum === 1 ? 'Rwaza' : 'Nkotsi'}
          sub={stratum === 1 ? 'Mukungwa wetland' : 'Volcanic hillside'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Controls */}
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Micro-climate inputs</h2>
            {loading && <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />}
          </div>

          <Slider
            icon={Thermometer} label="Air temperature" valueText={`${temp.toFixed(1)} °C`}
            min={10} max={32} step={0.5} value={temp} onChange={setTemp}
            hints={['10°C', '18°C optimum', '32°C']}
          />
          <Slider
            icon={Droplets} label="Relative humidity" valueText={`${humidity.toFixed(0)} %`}
            min={30} max={100} step={1} value={humidity} onChange={setHumidity}
            hints={['30%', '85% threshold', '100%']}
          />
          <Slider
            icon={Wind} label="Foliar leaf wetness" valueText={`${(leafWetness * 100).toFixed(0)} %`}
            min={0} max={1} step={0.05} value={leafWetness} onChange={setLeafWetness}
          />
          <Slider
            icon={Waves} label="Soil moisture (0–5 cm)" valueText={`${soilMoisture.toFixed(0)} %`}
            min={20} max={95} step={1} value={soilMoisture} onChange={setSoilMoisture}
            hints={['20%', '65% saturation', '95%']}
          />
          <Slider
            icon={Droplets} label="Dew duration (past 12 h)" valueText={`${wetnessDuration} h`}
            min={0} max={12} step={1} value={wetnessDuration} onChange={setWetnessDuration}
          />

          <div>
            <label htmlFor="stratum" className="mb-1.5 block text-xs font-medium text-slate-700">Agro-ecological stratum</label>
            <select
              id="stratum"
              value={stratum}
              onChange={(e) => setStratum(parseInt(e.target.value, 10))}
              className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-800"
            >
              <option value={1}>Rwaza — Mukungwa wetland (Stratum 2)</option>
              <option value={0}>Nkotsi — Volcanic hillside (Stratum 1)</option>
            </select>
          </div>
        </section>

        {/* Outputs */}
        <section className="space-y-6 xl:col-span-8">
          {result ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <RiskGauge detail={result.late_blight} pathogen="Pathogen 1" title="Late Blight (Kiniga)" scientific="Phytophthora infestans" />
                <RiskGauge detail={result.early_blight} pathogen="Pathogen 2" title="Early Blight" scientific="Alternaria solani" />
              </div>

              <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <div>
                  <p className="font-semibold text-slate-900">Epidemiological assessment</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{result.biological_diagnosis}</p>
                  <p className="mt-1 text-[11px] text-slate-400">Applied stratum: {result.stratum_applied}</p>
                </div>
              </div>

              {/* Feature-phone SMS console */}
              <div className="grid grid-cols-1 gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-5">
                <div className="space-y-3 md:col-span-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Farmer SMS dispatch</h3>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Signal className="h-3.5 w-3.5" /> SIM800L gateway · MTN Rwanda 2G
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-600">
                      Farmer
                      <input
                        type="text" value={farmer} onChange={(e) => setFarmer(e.target.value)}
                        className="rounded-md border border-slate-300 p-2 text-xs text-slate-900"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-600">
                      Phone number
                      <input
                        type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="rounded-md border border-slate-300 p-2 font-mono text-xs text-slate-900"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleDispatchSMS}
                    disabled={sendingSms}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-field-700 py-2.5 text-xs font-semibold text-white transition hover:bg-field-800 disabled:opacity-60"
                  >
                    {sendingSms ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Dispatch advisory
                  </button>
                  <p className="flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="h-3 w-3" /> Sent in Kinyarwanda, readable on basic feature phones.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <div className="mx-auto flex w-full max-w-[220px] flex-col rounded-[1.5rem] border-4 border-slate-800 bg-slate-100 p-3">
                    <div className="mb-2 flex items-center justify-center gap-1 text-[10px] font-medium text-slate-500">
                      <Smartphone className="h-3 w-3" /> Inbox
                    </div>
                    <div className="rounded-lg rounded-tl-none bg-white p-2.5 text-[11px] leading-snug text-slate-800 shadow-sm">
                      {result.kinyarwanda_sms}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">
              {apiError ? 'Waiting for the API…' : 'Running first simulation…'}
            </div>
          )}
        </section>
      </div>

      {/* Delivery confirmation toast */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-2 rounded-lg border p-3 text-xs shadow-lg ${
            toast.ok ? 'border-emerald-200 bg-white text-slate-800' : 'border-rose-200 bg-white text-rose-800'
          }`}
        >
          {toast.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
