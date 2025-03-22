import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';

const MODELS = [
  'SL12', 'SL13', 'SL18', 'SL24', 'SL30', 'SL36', 'SL42', 'SL43', 'SL48', 'SL50',
  'IN18', 'IN21', 'IN24', 'IN27', 'IN30', 'IN35', 'IN36',
  'CT30', 'CT33', 'CT40', 'CT42', 'NS30', 'NS24',
  'TH30', 'TH35', 'TH42',
  'CF16', 'CF20',
  'SH20', 'SH24'
] as const;

type Structure = Database['public']['Tables']['structures']['Row'];
type StructureInsert = Database['public']['Tables']['structures']['Insert'];

interface StructureFormProps {
  structure?: Structure | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const GLAZING_TYPES = ['CPC', 'PC8', 'Poly'] as const;

export default function StructureForm({ structure, onSubmit, onCancel }: StructureFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<StructureInsert>>(
    structure || {
      model: 'SL36',
      width: 30,
      spacing: 12,
      eave_height: 12,
      load_rating: '20 PSF',
      roof_glazing: 'PC8',
      elevation: 'Standard',
      zones: 1,
      gutter_partitions: 0,
      gable_partitions: 0
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (structure) {
        const { error: updateError } = await supabase
          .from('structures')
          .update({
            ...formData,
            elevation: formData.elevation || 'Standard',
            zones: formData.zones || 1,
            gutter_partitions: formData.gutter_partitions || 0,
            gable_partitions: formData.gable_partitions || 0
          })
          .eq('structure_id', structure.structure_id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('structures')
          .insert([{
            ...formData,
            elevation: formData.elevation || 'Standard',
            zones: formData.zones || 1,
            gutter_partitions: formData.gutter_partitions || 0,
            gable_partitions: formData.gable_partitions || 0
          }]);

        if (insertError) throw insertError;
      }
      
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save structure');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {structure ? 'Edit Structure' : 'New Structure'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Model
            </label>
            <select
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {MODELS.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Width (ft)
            </label>
            <input
              type="number"
              name="width"
              value={formData.width}
              onChange={handleChange}
              min={10}
              max={100}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Spacing (ft)
            </label>
            <input
              type="number"
              name="spacing"
              value={formData.spacing}
              onChange={handleChange}
              min={4}
              max={24}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Eave Height (ft)
            </label>
            <input
              type="number"
              name="eave_height"
              value={formData.eave_height}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Load Rating
            </label>
            <input
              type="text"
              name="load_rating"
              value={formData.load_rating}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Roof Glazing
            </label>
            <select
              name="roof_glazing"
              value={formData.roof_glazing}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {GLAZING_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
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
            {loading ? 'Saving...' : structure ? 'Save Changes' : 'Create Structure'}
          </button>
        </div>
      </form>
    </div>
  );
}