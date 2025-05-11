import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Ruler, Wind, Edit2, Share2, Trash2, Save, X, Plus, Fan, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';
import VentForm from './VentForm';
import RollupWallForm from './RollupWallForm';
import DropWallForm from './DropWallForm';
import ShareProjectModal from './ShareProjectModal';
import GlazingWizard from './GlazingWizard';

// Adjusted CombinedStructure Interface
interface CombinedStructure {
  structure_id: string; // From the joined structures table
  model: string;
  length: number; // Derived from length_ft
  length_ft: number; // From structure_user_entries
  width: number; // From structures table
  width_ft: number; // From structure_user_entries
  spacing: number;
  project_name: string;
  description: string;
  zones: number;
  ranges: number;
  houses: number;
  eave_height: number;
  roof_glazing: string;
  covering_roof: string;
  covering_sidewalls: string;
  covering_endwalls: string;
  covering_gables: string;
  gutter_partitions: number;
  gable_partitions: number;
  load_rating: string;
  elevation: string;
  status: string; // Added from structure_user_entries
  sidewall_concrete: boolean;
  endwall_concrete: boolean;
  gutter_partition_concrete: boolean;
  gable_partition_concrete: boolean;
  a_bays: number;
  b_bays: number;
  c_bays: number;
  d_bays: number;
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

// Calculate the total area for the curtain fabric
const calculateCurtainArea = (screen: any) => {
  return screen.quantity * screen.length * screen.width;
};

export default function ProjectDetails({ structureId, onBack, onDelete }: ProjectDetailsProps) {
  const [structure, setStructure] = useState<CombinedStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [vents, setVents] = useState<any[]>([]);
  const [showVentForm, setShowVentForm] = useState(false);
  const [editingVent, setEditingVent] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStructure, setEditedStructure] = useState<CombinedStructure | null>(null);
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

  const BASE_ANGLE_ASSEMBLY = 'VA820144'; // Example: Base Angle 1-5/8” x 2” x 1-1/2” x 12’
  const BASE_ANGLE_DESC = 'Base Angle'; // Simplified description for display
  const BASE_STRINGER_ASSEMBLY = 'VA820016'; // Example: Base Stringer - 4” C-Channel
  const BASE_STRINGER_DESC = 'Base Stringer'; // Simplified description for display
  const ANCHOR_BOLT_ASSEMBLY = 'AB-001';
  const ANCHOR_BOLT_DESC = 'Anchor Bolt';
  const BOLTS_PER_BASE_ANGLE = 5;

  type CalculatedComponent = {
    assemblyNumber: string;
    description: string;
    location: string;
    quantity: number;
    unit: 'Linear Ft' | 'Each';
  };
  const [calculatedBaseComponents, setCalculatedBaseComponents] = useState<CalculatedComponent[]>([]);

  const [isConcreteModalOpen, setIsConcreteModalOpen] = useState(false);

  const saveConcreteSettings = async (settings: {
    sidewall_concrete: boolean;
    endwall_concrete: boolean;
    gutter_partition_concrete: boolean;
    gable_partition_concrete: boolean;
  }) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('structure_user_entries')
        .update({
          sidewall_concrete: settings.sidewall_concrete,
          endwall_concrete: settings.endwall_concrete,
          gutter_partition_concrete: settings.gutter_partition_concrete,
          gable_partition_concrete: settings.gable_partition_concrete
        })
        .eq('entry_id', structureId);
      
      if (error) throw error;
      
      // Update local state
      if (structure) {
        setStructure({
          ...structure,
          sidewall_concrete: settings.sidewall_concrete,
          endwall_concrete: settings.endwall_concrete,
          gutter_partition_concrete: settings.gutter_partition_concrete,
          gable_partition_concrete: settings.gable_partition_concrete
        });
      }
      
