# WAIMO Project Handbook

All source files currently live under `E:/Trae/workspace/waimao`. This handbook replaces the garbled version and is encoded in UTF-8. It explains how the B2B “Waimao” platform is put together, what each file does, and how the pieces interact so you can confidently take the next steps.

---

## 1. Platform Overview
- **Product**: Industrial fastener marketplace with a marketing site, faceted product catalog, RFQ flow, and an admin console.
- **Frontend**: Next.js 14 App Router, React 18, TailwindCSS, App/Server Components mix, NextAuth for auth, custom middleware for `/admin`.
- **Backend integrations**: Directus (CMS + business DB), PostgreSQL via Prisma for auxiliary tables, Meilisearch for search, Nodemailer for RFQ notifications, Redis/Upstash for rate limiting.
- **Security**: `withSecurityContext` wrapper ensures request IDs, actor metadata, and consistent auditing across sensitive API routes. Honeypots, account/IP rate limits, and JWT sessions are enforced.
- **Infrastructure**: Docker Compose orchestrates Postgres, Directus, Redis, Meilisearch. Scripts bootstrap schema, seed data, reindex search, and enforce dependency contracts.

---

## 2. Architecture & Key Flows
1. **Catalog management**: Directus stores `products`, `categories`, `attributes`, plus Prisma-managed `product_images`. Admin UI (`/admin/products`) talks to Next API routes which call Directus and update the gallery table, then `syncProduct` pushes normalized documents to Meilisearch.
2. **Search & PDP**: `/products` uses Meilisearch facets (category + `attr_*` fields) to render cards. PDP pages read Directus for authoritative specs, join Prisma gallery rows for hero images, and embed structured data.
3. **RFQ pipeline**: `RFQForm` posts to `/api/inquiries`, which validates, rate-limits (IP/email), writes Directus `inquiries` + `inquiry_items`, links logged-in users, then notifies via Nodemailer and exposes statuses to users (`/my/inquiries`) and admins.
4. **Admin console**: Protected by middleware + NextAuth. Dashboard monitors services (Meilisearch/Directus health), inquiries list/detail uses `getInquiries`, settings module stores SMTP overrides in Prisma, user management surfaces VIP titles and inquiry history with filters/bulk delete routines.
5. **Sync & automation**: Scripts under `scripts/` manipulate Directus schema snapshots, seed demo content, rebuild search indices, verify security contracts, and bootstrap admin accounts. Directus webhooks call `/api/webhook/directus` (signed with `DIRECTUS_WEBHOOK_SECRET`) to keep Meilisearch in sync.

---

## 3. Operational Docs & Runbooks
- `README.md` – quickstart cloning, environment prep, and scripts to run.  
- `STARTUP.md` – detailed local start/stop steps plus troubleshooting (Prisma migrations, `.next` cache, Docker issues).  
- `DEPLOYMENT_MINIMAL.md` – minimal deployment procedure (docker, build, schema apply, env vars, security check).  
- `docs/runbooks/local-dev.md` – step-by-step local environment instructions (Chinese).  
- `docs/runbooks/verification.md` – verification checklist (lint/build/run/test).  
- `docs/runbooks/production-minimal.md` – VPS deployment guidance.  
- `docs/runbooks/backup-restore.md` – backup strategy for DB/files/search.  
- `docs/releases/v1.md` – Feature list, security baseline, limitations for v1 launch.

---

## 4. Directory Overview
| Path | Purpose |
| --- | --- |
| `.next/` | Build output (ignore for source changes). |
| `docs/` | Runbooks and release notes documented above. |
| `infra/` | Docker Compose + environment templates for infrastructure. |
| `node_modules/` | Installed dependencies (auto-managed). |
| `prisma/` | Prisma schema and migrations for `app_users`, email settings, gallery table. |
| `schema/` | Directus schema snapshots and exports. |
| `scripts/` | TS/MJS utilities for schema mgmt, seeding, indexing, QA guards. |
| `src/` | Next.js application code (app router, components, libs, middleware). |
| `tests/` | Currently empty placeholder for future automated tests. |
| `logs (*.log, *.txt)` | Captured development/server output (`dev-server.log`, `server.log`, `dev.log`, `.tmp-next-start*.log`, `cookies.txt`, `headers.txt`). Helpful for troubleshooting but not source. |

---

