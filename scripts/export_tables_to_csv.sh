#!/bin/bash

# Script to export Supabase tables to CSV files
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
  
  # Create export SQL
  SQL_COMMAND="\COPY (SELECT * FROM $TABLE) TO STDOUT WITH CSV HEADER"
  
  # Export using Supabase CLI
  npx supabase db execute "$SQL_COMMAND" --file "$EXPORT_DIR/${TABLE}_export_${DATE}.csv"
  
  # Check if export was successful
  if [ $? -eq 0 ]; then
    echo "✅ Successfully exported $TABLE to $EXPORT_DIR/${TABLE}_export_${DATE}.csv"
  else
    echo "❌ Failed to export $TABLE"
  fi
done

echo "Export process complete. Files are located in $EXPORT_DIR/"
