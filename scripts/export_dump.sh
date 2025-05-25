#!/bin/bash

# Create exports directory
mkdir -p data_exports

# Use Supabase db dump to get all tables
echo "Creating a full database dump..."
npx supabase db dump -f data_exports/all_tables.sql

echo "Extracting structure for glazing_requirements and glazing_panel_requirements..."
grep -A 50 "glazing_requirements" data_exports/all_tables.sql > data_exports/glazing_requirements_structure.txt
grep -A 50 "glazing_panel_requirements" data_exports/all_tables.sql > data_exports/glazing_panel_requirements_structure.txt

echo "Done. Check the data_exports directory for the exported files."
