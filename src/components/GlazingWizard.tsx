import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardContent } from './Card';
import { supabase, getPanelLength } from '../lib/supabase'; // Import getPanelLength
import { Button } from './Button.tsx'; // Explicitly added .tsx extension
import type { Database } from '../types/supabase'; // Added import for Supabase types

// Define RIGID_MATERIALS_CONFIG outside the component for a stable reference
const RIGID_MATERIALS_CONFIG: Record<string, number> = {
  'PC8': 2,
  'PC80%': 2,
  'CPC': 3,
  'GR7': 4,
};

// Panel widths in inches
const PANEL_WIDTHS_INCHES: Record<string, number> = {
  'PC8': 71.25,
  'CPC': 48,
  'GR7': 36,
  // Add other materials if necessary
};

// Define row type based on Supabase schema
type GlazingRequirementRow = Database['public']['Tables']['glazing_requirements']['Row'];

// Interface for section data
interface GlazingSection {
  section: string;
  material: string;
  area: number;
  unit: string;
  price: number;
  total: number;
  editable: boolean;
  bay?: string;
}

// Debug info interface for detailed information display
interface DebugInfoInputValues {
  projectId: string;
  model: string;
  normalizedModel: string;
  width: number;
  eaveHeight: number;
  length: number;
  aBays: number;
  bBays: number;
  cBays: number;
  dBays: number;
  roofGlazingType: string;
  initialRoofVentConfig: 'Non-Vented' | 'Single Vent' | 'Double Vent' | null;
}

interface DebugInfoCalculations {
  numABays: number;
  numBBays: number;
  numCBays: number;
  numDBays: number;
  roofArea: number;
  bayAreaBreakdown: {
    aBaysContribution: number;
    bBaysContribution: number;
    cBaysContribution: number;
    dBaysContribution: number;
  };
}

interface DebugInfo {
  inputValues: DebugInfoInputValues;
  calculations: DebugInfoCalculations;
  bayAreas: {
    areaA: number; areaASource: string;
    areaB: number; areaBSource: string;
    areaC: number; areaCSource: string;
    areaD: number; areaDSource: string;
  };
  dbMessages?: string[];
}

interface BaySpecificDetail {
  bayType: string;
  count: number;
  area: number;
  source: string;
  totalArea: number;
  modelDb: string | null;
  sectionDb: string | null;
  ventTypeDb: string | null;
  materialDb: string | null;
  widthDb: number | null;
  eaveHeightDb: number | null;
}

interface MaterialOption {
  value: string;
  label: string;
}

interface CalculatedPanelInfo {
  id: string; // Unique ID for React key, e.g., 'roof-slope-1'
  displayName: string; // User-friendly name, e.g., "Main Roof Slope (House 1)"
  panelLength: string | null; // As fetched from DB, e.g., "115 9/16\""
  panelQuantity: number | null;
  materialType: string | null;
  sectionNameDb: string; // For querying, e.g., "Roof"
  ventTypeDb: string; // For querying, e.g., "Non-Vented"
}

// Removed GlazingRequirementItemFromDB as it's not directly used after refactor, Supabase types will be inferred or defined as needed.

