import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardContent } from './Card';
import { supabase } from '../lib/supabase';
import { Button } from './Button.tsx'; // Explicitly added .tsx extension
import type { Database } from '../types/supabase'; // Added import for Supabase types

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
}

interface MaterialOption {
  value: string;
  label: string;
}

// Removed GlazingRequirementItemFromDB as it's not directly used after refactor, Supabase types will be inferred or defined as needed.

export function GlazingWizard({
  projectId,
  model,
  width,
  eaveHeight,
  length,
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
      let dbVentType: string | undefined = undefined;
      if (initialRoofVentConfig) {
        if (initialRoofVentConfig === 'Non-Vented') dbVentType = 'non-vented';
        else if (initialRoofVentConfig === 'Single Vent') dbVentType = 'single';
        else if (initialRoofVentConfig === 'Double Vent') dbVentType = 'double';
      }

      // Helper to build and execute query for a given bay
      const fetchBayData = async (bayChar: 'A' | 'B' | 'C' | 'D', bayLabel: string) => {
        let query = supabase
          .from('glazing_requirements')
          .select('*')
          .eq('model', normalizedModelValue)
          .eq('width', width)
          .eq('eave_height', eaveHeight)
          .eq('section', 'roof') // Added section filter
          .eq('material_type', roofMaterial) // Added material_type filter
          .like('bay', `%${bayChar}%`);

        if (dbVentType) {
          query = query.eq('vent_type', dbVentType); // Conditionally add vent_type filter
        }

        const { data: bayResults, error } = await query;

        const queryCriteriaMsg = `model=${normalizedModelValue}, w=${width}, eh=${eaveHeight}, sec=roof, mat=${roofMaterial}${dbVentType ? ', vt=' + dbVentType : ''}, bay LIKE %${bayChar}% (array)`;

        if (error) {
          console.error(`Supabase error fetching ${bayLabel} bay data:`, error);
          currentDebugInfo.dbMessages?.push(`${bayLabel} Bay Query Error: ${error.message} | Criteria: ${queryCriteriaMsg}`);
          throw new Error(`Failed to fetch ${bayLabel} bay data: ${error.message}`);
        }
        currentDebugInfo.dbMessages?.push(`${bayLabel} Bay Query: ${queryCriteriaMsg}`);

        let bayDataRow: GlazingRequirementRow | null = null;
        if (bayResults && bayResults.length > 0) {
          bayDataRow = bayResults[0];
          if (bayResults.length > 1) {
            currentDebugInfo.dbMessages?.push(`Warning: Multiple ${bayLabel} bay records found for specific criteria (${bayResults.length} found). Using the first one.`);
            console.warn(`GW: Multiple ${bayLabel} bay records found for ${queryCriteriaMsg} (${bayResults.length} found). Using first one.`);
          }
        } else {
          currentDebugInfo.dbMessages?.push(`No ${bayLabel} bay data found for specific criteria.`);
        }
        return bayDataRow;
      };

      try {
        const aData = await fetchBayData('A', 'A');
        if (aData) {
          const areaValue = parseFloatWithFallback(aData.area_sq_ft, 0);
          currentDebugInfo.bayAreas.areaA = areaValue;
          currentDebugInfo.bayAreas.areaASource = `DB (bay: ${aData.bay || 'A'}, material: ${aData.material_type || 'unknown'}, area: ${areaValue})`;
          currentDebugInfo.dbMessages?.push(`Found A data: Area=${areaValue}, Source=${currentDebugInfo.bayAreas.areaASource}`);
        } else {
          currentDebugInfo.bayAreas.areaASource = 'Not found in DB (specific criteria)';
        }

        const bData = await fetchBayData('B', 'B');
        if (bData) {
          const areaValue = parseFloatWithFallback(bData.area_sq_ft, 0);
          currentDebugInfo.bayAreas.areaB = areaValue;
          currentDebugInfo.bayAreas.areaBSource = `DB (bay: ${bData.bay || 'B'}, material: ${bData.material_type || 'unknown'}, area: ${areaValue})`;
          currentDebugInfo.dbMessages?.push(`Found B data: Area=${areaValue}, Source=${currentDebugInfo.bayAreas.areaBSource}`);
        } else {
          currentDebugInfo.bayAreas.areaBSource = 'Not found in DB (specific criteria)';
        }

        const cData = await fetchBayData('C', 'C');
        if (cData) {
          const areaValue = parseFloatWithFallback(cData.area_sq_ft, 0);
          currentDebugInfo.bayAreas.areaC = areaValue;
          currentDebugInfo.bayAreas.areaCSource = `DB (bay: ${cData.bay || 'C'}, material: ${cData.material_type || 'unknown'}, area: ${areaValue})`;
          currentDebugInfo.dbMessages?.push(`Found C data: Area=${areaValue}, Source=${currentDebugInfo.bayAreas.areaCSource}`);
        } else {
          currentDebugInfo.bayAreas.areaCSource = 'Not found in DB (specific criteria)';
        }

        const dData = await fetchBayData('D', 'D');
        if (dData) {
          const areaValue = parseFloatWithFallback(dData.area_sq_ft, 0);
          currentDebugInfo.bayAreas.areaD = areaValue;
          currentDebugInfo.bayAreas.areaDSource = `DB (bay: ${dData.bay || 'D'}, material: ${dData.material_type || 'unknown'}, area: ${areaValue})`;
          currentDebugInfo.dbMessages?.push(`Found D data: Area=${areaValue}, Source=${currentDebugInfo.bayAreas.areaDSource}`);
        } else {
          currentDebugInfo.bayAreas.areaDSource = 'Not found in DB (specific criteria)';
        }

        // Calculations
        const aBaysContribution = numABays * currentDebugInfo.bayAreas.areaA;
        const bBaysContribution = numBBays * currentDebugInfo.bayAreas.areaB;
        const cBaysContribution = numCBays * currentDebugInfo.bayAreas.areaC;
        const dBaysContribution = numDBays * currentDebugInfo.bayAreas.areaD;
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
          { bayType: 'A Bay', count: numABays, area: currentDebugInfo.bayAreas.areaA, source: currentDebugInfo.bayAreas.areaASource, totalArea: aBaysContribution },
          { bayType: 'B Bay', count: numBBays, area: currentDebugInfo.bayAreas.areaB, source: currentDebugInfo.bayAreas.areaBSource, totalArea: bBaysContribution },
          { bayType: 'C Bay', count: numCBays, area: currentDebugInfo.bayAreas.areaC, source: currentDebugInfo.bayAreas.areaCSource, totalArea: cBaysContribution },
          { bayType: 'D Bay', count: numDBays, area: currentDebugInfo.bayAreas.areaD, source: currentDebugInfo.bayAreas.areaDSource, totalArea: dBaysContribution },
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

      } catch (innerError: any) { 
        console.error("GW: Error during specific bay data fetching, calculations, or material options:", innerError);
        currentDebugInfo.dbMessages?.push(`Error during data processing sequence: ${innerError.message}`);
        throw innerError; 
      }

    } catch (error: any) { 
      // Ensure the full error object is logged if the error happens outside specific bay fetches
      console.error("GW: Overall error in fetchGlazingRequirements:", error, "Message:", error?.message);
      setError(`Failed to load glazing information: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ projectId, model, width, eaveHeight, length, numABays, numBBays, numCBays, numDBays, roofGlazingType, initialRoofVentConfig, supabase, roofMaterial ]);
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
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Section</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Material</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Area (sq ft)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sections.map((section, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{section.section}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {section.section === 'Roof Glazing' ? (
                        <select 
                          value={roofMaterial} 
                          onChange={(e) => handleRoofMaterialChange(e.target.value)}
                          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-1.5"
                        >
                          {materialOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      ) : (
                        <select 
                          value={section.material} 
                          onChange={(e) => handleMaterialChange(idx, e.target.value)}
                          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-1.5"
                          disabled={!section.editable}
                        >
                          {materialOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-200">{section.area.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );
  }

  export default GlazingWizard;
