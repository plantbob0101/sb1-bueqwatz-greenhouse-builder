import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';

// Type for our glazing panel requirements
type GlazingPanelRequirement = Database['public']['Tables']['glazing_panel_requirements']['Row'];
type GlazingPanelRequirementInsert = Database['public']['Tables']['glazing_panel_requirements']['Insert'];

interface FormProps {
  item: GlazingPanelRequirement | null;
  modelOptions: string[];
  sectionOptions: string[];
  materialTypeOptions: string[];
  ventTypeOptions: string[];
  onSubmit: () => void;
  onCancel: () => void;
}

export default function GlazingPanelRequirementForm({ 
  item, 
  modelOptions,
  sectionOptions,
  materialTypeOptions,
  ventTypeOptions,
  onSubmit, 
  onCancel 
}: FormProps) {
  const [formData, setFormData] = useState<Partial<GlazingPanelRequirementInsert>>({
    model: '',
    width: 0,
    eave_height: 0,
    section: '',
    material_type: '',
    panel_length: '', // Schema type is string
    vent_type: null,
    bay: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        model: item.model,
        width: item.width,
        eave_height: item.eave_height,
        section: item.section,
        vent_type: item.vent_type,
        bay: item.bay,
        material_type: item.material_type,
        panel_length: item.panel_length,
      });
    } else {
      // Reset for new form
      setFormData({
        model: '',
        width: 0,
        eave_height: 0,
        section: '',
        material_type: '',
        panel_length: '',
        vent_type: null,
        bay: null,
      });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      const numberValue = value === '' ? null : Number(value);
      setFormData(prev => ({ ...prev, [name]: numberValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Ensure required fields are present for insert
    const dataToSubmit: GlazingPanelRequirementInsert = {
      model: formData.model || '',
      width: formData.width || 0,
      eave_height: formData.eave_height || 0,
      section: formData.section || '',
      material_type: formData.material_type || '',
      panel_length: formData.panel_length || '',
      vent_type: formData.vent_type,
      bay: formData.bay,
    };

    try {
      if (item && item.id) {
        const { error: updateError } = await supabase
          .from('glazing_panel_requirements')
          .update(dataToSubmit)
          .eq('id', item.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('glazing_panel_requirements')
          .insert(dataToSubmit);
        if (insertError) throw insertError;
      }
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save glazing panel requirement');
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
            {item ? 'Edit Glazing Panel Requirement' : 'Add New Glazing Panel Requirement'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-300">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Model *</label>
                <select name="model" value={formData.model || ''} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="" disabled>Select Model</option>
                  {(modelOptions || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  {formData.model && !(modelOptions || []).includes(formData.model) && (<option value={formData.model}>{formData.model}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Section *</label>
                <select name="section" value={formData.section || ''} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="" disabled>Select Section</option>
                  {(sectionOptions || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  {formData.section && !(sectionOptions || []).includes(formData.section) && (<option value={formData.section}>{formData.section}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Width (ft) *</label>
                <input type="number" name="width" value={formData.width || ''} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Eave Height (ft) *</label>
                <input type="number" name="eave_height" value={formData.eave_height || ''} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Material Type *</label>
                <select name="material_type" value={formData.material_type || ''} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="" disabled>Select Material Type</option>
                  {(materialTypeOptions || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  {formData.material_type && !(materialTypeOptions || []).includes(formData.material_type) && (<option value={formData.material_type}>{formData.material_type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Panel Length *</label>
                <input type="text" name="panel_length" value={formData.panel_length || ''} onChange={handleChange} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Vent Type</label>
                <select name="vent_type" value={formData.vent_type || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="">None</option>
                  {(ventTypeOptions || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  {formData.vent_type && !(ventTypeOptions || []).includes(formData.vent_type) && (<option value={formData.vent_type}>{formData.vent_type}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Bay</label>
                <input type="text" name="bay" value={formData.bay || ''} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
              <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {item ? 'Save Changes' : 'Add Requirement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
