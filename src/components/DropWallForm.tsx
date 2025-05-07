import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface DropWallFormProps {
  wall?: {
    drop_wall_id: string;
    type: 'Guttered' | 'Quonset';
    wall_length: number;
    wall_height: number;
    wall_location?: string;
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
  structureId: string;
}

export default function DropWallForm({ wall, onSubmit, onCancel, structureId }: DropWallFormProps) {
  const [formData, setFormData] = useState({
    type: wall?.type || 'Guttered',
    wall_location: wall?.wall_location || 'Sidewall',
    wall_length: wall?.wall_length || 0,
    wall_height: wall?.wall_height || 0,
    drive_type: wall?.drive_type || 'Manual',
    motor_model: wall?.motor_model || '',
    ns30: wall?.ns30 || 'No',
    spacing: wall?.spacing || '4',
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-semibold text-white mb-6">
          {wall ? 'Edit Drop Wall' : 'Add Drop Wall'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Row 1: Wall Location and Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Wall Location*
              </label>
              <select
                name="wall_location"
                value={formData.wall_location}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m2%206%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]"
              >
                <option value="Sidewall">Sidewall</option>
                <option value="Endwall">Endwall</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m2%206%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]"
              >
                <option value="Guttered">Guttered</option>
                <option value="Quonset">Quonset</option>
              </select>
            </div>

            {/* Row 2: Quantity and Height */}
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
                Height (ft)
              </label>
              <select
                name="wall_height"
                value={formData.wall_height}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m2%206%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]"
              >
                {getWallHeightOptions(formData.type).map(height => (
                  <option key={height} value={height}>{height}</option>
                ))}
              </select>
            </div>

            {/* Row 3: NS30 and Spacing */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                NS30
              </label>
              <select
                name="ns30"
                value={formData.ns30}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m2%206%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
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
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m2%206%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]"
              >
                <option value="4">4'</option>
                <option value="6">6'</option>
              </select>
            </div>

            {/* Row 4: Length and Additional Corner Pockets */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Length (ft)
              </label>
              <input
                type="number"
                name="wall_length"
                value={formData.wall_length}
                onChange={handleChange}
                min={0}
                required
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

            {/* Row 5: Breaking Winch and ATI House */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Breaking Winch with Mount
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
                ATI House
              </label>
              <select
                name="ati_house"
                value={formData.ati_house}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m2%206%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* Row 6: Drive Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Drive Type
              </label>
              <select
                name="drive_type"
                value={formData.drive_type}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m2%206%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]"
              >
                <option value="Manual">Manual</option>
                <option value="Motorized">Motorized</option>
              </select>
            </div>
          </div>

          {/* Notes Field - Full Width */}
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

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : wall ? 'Save Changes' : 'Add Wall'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
