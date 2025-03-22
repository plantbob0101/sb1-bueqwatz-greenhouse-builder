import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RollupDropDrive {
  drive_id: string;
  drive_type: 'Motorized' | 'Manual';
  wall_type: 'Roll-up Wall' | 'Drop Wall';
  motor_model: string | null;
  max_length: number;
  compatible_structures: string[];
  created_at: string;
}

const WALL_TYPES = ['Roll-up Wall', 'Drop Wall'] as const;
const DRIVE_TYPES = ['Motorized', 'Manual'] as const;

export default function RollupDropDrivesTab() {
  const [drives, setDrives] = useState<RollupDropDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDrive, setEditingDrive] = useState<RollupDropDrive | null>(null);
  const [formData, setFormData] = useState<Partial<RollupDropDrive>>({
    drive_type: 'Motorized',
    wall_type: 'Roll-up Wall',
    motor_model: '',
    max_length: 0,
    compatible_structures: []
  });

  useEffect(() => {
    loadDrives();
  }, []);

  async function loadDrives() {
    try {
      const { data, error } = await supabase
        .from('rollup_drop_drives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrives(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drives');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingDrive) {
        const { error } = await supabase
          .from('rollup_drop_drives')
          .update(formData)
          .eq('drive_id', editingDrive.drive_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rollup_drop_drives')
          .insert([formData]);

        if (error) throw error;
      }

      await loadDrives();
      setShowForm(false);
      setEditingDrive(null);
      setFormData({
        drive_type: 'Motorized',
        wall_type: 'Roll-up Wall',
        motor_model: '',
        max_length: 0,
        compatible_structures: []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save drive');
    }
  };

  const handleDelete = async (driveId: string) => {
    if (!window.confirm('Are you sure you want to delete this drive?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('rollup_drop_drives')
        .delete()
        .eq('drive_id', driveId);

      if (error) throw error;
      await loadDrives();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete drive');
    }
  };

  const handleEdit = (drive: RollupDropDrive) => {
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
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingDrive(null);
            setFormData({
              drive_type: 'Motorized',
              wall_type: 'Roll-up Wall',
              motor_model: '',
              max_length: 0,
              compatible_structures: []
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Drive
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
              {editingDrive ? 'Edit Drive' : 'New Drive'}
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
                  Wall Type
                </label>
                <select
                  value={formData.wall_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, wall_type: e.target.value as 'Roll-up Wall' | 'Drop Wall' }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {WALL_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Maximum Length (ft)
                </label>
                <input
                  type="number"
                  value={formData.max_length === undefined ? '' : formData.max_length}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      max_length: val === '' ? undefined : Number(val)
                    }));
                  }}
                  min={1}
                  placeholder="Enter maximum length in feet"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Motor Model
                </label>
                <input
                  type="text"
                  value={formData.motor_model || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, motor_model: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter motor model"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Wall Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Max Length</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Motor Model</th>
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
                    <div className="text-sm text-white">{drive.wall_type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{drive.max_length} ft</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{drive.motor_model || '-'}</div>
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