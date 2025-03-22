import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import SettingsPage from './settings/SettingsPage';

export default function AppLayout() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col md:flex-row">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-auto w-full">
        {currentView === 'dashboard' ? <Dashboard /> : <SettingsPage />}
      </main>
    </div>
  );
}