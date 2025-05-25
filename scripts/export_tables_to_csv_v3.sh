#!/bin/bash

# Script to export Supabase tables to CSV files using supabase db execute
# Created: 2025-05-18

# Target tables
TABLES=("glazing_requirements" "glazing_panel_requirements")

# Create export directory if it doesn't exist
EXPORT_DIR="./data_exports"
mkdir -p $EXPORT_DIR

# Date for file naming
DATE=$(date +%Y%m%d)

# Loop through tables and export each one
for TABLE in "${TABLES[@]}"; do
  echo "Exporting table: $TABLE"
  
  # Export file path
  EXPORT_FILE="$EXPORT_DIR/${TABLE}_export_${DATE}.csv"
  
  # Export using supabase db execute
  echo "COPY $TABLE TO STDOUT WITH CSV HEADER;" > temp_export.sql
  npx supabase db execute --file temp_export.sql > "$EXPORT_FILE"
  
  # Check if export was successful
  if [ $? -eq 0 ] && [ -s "$EXPORT_FILE" ]; then
    echo "✅ Successfully exported $TABLE to $EXPORT_FILE"
  else
    echo "❌ Failed to export $TABLE"
  fi
done

# Clean up temp file
rm -f temp_export.sql

echo "Export process complete. Files are located in $EXPORT_DIR/"

# Show exported files
ls -la $EXPORT_DIR/
