import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DropWallFormProps {
  wall?: {
    drop_wall_id: string;
    type: 'Guttered' | 'Quonset';
    wall_length: number;
    wall_height: number;
    drive_type: 'Manual' | 'Motorized';
    motor_model?: string;
    ns30?: string;
    spacing?: string;
    ati_house?: string;
    quantity: number;
    braking_winch_with_mount: number;
    additional_corner_pockets: number;
    notes?: string;
  } | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function DropWallForm({ wall, onSubmit, onCancel }: DropWallFormProps) {
  const [formData, setFormData] = useState({
    type: wall?.type || 'Guttered',
    wall_length: wall?.wall_length || 0,
    wall_height: wall?.wall_height || 0,
    drive_type: wall?.drive_type || 'Manual',
    motor_model: wall?.motor_model || '',
    ns30: wall?.ns30 || 'No',
    spacing: wall?.spacing || '6\'',
    ati_house: wall?.ati_house || 'No',
    quantity: wall?.quantity || 1,
    braking_winch_with_mount: wall?.braking_winch_with_mount || 0,
    additional_corner_pockets: wall?.additional_corner_pockets || 0,
    notes: wall?.notes || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWallHeightOptions = (type: string) => {
    if (type === 'Guttered') {
      return [8, 10, 12];
    }
    return [0.8, 3.5, 4.5, 5, 6];
  };

  // Update wall height when type changes
  useEffect(() => {
    const options = getWallHeightOptions(formData.type);
    setFormData(prev => ({
      ...prev,
      wall_height: options[0]
    }));
  }, [formData.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save drop wall');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Guttered">Guttered</option>
            <option value="Quonset">Quonset</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Wall Height (ft)
          </label>
          <select
            name="wall_height"
            value={formData.wall_height}
            onChange={handleChange}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {getWallHeightOptions(formData.type).map(height => (
              <option key={height} value={height}>{height}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            NS30
          </label>
          <select
            name="ns30"
            value={formData.ns30}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Spacing
          </label>
          <select
            name="spacing"
            value={formData.spacing}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="4'">4'</option>
            <option value="6'">6'</option>
            <option value="12'">12'</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            ATI House
          </label>
          <select
            name="ati_house"
            value={formData.ati_house}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Quantity
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min={1}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Wall Length (ft)
          </label>
          <input
            type="number"
            name="wall_length"
            value={formData.wall_length}
            onChange={handleChange}
            min={1}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Braking Winch with Mount
          </label>
          <input
            type="number"
            name="braking_winch_with_mount"
            value={formData.braking_winch_with_mount}
            onChange={handleChange}
            min={0}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Additional Corner Pockets
          </label>
          <input
            type="number"
            name="additional_corner_pockets"
            value={formData.additional_corner_pockets}
            onChange={handleChange}
            min={0}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Drive Type
          </label>
          <select
            name="drive_type"
            value={formData.drive_type}
            onChange={handleChange}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Manual">Manual</option>
            <option value="Motorized">Motorized</option>
          </select>
        </div>

        {formData.drive_type === 'Motorized' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Motor Model
            </label>
            <input
              type="text"
              name="motor_model"
              value={formData.motor_model}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Optional notes about this drop wall"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : wall ? 'Update Wall' : 'Add Wall'}
        </button>
      </div>
    </form>
  );
}