export function GlazingWizard({
  projectId,
  model,
  width,
  eaveHeight,
  length,
  numHouses,
  aBays: initialABays, // Renaming for clarity
  bBays: initialBBays,
  cBays: initialCBays,
  dBays: initialDBays,
  roofGlazingType,
  initialRoofVentConfig,
}: {
  projectId: string;
  model: string;
  width: number;
  eaveHeight: number;
  length: number;
  numHouses: number;
  aBays: number | string;
  bBays: number | string;
  cBays: number | string;
  dBays: number | string;
  roofGlazingType: string;
  initialRoofVentConfig: 'Non-Vented' | 'Single Vent' | 'Double Vent' | null;
}) {
  const [sections, setSections] = useState<GlazingSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(true); // Keep state for toggling
  const [showBayDetails, setShowBayDetails] = useState(true); // Keep state for toggling
  const [roofMaterial, setRoofMaterial] = useState<string>(roofGlazingType);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [materialOptions, setMaterialOptions] = useState<MaterialOption[]>([]);
  const [baySpecificDetails, setBaySpecificDetails] = useState<BaySpecificDetail[]>([]);
  const [calculatedPanelData, setCalculatedPanelData] = useState<CalculatedPanelInfo[]>([]);
  const [loadingPanelData, setLoadingPanelData] = useState<boolean>(false);
  const [totalPanelsByArea, setTotalPanelsByArea] = useState<number | null>(null); // State for the new panel total

  // Helper component for structured debug display
  const DebugDisplaySection: React.FC<{ title: string; data: Record<string, any>; fields: Array<{key: string; label: string; unit?: string}> }> = ({ title, data, fields }) => {
    if (!data) return null;
    return (
      <div className="mb-4">
        <h4 className="font-semibold text-base text-emerald-400 mb-2">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {fields.map(field => {
            const value = data[field.key];
            // Ensure complex objects like bayAreaBreakdown are not directly rendered if they are part of 'data'
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              // Optionally, you could expand this to display nested object properties
              // For now, we skip direct rendering of objects to avoid [object Object]
              if (field.key === 'bayAreaBreakdown' && value) {
                return Object.entries(value).map(([key, val]) => (
                  <React.Fragment key={`${field.key}-${key}`}>
                    <span className="text-gray-400 pl-2">{`-> ${key}`}:</span>
                    <span className="text-gray-100">
                      {String(val)}
                      {/* Add units if applicable for breakdown parts */}
                    </span>
                  </React.Fragment>
                ));
              }
              return null;
            }
            return (
              value !== undefined && value !== null ? (
                <React.Fragment key={field.key}>
                  <span className="text-gray-400">{field.label}:</span>
                  <span className="text-gray-100">
                    {String(value)}
                    {field.unit && <span className="text-gray-500 ml-1">{field.unit}</span>}
                  </span>
                </React.Fragment>
              ) : null
            );
          })}
        </div>
      </div>
    );
  };

  const inputFields = [
    { key: 'projectId', label: 'Project ID' },
    { key: 'model', label: 'Model' },
    { key: 'normalizedModel', label: 'Normalized Model' },
    { key: 'width', label: 'Width', unit: 'ft' },
    { key: 'eaveHeight', label: 'Eave Height', unit: 'ft' },
    { key: 'length', label: 'Length', unit: 'ft' },
    { key: 'aBays', label: 'A Bays (Input)' },
    { key: 'bBays', label: 'B Bays (Input)' },
    { key: 'cBays', label: 'C Bays (Input)' },
    { key: 'dBays', label: 'D Bays (Input)' },
    { key: 'roofGlazingType', label: 'Roof Glazing Type' },
    { key: 'initialRoofVentConfig', label: 'Roof Vent Config' },
  ];

  const calculationFields = [
    { key: 'numABays', label: 'A Bays' },
    { key: 'numBBays', label: 'B Bays' },
    { key: 'numCBays', label: 'C Bays' },
    { key: 'numDBays', label: 'D Bays' },
    { key: 'roofArea', label: 'Total Roof Area', unit: 'sq ft' },
    { key: 'bayAreaBreakdown', label: 'Bay Area Breakdown' }, // Added for display
  ];

  const bayAreaFields = [
      {key: 'areaA', label: 'Area A', unit: 'sq ft'},
      {key: 'areaASource', label: 'Area A Source'},
      {key: 'areaB', label: 'Area B', unit: 'sq ft'},
      {key: 'areaBSource', label: 'Area B Source'},
      {key: 'areaC', label: 'Area C', unit: 'sq ft'},
      {key: 'areaCSource', label: 'Area C Source'},
      {key: 'areaD', label: 'Area D', unit: 'sq ft'},
      {key: 'areaDSource', label: 'Area D Source'},
  ];

  const parseFloatWithFallback = (val: string | number | undefined | null, fallback = 0) => {
    const num = parseFloat(String(val));
    return isNaN(num) ? fallback : num;
  };

  const numABays = parseFloatWithFallback(initialABays);
  const numBBays = parseFloatWithFallback(initialBBays);
  const numCBays = parseFloatWithFallback(initialCBays);
  const numDBays = parseFloatWithFallback(initialDBays);

  const fetchGlazingRequirements = useCallback(async () => {
    console.log('GW: fetchGlazingRequirements STARTED');
    setLoading(true);
    setError(null);

    // Determine the correct model names for display and DB query based on the 'model' prop
    let displayedNormalizedModel = model; // Default for display
    let dbQueryModelName = model;       // Default for DB queries

    // Example: If model prop is "SL18" and width is 18
    if (model === 'SL18') {
      displayedNormalizedModel = `Solar Light ${width}`; // Display "Solar Light 18"
      dbQueryModelName = 'Solar Light';                 // Query DB with "Solar Light"
    } else if (model.includes(' -> ')) {
      // Handle cases where model prop might be "SHORT_CODE -> Full Display Name"
      const parts = model.split(' -> ');
      dbQueryModelName = parts[0].trim(); // Part before ' -> ' for DB
      displayedNormalizedModel = parts[1]?.trim() || parts[0].trim(); // Part after ' -> ' for display
    }
    // Add more normalization rules here if other model codes or formats exist

    const currentDebugInfo: DebugInfo = {
      inputValues: {
        projectId,
        model,
        normalizedModel: displayedNormalizedModel, // USE THE NEW DISPLAY NAME
        width, // Use 'width' from props
        eaveHeight, // Use 'eaveHeight' from props
        length,
        aBays: numABays,
        bBays: numBBays,
        cBays: numCBays,
        dBays: numDBays,
        roofGlazingType,
        initialRoofVentConfig,
      },
      bayAreas: {
        areaA: 0, areaASource: 'Default',
        areaB: 0, areaBSource: 'Default',
        areaC: 0, areaCSource: 'Default',
        areaD: 0, areaDSource: 'Default',
      },
      calculations: {
        numABays,
        numBBays,
        numCBays,
        numDBays,
        roofArea: 0,
        bayAreaBreakdown: {
          aBaysContribution: 0,
          bBaysContribution: 0,
          cBaysContribution: 0,
          dBaysContribution: 0,
        },
      },
      dbMessages: [],
    };

    try {
      const normalizedModelValue = dbQueryModelName; // USE THE NEW DB QUERY NAME

      // Determine DB vent_type from prop
      // let dbVentType: string | undefined = undefined;
      // if (initialRoofVentConfig) {
      //   if (initialRoofVentConfig === 'Non-Vented') dbVentType = 'non-vented';
      //   else if (initialRoofVentConfig === 'Single Vent') dbVentType = 'single';
      //   else if (initialRoofVentConfig === 'Double Vent') dbVentType = 'double';
      // }

      // Helper to build and execute query for a given bay
      const fetchBayData = async (bayChar: 'A' | 'B' | 'C' | 'D', bayLabel: string) => {
        // This log already exists and is good.
        console.log(`Querying for ${bayLabel}: model='${normalizedModelValue}', width='${width}', eaveHeight='${eaveHeight}', section='Roof', bay='${bayChar}', material_type='${roofMaterial}'`);
        
        let area = 0;
        let source = 'Default';
        let ventTypeDb: string | null = null;
        let widthDb: number | null = null;
        let eaveHeightDb: number | null = null;

        try {
          let query = supabase
            .from('glazing_requirements')
            .select('area_sq_ft, vent_type, model, section, material_type, width, eave_height') // Select additional fields
            .eq('model', normalizedModelValue)
            .eq('width', width)
            .eq('eave_height', eaveHeight)
            .eq('section', 'Roof') // Changed to 'Roof' (capitalized)
            .eq('bay', bayChar)
            .eq('material_type', roofMaterial);

          const { data, error } = await query;

          if (error) {
            console.error(`Supabase error fetching ${bayLabel} data for material ${roofMaterial}:`, error.message, error); // Log full error object
            currentDebugInfo.dbMessages?.push(`Error fetching ${bayLabel} data: ${error.message}`);
            // Do not throw here, allow Promise.all to handle individual failures if needed
            // or ensure a default/error state is returned
            source = `DB Error: ${error.message}`;
          } else {
            console.log(`Data received for ${bayLabel} (material: ${roofMaterial}):`, JSON.stringify(data, null, 2)); // Log received data
            if (data && data.length > 0) {
              const record = data[0];
              ventTypeDb = record.vent_type; // Capture vent_type
              widthDb = record.width; // Capture width
              eaveHeightDb = record.eave_height; // Capture eave_height
              if (record.area_sq_ft !== null && record.area_sq_ft !== undefined) {
                area = parseFloat(String(record.area_sq_ft));
                source = 'DB';
              } else {
                area = 0;
                source = 'DB (area is null/undefined)';
              }
            } else {
              area = 0;
              source = 'Not found in DB';
            }
          }
        } catch (e: any) {
          console.error(`Critical error in fetchBayData for ${bayLabel} (material: ${roofMaterial}):`, e);
          currentDebugInfo.dbMessages?.push(`Critical error fetching ${bayLabel} data: ${e.message}`);
          source = `Critical Error: ${e.message}`;
          // Do not re-throw here to allow Promise.all to complete
        }
        // Update debug info directly here for simplicity in this step
        currentDebugInfo.bayAreas[`area${bayChar}`] = area;
        currentDebugInfo.bayAreas[`area${bayChar}Source`] = source;

        return { area, source, ventTypeDb, widthDb, eaveHeightDb }; // Return captured details
      };

      // Store results from fetchBayData calls
      const bayDataResults = {
        A: { area: 0, source: 'Default', ventTypeDb: null as string | null, widthDb: null as number | null, eaveHeightDb: null as number | null },
        B: { area: 0, source: 'Default', ventTypeDb: null as string | null, widthDb: null as number | null, eaveHeightDb: null as number | null },
        C: { area: 0, source: 'Default', ventTypeDb: null as string | null, widthDb: null as number | null, eaveHeightDb: null as number | null },
        D: { area: 0, source: 'Default', ventTypeDb: null as string | null, widthDb: null as number | null, eaveHeightDb: null as number | null },
      };

      try {
        const results = await Promise.allSettled([
          fetchBayData('A', 'Bay A'),
          fetchBayData('B', 'Bay B'),
          fetchBayData('C', 'Bay C'),
          fetchBayData('D', 'Bay D'),
        ]);

        results.forEach((result, index) => {
          const bayKey = ['A', 'B', 'C', 'D'][index] as 'A' | 'B' | 'C' | 'D';
          if (result.status === 'fulfilled') {
            bayDataResults[bayKey] = result.value;
            // Update debugInfo with fulfilled data
            currentDebugInfo.bayAreas[`area${bayKey}`] = result.value.area;
            currentDebugInfo.bayAreas[`area${bayKey}Source`] = result.value.source;
          } else {
            // Handle rejected promise (error already logged in fetchBayData)
            // Ensure debugInfo reflects the error source from fetchBayData's catch block
            console.error(`Promise for Bay ${bayKey} rejected:`, result.reason);
            currentDebugInfo.dbMessages?.push(`Promise for Bay ${bayKey} failed: ${result.reason?.message || 'Unknown error'}`);
            // bayDataResults[bayKey] will retain default error values or can be updated
            bayDataResults[bayKey].source = result.reason?.message || 'Promise rejected';
          }
        });

      } catch (overallError: any) { // Should not be reached if using Promise.allSettled correctly
        console.error("Error in fetchGlazingRequirements Promise.allSettled execution:", overallError);
        currentDebugInfo.dbMessages?.push(`Error in Promise.allSettled: ${overallError.message}`);
        // Set error state for all bays if this somehow triggers
      }

      // Calculations using bayDataResults
      const aBaysContribution = numABays * bayDataResults.A.area;
      const bBaysContribution = numBBays * bayDataResults.B.area;
      const cBaysContribution = numCBays * bayDataResults.C.area;
      const dBaysContribution = numDBays * bayDataResults.D.area;
      const totalRoofArea = aBaysContribution + bBaysContribution + cBaysContribution + dBaysContribution;

      currentDebugInfo.calculations = {
        numABays,
        numBBays,
        numCBays,
        numDBays,
        roofArea: totalRoofArea,
        bayAreaBreakdown: {
          aBaysContribution,
          bBaysContribution,
          cBaysContribution,
          dBaysContribution,
        },
      };

      setBaySpecificDetails([
        {
          bayType: 'A Bay', count: numABays, area: bayDataResults.A.area, source: bayDataResults.A.source, totalArea: aBaysContribution,
          modelDb: normalizedModelValue, sectionDb: 'Roof', ventTypeDb: bayDataResults.A.ventTypeDb, materialDb: roofMaterial,
          widthDb: bayDataResults.A.widthDb, eaveHeightDb: bayDataResults.A.eaveHeightDb
        },
        {
          bayType: 'B Bay', count: numBBays, area: bayDataResults.B.area, source: bayDataResults.B.source, totalArea: bBaysContribution,
          modelDb: normalizedModelValue, sectionDb: 'Roof', ventTypeDb: bayDataResults.B.ventTypeDb, materialDb: roofMaterial,
          widthDb: bayDataResults.B.widthDb, eaveHeightDb: bayDataResults.B.eaveHeightDb
        },
        {
          bayType: 'C Bay', count: numCBays, area: bayDataResults.C.area, source: bayDataResults.C.source, totalArea: cBaysContribution,
          modelDb: normalizedModelValue, sectionDb: 'Roof', ventTypeDb: bayDataResults.C.ventTypeDb, materialDb: roofMaterial,
          widthDb: bayDataResults.C.widthDb, eaveHeightDb: bayDataResults.C.eaveHeightDb
        },
        {
          bayType: 'D Bay', count: numDBays, area: bayDataResults.D.area, source: bayDataResults.D.source, totalArea: dBaysContribution,
          modelDb: normalizedModelValue, sectionDb: 'Roof', ventTypeDb: bayDataResults.D.ventTypeDb, materialDb: roofMaterial,
          widthDb: bayDataResults.D.widthDb, eaveHeightDb: bayDataResults.D.eaveHeightDb
        },
      ]);

      const initialGlazingSections: GlazingSection[] = [
        {
          section: 'Roof Glazing',
          material: roofMaterial, // Comes from prop roofGlazingType, managed by state roofMaterial
          area: totalRoofArea,
          unit: 'sq ft',
          price: 0,
          total: 0,
          editable: true,
        },
      ];
      setSections(initialGlazingSections);

      // Fetch Material Options from distinct material_type in glazing_requirements
      const { data: materialData, error: materialError } = await supabase
        .from('glazing_requirements')
        .select('material_type', { count: 'exact', head: false }) // Select distinct material_type
        .neq('material_type', ''); // Ensure material_type is not empty

      if (materialError) throw new Error(`Failed to fetch material options: ${materialError.message}`);
      currentDebugInfo.dbMessages?.push('Fetched material types from glazing_requirements.');
      
      if (materialData && Array.isArray(materialData)) {
        // Filter out null or undefined material_types and create unique options
        const uniqueMaterialTypes = [
          ...new Set(materialData
            .map((item: Pick<GlazingRequirementRow, 'material_type'>) => item.material_type)
            .filter((material): material is string => typeof material === 'string' && material.trim() !== '')),
        ];
        setMaterialOptions(uniqueMaterialTypes.map((m) => ({ value: m, label: m })));
        currentDebugInfo.dbMessages?.push(`Material options populated: ${uniqueMaterialTypes.join(', ')}`);
      } else {
        currentDebugInfo.dbMessages?.push('No material data found or data is not an array.');
        setMaterialOptions([]); // Set to empty array if no data
      }

      setDebugInfo(currentDebugInfo);

    } catch (processingError: any) { // Renamed from innerError, this is the main catch for the outer try block
      console.error("GW: Error during data processing sequence:", processingError);
      currentDebugInfo.dbMessages?.push(`Error during data processing sequence: ${processingError.message}`);
      setError(`Failed to load glazing information: ${processingError?.message || 'Unknown error'}`);
      setDebugInfo(currentDebugInfo); // Ensure debug info with error messages is set
      // Do not re-throw here, let finally execute
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ 
    projectId, model, width, eaveHeight, length, 
    initialABays, initialBBays, initialCBays, initialDBays, 
    roofGlazingType, initialRoofVentConfig, supabase, roofMaterial
    // State setters like setLoading, setError, etc., are stable and don't need to be in deps
    // numXBay values are derived inside the callback from initialXBay props
  ]);
  // Removed many state setters from dependency array as they are stable or would cause loops.
  // supabase client is stable. numXBay values are calculated from props and stable per render cycle where props don't change.

  useEffect(() => {
    console.log('GW: useEffect for fetchGlazingRequirements RUNNING');
    fetchGlazingRequirements();
  }, [fetchGlazingRequirements]);

  const handleMaterialChange = (idx: number, newMaterial: string) => {
    const updatedSections = sections.map((s, i) => i === idx ? { ...s, material: newMaterial } : s);
    setSections(updatedSections);
  };

  const handleRoofMaterialChange = (newMaterial: string) => {
    setRoofMaterial(newMaterial);
    // This will also trigger a re-fetch if roofMaterial is in fetchGlazingRequirements deps
    // or update sections directly if preferred
    const updatedSections = sections.map(s => s.section === 'Roof Glazing' ? { ...s, material: newMaterial } : s);
    setSections(updatedSections);
  };

  useEffect(() => {
    const calculateTotalPanelsByArea = async () => {
      if (baySpecificDetails.length === 0 || loading) {
        setTotalPanelsByArea(null); // Reset if no details or still loading
        return;
      }

      let cumulativePanels = 0;
      let calculationErrors: string[] = [];

      // Helper function to parse panel length strings like "115 9/16\"" to inches
      const parsePanelLengthToInches = (lengthStr: string | null): number | null => {
        if (!lengthStr) return null;
        const cleanedStr = lengthStr.replace(/"/g, '').trim(); // Remove quotes and trim
        let totalInches = 0;
        const parts = cleanedStr.split(' '); // Split whole number and fraction

        if (parts.length === 1) { // Only fraction or only whole number
          if (parts[0].includes('/')) { // Fraction like "9/16"
            const fractionParts = parts[0].split('/');
            if (fractionParts.length === 2) {
              totalInches = parseFloat(fractionParts[0]) / parseFloat(fractionParts[1]);
            }
          } else { // Whole number like "115"
            totalInches = parseFloat(parts[0]);
          }
        } else if (parts.length === 2) { // Mixed number like "115 9/16"
          totalInches = parseFloat(parts[0]); // Whole number part
          if (parts[1].includes('/')) {
            const fractionParts = parts[1].split('/');
            if (fractionParts.length === 2) {
              totalInches += parseFloat(fractionParts[0]) / parseFloat(fractionParts[1]);
            }
          }
        }
        return isNaN(totalInches) ? null : totalInches;
      };

      for (const bay of baySpecificDetails) {
        if (bay.count > 0 && bay.area > 0 && bay.materialDb && bay.modelDb && bay.sectionDb && bay.widthDb !== null && bay.eaveHeightDb !== null) {// Skip bays with no count or no area
        }

        const panelWidthInches = PANEL_WIDTHS_INCHES[bay.materialDb!];
        if (!panelWidthInches) {
          const errorMsg = `Panel width not found for material: ${bay.materialDb} in bay ${bay.bayType}`;
          console.warn(errorMsg);
          calculationErrors.push(errorMsg);
          continue;
        }

        const panelLengthRaw = await getPanelLength(
          bay.modelDb!,
          bay.sectionDb!,
          bay.ventTypeDb, // This can be null
          bay.materialDb!,
          bay.widthDb!,
          bay.eaveHeightDb!
        );

        const panelLengthInches = parsePanelLengthToInches(panelLengthRaw);

        if (!panelLengthInches) {
          console.warn(`Panel length not found or invalid for bay ${bay.bayType} (model: ${bay.modelDb}, section: ${bay.sectionDb}, vent: ${bay.ventTypeDb}, material: ${bay.materialDb}, width: ${bay.widthDb}, eave: ${bay.eaveHeightDb})`);
          calculationErrors.push(`Panel length not found or invalid for bay ${bay.bayType}`);
          continue;
        }

        const panelWidthFeet = panelWidthInches / 12;
        const panelLengthFeet = panelLengthInches / 12;
        const singlePanelAreaSqFt = panelWidthFeet * panelLengthFeet;

        if (singlePanelAreaSqFt === 0) {
          const errorMsg = `Single panel area is zero for bay ${bay.bayType}, check dimensions.`;
          console.warn(errorMsg);
          calculationErrors.push(errorMsg);
          continue;
        }

        const panelsForThisBayTypeArea = bay.area / singlePanelAreaSqFt;
        const totalPanelsForBay = bay.count * panelsForThisBayTypeArea;
        cumulativePanels += totalPanelsForBay;
      }

      if (calculationErrors.length > 0) {
        // Optionally, update UI to show these errors or a general error message
        console.error('Errors during panel calculation by area:', calculationErrors);
        // For now, we'll still set the calculated panels, but you might want to handle this differently
      }
      
      setTotalPanelsByArea(cumulativePanels);
    };

    calculateTotalPanelsByArea();

  }, [baySpecificDetails, loading]); // Dependencies: baySpecificDetails and loading

  useEffect(() => {
    const fetchAndCalculatePanelData = async () => {
      // Use formData.roofGlazingType for dynamic material selection by user
      if (!model || !width || !eaveHeight || !length || !roofMaterial || !initialRoofVentConfig || numHouses <= 0) {
        setCalculatedPanelData([]);
        return;
      }

      const materialMultiplier = RIGID_MATERIALS_CONFIG[roofMaterial]; // Use formData.roofGlazingType
      if (!materialMultiplier) {
        setCalculatedPanelData([]);
        return;
      }

      setLoadingPanelData(true);
      const panelInfoPromises: Promise<CalculatedPanelInfo | null>[] = [];
      const sectionsForProcessing: Omit<CalculatedPanelInfo, 'panelLength' | 'panelQuantity'>[] = [];

      // Determine sections based on vent config and number of houses
      switch (initialRoofVentConfig) {
        case 'Non-Vented':
          for (let i = 0; i < numHouses * 2; i++) {
            sectionsForProcessing.push({
              id: `non-vented-roof-${i + 1}`,
              displayName: `Roof Slope ${i + 1}`,
              materialType: roofMaterial,
              sectionNameDb: 'Roof',
              ventTypeDb: 'Non-Vented',
            });
          }
          break;
        case 'Single Vent':
          for (let i = 0; i < numHouses; i++) {
            sectionsForProcessing.push(
              {
                id: `sv-non-vent-slope-${i + 1}`,
                displayName: `House ${i + 1} - Roof Non-Vent Slope`,
                materialType: roofMaterial,
                sectionNameDb: 'Roof Non-Vent Slope',
                ventTypeDb: 'Single Vent',
              },
              {
                id: `sv-vent-slope-${i + 1}`,
                displayName: `House ${i + 1} - Roof Vent Slope`,
                materialType: roofMaterial,
                sectionNameDb: 'Roof Vent Slope',
                ventTypeDb: 'Single Vent',
              },
              {
                id: `sv-vent-${i + 1}`,
                displayName: `House ${i + 1} - Roof Vent`,
                materialType: roofMaterial,
                sectionNameDb: 'Roof Vent',
                ventTypeDb: 'Single Vent',
              }
            );
          }
          break;
        case 'Double Vent':
          for (let i = 0; i < numHouses * 2; i++) {
            sectionsForProcessing.push(
              {
                id: `dv-vent-slope-${i + 1}`,
                displayName: `Vent Slope ${i + 1}`,
                materialType: roofMaterial,
                sectionNameDb: 'Roof Vent Slope',
                ventTypeDb: 'Double Vent',
              },
              {
                id: `dv-vent-${i + 1}`,
                displayName: `Vent Area ${i + 1}`,
                materialType: roofMaterial,
                sectionNameDb: 'Roof Vent',
                ventTypeDb: 'Double Vent',
              }
            );
          }
          break;
        default:
          setCalculatedPanelData([]);
          setLoadingPanelData(false);
          return;
      }

      for (const section of sectionsForProcessing) {
        panelInfoPromises.push(
          (async (): Promise<CalculatedPanelInfo | null> => {
            try {
              // TEMPORARY FIX: Map 'SL18' to 'Solar Light' for database query
              const queryModel = model === 'SL18' ? 'Solar Light' : model;

              // Log the parameters being used for the query
              console.log('Querying glazing_panel_requirements with:', {
                model: queryModel, // Use the mapped model
                width,
                eaveHeight,
                sectionNameDb: section.sectionNameDb,
                ventTypeDb: section.ventTypeDb,
                roofMaterial,
              });

              const { data: panelReqData, error: panelReqError } = await supabase
                .from('glazing_panel_requirements')
                .select('panel_length') // Corrected column name
                .eq('model', queryModel) // Use the mapped model
                .eq('width', width)
                .eq('eave_height', eaveHeight)
                .eq('section', section.sectionNameDb)
                .eq('vent_type', section.ventTypeDb)
                .eq('material_type', roofMaterial)
                .single();

              if (panelReqError) {
                console.error(`Error fetching panel length for ${section.displayName}:`, panelReqError);
                return { ...section, panelLength: 'Error', panelQuantity: null };
              }
              
              const panelLength = panelReqData?.panel_length as string || 'Not found'; // Corrected property access
              const panelQuantity = (length / 12) * materialMultiplier;

              return {
                ...section,
                panelLength,
                panelQuantity,
              };
            } catch (e) {
              console.error(`Exception fetching panel length for ${section.displayName}:`, e);
              return { ...section, panelLength: 'Error', panelQuantity: null };
            }
          })()
        );
      }

      const resolvedPanelData = (await Promise.all(panelInfoPromises)).filter(p => p !== null) as CalculatedPanelInfo[];
      setCalculatedPanelData(resolvedPanelData);
      setLoadingPanelData(false);
    };

    fetchAndCalculatePanelData();
  // Dependencies: Ensure all props used in the effect are listed
  }, [model, width, eaveHeight, length, numHouses, initialRoofVentConfig, roofMaterial]); 


  if (loading) {
    console.log('GW: Rendering loading state');
    return <div className="p-4 text-gray-200">Loading glazing information...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  console.log('GW: Rendering main component content (loading is false)');

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setShowBayDetails(!showBayDetails)}>{showBayDetails ? 'Hide' : 'Show'} Bay Details</Button>
        <Button variant="outline" onClick={() => setShowDebug(!showDebug)}>{showDebug ? 'Hide' : 'Show'} Debug</Button>
      </div>

      {showDebug && debugInfo && (
        <Card>
          <CardHeader>Debug Information</CardHeader>
          <CardContent className="space-y-6 text-xs">
            <p className="text-sm text-gray-400 -mt-3 mb-1">Detailed debugging information for glazing calculations.</p>
            {debugInfo.inputValues && <DebugDisplaySection title="Input Values" data={debugInfo.inputValues} fields={inputFields} />}
            {debugInfo.calculations && <DebugDisplaySection title="Calculations" data={debugInfo.calculations} fields={calculationFields} />}
            {debugInfo.bayAreas && <DebugDisplaySection title="Bay Area Details (from DB/Defaults)" data={debugInfo.bayAreas} fields={bayAreaFields} />}
            {debugInfo.dbMessages && debugInfo.dbMessages.length > 0 && (
              <div>
                <h4 className="font-semibold text-base text-emerald-400 mb-2 mt-1">Database Log</h4>
                <ul className="list-disc list-inside pl-2 text-gray-300">
                  {debugInfo.dbMessages.map((msg, idx) => <li key={idx}>{msg}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showBayDetails && baySpecificDetails.length > 0 && (
        <Card>
          <CardHeader>Bay-Specific Details</CardHeader>
          <CardContent>
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bay Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Count</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Area (sq ft)</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Area</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {baySpecificDetails.map((detail) => (
                  <tr key={detail.bayType}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{detail.bayType}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{detail.count}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{detail.area.toFixed(2)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200 max-w-xs truncate" title={detail.source}>{detail.source}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{detail.totalArea.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>Glazing Sections</CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-300">Loading sections...</p>
          ) : sections.length > 0 ? (
            <div className="space-y-3">
              {sections.map((section, idx) => (
                <div key={idx} className="grid grid-cols-3 items-center gap-2 p-2 bg-gray-700 rounded">
                  <span className="text-sm text-gray-200 col-span-1 truncate" title={section.section}>{section.section}</span>
                  <div className="col-span-1">
                    <select 
                      value={section.material} 
                      onChange={(e) => handleMaterialChange(idx, e.target.value)}
                      className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-1.5"
                    >
                      {materialOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <span className="text-sm text-gray-200 col-span-1 text-right">
                    {section.area ? `${section.area.toFixed(2)} sq ft` : 'N/A'}
                  </span>
                </div>
              ))}
              {calculatedPanelData.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <h5 className="text-sm font-semibold text-emerald-300 mb-2">Panel Details (Rigid Materials):</h5>
                  {loadingPanelData ? (
                    <p className="text-gray-300">Calculating panel details...</p>
                  ) : (
                    <ul className="space-y-2">
                      {calculatedPanelData.map((panel) => (
                        <li key={panel.id} className="p-2 bg-gray-650 rounded-md">
                          <p className="text-sm font-medium text-white">{panel.displayName}</p>
                          <p className="text-xs text-gray-300">Material: {panel.materialType}</p>
                          <p className="text-xs text-gray-300">Panel Length: {panel.panelLength}</p>
                          <p className="text-xs text-gray-300">Panel Quantity: {panel.panelQuantity !== null ? panel.panelQuantity : 'N/A'}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-400">No glazing sections defined or calculable.</p>
          )}
        </CardContent>
      </Card>

      {totalPanelsByArea !== null && (
        <div className="mt-6">
          <h4 className="font-semibold text-base text-emerald-400 mb-2">Total Panels (Calculated by Bay Area):</h4>
          <p className="text-lg text-gray-100">{totalPanelsByArea.toFixed(2)} panels</p>
        </div>
      )}

    </div>
  );
}

export default GlazingWizard;
