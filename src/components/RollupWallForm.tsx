import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RollupWallData {
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
  drive_id?: string;
  houses_wide_per_system?: number;
  house_width?: number;
  frame_height?: number;
  ns30?: 'Yes' | 'No';
  gearbox_pocket?: number;
  simu_winch?: number;
  ridder_mount_guttered?: number;
  ridder_mount_quonset?: number;
}

interface RollupDropDrive {
  drive_id: string;
  drive_type: 'Manual' | 'Motorized';
  wall_type: string;
  motor_model: string | null;
  max_length: number;
  compatible_structures: string[];
  created_at: string | null;
  updated_at: string | null;
}

interface RollupWallFormProps {
  rollupWall?: RollupWallData;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function RollupWallForm({ rollupWall, onSubmit, onCancel }: RollupWallFormProps) {
  const [formData, setFormData] = useState({
    wall_location: rollupWall?.wall_location || 'Sidewall',
    type: rollupWall?.type || 'Guttered',
    drive_id: rollupWall?.drive_id || '',
    quantity: rollupWall?.quantity || 1,
    wall_height: rollupWall?.wall_height || 0,
    houses_wide_per_system: rollupWall?.houses_wide_per_system || 1,
    house_width: rollupWall?.house_width || 0,
    frame_height: rollupWall?.frame_height || 8, // Default to 8 for Guttered endwalls
    ns30: rollupWall?.ns30 || 'No',
    spacing: rollupWall?.spacing || "6'",
    wall_length: rollupWall?.wall_length || 0,
    drive_type: rollupWall?.drive_type || 'Manual',
    motor_model: rollupWall?.motor_model || '',
    gearbox_pocket: rollupWall?.gearbox_pocket || 0,
    simu_winch: rollupWall?.simu_winch || 0,
    ridder_mount_guttered: rollupWall?.ridder_mount_guttered || 0,
    ridder_mount_quonset: rollupWall?.ridder_mount_quonset || 0,
    notes: rollupWall?.notes || ''
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
    async function loadRollupDrives() {
      try {
        console.log('Form data when loading drives:', formData);
        
        const { data: drives, error } = await supabase
          .from('rollup_drop_drives')
          .select('*')
          .eq('wall_type', 'Roll-up Wall')
          .eq('drive_type', formData.drive_type)
          .gte('max_length', formData.wall_length || 0)
          .order('max_length', { ascending: true });

        if (error) {
          console.error('Error loading drives:', error);
          return;
        }

        // Type assertion to ensure the data matches our interface
        const typedDrives = (drives || []).map(drive => ({
          drive_id: drive.drive_id,
          drive_type: drive.drive_type as 'Manual' | 'Motorized',
          wall_type: drive.wall_type,
          motor_model: drive.motor_model,
          max_length: drive.max_length,
          compatible_structures: drive.compatible_structures,
          created_at: drive.created_at,
          updated_at: drive.updated_at
        }));

        setAvailableDrives(typedDrives);
      } catch (error) {
        console.error('Error in loadRollupDrives:', error);
      }
    }

    loadRollupDrives();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.wall_location) {
      setError('Wall location is required');
      setLoading(false);
      return;
    }

    if (!formData.type) {
      setError('Wall type is required');
      setLoading(false);
      return;
    }

    const isEndwall = formData.wall_location === 'Endwall';

    // Validate wall height and frame height based on wall location
    if (isEndwall) {
      const frameHeight = Number(formData.frame_height);
      if (isNaN(frameHeight) || frameHeight <= 0) {
        setError('Frame height must be a positive number');
        setLoading(false);
        return;
      }
    } else {
      const wallHeight = Number(formData.wall_height);
      if (isNaN(wallHeight) || wallHeight <= 0 || wallHeight > 14) {
        setError('Wall height must be a number between 1 and 14 feet');
        setLoading(false);
        return;
      }
    }

    // Validate wall length
    const wallLength = Number(formData.wall_length);
    if (isNaN(wallLength) || wallLength <= 0) {
      setError('Wall length must be a positive number');
      setLoading(false);
      return;
    }

    // Create submission data with all required fields
    const submissionData = {
      ...formData,
      wall_height: isEndwall ? Number(formData.frame_height) : Number(formData.wall_height),
      wall_length: wallLength,
      frame_height: isEndwall ? Number(formData.frame_height) : null,
      drive_id: formData.drive_id || null,
      drive_type: formData.drive_type || 'Manual',
      ns30: formData.ns30 || 'No',
      spacing: formData.spacing || '0',
      quantity: formData.quantity || 1,
      houses_wide_per_system: formData.houses_wide_per_system || 1,
      type: formData.type || (isEndwall ? 'Guttered' : 'Quonset'),
      wall_location: formData.wall_location
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
          <label htmlFor="wall_location" className="block text-sm font-medium text-gray-300 mb-1">
            Wall Location *
          </label>
          <select
            id="wall_location"
            name="wall_location"
            value={formData.wall_location}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     transition-colors duration-200 ease-in-out shadow-sm
                     appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                     bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                     bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
          >
            <option value="Sidewall">Sidewall</option>
            <option value="Endwall">Endwall</option>
          </select>
        </div>

        {isEndwall ? (
          <>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm
                         appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                         bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                         bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
              >
                <option value="Quonset">Quonset</option>
                <option value="Guttered">Guttered</option>
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min={1}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="houses_wide_per_system" className="block text-sm font-medium text-gray-300 mb-1">
                Houses Wide per System
              </label>
              <input
                type="number"
                id="houses_wide_per_system"
                name="houses_wide_per_system"
                value={formData.houses_wide_per_system}
                onChange={handleChange}
                min={1}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="wall_length" className="block text-sm font-medium text-gray-300 mb-1">
                Wall Length (ft) *
              </label>
              <input
                type="number"
                id="wall_length"
                name="wall_length"
                value={formData.wall_length}
                onChange={handleChange}
                min={1}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="house_width" className="block text-sm font-medium text-gray-300 mb-1">
                House Width (ft)
              </label>
              <select
                id="house_width"
                name="house_width"
                value={formData.house_width}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm
                         appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                         bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                         bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
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
              <label htmlFor="frame_height" className="block text-sm font-medium text-gray-300 mb-1">
                Frame Height (ft)
              </label>
              <select
                id="frame_height"
                name="frame_height"
                value={formData.frame_height}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm
                         appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                         bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                         bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
              >
                {getFrameHeightOptions(formData.type).map(height => (
                  <option key={height} value={height}>{height}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="gearbox_pocket" className="block text-sm font-medium text-gray-300 mb-1">
                Gearbox Pocket
              </label>
              <input
                type="number"
                id="gearbox_pocket"
                name="gearbox_pocket"
                value={formData.gearbox_pocket}
                onChange={handleChange}
                min={0}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="simu_winch" className="block text-sm font-medium text-gray-300 mb-1">
                Simu Winch
              </label>
              <input
                type="number"
                id="simu_winch"
                name="simu_winch"
                value={formData.simu_winch}
                onChange={handleChange}
                min={0}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="ridder_mount_guttered" className="block text-sm font-medium text-gray-300 mb-1">
                Ridder Mount (Guttered)
              </label>
              <input
                type="number"
                id="ridder_mount_guttered"
                name="ridder_mount_guttered"
                value={formData.ridder_mount_guttered}
                onChange={handleChange}
                min={0}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="ridder_mount_quonset" className="block text-sm font-medium text-gray-300 mb-1">
                Ridder Mount (Quonset)
              </label>
              <input
                type="number"
                id="ridder_mount_quonset"
                name="ridder_mount_quonset"
                value={formData.ridder_mount_quonset}
                onChange={handleChange}
                min={0}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="drive_type" className="block text-sm font-medium text-gray-300 mb-1">
                Drive Type
              </label>
              <select
                id="drive_type"
                name="drive_type"
                value={formData.drive_type}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm
                         appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                         bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                         bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
              >
                <option value="Manual">Manual</option>
                <option value="Motorized">Motorized</option>
              </select>
            </div>

            {formData.drive_type === 'Motorized' && (
              <div>
                <label htmlFor="drive_id" className="block text-sm font-medium text-gray-300 mb-1">
                  Motor Model *
                </label>
                <select
                  id="drive_id"
                  name="drive_id"
                  value={formData.drive_id}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                           transition-colors duration-200 ease-in-out shadow-sm
                           appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                           bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                           bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
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
              <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-1">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm
                         appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                         bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                         bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
              >
                <option value="Guttered">Guttered</option>
                <option value="Quonset">Quonset</option>
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min={1}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="wall_height" className="block text-sm font-medium text-gray-300 mb-1">
                Height (ft)
              </label>
              {formData.wall_location === 'Sidewall' ? (
                <select
                  id="wall_height"
                  name="wall_height"
                  value={formData.wall_height}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                           transition-colors duration-200 ease-in-out shadow-sm
                           appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                           bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                           bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
                >
                  {getHeightOptions(formData.wall_location, formData.type).map(height => (
                    <option key={height} value={height}>{height}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  id="wall_height"
                  name="wall_height"
                  value={formData.wall_height || ''}
                  onChange={handleChange}
                  min={1}
                  max={formData.frame_height || undefined}
                  step="0.1"
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                           transition-colors duration-200 ease-in-out shadow-sm"
                  placeholder={`Enter height (up to ${formData.frame_height || '?'} ft)`}
                />
              )}
            </div>

            <div>
              <label htmlFor="ns30" className="block text-sm font-medium text-gray-300 mb-1">
                NS30
              </label>
              <select
                id="ns30"
                name="ns30"
                value={formData.ns30}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm
                         appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                         bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                         bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div>
              <label htmlFor="spacing" className="block text-sm font-medium text-gray-300 mb-1">
                Spacing
              </label>
              <select
                id="spacing"
                name="spacing"
                value={formData.spacing}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm
                         appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                         bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                         bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
              >
                <option value="6'">6'</option>
                <option value="8'">8'</option>
              </select>
            </div>

            <div>
              <label htmlFor="wall_length" className="block text-sm font-medium text-gray-300 mb-1">
                Length (ft)
              </label>
              <input
                type="number"
                id="wall_length"
                name="wall_length"
                value={formData.wall_length}
                onChange={handleChange}
                min={1}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="gearbox_pocket" className="block text-sm font-medium text-gray-300 mb-1">
                Gearbox Pocket
              </label>
              <input
                type="number"
                id="gearbox_pocket"
                name="gearbox_pocket"
                value={formData.gearbox_pocket}
                onChange={handleChange}
                min={0}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="simu_winch" className="block text-sm font-medium text-gray-300 mb-1">
                Simu Winch
              </label>
              <input
                type="number"
                id="simu_winch"
                name="simu_winch"
                value={formData.simu_winch}
                onChange={handleChange}
                min={0}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="ridder_mount_guttered" className="block text-sm font-medium text-gray-300 mb-1">
                Ridder Mount (Guttered)
              </label>
              <input
                type="number"
                id="ridder_mount_guttered"
                name="ridder_mount_guttered"
                value={formData.ridder_mount_guttered}
                onChange={handleChange}
                min={0}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="ridder_mount_quonset" className="block text-sm font-medium text-gray-300 mb-1">
                Ridder Mount (Quonset)
              </label>
              <input
                type="number"
                id="ridder_mount_quonset"
                name="ridder_mount_quonset"
                value={formData.ridder_mount_quonset}
                onChange={handleChange}
                min={0}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="drive_type" className="block text-sm font-medium text-gray-300 mb-1">
                Drive Type
              </label>
              <select
                id="drive_type"
                name="drive_type"
                value={formData.drive_type}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         transition-colors duration-200 ease-in-out shadow-sm
                         appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                         bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                         bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
              >
                <option value="Manual">Manual</option>
                <option value="Motorized">Motorized</option>
              </select>
            </div>

            {formData.drive_type === 'Motorized' && (
              <div>
                <label htmlFor="drive_id" className="block text-sm font-medium text-gray-300 mb-1">
                  Motor Model *
                </label>
                <select
                  id="drive_id"
                  name="drive_id"
                  value={formData.drive_id}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                           focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                           transition-colors duration-200 ease-in-out shadow-sm
                           appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                           bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                           bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
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
        <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                   transition-colors duration-200 ease-in-out shadow-sm"
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
          {loading ? 'Saving...' : rollupWall ? 'Update Wall' : 'Add Wall'}
        </button>
      </div>
    </form>
  );
}