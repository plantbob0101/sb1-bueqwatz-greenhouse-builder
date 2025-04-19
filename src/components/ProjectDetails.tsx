import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Ruler, Thermometer, Wind, Edit2, Share2, Trash2, Save, X, Plus, Fan } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import VentForm from './VentForm';
import RollupWallForm from './RollupWallForm';
import DropWallForm from './DropWallForm';
import ShareProjectModal from './ShareProjectModal';

type Structure = Database['public']['Tables']['structures']['Row'];
type StructureUpdate = Database['public']['Tables']['structures']['Update'];
type StructureUserEntry = Database['public']['Tables']['structure_user_entries']['Row'];

// Combined type for the structure and user entry
interface CombinedStructure {
  structure_id: string;
  model: string;
  length: number;
  length_ft: number;
  spacing: number;
  project_name: string;
  description: string;
  zones: number;
  ranges: number;
  houses: number;
  width_ft: number;
  eave_height: number;
  roof_glazing: string;
  covering_roof: string;
  covering_sidewalls: string;
  covering_endwalls: string;
  covering_gables: string;
  gutter_partitions: number;
  gable_partitions: number;
}

interface ProjectDetailsProps {
  structureId: string;
  onBack: () => void;
  onDelete: () => void;
}

// --- CurtainFabric type for local use ---
type CurtainFabric = {
  fabric_id: string;
  fabric_name: string;
  fabric_type: 'Shade' | 'Blackout' | 'Insect Screen';
  price_0_5000: number;
  price_5000_20000: number;
  price_20000_plus: number;
  width_size: number[];
};

// --- Helper to get curtain fabric price for area ---
function getCurtainFabricPrice(fabric: CurtainFabric | null, area: number): number | null {
  if (!fabric) return null;
  if (area > 0 && area <= 5000) return fabric.price_0_5000;
  if (area > 5000 && area <= 20000) return fabric.price_5000_20000;
  if (area > 20000) return fabric.price_20000_plus;
  return null;
}