## 5. Root Configuration & Metadata
- `.env` / `.env.local` / `.env.example` – runtime secrets; example template lives in repo while real `.env` stays local.  
- `.eslintrc.json` – extends `next/core-web-vitals` for linting.  
- `.gitignore` – excludes build artifacts, env files, logs.  
- `.tmp-next-start*.log`, `dev-server.log`, `dev.log`, `server.log`, `start.log` – runtime logs; inspect when debugging.  
- `cookies.txt`, `headers.txt` – captured HTTP traces for reproducing API calls.  
- `docker-compose.yml` (root) – legacy compose file kept for quick local startup (distinct from `infra/docker-compose.yml`).  
- `next-env.d.ts` – Next-managed type declarations.  
- `next.config.js` – configures CSP, security headers, external image hosts, HSTS.  
- `package.json` / `package-lock.json` – dependencies and scripts (`dev`, `build`, `lint`, `security:contract`, `schema:apply`, `seed:demo`, `reindex`, etc.).  
- `postcss.config.js` / `tailwind.config.js` – styling pipeline config.  
- `project.md` – this handbook.  
- `README.md`, `STARTUP.md`, `DEPLOYMENT_MINIMAL.md` – described earlier.  
- `server.log` et al. – runtime logs as mentioned.  
- `test-image.jpg` – placeholder asset.  
- `tsconfig.json` – TypeScript compiler options with path alias `@/*`.  
- `tsconfig.tsbuildinfo` – incremental build metadata (auto-generated; safe to delete if stale).

---

## 6. Infrastructure & Schema Assets
- `infra/docker-compose.yml` – services: Postgres 16, Redis 7, Meilisearch v1.6, Directus 10.10 with healthchecks and persisted volumes.  
- `infra/docker-compose.override.example.yml` – optional Next.js container definition for running app inside Compose.  
- `infra/env.example` – canonical env var template (APP_URL, Directus secrets, Meilisearch, Redis, SMTP, admin bootstrap, etc.).
- `prisma/schema.prisma` – defines `AppUser`, `EmailSettings`, `ProductImage`, `UserRole`.  
- `prisma/migrations/20260124101657_init_app_users/migration.sql` – creates `app_users`.  
- `prisma/migrations/20260202_add_vip_title/migration.sql` – adds `vipTitle` column for VIP labels.  
- `prisma/migrations/20260207_add_email_and_gallery_tables/migration.sql` – introduces `email_settings` and `product_images` tables.  
- `prisma/migrations/migration_lock.toml` – Prisma migration state lock.  
- `schema/snapshot.json`, `snapshot.full.json`, `snapshot.sanitized.json`, `snapshot.yaml` – Directus schema dumps (sanitized ones feed `apply-schema`).  
- `schema/export/collections.json`, `fields.*.json`, `relations.json` – raw Directus schema exports per collection (products, categories, attributes, inquiries, etc.).

---

## 7. Scripts (`scripts/*.ts` / `.mjs`)
- `apply-schema.ts` – fetches Directus server schema, merges missing collections/fields/relations from `schema/snapshot.full.json`, sanitizes payload, posts diff/apply requests.  
- `backfill-product-gallery.ts` – ensures `product_images` table mirrors legacy `image_id` values for historical products.  
- `check-admin-role.ts` – verifies/upgrades `admin@waimao.com` to `ADMIN`.  
- `create-admin.ts` – bootstrap admin account using `ADMIN_BOOTSTRAP_EMAIL/PASSWORD`.  
- `enforce-deps.mjs` – preinstall hook blocking React >18 or `react-server-dom*` dependencies.  
- `export-directus-schema.ts` – dumps Directus collections/fields/relations JSON into `schema/export/`.  
- `get-token.ts` – quick script to validate a Directus admin token stored in `token.txt`.  
- `reindex.ts` – CLI helper that calls `/api/reindex` using `ADMIN_API_SECRET`.  
- `reset-auth-schema.ts` – drops the `app_auth` schema if corrupted before rerunning migrations.  
- `sanitize-snapshot.ts` – strips presentation metadata from snapshots to keep only schema-relevant keys (also re-exported as a utility).  
- `security-contract-check.mjs` – CI guard ensuring sensitive API routes import `withSecurityContext`.  
- `seed-directus.ts` – seeds demo categories/attributes/products, creates attribute values, enforces hierarchy, and optionally triggers reindex (reads `.env`).  
- `sync-meilisearch.ts` – full offline reindex: clears Meilisearch index, configures filterable attributes, bulk imports Directus products.  
- `test-admin-flow.ts` – scripted end-to-end admin login + CRUD (uses NextAuth CSRF flow).  
- `update-schema-v2.ts` – idempotent script that adds recent Directus fields (image, price_text, moq, lead_time_days, material_summary).

---

## 8. Application Code (`src/`)

### 8.1 Entry, Global Config & Middleware
- `src/middleware.ts` – wraps Next middleware with `withAuth` to protect `/admin**`, redirecting non-admins to `/`.
- `src/app/globals.css` – Tailwind base directives shared across layouts.
- `src/app/layout.tsx` – root HTML shell, metadata, JSON-LD organization schema, body styling.
- `src/app/robots.ts` – blocks crawlers from admin/API paths.
- `src/app/sitemap.ts` – builds sitemap by reading published categories/products from Directus.
- `src/app/api-docs/page.tsx` – client component describing REST endpoints (Chinese text for the doc portal).
- `src/app/components/header.tsx` – legacy header combining navigation + search (not currently used; marketing header supersedes it).

