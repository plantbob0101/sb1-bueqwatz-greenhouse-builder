#!/bin/bash

# Direct export script that focuses on getting results
mkdir -p data_exports

# Use the supabase db dump command to get the table schema and data
echo "Exporting tables directly from Supabase..."

# Export glazing_requirements
echo "COPY (SELECT * FROM public.glazing_requirements) TO STDOUT WITH CSV HEADER;" > export_query.sql
npx supabase db execute --file export_query.sql > data_exports/glazing_requirements.csv

# Export glazing_panel_requirements
echo "COPY (SELECT * FROM public.glazing_panel_requirements) TO STDOUT WITH CSV HEADER;" > export_query.sql
npx supabase db execute --file export_query.sql > data_exports/glazing_panel_requirements.csv

# Clean up
rm export_query.sql

# Display results
echo "Export complete. Files are in data_exports folder."
ls -la data_exports/
