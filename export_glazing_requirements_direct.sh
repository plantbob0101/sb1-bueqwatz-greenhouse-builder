#!/bin/bash
# Direct export for glazing_requirements

PROJECT_ROOT="/Users/robertstarnes/CascadeProjects/sb1-bueqwatz-greenhouse-builder"
TABLE_NAME="glazing_requirements"
OUTPUT_FILE="${PROJECT_ROOT}/${TABLE_NAME}_export_$(date +%Y%m%d_%H%M%S).csv"
DB_USER="postgres"
DB_NAME="postgres"

# Get Supabase Postgres Docker container ID for this specific project
PG_CONTAINER_ID=$(docker ps --filter "name=supabase_db_sb1-bueqwatz-greenhouse-builder" --format "{{.ID}}" | head -n 1)

if [ -z "$PG_CONTAINER_ID" ]; then
    echo "Error: Supabase PostgreSQL container (supabase_db_sb1-bueqwatz-greenhouse-builder) not found. Is Supabase running for this project?"
    exit 1
fi
echo "Using PostgreSQL container: $PG_CONTAINER_ID for table $TABLE_NAME"

echo "Exporting public.\"${TABLE_NAME}\" to ${OUTPUT_FILE}..."
docker exec "$PG_CONTAINER_ID" psql -U "$DB_USER" -d "$DB_NAME" -c "\COPY public.\"${TABLE_NAME}\" TO STDOUT WITH CSV HEADER" > "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    if [ -s "$OUTPUT_FILE" ]; then
        echo "✅ Export successful: ${OUTPUT_FILE}"
        echo "Preview (first 5 lines):"
        head -n 5 "$OUTPUT_FILE"
    else
        # Table might be empty or headers only were exported
        echo "ℹ️ Export command ran. The table 'public.${TABLE_NAME}' might be empty or only headers were exported."
        echo "   File created: ${OUTPUT_FILE}"
        echo "   Size: $(wc -c < "$OUTPUT_FILE") bytes"
    fi
else
    echo "❌ Export failed for table 'public.${TABLE_NAME}'. Please check the table name and ensure it exists in the 'public' schema."
    rm -f "$OUTPUT_FILE" # Clean up failed/empty file
fi
