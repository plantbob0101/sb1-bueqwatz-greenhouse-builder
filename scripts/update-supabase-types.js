// Script to update the Supabase type definitions for glazing_requirements
// This script will modify the type definitions in src/types/supabase.ts to:
// 1. Remove the 'length' field from glazing_requirements
// 2. Rename 'panel_count' to 'panel_width'

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Supabase types file
const typesFilePath = path.join(__dirname, '..', 'src', 'types', 'supabase.ts');

// Read the file
console.log(`Reading Supabase types file: ${typesFilePath}`);
let typesContent = fs.readFileSync(typesFilePath, 'utf8');

// Function to update the glazing_requirements type definitions
function updateGlazingRequirementsTypes(content) {
  // Create a backup of the original file
  const backupPath = `${typesFilePath}.backup`;
  fs.writeFileSync(backupPath, content);
  console.log(`Created backup at: ${backupPath}`);
  
  // Regular expressions to match the type definitions we need to update
  
  // 1. Remove the 'length' field from Row, Insert, and Update interfaces
  content = content.replace(/\s+length: number;/g, '');
  content = content.replace(/\s+length\?: number;/g, '');
  
  // 2. Rename 'panel_count' to 'panel_width' in Row, Insert, and Update interfaces
  content = content.replace(/panel_count: number \| null;/g, 'panel_width: number | null;');
  content = content.replace(/panel_count\?: number \| null;/g, 'panel_width?: number | null;');
  
  return content;
}

// Update the types
const updatedContent = updateGlazingRequirementsTypes(typesContent);

// Write the updated content back to the file
fs.writeFileSync(typesFilePath, updatedContent);
console.log(`Updated Supabase types file with new schema definitions.`);
console.log(`\nChanges made:`);
console.log(`1. Removed 'length' field from glazing_requirements types`);
console.log(`2. Renamed 'panel_count' to 'panel_width' in glazing_requirements types`);
console.log(`\nNext steps:`);
console.log(`1. Update the Supabase database schema to match these changes`);
console.log(`2. Import the modified data using the import script`);
