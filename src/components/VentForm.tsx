import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
    drive_id?: string;
    insect_screen_type?: string;
    insect_screen_quantity?: number;
    insect_screen_length?: number;
  } | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CONFIGURATIONS = ['Single', 'Double'];

const ATI_HOUSE_OPTIONS = ['Yes', 'No'] as const;

// Define valid vent types
const VENT_TYPES = [
  'Continental Roof',
  'Gothic Roof',
  'Insulator Roof',
  'Oxnard Vent',
  'Pad Vent',
  'Solar Light Roof',
  'Wall Vent'
] as const;

// Define default sizes for each vent type
const DEFAULT_VENT_SIZES: Record<string, number[]> = {
  'Continental Roof': [48],
  'Gothic Roof': [48],
  'Insulator Roof': [48],
  'Oxnard Vent': [36, 48],
  'Pad Vent': [36, 48],
  'Solar Light Roof': [48],
  'Wall Vent': [36, 48, 60]
};

// These must match exactly with the values in the database constraint
const VALID_COMBINED_TYPES = [
  'Continental Roof Single',
  'Continental Roof Double',
  'Gothic Roof Single',
  'Gothic Roof Double',
  'Insulator Roof Single',
  'Insulator Roof Double',
  'Oxnard Vent Single',
  'Oxnard Vent Double',
  'Pad Vent Single',
  'Pad Vent Double',
  'Solar Light Roof Single',
  'Solar Light Roof Double',
  'Wall Vent Single',
  'Wall Vent Double'
];

