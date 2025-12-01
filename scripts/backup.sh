#!/bin/bash

# Database Backup Script for GSO Inventory System
# Creates timestamped backups of the PostgreSQL database

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="gso_inventory_backup_${TIMESTAMP}.sql"

# Docker container name from docker-compose.yml
CONTAINER_NAME="gso-postgres"
DB_NAME="directus"
DB_USER="directus"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}Error: PostgreSQL container '$CONTAINER_NAME' is not running${NC}"
    echo "Start it with: docker-compose up -d postgres"
    exit 1
fi

# Create backup using pg_dump
echo "Creating backup: $BACKUP_FILE"
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" -F p > "$BACKUP_DIR/$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    # Compress the backup
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    COMPRESSED_FILE="$BACKUP_FILE.gz"
    
    # Get file size
    SIZE=$(du -h "$BACKUP_DIR/$COMPRESSED_FILE" | cut -f1)
    
    echo -e "${GREEN}✓ Backup completed successfully!${NC}"
    echo "File: $BACKUP_DIR/$COMPRESSED_FILE"
    echo "Size: $SIZE"
    
    # List recent backups
    echo ""
    echo "Recent backups:"
    ls -lht "$BACKUP_DIR" | head -6
else
    echo -e "${RED}✗ Backup failed!${NC}"
    exit 1
fi
