import React, { useState } from 'react';
import {
  LayoutDashboard,
  Settings,
  Users,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from './auth/AuthProvider';

interface SidebarProps {
  currentView: 'dashboard' | 'settings';
  onViewChange: (view: 'dashboard' | 'settings') => void;
}

const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {
  const { signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' as const },
    { icon: Settings, label: 'Settings', view: 'settings' as const },
    { icon: Users, label: 'Shared Projects' },
    { icon: HelpCircle, label: 'Help' },
  ];

  return (
    <div className="flex w-full md:w-auto">
      <aside className="w-full md:w-64 bg-gray-800 p-4 flex flex-col">
        <nav className="flex-1">
          <ul className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => item.view && onViewChange(item.view)}
                  className={`whitespace-nowrap flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    currentView === item.view
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <button
          onClick={signOut}
          className="hidden md:flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </aside>
    </div>
  );
};

export default Sidebar;