export default function VentForm({ vent, onSubmit, onCancel }: VentFormProps) {
  const [formData, setFormData] = useState({
    vent_type: vent?.vent_type || 'Continental Roof',
    single_double: vent?.single_double || 'Single',
    vent_size: vent?.vent_size || DEFAULT_VENT_SIZES['Continental Roof'][0],
    vent_quantity: vent?.vent_quantity || 1,
    vent_length: vent?.vent_length || 1,
    ati_house: vent?.ati_house || 'No',
    notes: vent?.notes || '',
    drive_id: vent?.drive_id || null,
    insect_screen_type: vent?.insect_screen_type || '',
    insect_screen_quantity: vent?.insect_screen_quantity || 1,
    insect_screen_length: vent?.insect_screen_length || 1
  });
  const [availableSizes, setAvailableSizes] = useState<number[]>(DEFAULT_VENT_SIZES['Continental Roof']);
  const [availableDrives, setAvailableDrives] = useState<any[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(vent?.drive_id || null);
  const [insectScreenFabrics, setInsectScreenFabrics] = useState<string[]>([]);

  useEffect(() => {
    async function loadInsectScreenFabrics() {
      try {
        const { data, error } = await supabase
          .from('curtain_fabrics')
          .select('fabric_name')
          .eq('fabric_type', 'Insect Screen')
          .order('fabric_name');

        if (error) throw error;
        setInsectScreenFabrics(data?.map(item => item.fabric_name) || []);
      } catch (err) {
        console.error('Error loading insect screen fabrics:', err);
      }
    }

    loadInsectScreenFabrics();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Update form data
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
      };

      // If changing vent type or configuration, validate the combination
      if (name === 'vent_type' || name === 'single_double') {
        const combinedType = `${name === 'vent_type' ? value : prev.vent_type} ${name === 'single_double' ? value : prev.single_double}`;
        
        // If the combination is invalid, reset insect screen data
        if (!VALID_COMBINED_TYPES.includes(combinedType)) {
          console.warn('Invalid vent type combination:', combinedType);
          return {
            ...newData,
            insect_screen_type: '',
            insect_screen_quantity: 1,
            insect_screen_length: 100
          };
        }
      }

      return newData;
    });

    // Update available sizes if vent type changes
    if (name === 'vent_type' && value in DEFAULT_VENT_SIZES) {
      setAvailableSizes(DEFAULT_VENT_SIZES[value]);
    }
  };

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

  // Get the current combined vent type for insect screen
  const getCombinedVentType = () => {
    const combinedType = `${formData.vent_type} ${formData.single_double}`;
    if (!VALID_COMBINED_TYPES.includes(combinedType)) {
      console.error('Invalid vent type combination:', combinedType);
      return null;
    }
    return combinedType;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('VentForm - Submitting form data:', formData);
    
    // Prepare the vent data
    const ventData = {
      ...formData,
      vent_insect_screen: formData.insect_screen_type ? {
        type: formData.insect_screen_type,
        quantity: formData.insect_screen_quantity,
        length: formData.insect_screen_length,
        vent_type: getCombinedVentType()
      } : null
    };
    
    console.log('VentForm - Prepared vent data:', ventData);
    onSubmit(ventData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vent_type" className="block text-sm font-medium text-gray-300 mb-1">
            Vent Type
          </label>
          <select
            id="vent_type"
            name="vent_type"
            value={formData.vent_type}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     transition-colors duration-200 ease-in-out shadow-sm
                     appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                     bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                     bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
            required
          >
            <option value="">Select Vent Type</option>
            {VENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="single_double" className="block text-sm font-medium text-gray-300 mb-1">
            Configuration
          </label>
          <select
            id="single_double"
            name="single_double"
            value={formData.single_double}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     transition-colors duration-200 ease-in-out shadow-sm
                     appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                     bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                     bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
          >
            {CONFIGURATIONS.map(config => (
              <option key={config} value={config}>{config}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="vent_size" className="block text-sm font-medium text-gray-300 mb-1">
            Size (inches)
          </label>
          <select
            id="vent_size"
            name="vent_size"
            value={formData.vent_size}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     transition-colors duration-200 ease-in-out shadow-sm
                     appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                     bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                     bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
          >
            {availableSizes.map(size => (
              <option key={size} value={size}>{size}"</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="vent_quantity" className="block text-sm font-medium text-gray-300 mb-1">
            Quantity
          </label>
          <input
            id="vent_quantity"
            type="number"
            inputMode="numeric"
            name="vent_quantity"
            value={formData.vent_quantity}
            onChange={handleChange}
            min={1}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     transition-colors duration-200 ease-in-out shadow-sm
                     [-webkit-appearance:none] [-moz-appearance:textfield]
                     [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <div>
          <label htmlFor="vent_length" className="block text-sm font-medium text-gray-300 mb-1">
            Length (ft)
          </label>
          <input
            id="vent_length"
            type="number"
            inputMode="decimal"
            name="vent_length"
            value={formData.vent_length}
            onChange={handleChange}
            min={0}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     transition-colors duration-200 ease-in-out shadow-sm
                     [-webkit-appearance:none] [-moz-appearance:textfield]
                     [&::-webkit-outer-spin-button]:appearance-none
                     [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="Enter length in feet"
          />
        </div>

        <div>
          <label htmlFor="ati_house" className="block text-sm font-medium text-gray-300 mb-1">
            ATI House
          </label>
          <select
            id="ati_house"
            name="ati_house"
            value={formData.ati_house}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                     transition-colors duration-200 ease-in-out shadow-sm
                     appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                     bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                     bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
          >
            {ATI_HOUSE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="vent_drive" className="block text-sm font-medium text-gray-300 mb-1">
          Vent Drive
        </label>
        <select
          id="vent_drive"
          value={selectedDriveId || ''}
          onChange={(e) => setSelectedDriveId(e.target.value || null)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                   transition-colors duration-200 ease-in-out shadow-sm
                   appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                   bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                   bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
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
        <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          placeholder="Optional notes about this vent"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="insect_screen_type" className="mb-1 text-sm font-medium text-gray-300">
          Insect Screen Type
        </label>
        <select
          id="insect_screen_type"
          name="insect_screen_type"
          value={formData.insect_screen_type}
          onChange={handleChange}
          className="bg-gray-700 text-white rounded px-3 py-2 w-full
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                   bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
        >
          <option value="">No Insect Screen</option>
          {insectScreenFabrics?.map(fabric => (
            <option key={fabric} value={fabric}>
              {fabric}
            </option>
          ))}
        </select>
      </div>

      {formData.insect_screen_type && (
        <>
          <div className="flex flex-col">
            <label htmlFor="insect_screen_quantity" className="mb-1 text-sm font-medium text-gray-300">
              Insect Screen Quantity
            </label>
            <input
              type="number"
              id="insect_screen_quantity"
              name="insect_screen_quantity"
              value={formData.insect_screen_quantity}
              onChange={handleChange}
              min="1"
              className="bg-gray-700 text-white rounded px-3 py-2 w-full
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="insect_screen_length" className="mb-1 text-sm font-medium text-gray-300">
              Insect Screen Length (ft)
            </label>
            <input
              type="number"
              id="insect_screen_length"
              name="insect_screen_length"
              value={formData.insect_screen_length}
              onChange={handleChange}
              min="1"
              className="bg-gray-700 text-white rounded px-3 py-2 w-full
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}
      
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 
                   focus:ring-gray-500 rounded-lg transition-colors duration-200 ease-in-out
                   [-webkit-tap-highlight-color:transparent]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg transition-colors duration-200 
                   ease-in-out hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 
                   focus:ring-offset-2 focus:ring-offset-gray-900 [-webkit-tap-highlight-color:transparent]"
        >
          {vent ? 'Update Vent' : 'Add Vent'}
        </button>
      </div>
    </form>
  );
}