export default function ProjectDetails({ structureId, onBack, onDelete }: ProjectDetailsProps) {
  const [structure, setStructure] = useState<CombinedStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [vents, setVents] = useState<any[]>([]);
  const [showVentForm, setShowVentForm] = useState(false);
  const [editingVent, setEditingVent] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStructure, setEditedStructure] = useState<StructureUpdate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [rollupWalls, setRollupWalls] = useState<any[]>([]);
  const [dropWalls, setDropWalls] = useState<any[]>([]);
  const [showRollupWallForm, setShowRollupWallForm] = useState(false);
  const [showDropWallForm, setShowDropWallForm] = useState(false);
  const [editingRollupWall, setEditingRollupWall] = useState<any | null>(null);
  const [editingDropWall, setEditingDropWall] = useState<any | null>(null);

  const GLAZING_TYPES = ['CPC', 'PC8', 'Poly'] as const;
  
  const [rollupWallDrives, setRollupWallDrives] = useState<Record<string, any>>({});

  const [curtainFabrics, setCurtainFabrics] = useState<CurtainFabric[]>([]);

  useEffect(() => {
    async function fetchStructure() {
      try {
        const { data: userEntry, error: userEntryError } = await supabase
          .from('structure_user_entries')
          .select('*')
          .eq('entry_id', structureId)
          .single();

        if (userEntryError) throw userEntryError;

        const { data: structureData, error: structureError } = await supabase
          .from('structures')
          .select('*')
          .eq('structure_id', userEntry.structure_id)
          .single();

        if (structureError) throw structureError;

        // Combine the data, omitting the duplicate structure_id from userEntry
        const { structure_id: _, ...userEntryWithoutStructureId } = userEntry;
        setStructure({ ...structureData, ...userEntryWithoutStructureId });
        setEditedStructure({ ...structureData, ...userEntryWithoutStructureId });

        // Load vents
        const { data: ventData, error: ventError } = await supabase
          .from('vents')
          .select(`
            vent_id,
            vent_type,
            single_double,
            vent_size,
            vent_quantity,
            vent_length,
            ati_house,
            notes,
            drive:vent_drives (
              drive_id,
              drive_type,
              motor_specifications
            ),
            vent_insect_screen (
              type,
              quantity,
              length,
              width,
              notes,
              slitting_fee
            )
          `)
          .eq('structure_id', structureId);

        if (ventError) throw ventError;
        setVents(ventData || []);

        // Load roll-up walls
        const { data: wallData, error: wallError } = await supabase
          .from('rollup_walls')
          .select('*')
          .eq('structure_id', structureId);

        if (wallError) throw wallError;
        setRollupWalls(wallData || []);

        // Load drop walls
        const { data: dropWallData, error: dropWallError } = await supabase
          .from('drop_walls')
          .select('*')
          .eq('structure_id', structureId);

        if (dropWallError) throw dropWallError;
        setDropWalls(dropWallData || []);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch structure details');
      } finally {
        setLoading(false);
      }
    }

    fetchStructure();
  }, [structureId]);

  useEffect(() => {
    async function fetchFabrics() {
      const { data, error } = await supabase
        .from('curtain_fabrics')
        .select('*')
        .eq('fabric_type', 'Insect Screen');
      if (!error && data) setCurtainFabrics(data);
      else setCurtainFabrics([]);
    }
    fetchFabrics();
  }, []);

  useEffect(() => {
    if (rollupWalls.length > 0) {
      const driveIds = rollupWalls
        .filter(wall => wall.drive_id)
        .map(wall => wall.drive_id);

      if (driveIds.length > 0) {
        loadDrives(driveIds);
      }
    }
  }, [rollupWalls]);

  const loadDrives = async (driveIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('rollup_drop_drives')
        .select('*')
        .in('drive_id', driveIds);

      if (error) throw error;

      const drivesMap = (data || []).reduce((acc, drive) => ({
        ...acc,
        [drive.drive_id]: drive
      }), {});

      setRollupWallDrives(drivesMap);
    } catch (err) {
      console.error('Error loading drives:', err);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedStructure(structure);
  };

  const handleSave = async () => {
    if (!editedStructure) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const { error } = await supabase
        .from('structure_user_entries')
        .update(editedStructure)
        .eq('entry_id', structureId);

      if (error) throw error;
      setStructure(editedStructure as CombinedStructure);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedStructure(structure);
    setSaveError(null);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('structure_user_entries')
        .delete()
        .eq('entry_id', structureId);

      if (error) throw error;
      onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editedStructure) return;
    const { name, value, type } = e.target;
    setEditedStructure(prev => ({
      ...prev!,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleAddVent = async (ventPayload: any) => {
    try {
      setError(null);
      console.log('Adding vent with payload:', ventPayload);

      // Create the vent
      const { data: newVent, error: ventError } = await supabase
        .from('vents')
        .insert([{
          structure_id: structureId,
          vent_type: ventPayload.vent_type,
          single_double: ventPayload.single_double,
          vent_size: ventPayload.vent_size,
          vent_quantity: ventPayload.vent_quantity,
          vent_length: ventPayload.vent_length,
          ati_house: ventPayload.ati_house,
          notes: ventPayload.notes,
          drive_id: ventPayload.drive_id
        }])
        .select()
        .single();

      if (ventError) throw ventError;

      // If there's an insect screen, create it
      if (ventPayload.vent_insect_screen?.[0]) {
        const configMultiplier = ventPayload.single_double === 'Double' ? 2 : 1;
        const screenData = {
          vent_id: newVent.vent_id,
          type: ventPayload.vent_insect_screen[0].type,
          quantity: ventPayload.vent_quantity * configMultiplier, // Use vent quantity x config
          length: ventPayload.vent_length, // Use vent length
          width: ventPayload.vent_insect_screen[0].width,
          notes: ventPayload.notes,
          slitting_fee: ventPayload.vent_insect_screen[0].slitting_fee || 0.22 // Add slitting fee
        };

        const { error: screenError } = await supabase
          .from('vent_insect_screen')
          .insert([screenData]);

        if (screenError) throw screenError;
      }

      // Refresh the vents data with a complete query
      const { data: refreshedVentData, error: refreshError } = await supabase
        .from('vents')
        .select(`
          vent_id,
          vent_type,
          single_double,
          vent_size,
          vent_quantity,
          vent_length,
          ati_house,
          notes,
          drive:vent_drives (
            drive_id,
            drive_type,
            motor_specifications
          ),
          vent_insect_screen (
            type,
            quantity,
            length,
            width,
            notes,
            slitting_fee
          )
        `)
        .eq('structure_id', structureId);

      if (refreshError) throw refreshError;
      setVents(refreshedVentData || []);
      setShowVentForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the vent');
    }
  };

  const handleUpdateVent = async (ventId: string, ventPayload: any) => {
    try {
      setError(null);

      // Update the vent
      const { error: ventError } = await supabase
        .from('vents')
        .update({
          vent_type: ventPayload.vent_type,
          single_double: ventPayload.single_double,
          vent_size: ventPayload.vent_size,
          vent_quantity: ventPayload.vent_quantity,
          vent_length: ventPayload.vent_length,
          ati_house: ventPayload.ati_house,
          notes: ventPayload.notes
        })
        .eq('vent_id', ventId);

      if (ventError) throw ventError;

      // If there's an insect screen, update it with the new vent quantity and length
      if (ventPayload.vent_insect_screen?.[0]) {
        const configMultiplier = ventPayload.single_double === 'Double' ? 2 : 1;
        const { error: screenError } = await supabase
          .from('vent_insect_screen')
          .update({
            type: ventPayload.vent_insect_screen[0].type,
            quantity: ventPayload.vent_quantity * configMultiplier, // Use vent quantity x config
            length: ventPayload.vent_length, // Use vent length
            width: ventPayload.vent_insect_screen[0].width,
            notes: ventPayload.notes,
            slitting_fee: ventPayload.vent_insect_screen[0].slitting_fee || 0.22 // Preserve slitting fee
          })
          .eq('vent_id', ventId);

        if (screenError) throw screenError;
      }

      // Refresh the vents data with a complete query
      const { data: refreshedVentData, error: refreshError } = await supabase
        .from('vents')
        .select(`
          vent_id,
          vent_type,
          single_double,
          vent_size,
          vent_quantity,
          vent_length,
          ati_house,
          notes,
          drive:vent_drives (
            drive_id,
            drive_type,
            motor_specifications
          ),
          vent_insect_screen (
            type,
            quantity,
            length,
            width,
            notes,
            slitting_fee
          )
        `)
        .eq('structure_id', structureId);

      if (refreshError) throw refreshError;
      setVents(refreshedVentData || []);
      setShowVentForm(false);
      setEditingVent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the vent');
    }
  };

  const handleDeleteVent = async (ventId: string) => {
    if (!window.confirm('Are you sure you want to delete this vent?')) return;

    try {
      const { error } = await supabase
        .from('vents')
        .delete()
        .eq('vent_id', ventId);

      if (error) throw error;
      setVents(vents.filter(v => v.vent_id !== ventId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vent');
    }
  };

  const handleAddRollupWall = async (wallData: any) => {
    try {
      const { data, error } = await supabase
        .from('rollup_walls')
        .insert([{ ...wallData, structure_id: structureId }])
        .select()
        .single();

      if (error) throw error;
      setRollupWalls([...rollupWalls, data]);
      setShowRollupWallForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add roll-up wall');
    }
  };

  const handleUpdateRollupWall = async (wallId: string, wallData: any) => {
    try {
      const { error } = await supabase
        .from('rollup_walls')
        .update(wallData)
        .eq('rollup_wall_id', wallId);

      if (error) throw error;

      setRollupWalls(walls => walls.map(w => 
        w.rollup_wall_id === wallId ? { ...w, ...wallData } : w
      ));
      setEditingRollupWall(null);
      setShowRollupWallForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update roll-up wall');
    }
  };

  const handleDeleteRollupWall = async (wallId: string) => {
    if (!window.confirm('Are you sure you want to delete this roll-up wall?')) return;

    try {
      const { error } = await supabase
        .from('rollup_walls')
        .delete()
        .eq('rollup_wall_id', wallId);

      if (error) throw error;
      setRollupWalls(walls => walls.filter(w => w.rollup_wall_id !== wallId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete roll-up wall');
    }
  };

  const handleAddDropWall = async (wallData: any) => {
    try {
      const { data, error } = await supabase
        .from('drop_walls')
        .insert([{ ...wallData, structure_id: structureId }])
        .select()
        .single();

      if (error) throw error;
      setDropWalls([...dropWalls, data]);
      setShowDropWallForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add drop wall');
    }
  };

  const handleUpdateDropWall = async (wallId: string, wallData: any) => {
    try {
      const { error } = await supabase
        .from('drop_walls')
        .update(wallData)
        .eq('drop_wall_id', wallId);

      if (error) throw error;

      setDropWalls(walls => walls.map(w => 
        w.drop_wall_id === wallId ? { ...w, ...wallData } : w
      ));
      setEditingDropWall(null);
      setShowDropWallForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update drop wall');
    }
  };

  const handleDeleteDropWall = async (wallId: string) => {
    if (!window.confirm('Are you sure you want to delete this drop wall?')) return;

    try {
      const { error } = await supabase
        .from('drop_walls')
        .delete()
        .eq('drop_wall_id', wallId);

      if (error) throw error;
      setDropWalls(walls => walls.filter(w => w.drop_wall_id !== wallId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete drop wall');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-emerald-500">Loading...</div>
      </div>
    );
  }

  if (error || !structure) {
    return (
      <div className="text-red-500 p-4 text-center">
        {error || 'Project not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold flex-1">
          {structure.project_name || 'Untitled Project'}
        </h2>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-emerald-500"
                title="Share Project"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleEdit}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-emerald-500"
                title="Edit Project"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-red-500"
                title="Delete Project"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-emerald-500"
                title="Save Changes"
              >
                <Save className="w-5 h-5" />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400"
                title="Cancel Editing"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {saveError && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>
          <dl className="space-y-2 text-gray-300">
            <div className="flex justify-between">
              <dt>Project Name:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <input
                    type="text"
                    name="project_name"
                    value={editedStructure?.project_name || ''}
                    onChange={handleInputChange}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1"
                  />
                ) : (
                  structure.project_name || 'Untitled Project'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Description:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <input
                    type="text"
                    name="description"
                    value={editedStructure?.description || ''}
                    onChange={handleInputChange}
                    className="bg-gray-700 border border-gray-600 rounded w-full px-2 py-1"
                  />
                ) : (
                  structure.description || 'No description provided'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Model:</dt>
              <dd className="font-medium">
                {structure.model || 'N/A'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Spacing:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <input
                    type="number"
                    name="spacing"
                    value={editedStructure?.spacing}
                    onChange={handleInputChange}
                    min={1}
                    max={10}
                    className="bg-gray-700 border border-gray-600 rounded w-20 px-2 py-1"
                  />
                ) : (
                  structure.spacing ? `${structure.spacing} ft` : 'N/A'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Width:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <input
                    type="number"
                    name="width_ft"
                    value={editedStructure?.width_ft}
                    onChange={handleInputChange}
                    min={10}
                    max={100}
                    className="bg-gray-700 border border-gray-600 rounded w-20 px-2 py-1"
                  />
                ) : (
                  structure.width_ft ? `${structure.width_ft} ft` : 'N/A'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Length:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <input
                    type="number"
                    name="length_ft"
                    value={editedStructure?.length_ft}
                    onChange={handleInputChange}
                    min={20}
                    max={300}
                    className="bg-gray-700 border border-gray-600 rounded w-20 px-2 py-1"
                  />
                ) : (
                  structure.length_ft ? `${structure.length_ft} ft` : 'N/A'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Eave Height:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <input
                    type="number"
                    name="eave_height"
                    value={editedStructure?.eave_height}
                    onChange={handleInputChange}
                    className="bg-gray-700 border border-gray-600 rounded w-20 px-2 py-1"
                  />
                ) : (
                  structure.eave_height ? `${structure.eave_height} ft` : 'N/A'
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Ruler className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Additional Specifications</h3>
          </div>
          <dl className="space-y-2 text-gray-300">
            <div className="flex justify-between">
              <dt>Zones:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <input
                    type="number"
                    name="zones"
                    value={editedStructure?.zones}
                    onChange={handleInputChange}
                    min={1}
                    max={10}
                    className="bg-gray-700 border border-gray-600 rounded w-20 px-2 py-1"
                  />
                ) : (
                  structure.zones || 'N/A'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Ranges:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <input
                    type="number"
                    name="ranges"
                    value={editedStructure?.ranges || 1}
                    onChange={handleInputChange}
                    min={1}
                    max={20}
                    className="bg-gray-700 border border-gray-600 rounded w-20 px-2 py-1"
                  />
                ) : (
                  structure.ranges || 'N/A'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Houses:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <input
                    type="number"
                    name="houses"
                    value={editedStructure?.houses || 1}
                    onChange={handleInputChange}
                    min={1}
                    max={20}
                    className="bg-gray-700 border border-gray-600 rounded w-20 px-2 py-1"
                  />
                ) : (
                  structure.houses || 'N/A'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>A Bays:</dt>
              <dd className="font-medium">2</dd>
            </div>
            <div className="flex justify-between">
              <dt>B Bays:</dt>
              <dd className="font-medium">{Math.floor(structure.length_ft / 12) - 2}</dd>
            </div>
            <div className="flex justify-between">
              <dt>C Bays:</dt>
              <dd className="font-medium">{2 * ((structure.houses || 1) - 1)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>D Bays:</dt>
              <dd className="font-medium">{(Math.floor(structure.length_ft / 12) - 2) * ((structure.houses || 1) - 1)}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Wind className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Glazing & Partitions</h3>
          </div>
          <dl className="space-y-2 text-gray-300">
            <div className="flex justify-between">
              <dt>Roof Glazing:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <select
                    name="roof_glazing"
                    value={editedStructure?.roof_glazing || 'PC8'}
                    onChange={handleInputChange}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1"
                  >
                    {GLAZING_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  structure.roof_glazing || 'N/A'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Roof Covering:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <select
                    name="covering_roof"
                    value={editedStructure?.covering_roof || 'PC8'}
                    onChange={handleInputChange}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1"
                  >
                    {GLAZING_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  structure.covering_roof || 'N/A'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Sidewall Covering:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <select
                    name="covering_sidewalls"
                    value={editedStructure?.covering_sidewalls || 'PC8'}
                    onChange={handleInputChange}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1"
                  >
                    {GLAZING_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  structure.covering_sidewalls || 'N/A'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Endwall Covering:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <select
                    name="covering_endwalls"
                    value={editedStructure?.covering_endwalls || 'PC8'}
                    onChange={handleInputChange}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1"
                  >
                    {GLAZING_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  structure.covering_endwalls || 'N/A'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Gable Covering:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <select
                    name="covering_gables"
                    value={editedStructure?.covering_gables || 'PC8'}
                    onChange={handleInputChange}
                    className="bg-gray-700 border border-gray-600 rounded px-2 py-1"
                  >
                    {GLAZING_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                ) : (
                  structure.covering_gables || 'N/A'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Gutter Partitions:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <input
                    type="number"
                    name="gutter_partitions"
                    value={editedStructure?.gutter_partitions}
                    onChange={handleInputChange}
                    min={0}
                    max={10}
                    className="bg-gray-700 border border-gray-600 rounded w-20 px-2 py-1"
                  />
                ) : (
                  structure.gutter_partitions || 'N/A'
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Gable Partitions:</dt>
              <dd className="font-medium">
                {isEditing ? (
                  <input
                    type="number"
                    name="gable_partitions"
                    value={editedStructure?.gable_partitions}
                    onChange={handleInputChange}
                    min={0}
                    max={10}
                    className="bg-gray-700 border border-gray-600 rounded w-20 px-2 py-1"
                  />
                ) : (
                  structure.gable_partitions || 'N/A'
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Fan className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Vents</h3>
          </div>
          <button
            onClick={() => {
              setEditingVent(null);
              setShowVentForm(true);
            }}
            className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Vent
          </button>
        </div>

        {showVentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <VentForm
                vent={editingVent}
                onSubmit={editingVent ? handleUpdateVent.bind(null, editingVent.vent_id) : handleAddVent}
                onCancel={() => {
                  setShowVentForm(false);
                  setEditingVent(null);
                }}
                structure={{
                  model: structure?.model || '',
                  length: structure?.length_ft || 0
                }}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {vents.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No vents added yet</p>
          ) : (
            vents.map((vent) => {
              let curtainPrice: number | null = null;
              let totalArea = 0;
              let notes = null;
              let minFabricWidth = 0;
              let fabricArea = 0;
              if (
                vent.vent_insect_screen &&
                vent.vent_insect_screen.length > 0
              ) {
                const screen = vent.vent_insect_screen[0];
                totalArea = screen.quantity * screen.length * screen.width;
                const fabric = curtainFabrics.find(f => f.fabric_name === screen.type);
                if (fabric && fabric.width_size.length > 0) {
                  const sorted = [...fabric.width_size].sort((a, b) => a - b);
                  minFabricWidth = sorted.find(w => w >= screen.width) || sorted[0];
                }
                fabricArea = minFabricWidth * screen.length * vent.vent_quantity;
                curtainPrice = getCurtainFabricPrice(fabric || null, fabricArea);
                notes = screen.notes;
              }
              return (
                <div
                  key={vent.vent_id}
                  className="bg-gray-750 p-4 rounded-lg flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{vent.vent_type}</h4>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>Size: {vent.vent_size}" ({vent.single_double})</p>
                      <p>Quantity: {vent.vent_quantity}</p>
                      <p>Length: {vent.vent_length}'</p>
                      <p>ATI House: {vent.ati_house}</p>
                      <p>Drive: {vent.drive ? `${vent.drive.drive_type} - ${vent.drive.motor_specifications || 'No specs'}` : 'No drive selected'}</p>
                      {/* Display insect screen information if available */}
                      {vent.vent_insect_screen && vent.vent_insect_screen.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <p className="font-medium text-emerald-400">Insect Screen:</p>
                          <p>Type: {vent.vent_insect_screen[0].type}</p>
                          <p>Quantity: {vent.vent_insect_screen[0].quantity}</p>
                          <p>Length: {vent.vent_insect_screen[0].length}'</p>
                          <p>Width: {vent.vent_insect_screen[0].width}'</p>
                          <p>Total Area: {fabricArea.toFixed(2)} sq ft</p>
                          {curtainPrice !== null ? (
                            <p className="text-emerald-400 font-semibold mt-1">Curtain Fabric Price: ${curtainPrice}</p>
                          ) : (
                            <p className="text-red-400 font-semibold mt-1">No price available for this area.</p>
                          )}
                          <p className="text-emerald-400 font-bold mt-1">Total Linear Feet to Cut: {(vent.vent_insect_screen[0].length * vent.vent_quantity).toFixed(1)} ft</p>
                          <p className="text-emerald-400 font-bold mt-1">Slitting Fee: ${(vent.vent_insect_screen[0].slitting_fee || 0.22).toFixed(3)} per linear foot</p>
                          <p className="text-emerald-400 font-bold mt-1">Fabric Total Area: {fabricArea.toFixed(2)} sq ft (using {minFabricWidth.toFixed(1)}' width)</p>
                          {notes && (
                            <p>Notes: {notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingVent(vent);
                        setShowVentForm(true);
                      }}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-emerald-500"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVent(vent.vent_id)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wind className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Roll-up Walls</h3>
          </div>
          <button
            onClick={() => {
              setEditingRollupWall(null);
              setShowRollupWallForm(true);
            }}
            className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Roll-up Wall
          </button>
        </div>

        {showRollupWallForm && (
          <RollupWallForm
            wall={editingRollupWall}
            onSubmit={(data) => {
              if (editingRollupWall) {
                handleUpdateRollupWall(editingRollupWall.rollup_wall_id, data);
              } else {
                handleAddRollupWall(data);
              }
            }}
            onCancel={() => {
              setShowRollupWallForm(false);
              setEditingRollupWall(null);
            }}
          />
        )}

        <div className="space-y-4">
          {rollupWalls.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No roll-up walls added yet</p>
          ) : (
            rollupWalls.map((wall) => (
              <div
                key={wall.rollup_wall_id}
                className="bg-gray-750 p-4 rounded-lg flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">{wall.wall_location} Roll-up Wall</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Dimensions: {wall.wall_height}' × {wall.wall_length}'</p>
                    <p>Drive: {wall.drive_type}
                      {wall.drive_type === 'Motorized' && wall.drive_id && rollupWallDrives[wall.drive_id] 
                        ? ` - ${rollupWallDrives[wall.drive_id].motor_model}`
                        : ''}
                    </p>
                    <p>Type: {wall.type}</p>
                    <p>Quantity: {wall.quantity}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingRollupWall(wall);
                      setShowRollupWallForm(true);
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-emerald-500"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRollupWall(wall.rollup_wall_id)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Wind className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Drop Walls</h3>
          </div>
          <button
            onClick={() => {
              setEditingDropWall(null);
              setShowDropWallForm(true);
            }}
            className="flex items-center gap-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Drop Wall
          </button>
        </div>

        {showDropWallForm && (
          <DropWallForm
            wall={editingDropWall}
            onSubmit={(data) => {
              if (editingDropWall) {
                handleUpdateDropWall(editingDropWall.drop_wall_id, data);
              } else {
                handleAddDropWall(data);
              }
            }}
            onCancel={() => {
              setShowDropWallForm(false);
              setEditingDropWall(null);
            }}
          />
        )}

        <div className="space-y-4">
          {dropWalls.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No drop walls added yet</p>
          ) : (
            dropWalls.map((wall) => (
              <div
                key={wall.drop_wall_id}
                className="bg-gray-750 p-4 rounded-lg flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">Drop Wall ({wall.type})</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Dimensions: {wall.wall_height}' × {wall.wall_length}'</p>
                    <p>Drive: {wall.drive_type}
                      {wall.drive_type === 'Motorized' && wall.motor_model 
                        ? ` - ${wall.motor_model}`
                        : ''}
                    </p>
                    <p>Quantity: {wall.quantity}</p>
                    <p>NS30: {wall.ns30}</p>
                    <p>Spacing: {wall.spacing}</p>
                    <p>ATI House: {wall.ati_house}</p>
                    {wall.braking_winch_with_mount > 0 && (
                      <p>Braking Winch: {wall.braking_winch_with_mount}</p>
                    )}
                    {wall.additional_corner_pockets > 0 && (
                      <p>Corner Pockets: {wall.additional_corner_pockets}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingDropWall(wall);
                      setShowDropWallForm(true);
                    }}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-emerald-500"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDropWall(wall.drop_wall_id)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <Thermometer className="w-6 h-6 text-emerald-500" />
          <h3 className="text-lg font-semibold">Environmental Controls</h3>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-emerald-500">Cooling System</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Exhaust Fans</span>
                  <span className="text-gray-400">4 × 48" Belt Drive</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Evaporative Cooling</span>
                  <span className="text-gray-400">6' × 40' CELdek System</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Air Circulation</span>
                  <span className="text-gray-400">8 × HAF-20 Fans</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-emerald-500">Heating System</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Unit Heaters</span>
                  <span className="text-gray-400">2 × 250,000 BTU</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Under-Bench</span>
                  <span className="text-gray-400">4 × Hot Water Loops</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Energy Curtain</span>
                  <span className="text-gray-400">Dual-Layer System</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <button className="text-emerald-500 hover:text-emerald-400 text-sm font-medium">
              Configure Environmental Controls →
            </button>
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareProjectModal
          projectId={structureId}
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}