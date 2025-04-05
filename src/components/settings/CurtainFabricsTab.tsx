import { useState, useEffect } from 'react';
import { Plus, Loader2, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CurtainFabric {
  fabric_id: string;
  fabric_name: string;
  fabric_type: 'Shade' | 'Blackout' | 'Insect Screen';
  energy_savings: number;
  shade_percentage: number;
  ventilation_reduction: number;
  width_size: string[];
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
  const [widthSizeInput, setWidthSizeInput] = useState('');
  const [formData, setFormData] = useState<Partial<CurtainFabric>>({
    fabric_name: '',
    fabric_type: 'Shade',
    shade_percentage: 0,
    energy_savings: 0,
    ventilation_reduction: 0,
    width_size: [],
    price_0_5000: 0,
    price_5000_20000: 0,
    price_20000_plus: 0
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        setError(`Auth Error: ${error.message}`);
      } else if (session) {
        loadFabrics();
      } else {
        setError('No active session');
      }
    };
    init();
  }, []);

  async function loadFabrics() {
    try {
      const { data, error } = await supabase
        .from('curtain_fabrics')
        .select('*')
        .order('fabric_name');

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
        fabric_name: formData.fabric_name || '',
        fabric_type: formData.fabric_type || 'Shade',
        // Convert percentage values to decimal (0-1)
        energy_savings: Number(formData.energy_savings) / 100,
        shade_percentage: Number(formData.shade_percentage) / 100,
        ventilation_reduction: Number(formData.ventilation_reduction) / 100,
        width_size: widths,
        price_0_5000: Number(formData.price_0_5000),
        price_5000_20000: Number(formData.price_5000_20000),
        price_20000_plus: Number(formData.price_20000_plus)
      } as const;

      type DataKeys = keyof typeof dataToSubmit;
      const requiredFields: DataKeys[] = [
        'fabric_name',
        'fabric_type',
        'energy_savings',
        'shade_percentage',
        'ventilation_reduction',
        'width_size',
        'price_0_5000',
        'price_5000_20000',
        'price_20000_plus'
      ];

      const missingFields = requiredFields.filter(field => {
        const value = dataToSubmit[field];
        return value === undefined || value === null || value === '' || 
               (typeof value === 'number' && isNaN(value));
      });

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      if (editingFabric) {
        const { error } = await supabase
          .from('curtain_fabrics')
          .update(dataToSubmit)
          .eq('fabric_id', editingFabric.fabric_id);

        if (error) {
          console.error('Supabase update error:', error);
          throw new Error(`Database error: ${error.message}`);
        }
      } else {
        const { error } = await supabase
          .from('curtain_fabrics')
          .insert([dataToSubmit]);

        if (error) {
          console.error('Supabase insert error:', error);
          throw new Error(`Database error: ${error.message}`);
        }
      }

      await loadFabrics();
      setShowForm(false);
      setEditingFabric(null);
      setFormData({
        fabric_name: '',
        fabric_type: 'Shade',
        energy_savings: 0,
        shade_percentage: 0,
        ventilation_reduction: 0,
        width_size: [],
        price_0_5000: 0,
        price_5000_20000: 0,
        price_20000_plus: 0
      });
      setWidthSizeInput('');
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save curtain fabric');
    }
  };

  const handleDelete = async (fabricId: string) => {
    setPendingDeleteId(fabricId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      const { error } = await supabase
        .from('curtain_fabrics')
        .delete()
        .eq('fabric_id', pendingDeleteId);

      if (error) throw error;
      await loadFabrics();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete curtain fabric';
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

  const handleEdit = (fabric: CurtainFabric) => {
    setEditingFabric(fabric);
    setWidthSizeInput(fabric.width_size.join(', '));
    setFormData({
      ...fabric,
      // Convert decimal values (0-1) to percentage (0-100) for display
      energy_savings: fabric.energy_savings * 100,
      shade_percentage: fabric.shade_percentage * 100,
      ventilation_reduction: fabric.ventilation_reduction * 100
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

      {/* Fabric List */}
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Curtain Fabrics</h2>
          <button
            onClick={() => {
              setEditingFabric(null);
              setFormData({
                fabric_name: '',
                fabric_type: 'Shade',
                energy_savings: 0,
                shade_percentage: 0,
                ventilation_reduction: 0,
                width_size: [],
                price_0_5000: 0,
                price_5000_20000: 0,
                price_20000_plus: 0
              });
              setWidthSizeInput('');
              setShowForm(true);
            }}
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Fabric
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Properties</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Widths</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Prices</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {fabrics.map((fabric) => (
                <tr key={fabric.fabric_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{fabric.fabric_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{fabric.fabric_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <div>Energy Savings: {(fabric.energy_savings * 100).toFixed(1)}%</div>
                    <div>Shade: {(fabric.shade_percentage * 100).toFixed(1)}%</div>
                    <div>Ventilation Reduction: {(fabric.ventilation_reduction * 100).toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {fabric.width_size.join(', ')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white space-y-1">
                      <div>0-5k: ${(fabric.price_0_5000 ?? 0).toFixed(3)}</div>
                      <div>5k-20k: ${(fabric.price_5000_20000 ?? 0).toFixed(3)}</div>
                      <div>20k+: ${(fabric.price_20000_plus ?? 0).toFixed(3)}</div>
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
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingFabric ? 'Edit Fabric' : 'Add Fabric'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingFabric(null);
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
                    Fabric Name
                  </label>
                  <input
                    type="text"
                    value={formData.fabric_name}
                    onChange={(e) => setFormData({ ...formData, fabric_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Fabric Type
                  </label>
                  <select
                    value={formData.fabric_type}
                    onChange={(e) => setFormData({ ...formData, fabric_type: e.target.value as CurtainFabric['fabric_type'] })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    required
                  >
                    {FABRIC_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Energy Savings (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.energy_savings}
                    onChange={(e) => setFormData({ ...formData, energy_savings: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Shade (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.shade_percentage}
                    onChange={(e) => setFormData({ ...formData, shade_percentage: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Ventilation Reduction (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.ventilation_reduction}
                    onChange={(e) => setFormData({ ...formData, ventilation_reduction: Number(e.target.value) })}
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
                    Price (0-5,000 sq ft)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.price_0_5000}
                    onChange={(e) => setFormData({ ...formData, price_0_5000: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Price (5,000-20,000 sq ft)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.price_5000_20000}
                    onChange={(e) => setFormData({ ...formData, price_5000_20000: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Price (20,000+ sq ft)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.price_20000_plus}
                    onChange={(e) => setFormData({ ...formData, price_20000_plus: Number(e.target.value) })}
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
                    setEditingFabric(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                >
                  {editingFabric ? 'Save Changes' : 'Add Fabric'}
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
            <p className="text-gray-300 mb-6">Are you sure you want to delete this fabric? This action cannot be undone.</p>
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