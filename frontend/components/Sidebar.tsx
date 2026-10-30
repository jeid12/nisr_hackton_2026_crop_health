import React, { useEffect, useState } from 'react';
import { Sprout, Activity, Database, LogOut, Menu, X, Wheat, Leaf } from 'lucide-react';
import { API_BASE } from '@/lib/theme';

type ApiState = 'checking' | 'online' | 'offline';

const SECTIONS = [
  {
    title: 'Monitoring',
    items: [
      { id: 'simulator', label: 'Risk Simulator', icon: Activity },
      { id: 'analytics', label: 'Telemetry & NISR Data', icon: Database },
    ],
  },
];

export default function Sidebar({
  activeTab, setActiveTab, username, onLogout,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  username: string;
  onLogout: () => void;
}) {
  const [api, setApi] = useState<ApiState>('checking');
  const [open, setOpen] = useState(false);

  // Poll the health endpoint so the sidebar shows whether the backend is reachable.
  useEffect(() => {
    let cancelled = false;
    const check = () =>
      fetch(`${API_BASE}/api/v1/health`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then(() => !cancelled && setApi('online'))
        .catch(() => !cancelled && setApi('offline'));
    check();
    const id = setInterval(check, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const select = (id: string) => {
    setActiveTab(id);
    setOpen(false);
  };

  const apiDot = api === 'online' ? 'bg-emerald-400' : api === 'offline' ? 'bg-rose-400' : 'bg-field-200';
  const apiText = api === 'online' ? 'API online' : api === 'offline' ? 'API offline' : 'Checking API';

  const content = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-field-500 text-white shadow-inner">
          <Sprout className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-base font-semibold tracking-tight text-white">CropHealth EWS</p>
          <p className="text-[11px] text-field-200">NISR 2026 · Musanze</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 px-3">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-field-200/70">{section.title}</p>
            <div className="space-y-1">
              {section.items.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => select(id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                      active
                        ? 'bg-white/15 text-white shadow-inner'
                        : 'text-field-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="rounded-lg bg-white/10 p-3 text-[11px] leading-relaxed text-field-100">
          <p className="flex items-center gap-1.5 font-semibold text-white">
            <Wheat className="h-3.5 w-3.5" /> Season A 2026
          </p>
          <p className="mt-1">Late Blight and Early Blight forecasts for smallholder potato and tomato plots.</p>
        </div>
      </nav>

      {/* Footer: API status and session */}
      <div className="space-y-3 border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-2 text-xs text-field-100">
          <span className={`h-2 w-2 rounded-full ${apiDot}`} />
          {apiText}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soil-200 text-xs font-bold uppercase text-field-900">
              {username.charAt(0) || '?'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{username}</p>
              <p className="text-[10px] text-field-200">Field officer</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-md p-2 text-field-100 transition hover:bg-white/10 hover:text-white"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-field-900 px-4 py-3 text-white lg:hidden">
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold">CropHealth EWS</span>
        </div>
        <button type="button" onClick={() => setOpen((o) => !o)} className="rounded-md p-1.5 hover:bg-white/10" aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-field-900 lg:block">{content}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-field-900 shadow-xl">{content}</aside>
        </div>
      )}
    </>
  );
}
