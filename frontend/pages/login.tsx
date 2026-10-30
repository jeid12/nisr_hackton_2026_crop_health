import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Sprout, Lock, User, Eye, EyeOff, AlertCircle, Loader2, Wheat, Droplets, ShieldCheck } from 'lucide-react';
import { login, validateSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in: skip the form.
  useEffect(() => {
    validateSession().then((user) => {
      if (user) router.replace('/');
    });
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign in · CropHealth EWS</title>
      </Head>
      <div className="grid min-h-screen grid-cols-1 bg-soil-50 lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden overflow-hidden bg-field-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:22px_22px]" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-field-500">
              <Sprout className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-semibold">CropHealth EWS</p>
              <p className="text-xs text-field-200">NISR 2026 Big Data Hackathon · Track 1</p>
            </div>
          </div>

          <div className="relative max-w-md space-y-6">
            <h1 className="text-4xl font-semibold leading-tight">Forecast blight before it reaches the field.</h1>
            <p className="text-field-100">
              Dual-pathogen early warning for Irish potato and tomato growers in Musanze. Late Blight and Early Blight
              risk is forecast from micro-climate telemetry and sent to farmers as Kinyarwanda SMS alerts.
            </p>
            <ul className="space-y-3 text-sm text-field-100">
              <li className="flex items-center gap-2"><Droplets className="h-4 w-4 text-emerald-300" /> Leaf wetness and humidity risk model</li>
              <li className="flex items-center gap-2"><Wheat className="h-4 w-4 text-emerald-300" /> NISR SAS 2026 Season A baselines</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Targeted spraying instead of calendar spraying</li>
            </ul>
          </div>

          <p className="relative text-xs text-field-200">Musanze District · Northern Province, Rwanda</p>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-field-700 text-white">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="font-semibold text-field-900">CropHealth EWS</span>
            </div>

            <h2 className="text-2xl font-semibold text-soil-900">Sign in</h2>
            <p className="mt-1 text-sm text-soil-700">Enter your field officer credentials to open the dashboard.</p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-soil-800">Username</span>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soil-700/60" />
                  <input
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-soil-200 bg-white py-2.5 pl-10 pr-3 text-sm text-soil-900 outline-none transition focus:border-field-600 focus:ring-2 focus:ring-field-200"
                    placeholder="admin"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-soil-800">Password</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soil-700/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-soil-200 bg-white py-2.5 pl-10 pr-10 text-sm text-soil-900 outline-none transition focus:border-field-600 focus:ring-2 focus:ring-field-200"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-soil-700/70 hover:text-soil-900"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-field-700 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-field-800 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] text-soil-700/80">
              Demo access for evaluators. Credentials are set by the backend environment.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
