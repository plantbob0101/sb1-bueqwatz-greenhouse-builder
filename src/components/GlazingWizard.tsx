import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from './Card';
import { supabase } from '../lib/supabase';

// Default values for bay areas when no data is available
const DEFAULT_A_BAY_AREA = 258;
const DEFAULT_B_BAY_AREA = 229;
const DEFAULT_C_BAY_AREA = 229;
const DEFAULT_D_BAY_AREA = 258;

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
interface DebugInfo {
  inputValues: {
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
  };
  calculations: {
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
  };
  bayAreas: {
    areaA: number;
    areaB: number;
    areaC: number;
    areaD: number;
    sources: {
      areaA: string;
      areaB: string;
      areaC: string;
      areaD: string;
    };
  };
}

// Section labels for display
const SECTION_LABELS: Record<string, string> = {
  roof: 'Roof Glazing',
  roof_vent: 'Roof Vent',
  sidewall: 'Sidewall Covering',
  sidewall_vent: 'Sidewall Vent',
  endwall: 'Endwall Covering',
  endwall_vent: 'Endwall Vent',
  door: 'Door',
  base: 'Base Material'
};

// Material options
const MATERIAL_OPTIONS = [
  { value: 'polycarbonate_8mm', label: 'Polycarbonate 8mm' },
  { value: 'polycarbonate_16mm', label: 'Polycarbonate 16mm' },
  { value: 'polycarbonate_16mm_triple', label: 'Polycarbonate 16mm Triple Wall' },
  { value: 'polycarbonate_25mm', label: 'Polycarbonate 25mm' },
  { value: 'glass', label: 'Glass' },
  { value: 'tempered_glass', label: 'Tempered Glass' }
];

