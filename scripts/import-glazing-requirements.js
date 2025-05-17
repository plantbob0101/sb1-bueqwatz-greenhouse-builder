// Import Glazing Requirements from CSV
// This script reads a CSV file and imports the data into the Supabase glazing_requirements table
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Initialize dotenv
config();

// Get dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables.');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to parse CSV
function parseCSV(csvString) {
  const lines = csvString.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).filter(line => line.trim() !== '').map(line => {
    // Handle quoted fields with commas
    const values = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    values.push(currentValue); // Add the last value
    
    // Create object from headers and values
    const obj = {};
    headers.forEach((header, index) => {
      // Convert empty strings to null
      let value = values[index] === '' ? null : values[index];
      
      // Remove quotes from quoted strings
      if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      
      // Convert numeric values
      if (value !== null && !isNaN(value) && header !== 'model' && header !== 'section' && 
          header !== 'bay' && header !== 'vent_type' && header !== 'material_type' && 
          header !== 'notes') {
        value = Number(value);
      }
      
      obj[header] = value;
    });
    
    return obj;
  });
}

async function importGlazingRequirements() {
  try {
    // Ask for the CSV file path
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Enter the path to the CSV file to import: ', async (csvPath) => {
      try {
        // Read the CSV file
        const fullPath = path.resolve(csvPath);
        console.log(`Reading file: ${fullPath}`);
        
        if (!fs.existsSync(fullPath)) {
          console.error(`Error: File not found at ${fullPath}`);
          rl.close();
          return;
        }
        
        const csvData = fs.readFileSync(fullPath, 'utf8');
        const records = parseCSV(csvData);
        
        console.log(`Found ${records.length} records in the CSV file.`);
        
        // Confirm before proceeding
        rl.question(`Do you want to import these ${records.length} records into the glazing_requirements table? (y/n): `, async (answer) => {
          if (answer.toLowerCase() !== 'y') {
            console.log('Import cancelled.');
            rl.close();
            return;
          }
          
          console.log('Starting import...');
          
          // Option to clear existing data
          rl.question('Do you want to clear all existing glazing requirements before importing? (y/n): ', async (clearAnswer) => {
            if (clearAnswer.toLowerCase() === 'y') {
              console.log('Clearing existing data...');
              const { error: deleteError } = await supabase
                .from('glazing_requirements')
                .delete()
                .neq('id', 0); // Delete all records
              
              if (deleteError) {
                console.error('Error clearing existing data:', deleteError);
                rl.close();
                return;
              }
              
              console.log('Existing data cleared successfully.');
            }
            
            // Import records in batches
            const batchSize = 50;
            let successCount = 0;
            let errorCount = 0;
            
            for (let i = 0; i < records.length; i += batchSize) {
              const batch = records.slice(i, i + batchSize);
              
              // Remove id field if present to let Supabase auto-generate new IDs
              // Uncomment this if you want to generate new IDs
              // batch.forEach(record => delete record.id);
              
              const { data, error } = await supabase
                .from('glazing_requirements')
                .upsert(batch, { onConflict: 'id' }); // Use upsert to update existing records by ID
              
              if (error) {
                console.error(`Error importing batch ${i/batchSize + 1}:`, error);
                errorCount += batch.length;
              } else {
                successCount += batch.length;
                console.log(`Imported batch ${i/batchSize + 1} (${i+1}-${Math.min(i+batchSize, records.length)} of ${records.length})`);
              }
            }
            
            console.log(`Import completed. ${successCount} records imported successfully, ${errorCount} errors.`);
            rl.close();
          });
        });
      } catch (err) {
        console.error('Error processing file:', err);
        rl.close();
      }
    });
  } catch (err) {
    console.error('Error importing glazing requirements:', err);
  }
}

// Run the import function
importGlazingRequirements();
