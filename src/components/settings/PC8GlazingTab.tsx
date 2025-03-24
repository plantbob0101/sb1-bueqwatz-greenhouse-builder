import { useState, useEffect } from 'react';
import { Plus, Loader2, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PC8Company {
  company_id: string;
  company_name: string;
  product: string;
  type: 'PC8' | 'CPC';
  light_transmittance: number;
  light_diffusion: number;
  width_size: string[];
  price_0_5000: number;
  price_5000_10000: number;
  price_10000_50000: number;
  price_50000_plus: number;
  created_at?: string;
  updated_at?: string;
}

const GLAZING_TYPES = ['PC8', 'CPC'] as const;

const PC8GlazingTab = () => {
  console.log('PC8GlazingTab: Starting render');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [companies, setCompanies] = useState<PC8Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<PC8Company | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<PC8Company, 'company_id' | 'updated_at'>>({
    company_name: '',
    product: '',
    type: 'PC8',
    light_transmittance: 0.0,
    light_diffusion: 0.0,
    width_size: [],
    price_0_5000: 0.0,
    price_5000_10000: 0.0,
    price_10000_50000: 0.0,
    price_50000_plus: 0.0,
    created_at: new Date().toISOString()
  });

  const addDebugInfo = (info: string) => {
    console.log('Debug:', info);
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${info}`].slice(-5));
  };

  // Load companies from Supabase
  const loadCompanies = async () => {
    try {
      addDebugInfo('Loading companies...');
      const { data, error } = await supabase
        .from('glazing_companies_pc8')
        .select('*')
        .order('company_name');

      if (error) {
        addDebugInfo(`Load error: ${error.message}`);
        setError(`Failed to load companies: ${error.message}`);
        return;
      }

      if (data && data.length > 0) {
        console.log('First company data structure:', data[0]);
        // Log all column names
        console.log('Column names:', Object.keys(data[0]));
      }

      setCompanies(data || []);
      addDebugInfo(`Loaded ${data?.length || 0} companies`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load companies';
      addDebugInfo(`Error: ${message}`);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    console.log('PC8GlazingTab: useEffect running');
    const init = async () => {
      try {
        console.log('PC8GlazingTab: Starting initialization');
        addDebugInfo('Component mounted');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('PC8GlazingTab: Auth error:', error);
          addDebugInfo(`Auth Error: ${error.message}`);
          setError(`Auth Error: ${error.message}`);
        } else if (session) {
          console.log('PC8GlazingTab: Session found:', session.user.email);
          addDebugInfo(`Logged in as: ${session.user.email}`);
          await loadCompanies();
        } else {
          console.log('PC8GlazingTab: No session found');
          addDebugInfo('No active session');
          setError('No active session');
        }
      } catch (err) {
        console.error('PC8GlazingTab: Init error:', err);
        setError(err instanceof Error ? err.message : 'Initialization error');
      }
    };
    init();
  }, []);

  const handleEdit = (company: PC8Company) => {
    setEditingCompany(company);
    setFormData({
      company_name: company.company_name,
      product: company.product,
      type: company.type,
      light_transmittance: company.light_transmittance,
      light_diffusion: company.light_diffusion,
      width_size: company.width_size,
      price_0_5000: company.price_0_5000,
      price_5000_10000: company.price_5000_10000,
      price_10000_50000: company.price_10000_50000,
      price_50000_plus: company.price_50000_plus,
      created_at: company.created_at || new Date().toISOString()
    });
    setShowForm(true);
  };

  const handleDelete = (companyId: string) => {
    setPendingDeleteId(companyId);
    setShowDeleteConfirm(true);
  };

  return (
    <div className="p-4">
      {/* Debug Panel */}
      <div className="p-4 bg-red-100 rounded-lg mb-4">
        <h3 className="font-semibold mb-2 text-gray-900">Debug Panel</h3>
        {debugInfo.map((info, i) => (
          <div key={i} className="text-sm font-mono text-gray-700">{info}</div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Add New Company Button */}
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
                  price_5000_10000: 0.0,
                  price_10000_50000: 0.0,
                  price_50000_plus: 0.0,
                  created_at: new Date().toISOString()
                });
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors text-white"
            >
              <Plus className="w-4 h-4" />
              New PC8 Company
            </button>
          </div>

          {/* Companies List */}
          {!showForm && (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-750">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Light Trans.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Light Diff.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Width Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Prices</th>
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
                          <div>0-5k: ${(company.price_0_5000 ?? 0).toFixed(2)}</div>
                          <div>5k-10k: ${(company.price_5000_10000 ?? 0).toFixed(2)}</div>
                          <div>10k-50k: ${(company.price_10000_50000 ?? 0).toFixed(2)}</div>
                          <div>50k+: ${(company.price_50000_plus ?? 0).toFixed(2)}</div>
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

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingCompany ? 'Edit Company' : 'Add New Company'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  addDebugInfo('Attempting to save company...');
                  console.log('Form data:', formData);
                  
                  if (editingCompany) {
                    addDebugInfo(`Updating company: ${formData.company_name}`);
                    const { data, error } = await supabase
                      .from('glazing_companies_pc8')
                      .update(formData)
                      .eq('company_id', editingCompany.company_id);
                    
                    if (error) {
                      console.error('Update error:', error);
                      addDebugInfo(`Update error: ${error.message}`);
                      throw error;
                    }
                    addDebugInfo(`Updated company: ${formData.company_name}`);
                    console.log('Update response:', data);
                  } else {
                    addDebugInfo(`Adding new company: ${formData.company_name}`);
                    const { data, error } = await supabase
                      .from('glazing_companies_pc8')
                      .insert([formData])
                      .select();
                    
                    if (error) {
                      console.error('Insert error:', error);
                      addDebugInfo(`Insert error: ${error.message}`);
                      throw error;
                    }
                    addDebugInfo(`Added new company: ${formData.company_name}`);
                    console.log('Insert response:', data);
                  }
                  
                  await loadCompanies();
                  setShowForm(false);
                } catch (err) {
                  console.error('Save error:', err);
                  let message: string;
                  if (err instanceof Error) {
                    message = err.message;
                  } else if (err && typeof err === 'object' && 'message' in err) {
                    message = String(err.message);
                  } else {
                    message = 'Failed to save company - check console for details';
                  }
                  setError(message);
                  addDebugInfo(`Error: ${message}`);
                }
              }} className="space-y-4">
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
                      Product
                    </label>
                    <input
                      type="text"
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'PC8' | 'CPC' })}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    >
                      {GLAZING_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Light Transmittance (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.light_transmittance * 100}
                      onChange={(e) => setFormData({ ...formData, light_transmittance: Number(e.target.value) / 100 })}
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
                      value={formData.light_diffusion * 100}
                      onChange={(e) => setFormData({ ...formData, light_diffusion: Number(e.target.value) / 100 })}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Width Sizes (ft)
                  </label>
                  <input
                    type="text"
                    value={formData.width_size.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      width_size: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="e.g. 4, 6, 8"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Price (0-5,000 sq ft)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_0_5000}
                      onChange={(e) => setFormData({ ...formData, price_0_5000: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Price (5,000-10,000 sq ft)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_5000_10000}
                      onChange={(e) => setFormData({ ...formData, price_5000_10000: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Price (10,000-50,000 sq ft)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_10000_50000}
                      onChange={(e) => setFormData({ ...formData, price_10000_50000: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Price (50,000+ sq ft)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price_50000_plus}
                      onChange={(e) => setFormData({ ...formData, price_50000_plus: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  >
                    {editingCompany ? 'Update' : 'Add'} Company
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-white mb-4">
                  Delete Company
                </h3>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete this company? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setPendingDeleteId(null);
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!pendingDeleteId) return;
                      try {
                        const { error } = await supabase
                          .from('glazing_companies_pc8')
                          .delete()
                          .eq('company_id', pendingDeleteId);
                        
                        if (error) throw error;
                        addDebugInfo(`Deleted company ID: ${pendingDeleteId}`);
                        await loadCompanies();
                      } catch (err) {
                        const message = err instanceof Error ? err.message : 'Failed to delete company';
                        setError(message);
                        addDebugInfo(`Error: ${message}`);
                      } finally {
                        setShowDeleteConfirm(false);
                        setPendingDeleteId(null);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PC8GlazingTab;