      // showSuccess('Concrete settings updated successfully');
      setIsConcreteModalOpen(false);
    } catch (err: any) {
      // showError('Failed to update concrete settings: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchStructure() {
      try {
        // Define the type for the data fetched from structure_user_entries including the joined structure
        // This uses the generated Supabase types for better accuracy
        type StructureUserEntryWithStructure = Database['public']['Tables']['structure_user_entries']['Row'] & {
          structures: Database['public']['Tables']['structures']['Row'] | null;
        };

        const { data: structureData, error: structureError } = await supabase
          .from('structure_user_entries')
          .select('*, structures(*)') // Keep the join
          .eq('entry_id', structureId)
          .single<StructureUserEntryWithStructure>(); // Use the specific type here

        if (structureError) throw structureError;
        if (!structureData) throw new Error('Project entry not found.');

        // --- Correctly combine data into CombinedStructure ---
        const combinedData: CombinedStructure = {
          // Fields from structures table (use optional chaining)
          structure_id: structureData.structures?.structure_id ?? '', // Use ID from joined table
          model: structureData.structures?.model ?? '',
          spacing: structureData.structures?.spacing ?? 0,
          zones: structureData.structures?.zones ?? 1,
          ranges: structureData.structures?.ranges ?? 1, 
          houses: structureData.structures?.houses ?? 1, 
          eave_height: structureData.structures?.eave_height ?? 0,
          roof_glazing: structureData.structures?.roof_glazing ?? '',
          gutter_partitions: structureData.structures?.gutter_partitions ?? 0,
          gable_partitions: structureData.structures?.gable_partitions ?? 0,
          load_rating: structureData.structures?.load_rating ?? '',
          elevation: structureData.structures?.elevation ?? 'Standard',
          width: structureData.structures?.width ?? 0,

          // New bay fields (default to 0 if missing)
          a_bays: structureData.structures?.a_bays ?? 0,
          b_bays: structureData.structures?.b_bays ?? 0,
          c_bays: structureData.structures?.c_bays ?? 0,
          d_bays: structureData.structures?.d_bays ?? 0,

          // Fields from structure_user_entries table (direct access)
          project_name: structureData.project_name ?? '',
          description: structureData.description ?? '',
          width_ft: structureData.width_ft ?? 0,
          length_ft: structureData.length_ft ?? 0,
          length: structureData.length_ft ?? 0, // Derive length from length_ft
          covering_roof: structureData.covering_roof ?? '',
          covering_sidewalls: structureData.covering_sidewalls ?? '',
          covering_endwalls: structureData.covering_endwalls ?? '',
          covering_gables: structureData.covering_gables ?? '',
          status: structureData.status ?? 'Draft',
          sidewall_concrete: structureData.sidewall_concrete ?? false,
          endwall_concrete: structureData.endwall_concrete ?? false,
          gutter_partition_concrete: structureData.gutter_partition_concrete ?? false,
          gable_partition_concrete: structureData.gable_partition_concrete ?? false,
        };

        const deepCopiedData = JSON.parse(JSON.stringify(combinedData));
        setStructure(deepCopiedData);
        setEditedStructure(JSON.parse(JSON.stringify(combinedData))); // Initialize edited state with deep copy

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
        setRollupWalls(JSON.parse(JSON.stringify(wallData || []))); // Deep copy

        // Load drop walls - ensuring wall_location is selected
        const { data: dropWallData, error: dropWallError } = await supabase
          .from('drop_walls')
          .select('*, wall_location') // Explicitly select wall_location
          .eq('structure_id', structureId);

        if (dropWallError) throw dropWallError;
        setDropWalls(JSON.parse(JSON.stringify(dropWallData || []))); // Deep copy

      } catch (error: any) {
        setError(error instanceof Error ? error.message : 'Failed to fetch structure details');
      } finally {
        setLoading(false);
      }
    }

    fetchStructure();
  }, [structureId]);

  useEffect(() => {
    async function loadCurtainFabrics() {
      const { data, error } = await supabase
        .from('curtain_fabrics')
        .select('*')
        .order('fabric_name');

      if (!error && data) {
        // Type assertion to ensure the data matches our interface
        const typedFabrics = data.map(fabric => ({
          ...fabric,
          fabric_type: fabric.fabric_type as 'Shade' | 'Blackout' | 'Insect Screen'
        }));
        setCurtainFabrics(typedFabrics);
      } else {
        console.error('Error loading curtain fabrics:', error);
      }
    }

    loadCurtainFabrics();
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
    if (!editedStructure) return; // Add back null check
    setIsSaving(true);
    setSaveError(null);

    // --- Prepare update data for structure_user_entries ---
    const updateData = {
      project_name: editedStructure.project_name ?? undefined, // Handle null -> undefined if needed
      description: editedStructure.description ?? undefined,
      width_ft: editedStructure.width_ft,
      length_ft: editedStructure.length_ft,
      covering_roof: editedStructure.covering_roof ?? undefined,
      covering_sidewalls: editedStructure.covering_sidewalls ?? undefined,
      covering_endwalls: editedStructure.covering_endwalls ?? undefined,
      covering_gables: editedStructure.covering_gables ?? undefined,
      status: editedStructure.status ?? undefined,
      // Do NOT include structure_id or other fields from the 'structures' table
    };

    try {
      const { error } = await supabase
        .from('structure_user_entries')
        .update(updateData) // Use the prepared data
        .eq('entry_id', structureId); // structureId holds the entry_id

      if (error) throw error;
      // Successfully updated, set the main structure state
      setStructure(editedStructure as CombinedStructure);
      setIsEditing(false);
    } catch (err) {
      console.error("Save error:", err); // Log the detailed error
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

    let processedValue: string | number | boolean = value; // Default to string

    if (type === 'number') {
      processedValue = Number(value);
    }
    // Add handling for checkboxes if they exist:
    // if (type === 'checkbox') {
    //   processedValue = (e.target as HTMLInputElement).checked;
    // }

    setEditedStructure(prev => {
      if (!prev) return null; // Should not happen due to guard clause, but satisfies TS
      const updated = {
        ...prev,
        [name]: processedValue,
      };
      // Explicitly cast back to CombinedStructure to satisfy TypeScript
      return updated as CombinedStructure;
    });
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

  const handleUpdateVent = async (ventId: string, data: any) => {
    setLoading(true);
    try {
      setError(null);

      // Calculate the total area for pricing
      const totalArea = data.vent_length * data.vent_quantity;
      console.log('Total area for pricing:', totalArea);

      // Update the vent
      const { error: ventError } = await supabase
        .from('vents')
        .update({
          vent_type: data.vent_type,
          single_double: data.single_double,
          vent_size: data.vent_size,
          vent_quantity: data.vent_quantity,
          vent_length: data.vent_length,
          ati_house: data.ati_house,
          notes: data.notes
        })
        .eq('vent_id', ventId);

      if (ventError) throw ventError;

      // If there's an insect screen, update it with the new vent quantity and length
      if (data.vent_insect_screen?.[0]) {
        const configMultiplier = data.single_double === 'Double' ? 2 : 1;
        const { error: screenError } = await supabase
          .from('vent_insect_screen')
          .update({
            type: data.vent_insect_screen[0].type,
            quantity: data.vent_quantity * configMultiplier, // Use vent quantity x config
            length: data.vent_length, // Use vent length
            width: data.vent_insect_screen[0].width,
            notes: data.notes,
            slitting_fee: data.vent_insect_screen[0].slitting_fee || 0.22 // Preserve slitting fee
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
    } finally {
      setLoading(false);
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

  const handleAddDropWall = async (data: any) => {
    setLoading(true);
    try {
      const payload = { ...data, structure_id: structureId };
      console.log('DropWall insert payload:', payload);
      const { error, data: insertData } = await supabase
        .from('drop_walls')
        .insert([payload]);

      if (error) {
        console.error('Supabase insert error:', error);
        alert(`Error inserting drop wall: ${error.message}`);
        return;
      }
      // Optionally, handle success
      console.log('DropWall insert success:', insertData);
      setShowDropWallForm(false);
      loadDropWalls();
    } catch (err) {
      console.error('Unexpected error inserting drop wall:', err);
      alert(`Unexpected error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDropWall = async (dropWallId: string, data: any) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('drop_walls')
        .update(data)
        .eq('drop_wall_id', dropWallId);

      if (error) throw error;
      setShowDropWallForm(false);
      setEditingDropWall(null);
      loadDropWalls();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update drop wall');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDropWall = async (dropWallId: string) => {
    if (!confirm('Are you sure you want to delete this drop wall?')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('drop_walls')
        .delete()
        .eq('drop_wall_id', dropWallId);

      if (error) throw error;
      loadDropWalls();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete drop wall');
    } finally {
      setLoading(false);
    }
  };

  const loadDropWalls = async () => {
    try {
      const { data, error } = await supabase
        .from('drop_walls')
        .select('*')
        .eq('structure_id', structureId);

      if (error) throw error;
      setDropWalls(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drop walls');
    }
  };

  useEffect(() => {
    if (structure) {
      const isEndwallConcrete = structure.endwall_concrete ?? false;
      const isSidewallConcrete = structure.sidewall_concrete ?? false;
      const isGutterPartitionConcrete = structure.gutter_partition_concrete ?? false;
      const isGablePartitionConcrete = structure.gable_partition_concrete ?? false;

      const calculated: CalculatedComponent[] = [];

      const totalSidewallFt = (structure?.length_ft || 0) * 2;
      const totalEndwallFt = (structure?.width_ft || 0) * 2;
      const totalGutterPartitionFt = (structure?.length_ft || 0) * (structure?.gutter_partitions || 0);
      const totalGablePartitionFt = (structure?.width_ft || 0) * (structure?.gable_partitions || 0);

      // Create new approach with proper temp variables 
      const allWalls = [...(rollupWalls || []), ...(dropWalls || [])];
      
      let sidewallReduction = 0;
      let endwallReduction = 0;
      
      for (let i = 0; i < allWalls.length; i++) {
        const wall = allWalls[i];
        const wallLength = wall?.wall_length || 0;
        const wallLocation = wall?.wall_location || '';
        const quantity = wall?.quantity || 1;
        
        if (wallLocation.toLowerCase().includes('sidewall') && wallLength > 0) {
          sidewallReduction += wallLength * quantity;
        }
        if (wallLocation.toLowerCase().includes('endwall') && wallLength > 0) {
          endwallReduction += wallLength * quantity;
        }
      }
      
      const remainingSidewallFt = Math.max(totalSidewallFt - sidewallReduction, 0);
      const remainingEndwallFt = Math.max(totalEndwallFt - endwallReduction, 0);
      const remainingGutterPartitionFt = Math.max(totalGutterPartitionFt, 0);
      const remainingGablePartitionFt = Math.max(totalGablePartitionFt, 0);

      // For sidewalls
      if (remainingSidewallFt > 0) {
        if (isSidewallConcrete) {
          // Base angle for concrete sidewalls
          const sidewallBaseAngleUnits = Math.ceil(remainingSidewallFt / 12);
          calculated.push({
            assemblyNumber: BASE_ANGLE_ASSEMBLY,
            description: BASE_ANGLE_DESC,
            location: 'Sidewalls',
            quantity: sidewallBaseAngleUnits,
            unit: 'Each',
          });
          
          // Anchor bolts for sidewall base angles
          const sidewallAnchorBolts = sidewallBaseAngleUnits * BOLTS_PER_BASE_ANGLE;
          calculated.push({
            assemblyNumber: ANCHOR_BOLT_ASSEMBLY,
            description: ANCHOR_BOLT_DESC,
            location: 'Sidewalls',
            quantity: sidewallAnchorBolts,
            unit: 'Each',
          });
        } else {
          // Base stringer for non-concrete sidewalls
          calculated.push({
            assemblyNumber: BASE_STRINGER_ASSEMBLY,
            description: BASE_STRINGER_DESC,
            location: 'Sidewalls',
            quantity: Math.round(remainingSidewallFt * 100) / 100,
            unit: 'Linear Ft',
          });
        }
      }
      
      // For endwalls
      if (remainingEndwallFt > 0) {
        if (isEndwallConcrete) {
          // Base angle for concrete endwalls
          const endwallBaseAngleUnits = Math.ceil(remainingEndwallFt / 12);
          calculated.push({
            assemblyNumber: BASE_ANGLE_ASSEMBLY,
            description: BASE_ANGLE_DESC,
            location: 'Endwalls',
            quantity: endwallBaseAngleUnits,
            unit: 'Each',
          });
          
          // Anchor bolts for endwall base angles
          const endwallAnchorBolts = endwallBaseAngleUnits * BOLTS_PER_BASE_ANGLE;
          calculated.push({
            assemblyNumber: ANCHOR_BOLT_ASSEMBLY,
            description: ANCHOR_BOLT_DESC,
            location: 'Endwalls',
            quantity: endwallAnchorBolts,
            unit: 'Each',
          });
        } else {
          // Base stringer for non-concrete endwalls
          calculated.push({
            assemblyNumber: BASE_STRINGER_ASSEMBLY,
            description: BASE_STRINGER_DESC,
            location: 'Endwalls',
            quantity: Math.round(remainingEndwallFt * 100) / 100,
            unit: 'Linear Ft',
          });
        }
      }

      // For gutter partitions
      if (remainingGutterPartitionFt > 0) {
        if (isGutterPartitionConcrete) {
          // Base angle for concrete gutter partitions
          const gutterBaseAngleUnits = Math.ceil(remainingGutterPartitionFt / 12);
          calculated.push({
            assemblyNumber: BASE_ANGLE_ASSEMBLY,
            description: BASE_ANGLE_DESC,
            location: 'Gutter Partitions',
            quantity: gutterBaseAngleUnits,
            unit: 'Each',
          });
          
          // Anchor bolts for gutter partition base angles
          const gutterAnchorBolts = gutterBaseAngleUnits * BOLTS_PER_BASE_ANGLE;
          calculated.push({
            assemblyNumber: ANCHOR_BOLT_ASSEMBLY,
            description: ANCHOR_BOLT_DESC,
            location: 'Gutter Partitions',
            quantity: gutterAnchorBolts,
            unit: 'Each',
          });
        } else {
          // Base stringer for non-concrete gutter partitions
          calculated.push({
            assemblyNumber: BASE_STRINGER_ASSEMBLY,
            description: BASE_STRINGER_DESC,
            location: 'Gutter Partitions',
            quantity: Math.round(remainingGutterPartitionFt * 100) / 100,
            unit: 'Linear Ft',
          });
        }
      }

      // For gable partitions
      if (remainingGablePartitionFt > 0) {
        if (isGablePartitionConcrete) {
          // Base angle for concrete gable partitions
          const gableBaseAngleUnits = Math.ceil(remainingGablePartitionFt / 12);
          calculated.push({
            assemblyNumber: BASE_ANGLE_ASSEMBLY,
            description: BASE_ANGLE_DESC,
            location: 'Gable Partitions',
            quantity: gableBaseAngleUnits,
            unit: 'Each',
          });
          
          // Anchor bolts for gable partition base angles
          const gableAnchorBolts = gableBaseAngleUnits * BOLTS_PER_BASE_ANGLE;
          calculated.push({
            assemblyNumber: ANCHOR_BOLT_ASSEMBLY,
            description: ANCHOR_BOLT_DESC,
            location: 'Gable Partitions',
            quantity: gableAnchorBolts,
            unit: 'Each',
          });
        } else {
          // Base stringer for non-concrete gable partitions
          calculated.push({
            assemblyNumber: BASE_STRINGER_ASSEMBLY,
            description: BASE_STRINGER_DESC,
            location: 'Gable Partitions',
            quantity: Math.round(remainingGablePartitionFt * 100) / 100,
            unit: 'Linear Ft',
          });
        }
      }

      setCalculatedBaseComponents(calculated); 
    }
  }, [structure, rollupWalls, dropWalls]);

  useEffect(() => {
    // Add CSS for toggle switches
    const style = document.createElement('style');
    style.innerHTML = `
      /* Toggle Switch Styling */
      .toggle-checkbox {
        transition: 0.4s;
        z-index: 10;
      }
      .toggle-checkbox:checked {
        transform: translateX(100%);
        border-color: #10b981;
      }
      .toggle-checkbox:checked + .toggle-label {
        background-color: #10b981;
      }
      .toggle-label {
        transition: background-color 0.4s;
        position: relative;
      }
    `;
    document.head.appendChild(style);

    // Cleanup function to remove the style when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
              let pricePerSqFt = 0;

              if (
                vent.vent_insect_screen &&
                vent.vent_insect_screen.length > 0
              ) {
                const screen = vent.vent_insect_screen[0];
                totalArea = calculateCurtainArea(screen);
                const fabric = curtainFabrics.find(f => f.fabric_name === screen.type);
                if (fabric && fabric.width_size.length > 0) {
                  const sorted = [...fabric.width_size].sort((a, b) => a - b);
                  minFabricWidth = sorted.find(w => w >= screen.width) || sorted[0];
                }
                fabricArea = minFabricWidth * screen.length * vent.vent_quantity;
                if (fabric) {
                  if (fabricArea > 0 && fabricArea <= 5000) {
                    pricePerSqFt = fabric.price_0_5000;
                  } else if (fabricArea > 5000 && fabricArea <= 20000) {
                    pricePerSqFt = fabric.price_5000_20000;
                  } else if (fabricArea > 20000) {
                    pricePerSqFt = fabric.price_20000_plus;
                  }
                  curtainPrice = fabricArea * pricePerSqFt;
                }
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
                          <p>Total Area: {totalArea.toFixed(2)} sq ft</p>
                          <p>Fabric Area: {fabricArea.toFixed(2)} sq ft (using {minFabricWidth.toFixed(1)}' width)</p>
                          {curtainPrice !== null ? (
                            <p className="text-emerald-400 font-semibold mt-1">Curtain Fabric Price: ${curtainPrice.toFixed(2)}</p>
                          ) : (
                            <p className="text-red-400 font-semibold mt-1">No price available for this area.</p>
                          )}
                          <p className="text-emerald-400 font-bold mt-1">Price per Square Foot: ${pricePerSqFt.toFixed(2)}</p>
                          <p className="text-emerald-400 font-bold mt-1">Total Linear Feet to Cut: {(vent.vent_insect_screen[0].length * vent.vent_quantity).toFixed(1)} ft</p>
                          <p className="text-emerald-400 font-bold mt-1">Slitting Fee: ${(vent.vent_insect_screen[0].slitting_fee || 0.22).toFixed(3)} per linear foot</p>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <RollupWallForm
                rollupWall={editingRollupWall}
                onSubmit={editingRollupWall ? handleUpdateRollupWall.bind(null, editingRollupWall.rollup_wall_id) : handleAddRollupWall}
                onCancel={() => {
                  setShowRollupWallForm(false);
                  setEditingRollupWall(null);
                }}
              />
            </div>
          </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <DropWallForm
                structureId={structureId}
                wall={editingDropWall}
                onSubmit={editingDropWall ? handleUpdateDropWall.bind(null, editingDropWall.drop_wall_id) : handleAddDropWall}
                onCancel={() => {
                  setShowDropWallForm(false);
                  setEditingDropWall(null);
                }}
              />
            </div>
          </div>
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
                  <h4 className="font-medium">{wall.type} Drop Wall</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Dimensions: {wall.wall_height}' × {wall.wall_length}'</p>
                    <p>Drive Type: {wall.drive_type}
                      {wall.motor_model && ` (${wall.motor_model})`}
                    </p>
                    <p>NS30: {wall.ns30} | Spacing: {wall.spacing} | ATI House: {wall.ati_house}</p>
                    <p>Quantity: {wall.quantity}</p>
                    {wall.notes && (
                      <p>Notes: {wall.notes}</p>
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

      {/* --- Wall Accessories Section --- */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <span className="mr-2">🧱</span> Wall Accessories
          </h3>
          <button
            onClick={() => setIsConcreteModalOpen(true)}
            className="px-3 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center text-sm"
          >
            <Settings size={14} className="mr-1" /> Configure Concrete
          </button>
        </div>

        {/* Concrete Configuration Modal */}
        {isConcreteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Concrete Configuration</h3>
                <button 
                  className="text-gray-400 hover:text-white"
                  onClick={() => setIsConcreteModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300">Select which walls have concrete foundations:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Perimeter Walls */}
                  <div className="bg-gray-700 rounded p-3">
                    <h4 className="font-medium text-white mb-2">Perimeter Walls</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-gray-300">Sidewalls</label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input 
                            type="checkbox" 
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                            checked={structure?.sidewall_concrete || false}
                            onChange={(e) => {
                              if (structure) {
                                const updatedStructure = {
                                  ...structure,
                                  sidewall_concrete: e.target.checked
                                };
                                setStructure(updatedStructure);
                              }
                            }}
                          />
                          <label 
                            className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-500 cursor-pointer"
                          ></label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-gray-300">Endwalls</label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input 
                            type="checkbox" 
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                            checked={structure?.endwall_concrete || false}
                            onChange={(e) => {
                              if (structure) {
                                const updatedStructure = {
                                  ...structure,
                                  endwall_concrete: e.target.checked
                                };
                                setStructure(updatedStructure);
                              }
                            }}
                          />
                          <label 
                            className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-500 cursor-pointer"
                          ></label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Partitions */}
                  <div className="bg-gray-700 rounded p-3">
                    <h4 className="font-medium text-white mb-2">Partitions</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-gray-300">Gutter Partitions</label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input 
                            type="checkbox" 
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                            checked={structure?.gutter_partition_concrete || false}
                            onChange={(e) => {
                              if (structure) {
                                const updatedStructure = {
                                  ...structure,
                                  gutter_partition_concrete: e.target.checked
                                };
                                setStructure(updatedStructure);
                              }
                            }}
                          />
                          <label 
                            className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-500 cursor-pointer"
                          ></label>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-gray-300">Gable Partitions</label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none">
                          <input 
                            type="checkbox" 
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                            checked={structure?.gable_partition_concrete || false}
                            onChange={(e) => {
                              if (structure) {
                                const updatedStructure = {
                                  ...structure,
                                  gable_partition_concrete: e.target.checked
                                };
                                setStructure(updatedStructure);
                              }
                            }}
                          />
                          <label 
                            className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-500 cursor-pointer"
                          ></label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                    onClick={() => setIsConcreteModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                    onClick={() => {
                      if (structure) {
                        saveConcreteSettings({
                          sidewall_concrete: structure.sidewall_concrete || false,
                          endwall_concrete: structure.endwall_concrete || false,
                          gutter_partition_concrete: structure.gutter_partition_concrete || false,
                          gable_partition_concrete: structure.gable_partition_concrete || false
                        });
                      }
                    }}
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calculated Base Components */}
        <div>
          <h4 className="text-md font-medium text-emerald-500">Calculated Base Components</h4>
          {calculatedBaseComponents.length === 0 ? (
            <p className="text-gray-400 text-sm">No base components to display.</p>
          ) : (
            <>
              <ul className="list-disc list-inside text-gray-400 space-y-1 pl-4 text-sm">
                {calculatedBaseComponents.map((comp, index) => (
                  <li key={index}>
                    {comp.description}: {comp.quantity} {comp.unit} ({comp.location})
                  </li>
                ))}
              </ul>
              
              {/* Totals Section */}
              <div className="mt-4 pt-3 border-t border-gray-700">
                <h5 className="text-sm font-medium text-emerald-500 mb-2">Totals</h5>
                <div className="space-y-1 text-sm text-gray-300">
                  <p>
                    Total Base Stringer: {calculatedBaseComponents
                      .filter(comp => comp.description === BASE_STRINGER_DESC)
                      .reduce((sum, comp) => sum + comp.quantity, 0)
                      .toFixed(2)} Linear Ft
                  </p>
                  <p>
                    Total Base Angle: {calculatedBaseComponents
                      .filter(comp => comp.description === BASE_ANGLE_DESC)
                      .reduce((sum, comp) => sum + comp.quantity, 0)} Each
                  </p>
                  <p>
                    Total Anchor Bolts: {calculatedBaseComponents
                      .filter(comp => comp.description === ANCHOR_BOLT_DESC)
                      .reduce((sum, comp) => sum + comp.quantity, 0)} Each
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Glazing Wizard Section */}
      <GlazingWizard
        projectId={structure.structure_id}
        model={structure.model}
        width={structure.width}
        eaveHeight={structure.eave_height}
        length={structure.length}
        aBays={structure.a_bays}
        bBays={structure.b_bays}
        cBays={structure.c_bays}
        dBays={structure.d_bays}
      />
    </div>
  );
}