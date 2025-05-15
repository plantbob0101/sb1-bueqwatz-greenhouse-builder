import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';

// Type for our glazing requirements
type GlazingRequirement = Database['public']['Tables']['glazing_requirements']['Row'];
type GlazingRequirementInsert = Database['public']['Tables']['glazing_requirements']['Insert'];

// Define material options
const MATERIAL_OPTIONS = [
  { value: 'PC8', label: 'PC8' },
  { value: 'PC80%', label: 'PC80%' },
  { value: 'GR7', label: 'GR7' },
  { value: 'CPC', label: 'CPC' },
  { value: 'Poly', label: 'Poly' },
];

interface FormProps {
  item: GlazingRequirement | null;
  modelOptions: string[];
  sectionOptions: string[];
  onSubmit: () => void;
  onCancel: () => void;
}

export default function GlazingRequirementForm({ 
  item, 
  modelOptions, 
  sectionOptions, 
  onSubmit, 
  onCancel 
}: FormProps) {
  // Initialize form state
  const [formData, setFormData] = useState<GlazingRequirementInsert>({
    model: '',
    width: 0,
    eave_height: 0,
    length: 0,
    section: '',
    material_type: 'PC8',
    // Optional fields with defaults
    bay: null,
    vent_type: null,
    area_sq_ft: null,
    linear_ft: null,
    panel_count: null,
    panel_length: null,
    notes: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing existing item
  useEffect(() => {
    if (item) {
      setFormData({
        model: item.model,
        width: item.width,
        eave_height: item.eave_height,
        length: item.length,
        section: item.section,
        bay: item.bay,
        vent_type: item.vent_type,
        material_type: item.material_type,
        area_sq_ft: item.area_sq_ft,
        linear_ft: item.linear_ft,
        panel_count: item.panel_count,
        panel_length: item.panel_length,
        notes: item.notes,
      });
    }
  }, [item]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Convert numeric inputs to numbers
    if (type === 'number') {
      const numberValue = value === '' ? null : Number(value);
      setFormData(prev => ({ ...prev, [name]: numberValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (item) {
        // Update existing item
        const { error } = await supabase
          .from('glazing_requirements')
          .update(formData)
          .eq('id', item.id);
        
        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('glazing_requirements')
          .insert(formData);
        
        if (error) throw error;
      }

      // Call onSubmit callback to refresh data and close modal
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save glazing requirement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {item ? 'Edit Glazing Requirement' : 'Add New Glazing Requirement'}
          </h2>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {error && (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6 flex items-center gap-2">
              <X className="w-5 h-5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Model *
                </label>
                <select
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="" disabled>Select Model</option>
                  {modelOptions.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                  {/* Allow custom entry if not in the list */}
                  {formData.model && !modelOptions.includes(formData.model) && (
                    <option value={formData.model}>{formData.model}</option>
                  )}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Section *
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="" disabled>Select Section</option>
                  {sectionOptions.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                  {/* Allow custom entry if not in the list */}
                  {formData.section && !sectionOptions.includes(formData.section) && (
                    <option value={formData.section}>{formData.section}</option>
                  )}
                </select>
              </div>

              {/* Width */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Width (ft) *
                </label>
                <input
                  type="number"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Eave Height */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Eave Height (ft) *
                </label>
                <input
                  type="number"
                  name="eave_height"
                  value={formData.eave_height}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Length */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Length (ft) *
                </label>
                <input
                  type="number"
                  name="length"
                  value={formData.length}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Bay */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Bay Type
                </label>
                <input
                  type="text"
                  name="bay"
                  value={formData.bay || ''}
                  onChange={handleChange}
                  placeholder="A Bay, B Bay, etc."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Material Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Material Type *
                </label>
                <select
                  name="material_type"
                  value={formData.material_type}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {MATERIAL_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Vent Type */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Vent Type
                </label>
                <input
                  type="text"
                  name="vent_type"
                  value={formData.vent_type || ''}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Area Square Feet */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Area (sq ft)
                </label>
                <input
                  type="number"
                  name="area_sq_ft"
                  value={formData.area_sq_ft || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g. 258"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Linear Feet */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Linear Feet
                </label>
                <input
                  type="number"
                  name="linear_ft"
                  value={formData.linear_ft || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Panel Count */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Panel Count
                </label>
                <input
                  type="number"
                  name="panel_count"
                  value={formData.panel_count || ''}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="Optional"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Panel Length */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Panel Length
                </label>
                <input
                  type="number"
                  name="panel_length"
                  value={formData.panel_length || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                placeholder="Optional notes about this glazing requirement"
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:bg-emerald-800 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
