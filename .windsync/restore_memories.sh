#!/bin/bash
WINDSURF_DIR="$HOME/Library/Application Support/Windsurf"
BACKUP_DIR="$(pwd)/.windsync"
mkdir -p "$WINDSURF_DIR/User/"
cp -a "$BACKUP_DIR/globalStorage/" "$WINDSURF_DIR/User/"
cp -a "$BACKUP_DIR/workspaceStorage/" "$WINDSURF_DIR/User/"
