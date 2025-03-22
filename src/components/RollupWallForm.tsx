import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RollupWallFormProps {
  wall?: {
    rollup_wall_id: string;
    wall_location: 'Sidewall' | 'Endwall';
    wall_length: number;
    wall_height: number;
    drive_type: 'Manual' | 'Motorized';
    motor_model?: string;
    type?: 'Quonset' | 'Guttered';
    quantity?: number;
    NS30?: 'Yes' | 'No';
    spacing?: string;
    notes?: string;
  } | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface RollupDropDrive {
  drive_id: string;
  drive_type: 'Manual' | 'Motorized';
  wall_type: 'Roll-up Wall' | 'Drop Wall';
  motor_model: string;
  max_length: number;
  compatible_structures: string[];
}

export default function RollupWallForm({ wall, onSubmit, onCancel }: RollupWallFormProps) {
  const [formData, setFormData] = useState({
    wall_location: wall?.wall_location || 'Sidewall',
    type: wall?.type || 'Guttered',
    drive_id: wall?.drive_id || '',
    quantity: wall?.quantity || 1,
    wall_height: wall?.wall_height || 0,
    houses_wide_per_system: wall?.houses_wide_per_system || 1,
    house_width: wall?.house_width || 0,
    frame_height: wall?.frame_height || 0,
    ns30: wall?.ns30 || 'No',
    spacing: wall?.spacing || "6'",
    wall_length: wall?.wall_length || 0,
    drive_type: wall?.drive_type || 'Manual',
    motor_model: wall?.motor_model || '',
    gearbox_pocket: wall?.gearbox_pocket || 0,
    simu_winch: wall?.simu_winch || 0,
    ridder_mount_guttered: wall?.ridder_mount_guttered || 0,
    ridder_mount_quonset: wall?.ridder_mount_quonset || 0,
    notes: wall?.notes || ''
  });

  const [availableDrives, setAvailableDrives] = useState<RollupDropDrive[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getFrameHeightOptions = (type: string) => {
    if (type === 'Guttered') {
      return [8, 10, 12, 14];
    }
    return [0.8, 3.5, 4.5, 5, 6];
  };

  const getHeightOptions = (wallLocation: string, type: string) => {
    if (wallLocation === 'Sidewall') {
      if (type === 'Guttered') {
        return [8, 10, 12, 14];
      } else if (type === 'Quonset') {
        return [0.8, 3.5, 4.5, 5, 6];
      }
    }
    return [];
  };

  useEffect(() => {
    loadDrives();
  }, [formData.wall_length, formData.drive_type]);

  // Reset wall height when location or type changes
  useEffect(() => {
    if (formData.wall_location === 'Sidewall') {
      const options = getHeightOptions(formData.wall_location, formData.type);
      if (options.length > 0 && !options.includes(formData.wall_height)) {
        setFormData(prev => ({
          ...prev,
          wall_height: options[0]
        }));
      }
    }
  }, [formData.wall_location, formData.type]);

  // Reset frame height when type changes for endwalls
  useEffect(() => {
    if (formData.wall_location === 'Endwall') {
      const options = getFrameHeightOptions(formData.type);
      if (options.length > 0 && !options.includes(formData.frame_height)) {
        setFormData(prev => ({
          ...prev,
          frame_height: options[0]
        }));
      }
    }
  }, [formData.type]);

  useEffect(() => {
    // Clear drive selection when drive type changes
    setFormData(prev => ({
      ...prev,
      drive_id: '',
      motor_model: ''
    }));
  }, [formData.drive_type]);

  const loadDrives = async () => {
    try {
      const { data, error } = await supabase
        .from('rollup_drop_drives')
        .select('*')
        .eq('wall_type', 'Roll-up Wall')
        .eq('drive_type', formData.drive_type)
        .gte('max_length', formData.wall_length || 0)
        .order('max_length', { ascending: true });

      if (error) throw error;
      setAvailableDrives(data || []);
    } catch (err) {
      console.error('Error loading drives:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate and convert wall height
    const wallHeight = Number(formData.wall_height);
    if (isNaN(wallHeight) || wallHeight <= 0 || wallHeight > 14) {
      setError('Wall height must be a number between 1 and 14 feet');
      setLoading(false);
      return;
    }
    
    // Create submission data without drive_id if none selected
    const submissionData = {
      ...formData,
      wall_height: wallHeight,
      drive_id: formData.drive_id || null // Set to null if empty string
    };

    try {
      onSubmit(submissionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save roll-up wall');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));
  };

  const isEndwall = formData.wall_location === 'Endwall';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Wall Location *
          </label>
          <select
            name="wall_location"
            value={formData.wall_location}
            onChange={handleChange}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Sidewall">Sidewall</option>
            <option value="Endwall">Endwall</option>
          </select>
        </div>

        {isEndwall ? (
          <>
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
                <option value="Quonset">Quonset</option>
                <option value="Guttered">Guttered</option>
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
                Houses Wide per System
              </label>
              <input
                type="number"
                name="houses_wide_per_system"
                value={formData.houses_wide_per_system}
                onChange={handleChange}
                min={1}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                House Width (ft)
              </label>
              <select
                name="house_width"
                value={formData.house_width}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select width</option>
                <option value="18">18</option>
                <option value="21">21</option>
                <option value="24">24</option>
                <option value="27">27</option>
                <option value="30">30</option>
                <option value="35">35</option>
                <option value="36">36</option>
                <option value="42">42</option>
                <option value="48">48</option>
                <option value="50">50</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Frame Height (ft)
              </label>
              <select
                name="frame_height" 
                value={formData.frame_height} 
                onChange={handleChange} 
                required 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" 
              > 
                {getFrameHeightOptions(formData.type).map(height => (
                  <option key={height} value={height}>{height}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Gearbox Pocket
              </label>
              <input
                type="number"
                name="gearbox_pocket"
                value={formData.gearbox_pocket}
                onChange={handleChange}
                min={0}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Simu Winch
              </label>
              <input
                type="number"
                name="simu_winch"
                value={formData.simu_winch}
                onChange={handleChange}
                min={0}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ridder Mount (Guttered)
              </label>
              <input
                type="number"
                name="ridder_mount_guttered"
                value={formData.ridder_mount_guttered}
                onChange={handleChange}
                min={0}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ridder Mount (Quonset)
              </label>
              <input
                type="number"
                name="ridder_mount_quonset"
                value={formData.ridder_mount_quonset}
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
                  Motor Model *
                </label>
                <select
                  name="drive_id" 
                  value={formData.drive_id}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select a motor model</option>
                  {availableDrives.map(drive => (
                    <option key={drive.drive_id} value={drive.drive_id}>
                      {drive.motor_model} (up to {drive.max_length}ft)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        ) : (
          <>
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
                <option value="Quonset">Quonset</option>
                <option value="Guttered">Guttered</option>
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
                Height (ft)
              </label>
              {formData.wall_location === 'Sidewall' ? (
                <select
                  name="wall_height"
                  value={formData.wall_height}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {getHeightOptions(formData.wall_location, formData.type).map(height => (
                    <option key={height} value={height}>{height}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  name="wall_height"
                  value={formData.wall_height || ''}
                  onChange={handleChange}
                  min={1}
                  max={formData.frame_height || undefined}
                  step="0.1"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={`Enter height (up to ${formData.frame_height || '?'} ft)`}
                />
              )}
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
                <option value="4'">4&apos;</option>
                <option value="6'">6&apos;</option>
                <option value="12'">12&apos;</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Length (ft)
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
                Gearbox Pocket
              </label>
              <input
                type="number"
                name="gearbox_pocket"
                value={formData.gearbox_pocket}
                onChange={handleChange}
                min={0}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Simu Winch
              </label>
              <input
                type="number"
                name="simu_winch"
                value={formData.simu_winch}
                onChange={handleChange}
                min={0}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ridder Mount (Guttered)
              </label>
              <input
                type="number"
                name="ridder_mount_guttered"
                value={formData.ridder_mount_guttered}
                onChange={handleChange}
                min={0}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Ridder Mount (Quonset)
              </label>
              <input
                type="number"
                name="ridder_mount_quonset"
                value={formData.ridder_mount_quonset}
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
                  Motor Model *
                </label>
                <select
                  name="drive_id" 
                  value={formData.drive_id}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select a motor model</option>
                  {availableDrives.map(drive => (
                    <option key={drive.drive_id} value={drive.drive_id}>
                      {drive.motor_model} (up to {drive.max_length}ft)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
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
          placeholder="Optional notes about this roll-up wall"
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