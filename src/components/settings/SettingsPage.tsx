import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Loader2, AlertCircle, Building2, Fan, Table } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import PC8GlazingTab from './PC8GlazingTab';
import PolyGlazingTab from './PolyGlazingTab';
import StructureForm from './StructureForm';
import VentDrivesTab from './VentDrivesTab';
import RollupDropDrivesTab from './RollupDropDrivesTab';
import CurtainFabricsTab from './CurtainFabricsTab';
import GlazingRequirementsTab from './GlazingRequirementsTab';
import GlazingPanelRequirementsTab from './GlazingPanelRequirementsTab.tsx';

type Structure = Database['public']['Tables']['structures']['Row'];

type Tab = 'structures' | 'vent-drives' | 'rollup-drop-drives' | 'pc8-glazing' | 'poly-glazing' | 'curtain-fabrics' | 'glazing-requirements' | 'glazing-panel-requirements' | 'cooling' | 'heating';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'structures', label: 'Structures', icon: <Building2 className="w-4 h-4" /> },
  { id: 'vent-drives', label: 'Vent Drives', icon: <Fan className="w-4 h-4" /> },
  { id: 'rollup-drop-drives', label: 'Roll-up & Drop Drives', icon: <Fan className="w-4 h-4" /> },
  { id: 'pc8-glazing', label: 'PC8 & CPC Glazing', icon: <Building2 className="w-4 h-4" /> },
  { id: 'poly-glazing', label: 'Poly Glazing', icon: <Building2 className="w-4 h-4" /> },
  { id: 'curtain-fabrics', label: 'Curtain Fabrics', icon: <Building2 className="w-4 h-4" /> },
  { id: 'glazing-requirements', label: 'Glazing Requirements', icon: <Table className="w-4 h-4" /> },
  { id: 'glazing-panel-requirements', label: 'Glazing Panel Requirements', icon: <Table className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingStructure, setEditingStructure] = useState<Structure | null>(null);
  const [currentTab, setCurrentTab] = useState<Tab>('structures');

  useEffect(() => {
    loadStructures();
  }, []);

  async function loadStructures() {
    try {
      const { data, error } = await supabase
        .from('structures')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStructures(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load structures');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this structure? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('structures')
        .delete()
        .eq('structure_id', id);

      if (error) throw error;
      await loadStructures();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete structure');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SettingsIcon className="w-8 h-8 text-emerald-500" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
      </div>
      
      <div className="border-b border-gray-700">
        <nav className="flex gap-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
                currentTab === tab.id
                  ? 'text-emerald-500 border-emerald-500'
                  : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {currentTab === 'structures' && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              setEditingStructure(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Structure
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {showForm ? (
        <StructureForm
          structure={editingStructure}
          onSubmit={async () => {
            await loadStructures();
            setShowForm(false);
            setEditingStructure(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingStructure(null);
          }}
        />
      ) : currentTab === 'structures' ? (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-750">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Dimensions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Glazing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {structures.map((structure) => (
                <tr key={structure.structure_id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{structure.model}</div>
                    <div className="text-sm text-gray-400">{structure.load_rating}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Width:</span>{' '}
                        <span className="text-white">{structure.width}'</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Spacing:</span>{' '}
                        <span className="text-white">{structure.spacing}'</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Eave:</span>{' '}
                        <span className="text-white">{structure.eave_height}'</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {structure.roof_glazing}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {structure.created_at ? new Date(structure.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingStructure(structure);
                        setShowForm(true);
                      }}
                      className="text-emerald-500 hover:text-emerald-400 mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(structure.structure_id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : currentTab === 'vent-drives' ? (
        <VentDrivesTab />
      ) : currentTab === 'rollup-drop-drives' ? (
        <RollupDropDrivesTab />
      ) : currentTab === 'pc8-glazing' ? (
        <PC8GlazingTab />
      ) : currentTab === 'poly-glazing' ? (
        <PolyGlazingTab />
      ) : currentTab === 'curtain-fabrics' ? (
        <CurtainFabricsTab />
      ) : currentTab === 'glazing-requirements' ? (
        <GlazingRequirementsTab />
      ) : currentTab === 'glazing-panel-requirements' ? (
        <GlazingPanelRequirementsTab />
      ) : (
        <div className="text-center py-8 text-gray-400">
          Content for {currentTab} will be added soon
        </div>
      )}
    </div>
  );
}