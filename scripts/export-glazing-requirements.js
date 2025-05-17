// Export Glazing Requirements to CSV
// This script connects to Supabase and exports all glazing requirements to a CSV file
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

// Initialize dotenv
config();

// Get dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Supabase credentials from environment variables
// You can also hardcode them here if needed for a one-time script
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables.');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to convert array of objects to CSV
function convertToCSV(arr) {
  if (arr.length === 0) {
    return '';
  }
  
  const headers = Object.keys(arr[0]);
  const headerRow = headers.join(',');
  
  const rows = arr.map(obj => {
    return headers.map(header => {
      // Handle null values
      if (obj[header] === null) {
        return '';
      }
      
      // Handle strings with commas by wrapping in quotes
      if (typeof obj[header] === 'string' && obj[header].includes(',')) {
        return `"${obj[header]}"`;
      }
      
      return obj[header];
    }).join(',');
  });
  
  return [headerRow, ...rows].join('\n');
}

async function exportGlazingRequirements() {
  try {
    console.log('Connecting to Supabase and fetching glazing requirements...');
    
    // Fetch all glazing requirements
    const { data, error } = await supabase
      .from('glazing_requirements')
      .select('*')
      .order('id');
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No glazing requirements found in the database.');
      return;
    }
    
    console.log(`Found ${data.length} glazing requirement records.`);
    
    // Convert data to CSV
    const csv = convertToCSV(data);
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `glazing-requirements-${timestamp}.csv`;
    const filepath = path.join(path.dirname(__dirname), filename);
    
    // Write to file
    fs.writeFileSync(filepath, csv);
    
    console.log(`Successfully exported glazing requirements to ${filepath}`);
    console.log('You can now edit this file and use it for importing back to Supabase.');
    
  } catch (err) {
    console.error('Error exporting glazing requirements:', err);
  }
}

// Run the export function
exportGlazingRequirements();
