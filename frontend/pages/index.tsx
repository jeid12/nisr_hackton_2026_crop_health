import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar';
import SimulatorConsole from '@/components/SimulatorConsole';
import TelemetryCharts from '@/components/TelemetryCharts';
import { clearSession, storedUsername, validateSession } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('simulator');
  const [username, setUsername] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  // Route guard: the dashboard only renders once the stored session is confirmed.
  useEffect(() => {
    validateSession().then((user) => {
      if (!user) {
        router.replace('/login');
        return;
      }
      setUsername(user);
      setChecked(true);
    });
  }, [router]);

  // Deep-link to a tab with ?tab=analytics (read after mount to avoid SSR mismatch).
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab === 'analytics' || tab === 'simulator') setActiveTab(tab);
  }, []);

  const logout = () => {
    clearSession();
    router.replace('/login');
  };

  if (!checked || !username) {
    return (
      <>
        <Head>
          <title>CropHealth EWS</title>
        </Head>
        <div className="flex min-h-screen items-center justify-center bg-soil-50 text-sm text-soil-700">
          {storedUsername() ? 'Checking your session…' : 'Redirecting to sign in…'}
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>CropHealth EWS · Dashboard</title>
      </Head>
      <div className="min-h-screen bg-soil-50">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} username={username} onLogout={logout} />
        <div className="lg:pl-64">
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            {activeTab === 'simulator' ? <SimulatorConsole /> : <TelemetryCharts />}
          </main>
        </div>
      </div>
    </>
  );
}
