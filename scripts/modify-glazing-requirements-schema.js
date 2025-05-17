// Modify Glazing Requirements Schema
// This script modifies the exported CSV to reflect schema changes:
// 1. Delete the 'length' field
// 2. Rename 'panel_count' to 'panel_width'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find the most recent export file
function findMostRecentExport() {
  const projectDir = path.dirname(__dirname);
  const files = fs.readdirSync(projectDir);
  
  // Filter for glazing requirements export files
  const exportFiles = files.filter(file => 
    file.startsWith('glazing-requirements-') && file.endsWith('.csv')
  );
  
  if (exportFiles.length === 0) {
    console.error('No export files found. Please run export-glazing-requirements.js first.');
    process.exit(1);
  }
  
  // Sort by creation time (most recent first)
  exportFiles.sort((a, b) => {
    const statA = fs.statSync(path.join(projectDir, a));
    const statB = fs.statSync(path.join(projectDir, b));
    return statB.mtime.getTime() - statA.mtime.getTime();
  });
  
  return path.join(projectDir, exportFiles[0]);
}

function modifySchema(inputFilePath) {
  console.log(`Processing file: ${inputFilePath}`);
  
  // Read the CSV file
  const csvData = fs.readFileSync(inputFilePath, 'utf8');
  const lines = csvData.split('\n');
  
  if (lines.length === 0) {
    console.error('CSV file is empty');
    return;
  }
  
  // Process header
  const headers = lines[0].split(',');
  
  // Find the indices of columns to modify
  const lengthIndex = headers.indexOf('length');
  const panelCountIndex = headers.indexOf('panel_count');
  
  if (lengthIndex === -1) {
    console.warn('Warning: "length" column not found in the CSV');
  }
  
  if (panelCountIndex === -1) {
    console.warn('Warning: "panel_count" column not found in the CSV');
  }
  
  // Create new headers
  const newHeaders = [...headers];
  
  // Rename panel_count to panel_width
  if (panelCountIndex !== -1) {
    newHeaders[panelCountIndex] = 'panel_width';
  }
  
  // Remove length column (if we remove it now, the indices for the data rows would be off)
  // We'll handle this when processing each row
  
  // Process data rows
  const newRows = [];
  newRows.push(newHeaders.filter((_, index) => index !== lengthIndex).join(','));
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const values = lines[i].split(',');
    
    // Remove length column
    if (lengthIndex !== -1) {
      values.splice(lengthIndex, 1);
    }
    
    newRows.push(values.join(','));
  }
  
  // Create new filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFilePath = path.join(
    path.dirname(inputFilePath), 
    `glazing-requirements-modified-${timestamp}.csv`
  );
  
  // Write modified CSV
  fs.writeFileSync(outputFilePath, newRows.join('\n'));
  
  console.log(`Schema modifications complete!`);
  console.log(`New file created: ${outputFilePath}`);
  console.log('\nChanges made:');
  console.log('1. Deleted "length" column');
  console.log('2. Renamed "panel_count" to "panel_width"');
  console.log('\nNext steps:');
  console.log('1. Edit the data in this new CSV file as needed');
  console.log('2. Update the Supabase database schema to match these changes');
  console.log('3. Update the type definitions in src/types/supabase.ts');
  console.log('4. Import the modified data using the import script');
}

// Find and process the most recent export file
const inputFilePath = findMostRecentExport();
modifySchema(inputFilePath);
