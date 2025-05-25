#!/bin/bash

# Script to export Supabase tables to CSV files using Docker
# Created: 2025-05-18

# Target tables
TABLES=("glazing_requirements" "glazing_panel_requirements")

# Create export directory if it doesn't exist
EXPORT_DIR="./data_exports"
mkdir -p $EXPORT_DIR

# Date for file naming
DATE=$(date +%Y%m%d)

# Get the PostgreSQL container ID
POSTGRES_CONTAINER=$(docker ps | grep -i postgres | grep -i bueqwatz | awk '{print $1}')

if [ -z "$POSTGRES_CONTAINER" ]; then
  echo "❌ PostgreSQL container not found. Make sure Supabase is running."
  exit 1
fi

echo "Found PostgreSQL container: $POSTGRES_CONTAINER"

# Loop through tables and export each one
for TABLE in "${TABLES[@]}"; do
  echo "Exporting table: $TABLE"
  
  # Export file path
  EXPORT_FILE="$EXPORT_DIR/${TABLE}_export_${DATE}.csv"
  
  # Export using docker exec with psql
  docker exec $POSTGRES_CONTAINER psql -U postgres -d postgres -c "\COPY (SELECT * FROM $TABLE) TO STDOUT WITH CSV HEADER" > "$EXPORT_FILE"
  
  # Check if export was successful
  if [ $? -eq 0 ] && [ -s "$EXPORT_FILE" ]; then
    echo "✅ Successfully exported $TABLE to $EXPORT_FILE"
  else
    echo "❌ Failed to export $TABLE"
  fi
done

echo "Export process complete. Files are located in $EXPORT_DIR/"

# Show exported files
ls -la $EXPORT_DIR/