export default function GlazingWizard({
  projectId,
  model,
  width,
  eaveHeight,
  length,
  aBays,
  bBays,
  cBays,
  dBays,
}: {
  projectId: string;
  model: string;
  width: number;
  eaveHeight: number;
  length: number;
  aBays: number;
  bBays: number;
  cBays: number;
  dBays: number;
}) {
  // Normalized model name for compatibility
  const normalizedModel = model.replace(/\s+/g, '_').toLowerCase();
  
  // Component state
  const [sections, setSections] = useState<GlazingSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [showBayDetails, setShowBayDetails] = useState<boolean>(false);
  const [roofMaterial, setRoofMaterial] = useState<string>('polycarbonate_8mm');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  // Fetch glazing requirements when inputs change
  useEffect(() => {
    if (model && width && eaveHeight && length) {
      fetchGlazingRequirements();
    }
  }, [projectId, model, width, eaveHeight, length, aBays, bBays, cBays, dBays, roofMaterial, normalizedModel]);

  // Function to fetch glazing requirements from the database
  async function fetchGlazingRequirements() {
    setLoading(true);

    // Log input values for debugging
    console.log('GlazingWizard props:', { 
      projectId, model, normalizedModel, width, eaveHeight, length,
      aBays, bBays, cBays, dBays,
      aBaysType: typeof aBays,
      bBaysType: typeof bBays,
      cBaysType: typeof cBays,
      dBaysType: typeof dBays
    });

    // Convert bay values robustly using parseFloat(String(value))
    const numABays = parseFloat(String(aBays)) || 0; 
    const numBBays = parseFloat(String(bBays)) || 0;
    const numCBays = parseFloat(String(cBays)) || 0;
    const numDBays = parseFloat(String(dBays)) || 0;

    // Log after conversion to verify
    console.log('Properly converted bay values using parseFloat(String()):', {
      numABays, numBBays, numCBays, numDBays,
      originalValues: { aBays, bBays, cBays, dBays }
    });

    try {
      // Fetch bay-specific glazing requirements
      const { data: bayData, error: bayError } = await supabase
        .from('glazing_requirements')
        .select('*')
        .or(`model.eq.${normalizedModel},model.eq.${model}`)
        .or('section.eq.A Bay,section.eq.B Bay,section.eq.C Bay,section.eq.D Bay');

      console.log('Bay data query results:', { bayData, bayError });
      
      // Fetch general glazing requirements
      const { data, error } = await supabase
        .from('glazing_requirements')
        .select('*')
        .eq('model', normalizedModel)
        .eq('width', width)
        .eq('eave_height', eaveHeight);

      if (error) {
        console.error('Error fetching glazing requirements:', error);
        setSections([]);
        setLoading(false);
        return;
      }

      // Initial values - Use defaults
      let areaA = DEFAULT_A_BAY_AREA;
      let areaB = DEFAULT_B_BAY_AREA;
      let areaC = DEFAULT_C_BAY_AREA;
      let areaD = DEFAULT_D_BAY_AREA;
      
      // Save the source of each area value for debugging
      let areaASource = 'default';
      let areaBSource = 'default';
      let areaCSource = 'default';
      let areaDSource = 'default';
      
      // Check if we have bay data from database
      if (bayData && bayData.length > 0) {
        console.log('Found bay data in database:', bayData);
        
        // Find the specific bay types
        const aBayData = bayData.find((row: any) => row.section === 'A Bay');
        const bBayData = bayData.find((row: any) => row.section === 'B Bay');
        const cBayData = bayData.find((row: any) => row.section === 'C Bay');
        const dBayData = bayData.find((row: any) => row.section === 'D Bay');
    
        // Use database values if available
        if (aBayData && aBayData.area_sq_ft) {
          areaA = aBayData.area_sq_ft;
          areaASource = `database (id: ${aBayData.id})`;
        }
        if (bBayData && bBayData.area_sq_ft) {
          areaB = bBayData.area_sq_ft;
          areaBSource = `database (id: ${bBayData.id})`;
        }
        if (cBayData && cBayData.area_sq_ft) {
          areaC = cBayData.area_sq_ft;
          areaCSource = `database (id: ${cBayData.id})`;
        }
        if (dBayData && dBayData.area_sq_ft) {
          areaD = dBayData.area_sq_ft;
          areaDSource = `database (id: ${dBayData.id})`;
        }
      }
      
      // Calculate the roof area based on the bay counts and areas
      const aBaysContribution = numABays * areaA;
      const bBaysContribution = numBBays * areaB;
      const cBaysContribution = numCBays * areaC;
      const dBaysContribution = numDBays * areaD;
      
      const calculatedRoofArea = aBaysContribution + bBaysContribution + cBaysContribution + dBaysContribution;
      
      // Set debug info for displaying in the UI
      setDebugInfo({
        inputValues: {
          projectId,
          model,
          normalizedModel,
          width,
          eaveHeight,
          length,
          aBays: numABays,
          bBays: numBBays,
          cBays: numCBays,
          dBays: numDBays
        },
        calculations: {
          numABays,
          numBBays,
          numCBays,
          numDBays,
          roofArea: calculatedRoofArea,
          bayAreaBreakdown: {
            aBaysContribution,
            bBaysContribution,
            cBaysContribution,
            dBaysContribution
          }
        },
        bayAreas: {
          areaA,
          areaB,
          areaC,
          areaD,
          sources: {
            areaA: areaASource,
            areaB: areaBSource,
            areaC: areaCSource,
            areaD: areaDSource
          }
        }
      });
      
      // Process glazing data from the API and create properly sorted sections
      if (data && data.length > 0) {
        console.log('Found glazing requirements:', data);
        
        const processedSections = data.map((row: any) => ({
          section: row.section || 'unknown',
          material: row.material_type || roofMaterial,
          area: row.section === 'roof' ? calculatedRoofArea : row.area_sq_ft || 0,
          unit: 'sq ft',
          price: row.material_cost || 0,
          total: row.section === 'roof' 
            ? calculatedRoofArea * (row.material_cost || 0) 
            : (row.area_sq_ft || 0) * (row.material_cost || 0),
          editable: row.section === 'roof'
        }));
        
        // Add the roof section if it doesn't exist
        if (!processedSections.some(s => s.section === 'roof')) {
          processedSections.push({
            section: 'roof',
            material: roofMaterial,
            area: calculatedRoofArea,
            unit: 'sq ft',
            price: 0,
            total: 0,
            editable: true
          });
        }
        
        // Sort sections by predefined order
        const sortedSections = processedSections.sort((a, b) => {
          const sectionOrder = Object.keys(SECTION_LABELS);
          return sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section);
        });
        
        setSections(sortedSections);
      } else {
        // Create just a roof section with calculated area if no other data
        setSections([
          {
            section: 'roof',
            material: roofMaterial,
            area: calculatedRoofArea,
            unit: 'sq ft',
            price: 0,
            total: 0,
            editable: true
          }
        ]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error in fetchGlazingRequirements:', err);
      setSections([]);
      setLoading(false);
    }
  }

  // Handler for changing material of a section
  const handleMaterialChange = (idx: number, newMaterial: string) => {
    const updatedSections = [...sections];
    updatedSections[idx].material = newMaterial;
    setSections(updatedSections);
  };

  // Handler for roof material change
  const handleRoofMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoofMaterial(e.target.value);
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>Glazing Wizard</CardHeader>
        <CardContent>
          <p className="text-gray-400">Loading glazing requirements...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex justify-between items-center">
        <span>Glazing Wizard</span>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded"
        >
          {showDebug ? "Hide Debug" : "Show Debug"}
        </button>
      </CardHeader>
      <CardContent>
        {/* Debug Panel */}
        {showDebug && debugInfo && (
          <div className="mb-6 p-4 bg-gray-750 rounded-lg border border-gray-600 overflow-auto text-xs">
            <h3 className="text-emerald-400 font-semibold mb-2">Debug Information</h3>
            
            <div className="mb-2 flex justify-between items-center">
              <span className="text-gray-300 text-xs italic">Detailed debugging information for glazing calculations</span>
              <button
                onClick={() => setShowBayDetails(!showBayDetails)}
                className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs rounded"
              >
                {showBayDetails ? "Hide Bay Details" : "Show Bay Details"}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-2 rounded">
                <h4 className="text-emerald-400 font-medium mb-1">Input Values:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">Project ID:</div>
                  <div className="text-white">{debugInfo.inputValues.projectId}</div>
                  
                  <div className="text-gray-400">Model:</div>
                  <div className="text-white">
                    {debugInfo.inputValues.model} 
                    {debugInfo.inputValues.normalizedModel !== debugInfo.inputValues.model && 
                      ` → ${debugInfo.inputValues.normalizedModel}`}
                  </div>
                  
                  <div className="text-gray-400">Width:</div>
                  <div className="text-white">{debugInfo.inputValues.width} ft</div>
                  
                  <div className="text-gray-400">Eave Height:</div>
                  <div className="text-white">{debugInfo.inputValues.eaveHeight} ft</div>
                  
                  <div className="text-gray-400">Length:</div>
                  <div className="text-white">{debugInfo.inputValues.length} ft</div>
                  
                  <div className="text-gray-400">A Bays:</div>
                  <div className="text-white">
                    {debugInfo.inputValues.aBays} 
                    <span className="text-gray-500 ml-1">({typeof debugInfo.inputValues.aBays})</span>
                  </div>
                  
                  <div className="text-gray-400">B Bays:</div>
                  <div className="text-white">
                    {debugInfo.inputValues.bBays}
                    <span className="text-gray-500 ml-1">({typeof debugInfo.inputValues.bBays})</span>
                  </div>
                  
                  <div className="text-gray-400">C Bays:</div>
                  <div className="text-white">
                    {debugInfo.inputValues.cBays}
                    <span className="text-gray-500 ml-1">({typeof debugInfo.inputValues.cBays})</span>
                  </div>
                  
                  <div className="text-gray-400">D Bays:</div>
                  <div className="text-white">
                    {debugInfo.inputValues.dBays}
                    <span className="text-gray-500 ml-1">({typeof debugInfo.inputValues.dBays})</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-2 rounded">
                <h4 className="text-emerald-400 font-medium mb-1">Calculations:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-400">A Bays:</div>
                  <div className="text-white">{debugInfo.calculations.numABays}</div>
                  
                  <div className="text-gray-400">B Bays:</div>
                  <div className="text-white">{debugInfo.calculations.numBBays}</div>
                  
                  <div className="text-gray-400">C Bays:</div>
                  <div className="text-white">{debugInfo.calculations.numCBays}</div>
                  
                  <div className="text-gray-400">D Bays:</div>
                  <div className="text-white">{debugInfo.calculations.numDBays}</div>
                  
                  <div className="text-gray-400">Total Roof Area:</div>
                  <div className="text-white font-semibold text-emerald-300">
                    {debugInfo.calculations.roofArea.toFixed(2)} sq ft
                  </div>
                </div>
              </div>
            </div>
            
            {showBayDetails && (
              <div className="mt-4">
                <h4 className="text-emerald-400 font-medium mb-1">Bay-Specific Details:</h4>
                <div className="bg-gray-800 p-2 rounded mb-3">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="text-left border-b border-gray-700">
                        <th className="pb-1 text-gray-300">Bay Type</th>
                        <th className="pb-1 text-gray-300">Count</th>
                        <th className="pb-1 text-gray-300">Area (sq ft)</th>
                        <th className="pb-1 text-gray-300">Source</th>
                        <th className="pb-1 text-gray-300">Total Area</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700">
                        <td className="py-1 text-white">A Bay</td>
                        <td className="py-1 text-white">{debugInfo.calculations.numABays}</td>
                        <td className="py-1 text-white">{debugInfo.bayAreas.areaA}</td>
                        <td className="py-1 text-gray-400 italic">{debugInfo.bayAreas.sources.areaA}</td>
                        <td className="py-1 text-white">{debugInfo.calculations.bayAreaBreakdown.aBaysContribution.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-1 text-white">B Bay</td>
                        <td className="py-1 text-white">{debugInfo.calculations.numBBays}</td>
                        <td className="py-1 text-white">{debugInfo.bayAreas.areaB}</td>
                        <td className="py-1 text-gray-400 italic">{debugInfo.bayAreas.sources.areaB}</td>
                        <td className="py-1 text-white">{debugInfo.calculations.bayAreaBreakdown.bBaysContribution.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-1 text-white">C Bay</td>
                        <td className="py-1 text-white">{debugInfo.calculations.numCBays}</td>
                        <td className="py-1 text-white">{debugInfo.bayAreas.areaC}</td>
                        <td className="py-1 text-gray-400 italic">{debugInfo.bayAreas.sources.areaC}</td>
                        <td className="py-1 text-white">{debugInfo.calculations.bayAreaBreakdown.cBaysContribution.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-white">D Bay</td>
                        <td className="py-1 text-white">{debugInfo.calculations.numDBays}</td>
                        <td className="py-1 text-white">{debugInfo.bayAreas.areaD}</td>
                        <td className="py-1 text-gray-400 italic">{debugInfo.bayAreas.sources.areaD}</td>
                        <td className="py-1 text-white">{debugInfo.calculations.bayAreaBreakdown.dBaysContribution.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="text-xs bg-gray-800 p-2 rounded">
                  <h4 className="text-emerald-400 font-medium mb-1">Calculation Formula:</h4>
                  <div className="my-2 bg-gray-900 p-2 rounded font-mono">
                    roofArea = 
                    <span className="text-blue-400"> (numABays * areaA) </span> + 
                    <span className="text-green-400"> (numBBays * areaB) </span> + 
                    <span className="text-yellow-400"> (numCBays * areaC) </span> + 
                    <span className="text-purple-400"> (numDBays * areaD) </span>
                  </div>
                  <div className="my-2 bg-gray-900 p-2 rounded font-mono">
                    roofArea = 
                    <span className="text-blue-400"> ({debugInfo.calculations.numABays} * {debugInfo.bayAreas.areaA}) </span> + 
                    <span className="text-green-400"> ({debugInfo.calculations.numBBays} * {debugInfo.bayAreas.areaB}) </span> + 
                    <span className="text-yellow-400"> ({debugInfo.calculations.numCBays} * {debugInfo.bayAreas.areaC}) </span> + 
                    <span className="text-purple-400"> ({debugInfo.calculations.numDBays} * {debugInfo.bayAreas.areaD}) </span>
                  </div>
                  <div className="my-2 bg-gray-900 p-2 rounded font-mono">
                    roofArea = 
                    <span className="text-blue-400"> {debugInfo.calculations.bayAreaBreakdown.aBaysContribution.toFixed(2)} </span> + 
                    <span className="text-green-400"> {debugInfo.calculations.bayAreaBreakdown.bBaysContribution.toFixed(2)} </span> + 
                    <span className="text-yellow-400"> {debugInfo.calculations.bayAreaBreakdown.cBaysContribution.toFixed(2)} </span> + 
                    <span className="text-purple-400"> {debugInfo.calculations.bayAreaBreakdown.dBaysContribution.toFixed(2)} </span>
                  </div>
                  <div className="my-2 bg-gray-900 p-2 rounded font-mono">
                    roofArea = <span className="text-emerald-300 font-semibold">{debugInfo.calculations.roofArea.toFixed(2)}</span> sq ft
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Sections Table */}
        <table className="min-w-full text-white text-sm">
          <thead>
            <tr>
              <th className="text-left">Section</th>
              <th className="text-left">Material</th>
              <th className="text-right">Area</th>
              <th className="text-right">Unit</th>
              <th className="text-right">Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                <td className="py-2 pl-2">
                  {SECTION_LABELS[section.section] || section.section}
                </td>
                <td className="py-2">
                  {section.section === 'roof' ? (
                    <select
                      value={roofMaterial}
                      onChange={handleRoofMaterialChange}
                      className="bg-gray-700 text-white border border-gray-600 rounded p-1 text-sm"
                    >
                      {MATERIAL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : section.editable ? (
                    <select
                      value={section.material}
                      onChange={(e) => handleMaterialChange(idx, e.target.value)}
                      className="bg-gray-700 text-white border border-gray-600 rounded p-1 text-sm"
                    >
                      {MATERIAL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    section.material
                  )}
                </td>
                <td className="py-2 text-right">{section.area.toFixed(2)}</td>
                <td className="py-2 text-right">{section.unit}</td>
                <td className="py-2 text-right">${section.price.toFixed(2)}</td>
                <td className="py-2 text-right pr-2">${section.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
