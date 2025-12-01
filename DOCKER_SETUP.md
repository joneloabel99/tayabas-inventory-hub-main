# Docker Setup Guide

This guide explains how to run the GSO Inventory Stock Management System using Docker.

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Start all services

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** (port 5432): Database for Directus
- **Directus** (port 8055): Headless CMS
- **React App** (port 8080): Frontend application

### 2. Access the applications

- **React App**: http://localhost:8080
- **Directus Admin**: http://localhost:8055/admin
  - Email: `admin@example.com`
  - Password: `admin123`

### 3. Stop all services

```bash
docker-compose down
```

## Directus Initial Setup

After first startup, you need to configure Directus:

1. Go to http://localhost:8055/admin
2. Login with default credentials (see above)
3. Create the collections as outlined in `DIRECTUS_SETUP.md`:
   - items
   - stock_movements
   - custodians
   - physical_counts
   - count_details
   - department_requests
   - categories
   - transactions

4. Generate an Access Token:
   - Settings → Access Tokens → Create Token
   - Copy the token

5. Update your local `.env` file:
   ```
   VITE_DIRECTUS_URL=http://localhost:8055
   VITE_DIRECTUS_TOKEN=<your-token-here>
   ```

6. Restart the React app:
   ```bash
   docker-compose restart app
   ```

## Development Workflow

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f directus
docker-compose logs -f postgres
```

### Rebuild containers

```bash
# Rebuild all
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build app
```

### Access service shell

```bash
# React app
docker-compose exec app sh

# Directus
docker-compose exec directus sh

# PostgreSQL
docker-compose exec postgres psql -U directus
```

### Reset everything (delete data)

```bash
docker-compose down -v
docker-compose up -d
```

## Troubleshooting

### Port already in use

If ports 8080, 8055, or 5432 are already in use, edit `docker-compose.yml`:

```yaml
ports:
  - "8081:8080"  # Change left number only
```

### Directus not starting

Check logs:
```bash
docker-compose logs directus
```

Common issues:
- PostgreSQL not ready (wait 30 seconds and try again)
- Database connection error (check postgres logs)

### React app not updating

Hot reload with Docker can be slow. If changes aren't showing:

```bash
docker-compose restart app
```

Or run locally instead:
```bash
npm run dev
```

## Production Deployment

**⚠️ Important**: This Docker setup is for local development only!

For production:
1. Use Lovable's built-in deployment (click Publish button)
2. Or deploy to platforms like Vercel, Netlify, or AWS
3. Use managed Directus Cloud or self-host with proper security

## Database Management

### Backup Database

Create a backup of your PostgreSQL database:

```bash
# Make script executable (first time only)
chmod +x scripts/backup.sh

# Create backup
./scripts/backup.sh
```

Backups are saved to `./backups/` directory with timestamps.

### Restore Database

Restore from a previous backup:

```bash
# Make script executable (first time only)
chmod +x scripts/restore.sh

# Restore (interactive)
./scripts/restore.sh
```

⚠️ **Warning**: This will overwrite all current data!

### Seed Sample Data

Populate database with sample data for testing:

```bash
docker exec -i gso-postgres psql -U directus -d directus < scripts/seed.sql
```

See `scripts/README.md` for detailed documentation.

## Environment Variables

The `.env` file contains:
- Lovable Cloud credentials (auto-configured)
- Directus URL and token (you configure)

**Never commit `.env` to version control!**

## Volumes

Docker creates persistent volumes for:
- `postgres_data`: Database files
- `directus_uploads`: Uploaded files
- `directus_extensions`: Custom extensions

Data persists between container restarts.

## Network

All services run on the same Docker network and can communicate:
- App → Directus: `http://directus:8055`
- Directus → PostgreSQL: `postgres:5432`

External access uses localhost ports.
