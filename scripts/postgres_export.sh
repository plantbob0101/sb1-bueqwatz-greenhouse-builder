#!/bin/bash

# Direct PostgreSQL export script using Docker
mkdir -p data_exports

# Get container ID
PG_CONTAINER=$(docker ps | grep postgres | grep bueqwatz | head -1 | awk '{print $1}')

echo "Using PostgreSQL container: $PG_CONTAINER"

# Export both tables directly using psql with proper escaping
echo "Exporting glazing_requirements table..."
docker exec $PG_CONTAINER psql -U postgres -d postgres -c "\\COPY public.glazing_requirements TO STDOUT CSV HEADER" > data_exports/glazing_requirements_export.csv

echo "Exporting glazing_panel_requirements table..."
docker exec $PG_CONTAINER psql -U postgres -d postgres -c "\\COPY public.glazing_panel_requirements TO STDOUT CSV HEADER" > data_exports/glazing_panel_requirements_export.csv

# Show the results
echo "Export complete. Results:"
ls -lh data_exports/*export.csv
echo "Contents of glazing_requirements_export.csv:"
cat data_exports/glazing_requirements_export.csv
echo "Contents of glazing_panel_requirements_export.csv:"
cat data_exports/glazing_panel_requirements_export.csv
