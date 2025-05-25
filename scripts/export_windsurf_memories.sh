#!/bin/bash

# Set up directories
EXPORT_DIR="$(pwd)/windsurf_memories_export"
WINDSURF_DIR="$HOME/Library/Application Support/Windsurf"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create export directory
mkdir -p "$EXPORT_DIR"

# Export memories from SQLite databases
export_sqlite_db() {
    local db_path="$1"
    local output_file="$2"
    
    if [ -f "$db_path" ]; then
        echo "Exporting $db_path to $output_file"
        sqlite3 "$db_path" .dump > "$output_file"
    fi
}

# Export global storage
export_sqlite_db "$WINDSURF_DIR/User/globalStorage/state.vscdb" "$EXPORT_DIR/global_storage_$TIMESTAMP.sql"

# Export workspace storage
find "$WINDSURF_DIR/User/workspaceStorage" -name "state.vscdb" | while read -r db; do
    ws_name=$(basename "$(dirname "$db")")
    export_sqlite_db "$db" "$EXPORT_DIR/workspace_${ws_name}_$TIMESTAMP.sql"
done

# Copy other relevant files
cp -a "$WINDSURF_DIR/User/globalStorage/storage.json" "$EXPORT_DIR/global_storage_$TIMESTAMP.json" 2>/dev/null || true

# Create a summary file
cat > "$EXPORT_DIR/README.txt" <<EOL
Windsurf Memories Export
=======================
Exported on: $(date)

This directory contains exported Windsurf memories and settings.

Files:
- global_storage_*.sql: SQL dump of the global state database
- workspace_*.sql: SQL dumps of workspace-specific state databases
- global_storage_*.json: Global storage settings

To view the SQL files, you can use any text editor or SQLite browser.
EOL

echo "\nExport complete! Your memories have been exported to:
$EXPORT_DIR\n"
echo "To view the exported files, you can use:
  open "$EXPORT_DIR""
