#!/bin/bash

# Script to import CSV files into Supabase tables
# Created: 2025-05-18

# Check if file is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <path_to_csv_file> <table_name>"
  echo "Example: $0 ./data_exports/glazing_panel_requirements_data.csv glazing_panel_requirements"
  exit 1
fi

# Check if table name is provided
if [ -z "$2" ]; then
  echo "You must specify a table name as the second argument"
  echo "Example: $0 ./data_exports/glazing_panel_requirements_data.csv glazing_panel_requirements"
  exit 1
fi

CSV_FILE=$1
TABLE_NAME=$2

# Check if file exists
if [ ! -f "$CSV_FILE" ]; then
  echo "❌ File not found: $CSV_FILE"
  exit 1
fi

# Get the postgres container ID
POSTGRES_CONTAINER=$(docker ps | grep -i postgres | grep -i bueqwatz | head -1 | awk '{print $1}')

if [ -z "$POSTGRES_CONTAINER" ]; then
  echo "❌ PostgreSQL container not found. Make sure Supabase is running."
  exit 1
fi

echo "Found PostgreSQL container: $POSTGRES_CONTAINER"
echo "Importing $CSV_FILE into table $TABLE_NAME..."

# Copy the CSV file to the container
docker cp "$CSV_FILE" "$POSTGRES_CONTAINER:/tmp/import.csv"

# Run the import command
docker exec "$POSTGRES_CONTAINER" psql -U postgres -d postgres -c "\
  COPY $TABLE_NAME FROM '/tmp/import.csv' \
  WITH (FORMAT csv, HEADER true);"

# Check if import was successful
if [ $? -eq 0 ]; then
  echo "✅ Successfully imported data from $CSV_FILE into $TABLE_NAME"
else
  echo "❌ Failed to import data"
fi

# Clean up
docker exec "$POSTGRES_CONTAINER" rm -f /tmp/import.csv
