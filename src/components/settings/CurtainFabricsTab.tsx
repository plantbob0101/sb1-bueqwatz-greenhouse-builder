import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CurtainFabric {
  fabric_id: string;
  fabric_name: string;
  fabric_type: 'Shade' | 'Blackout' | 'Insect Screen';
  energy_savings: number;
  shade_percentage: number;
  ventilation_reduction: number;
  width_size: number;
  price_0_5000: number;
  price_5000_20000: number;
  price_20000_plus: number;
  created_at: string;
}

const FABRIC_TYPES = [
  'Shade',
  'Blackout',
  'Insect Screen'
] as const;

export default function CurtainFabricsTab() {
  const [fabrics, setFabrics] = useState<CurtainFabric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFabric, setEditingFabric] = useState<CurtainFabric | null>(null);
  const [formData, setFormData] = useState<Partial<CurtainFabric>>({
    fabric_name: '',
    fabric_type: 'Shade',
    shade_percentage: 0,
    energy_savings: 0,
    ventilation_reduction: 0,
    width_size: [] as number[],
    price_0_5000: 0,
    price_5000_20000: 0,
    price_20000_plus: 0
  });

  useEffect(() => {
    loadFabrics();
  }, []);

  async function loadFabrics() {
    try {
      const { data, error } = await supabase
        .from('curtain_fabrics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFabrics(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load curtain fabrics');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingFabric) {
        const { error } = await supabase
          .from('curtain_fabrics')
          .update(formData)
          .eq('fabric_id', editingFabric.fabric_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('curtain_fabrics')
          .insert([formData]);

        if (error) throw error;
      }

      await loadFabrics();
      setShowForm(false);
      setEditingFabric(null);
      setFormData({
        fabric_name: '',
        fabric_type: 'Insect Screen',
        energy_savings: 0,
        shade_percentage: 0,
        ventilation_reduction: 0,
        width_size: 0,
        price_0_5000: 0,
        price_5000_20000: 0,
        price_20000_plus: 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save curtain fabric');
    }
  };

  const handleDelete = async (fabricId: string) => {
    if (!window.confirm('Are you sure you want to delete this curtain fabric?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('curtain_fabrics')
        .delete()
        .eq('fabric_id', fabricId);

      if (error) throw error;
      await loadFabrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete curtain fabric');
    }
  };

  const handleEdit = (fabric: CurtainFabric) => {
    setEditingFabric(fabric);
    setFormData(fabric);
    setShowForm(true);
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
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingFabric(null);
            setFormData({
              fabric_name: '',
              fabric_type: 'Shade',
              energy_savings: 0,
              shade_percentage: 0,
              ventilation_reduction: 0,
              width_size: [] as number[],
              price_0_5000: 0,
              price_5000_20000: 0,
              price_20000_plus: 0
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Curtain Fabric
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {showForm ? (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              {editingFabric ? 'Edit Curtain Fabric' : 'New Curtain Fabric'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingFabric(null);
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fabric Name
                </label>
                <input
                  type="text"
                  value={formData.fabric_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, fabric_name: e.target.value }))}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fabric Type
                </label>
                <select
                  value={formData.fabric_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, fabric_type: e.target.value as CurtainFabric['fabric_type'] }))}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {FABRIC_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Shade Percentage (%)
                </label>
                <input
                  type="number"
                  value={formData.shade_percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, shade_percentage: parseFloat(e.target.value) || 0 }))}
                  min={0}
                  max={100}
                  step={0.1}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Energy Savings (%)
                </label>
                <input
                  type="number"
                  value={formData.energy_savings}
                  onChange={(e) => setFormData(prev => ({ ...prev, energy_savings: parseFloat(e.target.value) || 0 }))}
                  min={0}
                  max={100}
                  step={0.1}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ventilation Reduction (%)
                </label>
                <input
                  type="number"
                  value={formData.ventilation_reduction}
                  onChange={(e) => setFormData(prev => ({ ...prev, ventilation_reduction: parseFloat(e.target.value) || 0 }))}
                  min={0}
                  max={100}
                  step={0.001}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Width Size (ft)
                </label>
                <input
                  type="text"
                  value={formData.width_size?.join(', ') || ''}
                  onChange={(e) => {
                    const input = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      width_size: input === '' ? [] : input.split(',')
                        .map(v => v.trim())
                        .filter(v => v !== '')
                        .map(v => {
                          const num = parseFloat(v);
                          return isNaN(num) ? null : num;
                        })
                        .filter((v): v is number => v !== null)
                    }));
                  }}
                  placeholder="Enter widths separated by commas (e.g., 11.8, 13.7)"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Price (0-5,000 sq ft)
                </label>
                <input
                  type="number"
                  value={formData.price_0_5000}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_0_5000: parseFloat(e.target.value) || 0 }))}
                  min={0}
                  step={0.001}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Price (5,000-20,000 sq ft)
                </label>
                <input
                  type="number"
                  value={formData.price_5000_20000}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_5000_20000: parseFloat(e.target.value) || 0 }))}
                  min={0}
                  step={0.001}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Price (20,000+ sq ft)
                </label>
                <input
                  type="number"
                  value={formData.price_20000_plus}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_20000_plus: parseFloat(e.target.value) || 0 }))}
                  min={0}
                  step={0.001}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingFabric(null);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                {editingFabric ? 'Save Changes' : 'Create Fabric'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-750">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Shade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Energy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vent.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Width</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price Range</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {fabrics.map((fabric) => (
                <tr key={fabric.fabric_id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{fabric.fabric_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{fabric.fabric_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{fabric.shade_percentage.toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{fabric.energy_savings.toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{fabric.ventilation_reduction.toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {fabric.width_size.map(w => Number(w).toFixed(1)).join(', ')} ft
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white space-y-1">
                      <div>0-5k: ${fabric.price_0_5000.toFixed(3)}</div>
                      <div>5k-20k: ${fabric.price_5000_20000.toFixed(3)}</div>
                      <div>20k+: ${fabric.price_20000_plus.toFixed(3)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(fabric)}
                      className="text-emerald-500 hover:text-emerald-400 mr-4"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fabric.fabric_id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}