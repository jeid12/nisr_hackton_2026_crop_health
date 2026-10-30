// Shared API address and chart palette.
// Series colors are the validated categorical slots (blue, orange, aqua) from the dataviz reference palette.
// Status colors are reserved for risk tiers and always appear with a label, never on color alone.

// Runtime config (public/config.js, written by the container at start) wins over the build-time variable.
const runtimeApi = typeof window !== 'undefined' ? (window as unknown as { CROPHEALTH_API_BASE?: string }).CROPHEALTH_API_BASE : '';
export const API_BASE = runtimeApi || process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

export const SERIES = {
  humidity: '#2a78d6',
  temperature: '#eb6834',
  soil: '#1baf7a',
  neutral: '#64748b',
  risk: '#1c5cab',
};

export const STATUS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
};

export const CHART = {
  grid: '#e2e8f0',
  tick: '#64748b',
  track: '#f1f5f9',
};

// Maps the backend's status_color (green | amber | red) to a status hex.
export const toneFor = (color: string): string =>
  color === 'red' ? STATUS.critical : color === 'amber' ? STATUS.warning : STATUS.good;
