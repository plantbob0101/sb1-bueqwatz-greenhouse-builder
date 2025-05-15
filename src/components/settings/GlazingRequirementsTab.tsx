import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Loader2, ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/supabase';
import GlazingRequirementForm from './GlazingRequirementForm';

// Type for our glazing requirements
type GlazingRequirement = Database['public']['Tables']['glazing_requirements']['Row'];

// Define filter state type
interface FilterState {
  model: string;
  section: string;
  width: string;
  eaveHeight: string;
}

export default function GlazingRequirementsTab() {
  // State for glazing requirements data
  const [glazingRequirements, setGlazingRequirements] = useState<GlazingRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for CRUD operations
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GlazingRequirement | null>(null);
  
  // State for filtering and pagination
  const [filters, setFilters] = useState<FilterState>({
    model: '',
    section: '',
    width: '',
    eaveHeight: ''
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Page size options
  const pageSizeOptions = [5, 10, 25, 50, 100];
  const [totalCount, setTotalCount] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof GlazingRequirement>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // State for unique filter options (from data)
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [sectionOptions, setSectionOptions] = useState<string[]>([]);
  const [widthOptions, setWidthOptions] = useState<number[]>([]);
  const [eaveHeightOptions, setEaveHeightOptions] = useState<number[]>([]);

  // Load glazing requirements data
  useEffect(() => {
    loadGlazingRequirements();
    loadFilterOptions();
  }, [page, pageSize, sortColumn, sortDirection, filters]);

  // Function to load glazing requirements with filtering, sorting and pagination
  async function loadGlazingRequirements() {
    setLoading(true);
    try {
      // Start building the query
      let query = supabase
        .from('glazing_requirements')
        .select('*', { count: 'exact' });
      
      // Apply filters if they exist
      if (filters.model) {
        query = query.eq('model', filters.model);
      }
      if (filters.section) {
        query = query.eq('section', filters.section);
      }
      if (filters.width) {
        query = query.eq('width', parseInt(filters.width));
      }
      if (filters.eaveHeight) {
        query = query.eq('eave_height', parseInt(filters.eaveHeight));
      }
      
      // Apply sorting
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
      
      // Apply pagination
      query = query.range((page - 1) * pageSize, page * pageSize - 1);
      
      // Execute query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      setGlazingRequirements(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load glazing requirements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  
  // Function to load filter options (unique values for dropdown filters)
  async function loadFilterOptions() {
    try {
      // Get unique models
      const { data: modelData } = await supabase
        .from('glazing_requirements')
        .select('model')
        .order('model');
      
      // Get unique sections
      const { data: sectionData } = await supabase
        .from('glazing_requirements')
        .select('section')
        .order('section');
      
      // Get unique widths
      const { data: widthData } = await supabase
        .from('glazing_requirements')
        .select('width')
        .order('width');
      
      // Get unique eave heights
      const { data: eaveHeightData } = await supabase
        .from('glazing_requirements')
        .select('eave_height')
        .order('eave_height');
      
      // Extract unique values and set state
      if (modelData) {
        const uniqueModels = Array.from(new Set(modelData.map(item => item.model)));
        setModelOptions(uniqueModels);
      }
      
      if (sectionData) {
        const uniqueSections = Array.from(new Set(sectionData.map(item => item.section)));
        setSectionOptions(uniqueSections);
      }
      
      if (widthData) {
        const uniqueWidths = Array.from(new Set(widthData.map(item => item.width)));
        setWidthOptions(uniqueWidths);
      }
      
      if (eaveHeightData) {
        const uniqueEaveHeights = Array.from(new Set(eaveHeightData.map(item => item.eave_height)));
        setEaveHeightOptions(uniqueEaveHeights);
      }
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  }

  // Function to handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filter changes
  };

  // Function to handle column sort
  const handleSort = (column: keyof GlazingRequirement) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Render loading state
  if (loading && glazingRequirements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with add button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Glazing Requirements</h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Requirement
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg flex items-center gap-2">
          <X className="w-5 h-5" />
          {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-800 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Model</label>
          <select
            value={filters.model}
            onChange={(e) => handleFilterChange('model', e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Models</option>
            {modelOptions.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Section</label>
          <select
            value={filters.section}
            onChange={(e) => handleFilterChange('section', e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Sections</option>
            {sectionOptions.map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Width</label>
          <select
            value={filters.width}
            onChange={(e) => handleFilterChange('width', e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Widths</option>
            {widthOptions.map(width => (
              <option key={width} value={width.toString()}>{width}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Eave Height</label>
          <select
            value={filters.eaveHeight}
            onChange={(e) => handleFilterChange('eaveHeight', e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Eave Heights</option>
            {eaveHeightOptions.map(height => (
              <option key={height} value={height.toString()}>{height}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main data table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-750">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('id')}
                    className="flex items-center gap-1"
                  >
                    ID
                    {sortColumn === 'id' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('model')}
                    className="flex items-center gap-1"
                  >
                    Model
                    {sortColumn === 'model' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('width')}
                    className="flex items-center gap-1"
                  >
                    Width
                    {sortColumn === 'width' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('eave_height')}
                    className="flex items-center gap-1"
                  >
                    Eave Height
                    {sortColumn === 'eave_height' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('section')}
                    className="flex items-center gap-1"
                  >
                    Section
                    {sortColumn === 'section' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('vent_type')}
                    className="flex items-center gap-1"
                  >
                    Vent Type
                    {sortColumn === 'vent_type' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('bay')}
                    className="flex items-center gap-1"
                  >
                    Bay
                    {sortColumn === 'bay' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('material_type')}
                    className="flex items-center gap-1"
                  >
                    Material
                    {sortColumn === 'material_type' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button 
                    onClick={() => handleSort('area_sq_ft')}
                    className="flex items-center gap-1"
                  >
                    Area (sq ft)
                    {sortColumn === 'area_sq_ft' && (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {glazingRequirements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-400">
                    No glazing requirements found. Try adjusting your filters or add a new requirement.
                  </td>
                </tr>
              ) : (
                glazingRequirements.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {item.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {item.model}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {item.width}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {item.eave_height}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {item.section}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {item.vent_type || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {item.bay || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {item.material_type}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {item.area_sq_ft ?? '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowForm(true);
                        }}
                        className="text-emerald-500 hover:text-emerald-400 mr-4"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination controls */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-700">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} entries
            </div>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1); // Reset to first page when changing page size
              }}
              className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`p-2 rounded-lg ${page === 1 ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-white px-2">
              Page {page} of {Math.ceil(totalCount / pageSize)}
            </div>
            <button
              onClick={() => setPage(Math.min(Math.ceil(totalCount / pageSize), page + 1))}
              disabled={page >= Math.ceil(totalCount / pageSize)}
              className={`p-2 rounded-lg ${page >= Math.ceil(totalCount / pageSize) ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Form modal will be implemented separately */}
      {showForm && (
        <GlazingRequirementForm
          item={editingItem}
          modelOptions={modelOptions}
          sectionOptions={sectionOptions}
          onSubmit={() => {
            loadGlazingRequirements();
            setShowForm(false);
            setEditingItem(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );

  // Function to handle delete
  async function handleDelete(id: number) {
    if (!window.confirm('Are you sure you want to delete this glazing requirement? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('glazing_requirements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh data
      loadGlazingRequirements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete glazing requirement');
    }
  }
}


