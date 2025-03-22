import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PC8Company {
  company_id: string;
  company_name: string;
  product: string;
  type: 'PC8' | 'CPC';
  light_transmittance: number;
  light_diffusion: number;
  width_size: string[]; // Array of strings like ["11.8", "13.7"]
  price_0_5000: number;
  price_5000_20000: number;
  price_20000_plus: number;
  created_at: string;
}

const GLAZING_TYPES = ['PC8', 'CPC'] as const;

export default function PC8GlazingTab() {
  const [companies, setCompanies] = useState<PC8Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<PC8Company | null>(null);
  const [formData, setFormData] = useState<Partial<PC8Company>>({
    company_name: '',
    product: '',
    type: 'PC8',
    light_transmittance: 0,
    light_diffusion: 0,
    width_size: [],
    price_0_5000: 0,
    price_5000_20000: 0,
    price_20000_plus: 0
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const { data, error } = await supabase
        .from('glazing_companies_pc8')
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

    try {
      if (editingCompany) {
        const { error } = await supabase
          .from('glazing_companies_pc8')
          .update(formData)
          .eq('company_id', editingCompany.company_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('glazing_companies_pc8')
          .insert([formData]);

        if (error) throw error;
      }

      await loadCompanies();
      setShowForm(false);
      setEditingCompany(null);
      setFormData({
        company_name: '',
        product: '',
        type: 'PC8',
        light_transmittance: 0,
        light_diffusion: 0,
        price_0_5000: 0,
        price_5000_10000: 0,
        price_10000_50000: 0,
        price_50000_plus: 0
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
        .from('glazing_companies_pc8')
        .delete()
        .eq('company_id', companyId);

      if (error) throw error;
      await loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete company');
    }
  };

  const handleEdit = (company: PC8Company) => {
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
              product: '',
              type: 'PC8',
              light_transmittance: 0.0,
              light_diffusion: 0.0,
              width_size: [],
              price_0_5000: 0.0,
              price_5000_20000: 0.0,
              price_20000_plus: 0.0
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Polycarbonate
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
                  Product
                </label>
                <input
                  type="text"
                  value={formData.product || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'PC8' | 'CPC' }))}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {GLAZING_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Light Transmittance
                </label>
                <input
                  type="text"
                  value={formData.light_transmittance}
                  onChange={(e) => setFormData(prev => ({ ...prev, light_transmittance: parseFloat(e.target.value) || 0 }))}
                  min={0}
                  max={1}
                  step={0.01}
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
                    }));
                  }}
                  placeholder="Enter widths separated by commas (e.g., 11.8, 13.7)"
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
                  Price (0-5000 sq ft)
                </label>
                <input
                  type="number"
                  value={formData.price_0_5000}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_0_5000: e.target.value ? parseFloat(e.target.value) : 0 }))}
                  min={0}
                  step={0.01}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Price (5000-20000 sq ft)
                </label>
                <input
                  type="number"
                  value={formData.price_5000_20000}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_5000_20000: e.target.value ? parseFloat(e.target.value) : 0 }))}
                  min={0}
                  step={0.01}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Price (20000+ sq ft)
                </label>
                <input
                  type="number"
                  value={formData.price_20000_plus}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_20000_plus: e.target.value ? parseFloat(e.target.value) : 0 }))}
                  min={0}
                  step={0.01}
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
                {editingCompany ? 'Save Changes' : 'Create Polycarbonate'}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Light Trans.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Light Diff.</th>
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
                    <div className="text-sm text-white">{company.product || '-'}</div>
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
                    <div className="text-sm text-white">{company.width_size.join(', ')} ft</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white space-y-1">
                      <div>0-5k: ${company.price_0_5000.toFixed(2)}</div>
                      <div>5k-20k: ${company.price_5000_20000.toFixed(2)}</div>
                      <div>20k+: ${company.price_20000_plus.toFixed(2)}</div>
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