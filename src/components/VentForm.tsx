import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { X } from 'lucide-react';

interface VentFormProps {
  vent?: {
    vent_id: string;
    vent_type: string;
    single_double: string;
    vent_size: number;
    vent_quantity: number;
    vent_length: number;
    ati_house: string;
    notes: string;
  } | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const VENT_TYPES = [
  'Continental Roof',
  'Gothic Roof',
  'Insulator Roof',
  'Oxnard Vent',
  'Pad Vent',
  'Solar Light Roof',
  'Wall Vent'
];

// Define default sizes for each vent type
const DEFAULT_VENT_SIZES: Record<string, number[]> = {
  'Continental Roof': [48],
  'Gothic Roof': [48],
  'Insulator Roof': [36, 48],
  'Oxnard Vent': [21, 27, 30, 35],
  'Pad Vent': [36, 48, 60],
  'Solar Light Roof': [54],
  'Wall Vent': [36, 48, 60]
};

export default function VentForm({ vent, onSubmit, onCancel }: VentFormProps) {
  const [formData, setFormData] = useState({
    vent_type: vent?.vent_type || 'Continental Roof',
    single_double: vent?.single_double || 'Single',
    vent_size: vent?.vent_size || DEFAULT_VENT_SIZES['Continental Roof'][0],
    vent_quantity: vent?.vent_quantity || 1,
    vent_length: vent?.vent_length || '',
    ati_house: vent?.ati_house || 'Yes',
    notes: vent?.notes || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSizes, setAvailableSizes] = useState<number[]>(DEFAULT_VENT_SIZES['Continental Roof']);
  const [availableDrives, setAvailableDrives] = useState<any[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(vent?.drive_id || null);

  useEffect(() => {
    // Update available sizes when vent type changes
    const sizes = DEFAULT_VENT_SIZES[formData.vent_type] || [];
    setAvailableSizes(sizes);
    
    // Update form data with first available size if current size isn't in the list
    if (!sizes.includes(formData.vent_size)) {
      setFormData(prev => ({
        ...prev,
        vent_size: sizes[0]
      }));
    }
  }, [formData.vent_type]);

  useEffect(() => {
    async function loadVentDrives() {
      try {
        const { data, error } = await supabase
          .from('vent_drives')
          .select('*')
          .eq('vent_type', formData.vent_type);

        if (error) throw error;
        setAvailableDrives(data || []);
      } catch (err) {
        console.error('Error loading vent drives:', err);
      }
    }

    loadVentDrives();
  }, [formData.vent_type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      onSubmit({
        ...formData,
        drive_id: selectedDriveId
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vent');
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
            Vent Type
          </label>
          <select
            name="vent_type"
            value={formData.vent_type}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {VENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Configuration
          </label>
          <select
            name="single_double"
            value={formData.single_double}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Single">Single</option>
            <option value="Double">Double</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Size (inches)
          </label>
          <select
            name="vent_size"
            value={formData.vent_size}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {availableSizes.map(size => (
              <option key={size} value={size}>{size}"</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Quantity
          </label>
          <input
            type="number"
            name="vent_quantity"
            value={formData.vent_quantity}
            onChange={handleChange}
            min={1}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Length (ft)
          </label>
          <input
            type="number"
            name="vent_length"
            value={formData.vent_length}
            onChange={handleChange}
            min={0}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter length in feet"
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
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Vent Drive
        </label>
        <select
          value={selectedDriveId || ''}
          onChange={(e) => setSelectedDriveId(e.target.value || null)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select a drive</option>
          {availableDrives.map(drive => (
            <option key={drive.drive_id} value={drive.drive_id}>
              {drive.drive_type} - {drive.motor_specifications || 'No specs'} 
              {drive.vent_size ? ` (up to ${drive.vent_size}ft)` : ''}
            </option>
          ))}
        </select>
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
          placeholder="Optional notes about this vent"
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
          {loading ? 'Saving...' : vent ? 'Update Vent' : 'Add Vent'}
        </button>
      </div>
    </form>
  );
}