### 8.2 Marketing & Public Areas (`src/app/(marketing)` & `(shop)`)
- `(marketing)/layout.tsx` – wraps marketing routes with `MarketingHeader` + `Footer`.
- `(marketing)/page.tsx` – hero/landing page for industrial fasteners.
- `(marketing)/login/page.tsx` – client login form; uses NextAuth `signIn`, handles redirect logic, success messages.
- `(marketing)/register/page.tsx` – client registration with honeypot, minimal form duration check, posts to `/api/auth/register`.
- `(shop)/layout.tsx` – shares same header/footer for catalog pages.
- `(shop)/categories/[slug]/page.tsx` – renders a category landing with breadcrumb, total counts via Meilisearch, fallback banner when empty.
- `(shop)/my/inquiries/page.tsx` – ensures user session, fetches user-specific inquiries and renders a table with statuses.
- `(shop)/my/inquiries/[id]/page.tsx` – detail view for a single inquiry, verifying ownership before rendering items and status.
- `(shop)/products/page.tsx` – main catalog with hero section, `SearchBar`, `FacetsSidebar`, product grid, pagination.
- `(shop)/products/components/search-bar.tsx` – Suspense-wrapped controlled input syncing query params.
- `(shop)/products/components/facets-sidebar.tsx` – builds filter UI for categories and `attr_*` facets, encoding filters as JSON in URL.
- `(shop)/products/components/product-card.tsx` – displays Meilisearch hit data with key specs and CTA.
- `(shop)/products/[slug]/page.tsx` – PDP pulling Directus data, Prisma gallery, generating JSON-LD, tabs, and embedding `RFQForm`.

### 8.3 Admin Area (`src/app/(admin)`)
- `(admin)/layout.tsx` – server component verifying admin session before rendering `AdminHeader`.
- `admin/dashboard/page.tsx` – summary tiles for products/inquiries + health cards + quick reindex action.
- `admin/dashboard/components/dashboard-reindex.tsx` – client widget prompting for `ADMIN_API_SECRET` and calling `/api/reindex`.
- `admin/dashboard/components/health-card.tsx` – polls `/api/health` to render Meilisearch/Directus status.
- `admin/inquiries/actions.ts` – server action to update inquiry status and revalidate relevant paths.
- `admin/inquiries/page.tsx` – filterable inquiries table, status chips, links to detail pages.
- `admin/inquiries/[id]/page.tsx` – inquiry detail card showing customer info, message, items, status buttons.
- `admin/inquiries/[id]/status-buttons.tsx` – client component invoking server action with confirmation prompts.
- `admin/products/page.tsx` – lists Directus products with thumbnails computed via Prisma gallery map.
- `admin/products/new/page.tsx` – fetches categories/attributes and renders `ProductForm`.
- `admin/products/[id]/edit/page.tsx` – preloads existing product + gallery, offers delete button.
- `admin/products/[id]/edit/delete-button.tsx` – client button calling DELETE `/api/admin/products/:id`.
- `admin/settings/email/page.tsx` – server component fetching sanitized settings + env hints, renders form text (currently contains some Chinese copy).
- `admin/settings/email/email-settings-form.tsx` – client form managing SMTP settings, password clearing, test email dispatch.
- `admin/users/page.tsx` – loads initial `listAdminUsers` data and renders `UserManagementShell`.
- `admin/users/user-management-shell.tsx` – large client component for search/filter/pagination, detail side panel with inquiry history, VIP title editing, bulk delete calls.

### 8.4 Shared UI (`src/components`)
- `components/footer.tsx` – marketing footer with contact info.
- `components/image-gallery.tsx` – carousel/thumbnail gallery for PDP.
- `components/InquiryForm.tsx` – deprecated RFQ widget kept for reference; uses local state and honeypot.
- `components/json-ld.tsx` – helper to embed JSON-LD blocks.
- `components/rfq-form.tsx` – main RFQ form used on PDP; handles optimistic submission, success panel, honeypot field.
- `components/search-input.tsx` – header search bar variant.
- `components/admin/product-form.tsx` – comprehensive form for creating/editing Directus products, including slug/sku, gallery upload via `/api/admin/upload`, attribute inputs, and call to appropriate API route.
- `components/layout/admin-header.tsx` – top navigation for admin pages.
- `components/layout/admin-logout-btn.tsx` – NextAuth `signOut` trigger used in admin header.
- `components/layout/marketing-header.tsx` – server component retrieving session to show login links, `UserNav`, search.
- `components/layout/user-nav.tsx` – client side user menu (VIP badge display, `Admin`/`My Inquiries` link, logout).

