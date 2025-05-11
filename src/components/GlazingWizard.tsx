import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from './Card';
// Placeholder: Replace with your actual fetch logic and types
// import { fetchGlazingRequirements, fetchGlazingConfig, fetchPrices, updateGlazingConfig } from '../api/glazing';

interface GlazingSection {
  section: string;
  material: string;
  area: number;
  unit: string;
  price: number;
  total: number;
  editable: boolean;
}

const SECTION_LABELS: Record<string, string> = {
  roof: 'Roof Glazing',
  roof_vent: 'Roof Vent',
  sidewall: 'Sidewall Covering',
  endwall: 'Endwall Covering',
  gable: 'Gable Covering',
  gutter_partition: 'Gutter Partitions',
  gable_partition: 'Gable Partitions',
  rollup_wall: 'Roll-up Wall',
  drop_wall: 'Drop Wall',
};

const MATERIAL_OPTIONS = [
  { value: 'PC8', label: 'PC8' },
  { value: 'PC80%', label: 'PC80%' },
  { value: 'GR7', label: 'GR7' },
  { value: 'CPC', label: 'CPC' },
  { value: 'Poly', label: 'Poly' },
];

import { supabase } from '../lib/supabase';

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
  // Placeholder state
  const [sections, setSections] = useState<GlazingSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Map abbreviations to full model names for querying
  const MODEL_MAP: Record<string, string> = {
    SL18: 'Solar Light', // Now matches your Supabase data
    // Add more mappings as needed
  };
  const normalizedModel = MODEL_MAP[model] || model;

  useEffect(() => {
    async function fetchGlazingRequirements() {
      setLoading(true);
      // Log the query parameters for debugging
      console.log('Querying glazing_requirements with:', { model, normalizedModel, width, eaveHeight, length });
      // Query Supabase for matching glazing requirements
      const { data, error } = await supabase
        .from('glazing_requirements')
        .select('*')
        .eq('model', normalizedModel)
        .eq('width', width)
        .eq('eave_height', eaveHeight)
        .eq('length', length);

      if (error) {
        setSections([]);
        setLoading(false);
        return;
      }

      // Desired section order
      const SECTION_ORDER = [
        'roof',
        'roof_vent',
        'sidewall',
        'endwall',
        'gable',
        'gutter_partition',
        'gable_partition',
        'rollup_wall',
        'drop_wall',
      ];

      // Aggregate by section, sum area, use first material
      const aggregated = SECTION_ORDER.map(section => {
        const rows = (data || []).filter(row => row.section === section);
        if (rows.length === 0) return null;
        return {
          section,
          material: rows[0].material_type,
          area: rows.reduce((sum, r) => sum + (r.area_sq_ft || 0), 0),
          unit: 'sq_ft',
          price: 0, // TODO: fetch price from pricing table if needed
          total: 0, // TODO: calculate total
          editable: true,
        };
      }).filter((x): x is GlazingSection => !!x);
      setSections(aggregated);
      setLoading(false);
    }
    if (model && width && eaveHeight && length) {
      fetchGlazingRequirements();
    }
  }, [projectId, model, width, eaveHeight, length]);

  const handleMaterialChange = (idx: number, newMaterial: string) => {
    // TODO: Refetch area/price for new material (for now just update material)
    setSections((prev) =>
      prev.map((s, i) =>
        i === idx ? { ...s, material: newMaterial } : s
      )
    );
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>Glazing Wizard</CardHeader>
        <CardContent>
          <div className="text-center text-emerald-400">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>Glazing Wizard</CardHeader>
      <CardContent>
        {(sections.length === 0) ? (
          <div className="text-center text-yellow-400 my-8">
            <div className="mb-2">No glazing requirements found for this configuration.</div>
            <div className="text-xs text-gray-400">
              <strong>Query parameters:</strong><br />
              Model (input): <code>{model}</code><br />
              Model (used): <code>{MODEL_MAP[model] || model}</code><br />
              Width: <code>{width}</code><br />
              Eave Height: <code>{eaveHeight}</code><br />
              Length: <code>{length}</code>
            </div>
          </div>
        ) : (
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
              {sections.map((s, idx) => (
                <tr key={s.section}>
                  <td>{SECTION_LABELS[s.section] || s.section}</td>
                  <td>
                    {s.editable ? (
                      <select
                        value={s.material}
                        onChange={e => handleMaterialChange(idx, e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.5em_1.5em] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22m2%206%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]"
                      >
                        {MATERIAL_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span>{s.material}</span>
                    )}
                  </td>
                  <td className="text-right">{s.area}</td>
                  <td className="text-right">{s.unit}</td>
                  <td className="text-right">${s.price.toFixed(2)}</td>
                  <td className="text-right">${s.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
