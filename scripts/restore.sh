#!/bin/bash

# Database Restore Script for GSO Inventory System
# Restores a database backup from a specified file

# Configuration
BACKUP_DIR="./backups"
CONTAINER_NAME="gso-postgres"
DB_NAME="directus"
DB_USER="directus"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to list available backups
list_backups() {
    echo "Available backups:"
    ls -1t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | nl
}

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}Error: Backup directory '$BACKUP_DIR' not found${NC}"
    exit 1
fi

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}Error: PostgreSQL container '$CONTAINER_NAME' is not running${NC}"
    echo "Start it with: docker-compose up -d postgres"
    exit 1
fi

# List available backups
list_backups

# Check if any backups exist
if [ $(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l) -eq 0 ]; then
    echo -e "${RED}No backups found in '$BACKUP_DIR'${NC}"
    exit 1
fi

# Prompt for backup selection
echo ""
read -p "Enter backup number to restore (or 'q' to quit): " SELECTION

if [ "$SELECTION" = "q" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Get the selected backup file
BACKUP_FILE=$(ls -1t "$BACKUP_DIR"/*.sql.gz | sed -n "${SELECTION}p")

if [ -z "$BACKUP_FILE" ]; then
    echo -e "${RED}Invalid selection${NC}"
    exit 1
fi

# Confirm restoration
echo -e "${YELLOW}WARNING: This will overwrite all current data!${NC}"
echo "Restoring from: $(basename $BACKUP_FILE)"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

echo "Starting database restore..."

# Stop Directus to prevent connection issues
echo "Stopping Directus..."
docker-compose stop directus

# Decompress and restore
echo "Restoring database..."
gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database restored successfully!${NC}"
    
    # Restart Directus
    echo "Restarting Directus..."
    docker-compose start directus
    
    echo -e "${GREEN}✓ Restore completed!${NC}"
else
    echo -e "${RED}✗ Restore failed!${NC}"
    
    # Try to restart Directus anyway
    docker-compose start directus
    exit 1
fi
