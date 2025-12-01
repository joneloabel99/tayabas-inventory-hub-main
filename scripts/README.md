# Database Scripts

This directory contains scripts for managing your PostgreSQL database.

## Backup Script

Creates timestamped compressed backups of your database.

### Usage

```bash
# Make script executable (first time only)
chmod +x scripts/backup.sh

# Run backup
./scripts/backup.sh
```

Backups are saved to `./backups/` directory with format:
```
gso_inventory_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Schedule Automatic Backups

#### Linux/Mac (crontab)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/project/scripts/backup.sh
```

#### Windows (Task Scheduler)
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., daily at 2 AM)
4. Action: Start a program
5. Program: `bash.exe`
6. Arguments: `/path/to/project/scripts/backup.sh`

## Restore Script

Restores database from a backup file.

### Usage

```bash
# Make script executable (first time only)
chmod +x scripts/restore.sh

# Run restore (interactive)
./scripts/restore.sh
```

The script will:
1. List available backups
2. Ask you to select a backup
3. Confirm before overwriting data
4. Stop Directus temporarily
5. Restore the database
6. Restart Directus

⚠️ **WARNING**: This will overwrite all current data!

## Seed Script

Populates database with sample data for testing/development.

### Usage

```bash
# Via Docker
docker exec -i gso-postgres psql -U directus -d directus < scripts/seed.sql

# Or using restore script with seed.sql
cat scripts/seed.sql | docker exec -i gso-postgres psql -U directus -d directus
```

### Sample Data Includes:

- **5 Categories**: Office Supplies, Electronics, Furniture, etc.
- **5 Custodians**: Sample staff members
- **10 Items**: Various inventory items with quantities
- **10 Stock Movements**: Sample received/issued records
- **5 Department Requests**: Sample pending/approved requests
- **3 Physical Counts**: Sample inventory audits
- **8 Count Details**: Sample count records

## Windows Users

If using Git Bash or WSL:

```bash
# Backup
bash scripts/backup.sh

# Restore
bash scripts/restore.sh
```

## Backup Retention

To automatically clean old backups:

```bash
# Keep only last 30 days of backups
find ./backups -name "*.sql.gz" -mtime +30 -delete
```

## Troubleshooting

### "Container not running" error
```bash
docker-compose up -d postgres
```

### "Permission denied" error
```bash
chmod +x scripts/backup.sh scripts/restore.sh
```

### Backup too large
Consider excluding certain tables or using incremental backups.

### Restore fails
- Ensure database schema matches backup version
- Check Docker container logs: `docker-compose logs postgres`
- Verify backup file is not corrupted: `gunzip -t backup_file.sql.gz`
