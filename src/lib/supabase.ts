import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Fetches the panel length in inches from the 'glazing_panel_requirements' table.
 * @param model The model name (e.g., 'Solar Light').
 * @param section The section name (e.g., 'Roof', 'Sidewall').
 * @param ventType The vent type (e.g., 'Non-Vented', 'Single Vent', or null).
 * @param material The material type (e.g., 'PC8', 'CPC').
 * @returns A promise that resolves to the panel_length_inches string or null if not found/error.
 */
export async function getPanelLength(
  model: string,
  section: string,
  ventType: string | null, // ventType can be null
  material: string,
  width: number,
  eaveHeight: number
): Promise<string | null> {
  console.log(
    `getPanelLength: Querying for model='${model}', section='${section}', ventType='${ventType}', material='${material}', width='${width}', eaveHeight='${eaveHeight}'`
  );

  try {
    let queryBuilder = supabase
      .from('glazing_panel_requirements')
      .select('panel_length')
      .eq('model', model)
      .eq('width', width)
      .eq('eave_height', eaveHeight)
      .eq('section', section) 
      .eq('material_type', material);

    if (ventType === null) {
      queryBuilder = queryBuilder.is('vent_type', null);
    } else {
      queryBuilder = queryBuilder.eq('vent_type', ventType);
    }

    const { data, error } = await queryBuilder.maybeSingle(); // Expect at most one row

    if (error) {
      console.error('Supabase error in getPanelLength:', error.message, error);
      return null;
    }

    if (data && data.panel_length) {
      console.log('getPanelLength: Found panel length:', data.panel_length);
      return data.panel_length;
    }

    console.log('getPanelLength: Panel length not found for the given criteria.');
    return null;
  } catch (e: any) {
    console.error('Critical error in getPanelLength:', e.message, e);
    return null;
  }
}