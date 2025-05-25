import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Loader2, ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import GlazingPanelRequirementForm from './GlazingPanelRequirementForm.tsx'; // Will be created next

// Type for our glazing panel requirements
type GlazingPanelRequirement = Database['public']['Tables']['glazing_panel_requirements']['Row'];

// Define filter state type
interface FilterState {
  model: string;
  section: string;
  material_type: string;
  vent_type: string;
}

export default function GlazingPanelRequirementsTab() {
  // State for glazing panel requirements data
  const [glazingPanelRequirements, setGlazingPanelRequirements] = useState<GlazingPanelRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for CRUD operations
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GlazingPanelRequirement | null>(null);
  
  // State for filtering and pagination
  const [filters, setFilters] = useState<FilterState>({
    model: '',
    section: '',
    material_type: '',
    vent_type: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const pageSizeOptions = [5, 10, 25, 50, 100];
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof GlazingPanelRequirement>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // State for unique filter options
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [sectionOptions, setSectionOptions] = useState<string[]>([]);
  const [materialTypeOptions, setMaterialTypeOptions] = useState<string[]>([]);
  const [ventTypeOptions, setVentTypeOptions] = useState<string[]>([]);

  useEffect(() => {
    loadGlazingPanelRequirements();
    loadFilterOptions();
  }, [page, pageSize, sortColumn, sortDirection, filters]);

  async function loadGlazingPanelRequirements() {
    setLoading(true);
    try {
      let query = supabase
        .from('glazing_panel_requirements')
        .select('*', { count: 'exact' });
      
      if (filters.model) query = query.eq('model', filters.model);
      if (filters.section) query = query.eq('section', filters.section);
      if (filters.material_type) query = query.eq('material_type', filters.material_type);
      if (filters.vent_type) query = query.eq('vent_type', filters.vent_type);
      
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
      query = query.range((page - 1) * pageSize, page * pageSize - 1);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setGlazingPanelRequirements(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load glazing panel requirements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  async function loadFilterOptions() {
    try {
      const { data: modelData } = await supabase.from('glazing_panel_requirements').select('model').order('model');
      const { data: sectionData } = await supabase.from('glazing_panel_requirements').select('section').order('section');
      const { data: materialTypeData } = await supabase.from('glazing_panel_requirements').select('material_type').order('material_type');
      const { data: ventTypeData } = await supabase.from('glazing_panel_requirements').select('vent_type').order('vent_type');
      
      if (modelData) setModelOptions(Array.from(new Set(modelData.map(item => item.model).filter(Boolean) as string[])));
      if (sectionData) setSectionOptions(Array.from(new Set(sectionData.map(item => item.section).filter(Boolean) as string[])));
      if (materialTypeData) setMaterialTypeOptions(Array.from(new Set(materialTypeData.map(item => item.material_type).filter(Boolean) as string[])));
      if (ventTypeData) setVentTypeOptions(Array.from(new Set(ventTypeData.map(item => item.vent_type).filter(Boolean) as string[])));

    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSort = (column: keyof GlazingPanelRequirement) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this requirement?')) return;
    try {
      const { error } = await supabase.from('glazing_panel_requirements').delete().eq('id', id);
      if (error) throw error;
      loadGlazingPanelRequirements(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete requirement');
      console.error(err);
    }
  };

  const columns: { key: keyof GlazingPanelRequirement; label: string; sortable?: boolean }[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'model', label: 'Model', sortable: true },
    { key: 'width', label: 'Width', sortable: true },
    { key: 'eave_height', label: 'Eave Height', sortable: true },
    { key: 'section', label: 'Section', sortable: true },
    { key: 'vent_type', label: 'Vent Type', sortable: true },
    { key: 'bay', label: 'Bay', sortable: true },
    { key: 'material_type', label: 'Material Type', sortable: true },
    { key: 'panel_length', label: 'Panel Length', sortable: true },
  ];

  if (loading && glazingPanelRequirements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Glazing Panel Requirements</h2>
        <button
          onClick={() => { setEditingItem(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Panel Requirement
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg flex items-center gap-2">
          <X className="w-5 h-5" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-sm hover:underline">Dismiss</button>
        </div>
      )}

      {showForm ? (
        <GlazingPanelRequirementForm
          item={editingItem}
          modelOptions={modelOptions}
          sectionOptions={sectionOptions}
          materialTypeOptions={materialTypeOptions}
          ventTypeOptions={ventTypeOptions}
          onSubmit={() => { loadGlazingPanelRequirements(); setShowForm(false); setEditingItem(null); }}
          onCancel={() => { setShowForm(false); setEditingItem(null); }}
        />
      ) : (
        <>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg">
            <div>
              <label htmlFor="modelFilter" className="block text-sm font-medium text-gray-300">Model</label>
              <select id="modelFilter" value={filters.model} onChange={(e) => handleFilterChange('model', e.target.value)} className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-white">
                <option value="">All Models</option>
                {modelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="sectionFilter" className="block text-sm font-medium text-gray-300">Section</label>
              <select id="sectionFilter" value={filters.section} onChange={(e) => handleFilterChange('section', e.target.value)} className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-white">
                <option value="">All Sections</option>
                {sectionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="materialTypeFilter" className="block text-sm font-medium text-gray-300">Material Type</label>
              <select id="materialTypeFilter" value={filters.material_type} onChange={(e) => handleFilterChange('material_type', e.target.value)} className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-white">
                <option value="">All Material Types</option>
                {materialTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="ventTypeFilter" className="block text-sm font-medium text-gray-300">Vent Type</label>
              <select id="ventTypeFilter" value={filters.vent_type} onChange={(e) => handleFilterChange('vent_type', e.target.value)} className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm text-white">
                <option value="">All Vent Types</option>
                {ventTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-gray-800 rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750">
                <tr>
                  {columns.map(col => (
                    <th key={col.key as string} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => col.sortable && handleSort(col.key)}>
                      <div className="flex items-center">
                        {col.label}
                        {col.sortable && sortColumn === col.key && (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />
                        )}
                      </div>
                    </th>
                  ))}
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {glazingPanelRequirements.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-750">
                    {columns.map(col => (
                      <td key={col.key as string} className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {String(item[col.key] === null || item[col.key] === undefined ? '-' : item[col.key])}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => { setEditingItem(item); setShowForm(true); }} className="text-emerald-500 hover:text-emerald-400 mr-4"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <span className="text-sm text-gray-400">
                Showing {Math.min((page - 1) * pageSize + 1, totalCount)} to {Math.min(page * pageSize, totalCount)} of {totalCount} entries
              </span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="ml-2 p-1 bg-gray-700 border border-gray-600 rounded-md text-sm text-white">
                {pageSizeOptions.map(size => <option key={size} value={size}>{size} per page</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-600"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm text-gray-400">Page {page} of {Math.ceil(totalCount / pageSize)}</span>
              <button onClick={() => setPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))} disabled={page === Math.ceil(totalCount / pageSize)} className="p-2 bg-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-600"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
