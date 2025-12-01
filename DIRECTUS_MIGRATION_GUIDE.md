# Directus Backend Setup Guide

This guide explains how to set up and run this application with a Directus backend using Docker.

## How to Use with Docker

### 1. **Start Docker Services**
```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Directus (port 8055)
- React App (port 8080)

### 2. **Access the Application**
- **Directus Admin**: http://localhost:8055/admin
  - Email: admin@example.com
  - Password: admin123

- **React App**: http://localhost:8080

### 3. **Configure Directus Collections**

Follow the steps in `DIRECTUS_SETUP.md` to:
1. Create collections (items, stock_movements, custodians)
2. Configure fields for each collection
3. Set up relationships
4. Generate a Directus access token

### 4. **Update Environment Variables**

In your `.env` file:
```env
VITE_DIRECTUS_URL=http://localhost:8055
VITE_DIRECTUS_TOKEN=<your-token-from-directus>
```

### 5. **Restart the App**
```bash
docker-compose restart app
```

## Authentication Note

The current Directus authentication is a **mock implementation** for local development:
- Stores user info in localStorage
- No real password validation
- For production, implement real Directus authentication using their API

## Next Steps

1. ✅ Set up Directus collections (see DIRECTUS_SETUP.md)
2. ✅ Generate and add Directus access token to `.env`
3. ✅ Restart the app with `docker-compose restart app`
4. ✅ Test CRUD operations with Directus
5. For production: Implement real Directus authentication

## Benefits

- **Runs completely locally** with Docker
- **Full control** - manage your backend with Directus CMS
- **Easy setup** - Docker Compose handles all services
- **Database access** - Direct PostgreSQL access on port 5432

