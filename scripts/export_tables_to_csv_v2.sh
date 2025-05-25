#!/bin/bash

# Script to export Supabase tables to CSV files using psql
# Created: 2025-05-18

# Target tables
TABLES=("glazing_requirements" "glazing_panel_requirements")

# Create export directory if it doesn't exist
EXPORT_DIR="./data_exports"
mkdir -p $EXPORT_DIR

# Date for file naming
DATE=$(date +%Y%m%d)

echo "Starting Supabase database..."
npx supabase start

echo "Getting Supabase connection info..."
CONNECTION_STRING=$(npx supabase db connect --brief)

# Loop through tables and export each one
for TABLE in "${TABLES[@]}"; do
  echo "Exporting table: $TABLE"
  
  # Export using psql
  EXPORT_FILE="$EXPORT_DIR/${TABLE}_export_${DATE}.csv"
  psql "$CONNECTION_STRING" -c "\COPY $TABLE TO '$EXPORT_FILE' WITH CSV HEADER"
  
  # Check if export was successful
  if [ $? -eq 0 ]; then
    echo "✅ Successfully exported $TABLE to $EXPORT_FILE"
  else
    echo "❌ Failed to export $TABLE"
  fi
done

echo "Export process complete. Files are located in $EXPORT_DIR/"

# Show exported files
ls -la $EXPORT_DIR/
