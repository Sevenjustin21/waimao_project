# Minimal Deployment Guide

## 1. Local Deployment (Docker Compose)

The project includes a `docker-compose.yml` for running dependencies (Postgres, Directus, Meilisearch, Redis).

```bash
# Start services
docker compose up -d

# Check status
docker compose ps
```

## 2. Production Build

To deploy the Next.js application:

```bash
# 1. Install dependencies
npm install --production=false

# 2. Build application
npm run build

# 3. Start server
npm start
```

## 3. Schema & Data Setup

After starting services for the first time:

```bash
# Apply schema to Directus
npm run db:apply

# Seed initial data (optional)
npm run db:seed

# Initialize search index
npm run search:reindex
```

## 4. Environment Variables

Ensure `.env` is configured with correct service URLs and secrets:

- `DIRECTUS_URL`: Internal URL for server-side
- `NEXT_PUBLIC_DIRECTUS_URL`: Public URL for client-side
- `MEILISEARCH_HOST` & `MEILISEARCH_API_KEY`
- `ADMIN_API_SECRET`: For protected API routes

## 5. Security Baseline

Before promoting a build, run `npm run security:contract` (already part of `npm run lint`) to ensure every protected App Router handler uses `withSecurityContext` and emits `X-Request-Id`.