### 8.5 Libraries (`src/lib`)
- `admin-users.ts` – Prisma-backed queries for admin user list, filters, summaries, VIP-aware fetcher, `getAdminUserDetail`.
- `auth.ts` – NextAuth credentials provider setup, rate limiters per burst/window/account, secure cookie logic, JWT/session callbacks.
- `directus.ts` – typed Directus SDK client configured with admin token, schema interfaces for products/categories/attributes/inquiries.
- `email-settings.ts` – CRUD around Prisma `email_settings`, env fallback resolution, sanitized views for UI, sending config for Nodemailer.
- `inquiries.ts` – helper functions to fetch inquiry lists/details and update status via Directus SDK (including manual fetch of `inquiry_items`).
- `logger.ts` – structured logging helper + `logRequest`.
- `meilisearch.ts` – wrapper for MeiliSearch client, transformation logic from Directus data, filter formatting, `searchProducts`, `rebuildIndex`, `sync/delete` helpers.
- `prisma.ts` – Prisma client singleton with re-exported models.  
- `product-gallery.ts` – Prisma helper to read/replace product gallery rows and map them for admin/product pages.
- `rate-limit.ts` – memory + optional Upstash Redis rate limiter factory.
- `request-id.ts` – attaches deterministic `x-request-id` headers.
- `security-context.ts` – `withSecurityContext` higher-order handler providing session, actor metadata, audit/rate-limit stubs, request logging.
- `vip-column.ts` – utilities detecting the presence of `vipTitle` column and gracefully degrading features if migrations are missing.

### 8.6 API Routes (`src/app/api`)
- `admin/email-settings/route.ts` – GET/PUT endpoints guarded by `withSecurityContext` to read/update SMTP config.
- `admin/email-settings/test/route.ts` – sends a test email via resolved SMTP credentials.
- `admin/products/route.ts` – GET list of products, POST create product + gallery + Meilisearch sync.
- `admin/products/[id]/route.ts` – GET/PUT/DELETE for product detail, updates gallery + search index.
- `admin/upload/route.ts` – proxies file uploads to Directus `/files` with admin token.
- `admin/users/route.ts` – paginated user search endpoint used by admin UI.
- `admin/users/bulk-delete/route.ts` – deletes filtered USER accounts with safeguard cap and rejects admin deletions.
- `admin/users/[id]/route.ts` – GET detail (with inquiries), PATCH VIP title (ensures column present), DELETE user if non-admin.
- `assets/[id]/route.ts` – proxy for Directus assets; copies query params, enforces caching headers.
- `auth/register/route.ts` – handles registrations with honeypot, min form time, IP/email rate limits, bcrypt hashing.
- `auth/[...nextauth]/route.ts` – NextAuth handler wiring `authOptions`.
- `health/route.ts` – pings Directus + Meilisearch, returns status/latency.
- `inquiries/route.ts` – RFQ intake endpoint (validation, rate limiting, Directus writes, Nodemailer notifications).
- `inquiries/[id]/route.ts` – admin token-protected GET for direct inquiry detail (used for automation/diagnostics).
- `inquiries/[id]/status/route.ts` – admin-only status update using Directus.
- `reindex/route.ts` – rebuilds Meilisearch index if session admin or correct `ADMIN_API_SECRET` bearer token provided.
- `search/products/route.ts` – public search API leveraging `searchProducts`, handles filter JSON validation.
- `webhook/directus/route.ts` – signed webhook handler reacting to Directus product events to sync/delete Meilisearch docs.

### 8.7 Types (`src/types`)
- `admin-users.ts` – shared TypeScript types (`AdminUserSummary`, `AdminUserListResult`, etc.) between UI, API, and scripts.
- `next-auth.d.ts` – augments NextAuth session/JWT types with `id`, `role`, `vipTitle`.

---

## 9. Supporting Data & Logs
- `dev-server.log`, `dev.log`, `server.log`, `start.log`, `.tmp-next-start*.log` – chronological app/server logs to inspect when diagnosing issues.  
- `cookies.txt`, `headers.txt` – sample request data captured during debugging.  
- `.tmp-next-start.err.log` – Next.js startup trace (stderr).  
- `tsconfig.tsbuildinfo` – automatically regenerated TypeScript state (delete if stale).  
- `node_modules/`, `.next/` – produced by installs/builds; do not edit manually.

---

## 10. Next Steps
With this map you should be able to dive into any area—UI, API, schema scripts, or infra—without guesswork. When you are ready for further tasks (new features, audits, deployments), refer back to the sections above to see which files to touch and which scripts/runbooks to follow. Let me know what you’d like to do next!
