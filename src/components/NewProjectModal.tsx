import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import { useAuth } from './auth/AuthProvider';

type NewProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

type Structure = Database['public']['Tables']['structures']['Row'];
type UserEntry = Database['public']['Tables']['structure_user_entries']['Insert'];

const GLAZING_TYPES = ['CPC', 'PC8', 'Poly'] as const;

export default function NewProjectModal({ isOpen, onClose, onSuccess }: NewProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);

  const [formData, setFormData] = useState<Partial<UserEntry>>({
    project_name: '',
    description: '',
    structural_upgrades: '',
    elevation: '',
    width_ft: 30,
    length_ft: 0,
    eave_height: 14,
    zones: 0,
    ranges: 1,
    houses: 1,
    gutter_partitions: 0,
    gable_partitions: 0,
    roof_glazing: 'PC8',
    covering_roof: 'PC8',
    covering_sidewalls: 'PC8',
    covering_endwalls: 'PC8',
    covering_gables: 'PC8'
  });

  useEffect(() => {
    async function loadStructures() {
      try {
        const { data, error } = await supabase
          .from('structures')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStructures(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load structures');
      }
    }

    loadStructures();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedStructure) {
        throw new Error('Please select a structure template');
      }

      const { error: insertError } = await supabase
        .from('structure_user_entries')
        .insert([{
          user_id: user?.id,
          ...formData,
          structure_id: selectedStructure.structure_id
        }]);

      if (insertError) throw insertError;
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleStructureSelect = (structureId: string) => {
    const structure = structures.find(s => s.structure_id === structureId);
    if (structure) {
      setSelectedStructure(structure);
      // Pre-fill some values from the template
      setFormData(prev => ({
        ...prev,
        width_ft: structure.width,
        eave_height: structure.eave_height,
        roof_glazing: structure.roof_glazing
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Create New Project</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Project Name
              </label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter project name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Brief project description"
              />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-4">Select Structure Template</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Template Model
                </label>
                <select
                  value={selectedStructure?.structure_id || ''}
                  onChange={(e) => handleStructureSelect(e.target.value)}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select a template</option>
                  {structures.map(structure => (
                    <option key={structure.structure_id} value={structure.structure_id}>
                      {structure.model} - {structure.eave_height}' eave - {structure.load_rating}
                    </option>
                  ))}
                </select>
              </div>

            {selectedStructure && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Width (ft)
                  </label>
                  <input
                    type="number"
                    name="width_ft"
                    value={formData.width_ft}
                    onChange={handleChange}
                    min={10}
                    max={100}
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
              </>
            )}
            </div>
          </div>

          {selectedStructure && (
            <div className="pt-4 border-t border-gray-700">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Additional Specifications
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Length (ft)
                  </label>
                  <input
                    type="number"
                    name="length_ft"
                    value={formData.length_ft}
                    onChange={handleChange}
                    min={20}
                    max={300}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Zones
                  </label>
                  <input
                    type="number"
                    name="zones"
                    value={formData.zones}
                    onChange={handleChange}
                    min={1}
                    max={10}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Ranges
                  </label>
                  <input
                    type="number"
                    name="ranges"
                    value={formData.ranges}
                    onChange={handleChange}
                    min={1}
                    max={20}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Houses
                  </label>
                  <input
                    type="number"
                    name="houses"
                    value={formData.houses}
                    onChange={handleChange}
                    min={1}
                    max={20}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Gutter Partitions
                  </label>
                  <input
                    type="number"
                    name="gutter_partitions"
                    value={formData.gutter_partitions}
                    onChange={handleChange}
                    min={0}
                    max={10}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Gable Partitions
                  </label>
                  <input
                    type="number"
                    name="gable_partitions"
                    value={formData.gable_partitions}
                    onChange={handleChange}
                    min={0}
                    max={10}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Elevation
                  </label>
                  <input
                    type="text"
                    name="elevation"
                    value={formData.elevation}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Roof Covering
                  </label>
                  <select
                    name="covering_roof"
                    value={formData.covering_roof}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {GLAZING_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Sidewall Covering
                  </label>
                  <select
                    name="covering_sidewalls"
                    value={formData.covering_sidewalls}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {GLAZING_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Endwall Covering
                  </label>
                  <select
                    name="covering_endwalls"
                    value={formData.covering_endwalls}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {GLAZING_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Gable Covering
                  </label>
                  <select
                    name="covering_gables"
                    value={formData.covering_gables}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {GLAZING_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Structural Upgrades
                  </label>
                  <input
                    type="text"
                    name="structural_upgrades"
                    value={formData.structural_upgrades}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Optional structural upgrades"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedStructure}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}