import { useState, useEffect } from 'react';
import { Plus, Loader2, Edit2, Trash2 } from 'lucide-react';
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
  const [widthSizeInput, setWidthSizeInput] = useState('');
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        setError(`Auth Error: ${error.message}`);
      } else if (session) {
        loadCompanies();
      } else {
        setError('No active session');
      }
    };
    init();
  }, []);

  async function loadCompanies() {
    try {
      const { data, error } = await supabase
        .from('glazing_companies_poly')
        .select('*')
        .order('company_name');

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
      // Parse and validate width sizes
      const widths = widthSizeInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      // Validate each width is a valid number
      const invalidWidth = widths.find(w => isNaN(parseFloat(w)));
      if (invalidWidth) {
        throw new Error(`Invalid width value: ${invalidWidth}`);
      }

      if (widths.length === 0) {
        throw new Error('Please enter at least one width size');
      }

      // Create the data object with all required fields
      const dataToSubmit = {
        company_name: formData.company_name || '',
        type: formData.type || '',
        // Convert percentage values to decimal (0-1)
        light_transmittance: Number(formData.light_transmittance) / 100,
        light_diffusion: Number(formData.light_diffusion) / 100,
        widths_available: widths,
        price_400lbs_less: Number(formData.price_400lbs_less),
        price_401_2000lbs: Number(formData.price_401_2000lbs),
        price_2000lbs_plus: Number(formData.price_2000lbs_plus)
      } as const;

      type DataKeys = keyof typeof dataToSubmit;
      const requiredFields: DataKeys[] = [
        'company_name',
        'type',
        'light_transmittance',
        'light_diffusion',
        'widths_available',
        'price_400lbs_less',
        'price_401_2000lbs',
        'price_2000lbs_plus'
      ];

      const missingFields = requiredFields.filter(field => {
        const value = dataToSubmit[field];
        return value === undefined || value === null || value === '' || 
               (typeof value === 'number' && isNaN(value));
      });

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      if (editingCompany) {
        const { error } = await supabase
          .from('glazing_companies_poly')
          .update(dataToSubmit)
          .eq('company_id', editingCompany.company_id);

        if (error) {
          console.error('Supabase update error:', error);
          throw new Error(`Database error: ${error.message}`);
        }
      } else {
        const { error } = await supabase
          .from('glazing_companies_poly')
          .insert([dataToSubmit]);

        if (error) {
          console.error('Supabase insert error:', error);
          throw new Error(`Database error: ${error.message}`);
        }
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
      setWidthSizeInput('');
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save company');
    }
  };

  const handleDelete = async (companyId: string) => {
    setPendingDeleteId(companyId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      const { error } = await supabase
        .from('glazing_companies_poly')
        .delete()
        .eq('company_id', pendingDeleteId);

      if (error) throw error;
      await loadCompanies();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete poly glazing company';
      setError(message);
    } finally {
      setShowDeleteConfirm(false);
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPendingDeleteId(null);
  };

  const handleEdit = (company: PolyCompany) => {
    setEditingCompany(company);
    setWidthSizeInput(company.widths_available.join(', '));
    setFormData({
      ...company,
      // Convert decimal values (0-1) to percentage (0-100) for display
      light_transmittance: company.light_transmittance * 100,
      light_diffusion: company.light_diffusion * 100
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Company List */}
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Poly Glazing Companies</h2>
          <button
            onClick={() => {
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
              setWidthSizeInput('');
              setShowForm(true);
            }}
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Company
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Light Properties</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Widths</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Prices</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {companies.map((company) => (
                <tr key={company.company_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{company.company_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{company.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <div>Light Transmission: {(company.light_transmittance * 100).toFixed(1)}%</div>
                    <div>Light Diffusion: {(company.light_diffusion * 100).toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {company.widths_available.join(', ')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white space-y-1">
                      <div>0-400 lbs: ${(company.price_400lbs_less ?? 0).toFixed(3)}</div>
                      <div>401-2000 lbs: ${(company.price_401_2000lbs ?? 0).toFixed(3)}</div>
                      <div>2000+ lbs: ${(company.price_2000lbs_plus ?? 0).toFixed(3)}</div>
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
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingCompany ? 'Edit Company' : 'Add Company'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCompany(null);
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Light Transmission (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.light_transmittance}
                    onChange={(e) => setFormData({ ...formData, light_transmittance: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Light Diffusion (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.light_diffusion}
                    onChange={(e) => setFormData({ ...formData, light_diffusion: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Available Widths (ft)
                </label>
                <input
                  type="text"
                  value={widthSizeInput}
                  onChange={(e) => setWidthSizeInput(e.target.value)}
                  placeholder="e.g. 11.8, 13.7"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Price (0-400 lbs)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.price_400lbs_less}
                    onChange={(e) => setFormData({ ...formData, price_400lbs_less: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Price (401-2000 lbs)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.price_401_2000lbs}
                    onChange={(e) => setFormData({ ...formData, price_401_2000lbs: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Price (2000+ lbs)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.price_2000lbs_plus}
                    onChange={(e) => setFormData({ ...formData, price_2000lbs_plus: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    required
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
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                >
                  {editingCompany ? 'Save Changes' : 'Add Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete this company? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}