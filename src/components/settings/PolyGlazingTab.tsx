import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PolyCompany {
  company_id: string;
  company_name: string;
  type: string;
  light_transmittance: number;
  light_diffusion: number;
  widths_available: string[];
  price_400lbs_less: number;
  price_401_2000lbs: number;
  price_2000lbs_plus: number;
  created_at: string;
}

export default function PolyGlazingTab() {
  const [companies, setCompanies] = useState<PolyCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<PolyCompany | null>(null);
  const [formData, setFormData] = useState<Partial<PolyCompany>>({
    company_name: '',
    type: '',
    light_transmittance: 0.0,
    light_diffusion: 0.0,
    widths_available: [],
    price_400lbs_less: 0.0,
    price_401_2000lbs: 0.0,
    price_2000lbs_plus: 0.0
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const { data, error } = await supabase
        .from('glazing_companies_poly')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Ensure all numeric values are valid
    const numericData = {
      ...formData,
      light_transmittance: Number(formData.light_transmittance) || 0,
      light_diffusion: Number(formData.light_diffusion) || 0,
      price_400lbs_less: Number(formData.price_400lbs_less) || 0,
      price_401_2000lbs: Number(formData.price_401_2000lbs) || 0,
      price_2000lbs_plus: Number(formData.price_2000lbs_plus) || 0
    };

    try {
      if (editingCompany) {
        const { error } = await supabase
          .from('glazing_companies_poly')
          .update(numericData)
          .eq('company_id', editingCompany.company_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('glazing_companies_poly')
          .insert([numericData]);

        if (error) throw error;
      }

      await loadCompanies();
      setShowForm(false);
      setEditingCompany(null);
      setFormData({
        company_name: '',
        type: '',
        light_transmittance: 0,
        light_diffusion: 0,
        widths_available: [],
        price_400lbs_less: 0,
        price_401_2000lbs: 0,
        price_2000lbs_plus: 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save company');
    }
  };

  const handleDelete = async (companyId: string) => {
    if (!window.confirm('Are you sure you want to delete this company?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('glazing_companies_poly')
        .delete()
        .eq('company_id', companyId);

      if (error) throw error;
      await loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete company');
    }
  };

  const handleEdit = (company: PolyCompany) => {
    setEditingCompany(company);
    setFormData(company);
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
            setEditingCompany(null);
            setFormData({
              company_name: '',
              type: '',
              light_transmittance: 0.0,
              light_diffusion: 0.0,
              widths_available: [],
              price_400lbs_less: 0.0,
              price_401_2000lbs: 0.0,
              price_2000lbs_plus: 0.0
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Poly
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
              {editingCompany ? 'Edit Company' : 'New Company'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingCompany(null);
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
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Type
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Light Transmittance
                </label>
                <input
                  type="number"
                  value={formData.light_transmittance}
                  onChange={(e) => setFormData(prev => ({ ...prev, light_transmittance: e.target.value ? parseFloat(e.target.value) : 0 }))}
                  min={0}
                  max={1}
                  step={0.01}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Light Diffusion
                </label>
                <input
                  type="number"
                  value={formData.light_diffusion}
                  onChange={(e) => setFormData(prev => ({ ...prev, light_diffusion: e.target.value ? parseFloat(e.target.value) : 0 }))}
                  min={0}
                  max={1}
                  step={0.01}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Available Widths
                </label>
                <input
                  type="text"
                  value={formData.widths_available?.join(', ')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    widths_available: e.target.value.split(',').map(w => w.trim())
                  }))}
                  placeholder="Enter widths separated by commas"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Price (400 lbs or less)
                </label>
                <input
                  type="number"
                  value={formData.price_400lbs_less}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_400lbs_less: e.target.value ? parseFloat(e.target.value) : 0 }))}
                  min={0}
                  step={0.001}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Price (401-2000 lbs)
                </label>
                <input
                  type="number"
                  value={formData.price_401_2000lbs}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_401_2000lbs: e.target.value ? parseFloat(e.target.value) : 0 }))}
                  min={0}
                  step={0.001}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Price (2000+ lbs)
                </label>
                <input
                  type="number"
                  value={formData.price_2000lbs_plus}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_2000lbs_plus: e.target.value ? parseFloat(e.target.value) : 0 }))}
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
                  setEditingCompany(null);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                {editingCompany ? 'Save Changes' : 'Create Company'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-750">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Light Trans.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Light Diff.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Widths</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price Range</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {companies.map((company) => (
                <tr key={company.company_id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{company.company_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{company.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{(company.light_transmittance * 100).toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{(company.light_diffusion * 100).toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{company.widths_available.join(', ')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white space-y-1">
                      <div>≤400 lbs: ${company.price_400lbs_less.toFixed(3)}</div>
                      <div>401-2000 lbs: ${company.price_401_2000lbs.toFixed(3)}</div>
                      <div>2000+ lbs: ${company.price_2000lbs_plus.toFixed(3)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(company)}
                      className="text-emerald-500 hover:text-emerald-400 mr-4"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(company.company_id)}
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