#!/bin/bash

# Source and destination directories
WINDSURF_DIR="$HOME/Library/Application Support/Windsurf"
BACKUP_DIR="$(pwd)/.windsync"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR/memories"

# Copy relevant files
cp -a "$WINDSURF_DIR/User/globalStorage/" "$BACKUP_DIR/"
cp -a "$WINDSURF_DIR/User/workspaceStorage/" "$BACKUP_DIR/"

# Create a restore script
echo '#!/bin/bash' > "$BACKUP_DIR/restore_memories.sh"
echo 'WINDSURF_DIR="$HOME/Library/Application Support/Windsurf"' >> "$BACKUP_DIR/restore_memories.sh"
echo 'BACKUP_DIR="$(pwd)/.windsync"' >> "$BACKUP_DIR/restore_memories.sh"
echo 'mkdir -p "$WINDSURF_DIR/User/"' >> "$BACKUP_DIR/restore_memories.sh"
echo 'cp -a "$BACKUP_DIR/globalStorage/" "$WINDSURF_DIR/User/"' >> "$BACKUP_DIR/restore_memories.sh"
echo 'cp -a "$BACKUP_DIR/workspaceStorage/" "$WINDSURF_DIR/User/"' >> "$BACKUP_DIR/restore_memories.sh"
chmod +x "$BACKUP_DIR/restore_memories.sh"

echo "Memories backed up to $BACKUP_DIR"
echo "To restore on another machine, copy the .windsync directory and run restore_memories.sh"
