import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface VentData {
  vent_id?: string;
  vent_type: string;
  single_double: string;
  vent_size: number;
  vent_quantity: number;
  vent_length: number;
  ati_house: string;
  notes: string;
  drive_id?: string | null;
  vent_insect_screen?: {
    type: string;
    quantity: number;
    length: number;
    width: number;
    notes?: string;
  }[];
}

interface VentFormProps {
  vent?: VentData;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  structure?: {
    model: string;
    length: number;
  };
}

interface VentDrive {
  drive_id: string;
  drive_type: string;
  vent_type: string;
  vent_size: number;
  motor_specifications: string | null;
  compatible_structures: string[];
  created_at: string | null;
  updated_at: string | null;
  max_length: number;
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
const DEFAULT_VENT_SIZES: { [key: string]: number[] } = {
  'Solar Light Roof': [54],
  'Insulator Roof': [48],
  'Gothic Roof': [48],
  'Continental Roof': [48],
  'Wall Vent Single': [36, 42, 48],
  'Wall Vent Double': [36, 42, 48]
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

export default function VentForm({ vent, onSubmit, onCancel, structure }: VentFormProps) {
  const getVentTypeFromModel = (model: string = '') => {
    const upperModel = model.toUpperCase();
    if (upperModel.startsWith('SL')) return 'Solar Light Roof';
    if (upperModel.startsWith('IN')) return 'Insulator Roof';
    if (upperModel.startsWith('NS')) return 'Gothic Roof';
    if (upperModel.startsWith('CT')) return 'Continental Roof';
    return 'Continental Roof'; // default
  };

  const getDefaultVentSize = (ventType: string) => {
    return DEFAULT_VENT_SIZES[ventType][0];
  };

  const initialVentType = structure ? getVentTypeFromModel(structure.model) : 'Continental Roof';

  const defaultVentData: VentData = {
    vent_type: initialVentType,
    single_double: 'Single',
    vent_size: getDefaultVentSize(initialVentType),
    vent_quantity: 1,
    vent_length: structure?.length || 1,
    ati_house: 'Yes',
    notes: '',
    drive_id: undefined,
    vent_insect_screen: undefined
  };

  const [formData, setFormData] = useState<VentData>(vent || defaultVentData);
  const [availableSizes, setAvailableSizes] = useState<number[]>(DEFAULT_VENT_SIZES[formData.vent_type]);
  const [availableDrives, setAvailableDrives] = useState<VentDrive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(vent?.drive_id || null);
  const [insectScreenFabrics, setInsectScreenFabrics] = useState<string[]>([]);

  useEffect(() => {
    console.log('Initial form data:', {
      ventData: vent,
      formData,
      selectedDriveId
    });
  }, []);

  useEffect(() => {
    if (vent) {
      const ventQuantity = typeof vent.vent_quantity === 'string' ? parseInt(vent.vent_quantity) : vent.vent_quantity;
      const ventLength = typeof vent.vent_length === 'string' ? parseInt(vent.vent_length) : vent.vent_length;
      
      const newFormData: VentData = {
        ...defaultVentData,
        ...vent,
        vent_quantity: ventQuantity || 1,
        vent_length: ventLength || 1,
        drive_id: vent.drive_id,
        vent_insect_screen: vent.vent_insect_screen?.map(screen => ({
          ...screen,
          quantity: ventQuantity || 1,
          length: ventLength || 1
        }))
      };

      setFormData(newFormData);

      if (vent.vent_type in DEFAULT_VENT_SIZES) {
        setAvailableSizes(DEFAULT_VENT_SIZES[vent.vent_type]);
      }
    }
  }, [vent]);

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

  useEffect(() => {
    async function loadVentDrives() {
      try {
        console.log('Form data when loading drives:', formData);
        
        // Get all drives with explicit field selection
        const { data: allDrives, error: allDrivesError } = await supabase
          .from('vent_drives')
          .select('*');

        if (allDrivesError) {
          console.error('Error loading all drives:', allDrivesError);
          return;
        }

        // Show raw database results
        console.log('Raw database results:', allDrives);

        if (allDrives && allDrives.length > 0) {
          console.log('First drive fields:', Object.keys(allDrives[0]));
        }

        // Cast and log the full drive data with all fields
        const typedDrives = (allDrives || []).map(drive => {
          // Create a properly typed object with defaults for missing fields
          return {
            drive_id: drive.drive_id,
            drive_type: drive.drive_type,
            vent_type: drive.vent_type,
            vent_size: drive.vent_size || 160,
            motor_specifications: drive.motor_specifications,
            compatible_structures: drive.compatible_structures || [],
            created_at: drive.created_at,
            updated_at: drive.updated_at,
            // In the database, vent_size is actually the maximum vent length the drive can handle
            max_length: drive.vent_size || 160
          } as VentDrive;
        });

        console.log('Available vent types in database:', [...new Set(typedDrives.map(d => d.vent_type))]);
        console.log('Selected vent type:', formData.vent_type);
        
        // NO FILTERING AT ALL - show all drives
        const unfiltered = typedDrives;
        console.log('All drives, unfiltered:', unfiltered);
        
        // Step 1: Filter by vent type only
        const ventTypeFiltered = typedDrives.filter(drive => {
          const ventTypeMatch = drive.vent_type === formData.vent_type;
          console.log(`Filtering drive ${drive.drive_id}: type=${drive.vent_type}, match=${ventTypeMatch}`);
          return ventTypeMatch;
        });
        
        console.log('After vent type filtering:', ventTypeFiltered);
        
        // Step 2: Add structure model filtering
        const structureFiltered = ventTypeFiltered.filter(drive => {
          // If no structure model is selected, include all drives
          if (!structure?.model) {
            return true;
          }
          
          // Check if the drive is compatible with the selected structure
          const structureMatch = drive.compatible_structures.some(code => 
            structure.model.startsWith(code)
          );
          
          console.log(`Structure filtering for drive ${drive.drive_id}: model=${structure?.model}, compatible=${drive.compatible_structures.join(',')}, match=${structureMatch}`);
          return structureMatch;
        });
        
        console.log('After structure filtering:', structureFiltered);
        
        // Finally filter by length
        const lengthFiltered = structureFiltered.filter(drive => {
          const rawVentLength = formData.vent_length;
          console.log('Raw vent length:', rawVentLength, typeof rawVentLength);
          
          // Don't filter if no length is set
          if (!rawVentLength) {
            console.log(`Drive ${drive.drive_id}: No length set, including drive`);
            return true;
          }

          const ventLength = parseFloat(rawVentLength);
          
          // If it's not a valid number, include all drives
          if (isNaN(ventLength)) {
            console.log(`Drive ${drive.drive_id}: Invalid length value, including drive`);
            return true;
          }
          
          // Check if the drive can handle the vent length
          // Use vent_size as the max_length since that's what it represents in the database
          const maxLength = drive.vent_size;
          const lengthMatch = maxLength >= ventLength;
          
          if (!lengthMatch) {
            console.log(`Drive ${drive.drive_id}: FILTERED OUT - max size ${maxLength} is less than vent length ${ventLength}`);
          } else {
            console.log(`Drive ${drive.drive_id}: INCLUDED - max size ${maxLength} can handle vent length ${ventLength}`);
          }
          
          return lengthMatch;
        });
        
        console.log('After length filtering:', lengthFiltered);
        
        // Use length filtered drives
        const drives = lengthFiltered;

        setAvailableDrives(drives);
        
        // If we have drives but none selected, select the first one
        if (drives.length && !selectedDriveId) {
          const newDriveId = drives[0].drive_id;
          setSelectedDriveId(newDriveId);
          setFormData(prev => ({
            ...prev,
            drive_id: newDriveId
          }));
        }
        
        // If the currently selected drive is no longer valid
        // select the first available drive instead
        if (selectedDriveId && !drives.some(d => d.drive_id === selectedDriveId)) {
          if (drives.length) {
            const newDriveId = drives[0].drive_id;
            setSelectedDriveId(newDriveId);
            setFormData(prev => ({
              ...prev,
              drive_id: newDriveId
            }));
          } else {
            setSelectedDriveId(null);
            setFormData(prev => ({
              ...prev,
              drive_id: undefined
            }));
          }
        }
      } catch (error) {
        console.error('Error in loadVentDrives:', error);
      }
    }

    if (formData.vent_type) {
      loadVentDrives();
    }
  }, [formData.vent_type, formData.vent_length, structure?.model]);

  useEffect(() => {
    console.log('Form state updated:', {
      ventType: formData.vent_type,
      availableDrives,
      selectedDriveId,
      formDataDriveId: formData.drive_id
    });
  }, [formData.vent_type, availableDrives, selectedDriveId, formData.drive_id]);

  useEffect(() => {
    if (selectedDriveId) {
      // Find the selected drive
      const selectedDrive = availableDrives.find(d => d.drive_id === selectedDriveId);
      
      if (selectedDrive) {
        console.log('Selected drive:', selectedDrive);
        setFormData(prev => ({
          ...prev,
          drive_id: selectedDriveId
        }));
      }
    }
  }, [selectedDriveId, availableDrives]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    console.log('Form field changed:', { name: e.target.name, value: e.target.value });
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev };
      
      if (type === 'number') {
        newData[name as keyof VentData] = value === '' ? 0 : parseFloat(value);
      } else {
        newData[name as keyof VentData] = value;
      }

      // If changing vent quantity or length, update insect screen
      if (name === 'vent_quantity' || name === 'vent_length') {
        if (prev.vent_insect_screen?.[0]) {
          newData.vent_insect_screen = [{
            ...prev.vent_insect_screen[0],
            quantity: name === 'vent_quantity' ? parseFloat(value) : prev.vent_insect_screen[0].quantity,
            length: name === 'vent_length' ? parseFloat(value) : prev.vent_insect_screen[0].length
          }];
        }
      }

      // Handle insect screen type selection
      if (name === 'insect_screen_type') {
        if (value) {
          newData.vent_insect_screen = [{
            type: value,
            quantity: prev.vent_quantity,
            length: prev.vent_length,
            width: prev.vent_insect_screen?.[0]?.width || 0
          }];
        } else {
          newData.vent_insect_screen = undefined;
        }
      }

      // Handle insect screen width
      if (name === 'insect_screen_width' && prev.vent_insect_screen?.[0]) {
        newData.vent_insect_screen = [{
          ...prev.vent_insect_screen[0],
          width: parseFloat(value)
        }];
      }

      return newData;
    });
  };

  // Update available sizes and default size when vent type changes
  const handleVentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVentType = e.target.value;
    const newSizes = DEFAULT_VENT_SIZES[newVentType];
    setAvailableSizes(newSizes);
    
    setFormData(prev => ({
      ...prev,
      vent_type: newVentType,
      vent_size: newSizes[0] // Set to first available size for the new vent type
    }));
  };

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
    console.log('Submitting form with data:', {
      ...formData,
      drive_id: selectedDriveId
    });
    
    // If insect screen type is selected but no width, set a default
    if (formData.vent_insect_screen?.[0] && !formData.vent_insect_screen[0].width) {
      formData.vent_insect_screen[0].width = 0;
    }

    // Always ensure insect screen quantity and length match the vent
    if (formData.vent_insect_screen?.[0]) {
      formData.vent_insect_screen[0].quantity = formData.vent_quantity;
      formData.vent_insect_screen[0].length = formData.vent_length;
    }

    onSubmit({
      ...formData,
      drive_id: selectedDriveId
    });
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
            onChange={handleVentTypeChange}
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
      
      {/* Drive Selection */}
      <div className="mb-4">
        <label htmlFor="drive_id" className="block text-sm font-medium text-gray-700">
          Vent Drive
        </label>
        <select
          id="drive_id"
          name="drive_id"
          value={selectedDriveId || ''}
          onChange={(e) => {
            const driveId = e.target.value;
            console.log('Drive selected:', {
              driveId,
              availableDrives: availableDrives.map(d => ({
                id: d.drive_id,
                specs: d.motor_specifications
              }))
            });
            setSelectedDriveId(driveId);
            setFormData(prev => ({
              ...prev,
              drive_id: driveId
            }));
          }}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                   transition-colors duration-200 ease-in-out shadow-sm
                   appearance-none [-webkit-appearance:none] [-moz-appearance:none]
                   bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M4.646%205.646a.5.5%200%200%201%20.708%200L8%208.293l2.646-2.647a.5.5%200%200%201%20.708.708l-3%203a.5.5%200%200%201-.708%200l-3-3a.5.5%200%200%201%200-.708z%22%2F%3E%3C%2Fsvg%3E')]
                     bg-no-repeat bg-[length:16px_16px] bg-[right_0.5rem_center]"
        >
          <option value="">Select a drive</option>
          {availableDrives.map((drive) => (
            <option key={drive.drive_id} value={drive.drive_id}>
              {`${drive.motor_specifications || 'Motor'} - ${drive.vent_type} - Max: ${drive.vent_size}ft`}
            </option>
          ))}
        </select>
        {selectedDriveId && (
          <p className="mt-1 text-sm text-gray-500">
            {availableDrives.find(d => d.drive_id === selectedDriveId)?.motor_specifications}
          </p>
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
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          placeholder="Optional notes about this vent"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="insect_screen_type" className="block text-sm font-medium text-gray-300 mb-1">
          Insect Screen Type
        </label>
        <select
          id="insect_screen_type"
          name="insect_screen_type"
          value={formData.vent_insect_screen?.[0]?.type || ''}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                   transition-colors duration-200 ease-in-out shadow-sm
                   appearance-none [-webkit-appearance:none] [-moz-appearance:none]
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

      {formData.vent_insect_screen && (
        <>
          <div className="flex flex-col">
            <label htmlFor="insect_screen_width" className="block text-sm font-medium text-gray-300 mb-1">
              Insect Screen Width (ft)
            </label>
            <input
              type="number"
              id="insect_screen_width"
              name="insect_screen_width"
              value={formData.vent_insect_screen?.[0]?.width || 0}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white 
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                       transition-colors duration-200 ease-in-out shadow-sm
                       [-webkit-appearance:none] [-moz-appearance:textfield]
                       [&::-webkit-outer-spin-button]:appearance-none
                       [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="insect_screen_quantity" className="block text-sm font-medium text-gray-300 mb-1">
              Insect Screen Quantity (auto-filled from vent)
            </label>
            <input
              type="number"
              id="insect_screen_quantity"
              name="insect_screen_quantity"
              value={formData.vent_insect_screen?.[0]?.quantity || 1}
              disabled
              className="w-full bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="insect_screen_length" className="block text-sm font-medium text-gray-300 mb-1">
              Insect Screen Length (auto-filled from vent)
            </label>
            <input
              type="number"
              id="insect_screen_length"
              name="insect_screen_length"
              value={formData.vent_insect_screen?.[0]?.length || 1}
              disabled
              className="w-full bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
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