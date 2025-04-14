import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface VentDrive {
  drive_id: string;
  drive_type: 'Motorized' | 'Manual';
  vent_type: string;
  vent_size: number; // This represents the maximum length the drive can handle
  motor_specifications: string | null;
  compatible_structures: string[];
  created_at: string;
}

const VENT_TYPES = [
  'Continental Roof',
  'Gothic Roof',
  'Insulator Roof',
  'Oxnard Vent',
  'Pad Vent',
  'Solar Light Roof',
  'Wall Vent'
] as const;

const DRIVE_TYPES = ['Motorized', 'Manual'] as const;

export default function VentDrivesTab() {
  const [drives, setDrives] = useState<VentDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDrive, setEditingDrive] = useState<VentDrive | null>(null);
  const [formData, setFormData] = useState<Partial<VentDrive>>({
    drive_type: 'Motorized',
    vent_type: 'Continental Roof',
    vent_size: 160, // Default max length of 160 feet
    motor_specifications: '',
    compatible_structures: []
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadDrives();
  }, []);

  async function loadDrives() {
    try {
      const { data, error } = await supabase
        .from('vent_drives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to include default values for missing fields
      const processedData = (data || []).map(drive => ({
        ...drive,
        vent_size: drive.vent_size || 160, // Default to 160 feet if not specified
        compatible_structures: drive.compatible_structures || []
      })) as VentDrive[];
      
      setDrives(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vent drives');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Log full form data for debugging
    console.log('Submitting vent drive data:', formData);

    try {
      // Create a clean object with only the fields that definitely exist in the database
      const baseData = {
        drive_type: formData.drive_type || 'Motorized',
        vent_type: formData.vent_type || 'Continental Roof',
        vent_size: formData.vent_size || 0,
        motor_specifications: formData.motor_specifications || '',
        compatible_structures: formData.compatible_structures || []
      };

      // If we're editing, we need the drive_id too
      const finalData = editingDrive 
        ? { ...baseData }  
        : baseData;
      
      console.log('Cleaned data to submit:', finalData);

      if (editingDrive) {
        console.log('Updating drive with ID:', editingDrive.drive_id);
        const { data, error } = await supabase
          .from('vent_drives')
          .update(finalData)
          .eq('drive_id', editingDrive.drive_id);

        if (error) {
          console.error('Update error details:', error);
          throw error;
        }
        console.log('Update successful, response:', data);
      } else {
        console.log('Inserting new drive');
        const { data, error } = await supabase
          .from('vent_drives')
          .insert([finalData]);

        if (error) {
          console.error('Insert error details:', error);
          throw error;
        }
        console.log('Insert successful, response:', data);
      }

      await loadDrives();
      setShowForm(false);
      setEditingDrive(null);
      setFormData({
        drive_type: 'Motorized',
        vent_type: 'Continental Roof',
        vent_size: 160,
        motor_specifications: '',
        compatible_structures: []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vent drive');
    }
  };

  const handleDelete = async (driveId: string) => {
    setPendingDeleteId(driveId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      // Check auth state
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) {
        setError('Authentication error: ' + authError.message);
        return;
      }
      if (!session) {
        setError('You must be logged in to delete items');
        return;
      }

      const { error } = await supabase
        .from('vent_drives')
        .delete()
        .eq('drive_id', pendingDeleteId);

      if (error) {
        setError(`Failed to delete: ${error.message}`);
        return;
      }

      await loadDrives();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vent drive');
    } finally {
      setShowDeleteConfirm(false);
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPendingDeleteId(null);
  };

  const handleEdit = (drive: VentDrive) => {
    setEditingDrive(drive);
    setFormData(drive);
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
      {showDeleteConfirm && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Confirm Delete</h3>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this vent drive?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingDrive(null);
            setFormData({
              drive_type: 'Motorized',
              vent_type: 'Continental Roof',
              vent_size: 160,
              motor_specifications: '',
              compatible_structures: []
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Vent Drive
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      {showForm ? (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">
              {editingDrive ? 'Edit Vent Drive' : 'New Vent Drive'}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingDrive(null);
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
                  Drive Type
                </label>
                <select
                  value={formData.drive_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, drive_type: e.target.value as 'Motorized' | 'Manual' }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {DRIVE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Vent Type
                </label>
                <select
                  value={formData.vent_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, vent_type: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {VENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Maximum Drive Length (ft)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.vent_size === undefined ? '' : formData.vent_size}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        vent_size: val === '' ? undefined : Number(val)
                      }));
                    }}
                    min={1}
                    placeholder="Enter maximum length in feet"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Motor Specifications
                </label>
                <input
                  type="text"
                  value={formData.motor_specifications || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, motor_specifications: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter motor specifications"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Compatible Structures
                </label>
                <input
                  type="text"
                  value={formData.compatible_structures?.join(', ') || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      compatible_structures: value === '' ? [] : value.split(',').map(s => s.trim())
                    }));
                  }}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter model names separated by commas (e.g., SL36, IN30, CT42)"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingDrive(null);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                {editingDrive ? 'Save Changes' : 'Create Drive'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-750">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Drive Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vent Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Max Length (ft)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Motor Specs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Compatible</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {drives.map((drive) => (
                <tr key={drive.drive_id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{drive.drive_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{drive.vent_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{drive.vent_size ? `${drive.vent_size} ft` : '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{drive.motor_specifications || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{drive.compatible_structures.join(', ')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(drive)}
                      className="text-emerald-500 hover:text-emerald-400 mr-4"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(drive.drive_id)}
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