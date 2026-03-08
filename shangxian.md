# WAIMO 项目上线全景资料

> 目标：把现有仓库 `E:/trae/workspace/waimao` 中的全部上线相关信息梳理成一个文档，供后续的 ChatGPT 部署顾问直接读取，无需再访问源码。

## 1. 平台概述
- **产品形态**：面向海外工业客户的 B2B 紧固件营销站点，内含市场营销主页、带 Meilisearch 的产品目录与详情页、RFQ（询价）渠道、登录账户区以及管理员控制台。
- **前端**：Next.js 14 App Router（`src/app`），React 18 + TailwindCSS，自带 `globals.css` 与主题变量。页面按路由分组：`(marketing)`、`(shop)`、`(admin)`。
- **后端依赖**：
  - Directus 10（Headless CMS，负责 `products`/`categories`/`attributes`/`inquiries` 等业务数据）。
  - PostgreSQL 16（被 Directus 及 Prisma 共用，Prisma 管理 `app_users`、`email_settings`、`product_images` 等表）。
  - Redis 7（可选，用于速率限制；若未配置 Upstash 则退回内存存储）。
  - Meilisearch 1.6（商品搜索与 facets）。
  - Nodemailer + SMTP（RFQ、联系表单通知）。
  - NextAuth Credentials Provider（账户登录、JWT 会话）。
- **部署方式**：项目层面通过 `npm run build && npm run start` 启动 Next.js；底层依赖由 `infra/docker-compose.yml` 编排。正式环境通常在同一台 VPS/VM 或容器集群中运行 app + Directus + 数据服务，并由外部反向代理（Nginx/Caddy/Traefik）提供 TLS。

## 2. 运行时组件与端口
| 服务 | 镜像/实现 | 端口（默认） | 说明 |
| --- | --- | --- | --- |
| Next.js 应用 | 本仓库 | `3000` | 生产模式运行 `next start`，依赖 `.env` 配置 Directus、数据库、邮箱等。 |
| Directus | `directus/directus:10.10` | `8055` | 通过 Admin Token 对接，在 `/api/assets` 中由应用代理。 |
| PostgreSQL | `postgres:16` | `15432`（对外映射） | Directus + Prisma 共用，`POSTGRES_*` 变量保持一致。 |
| Redis | `redis:7` | `16379` | 速率限制用；在 `infra/docker-compose.yml` 中默认启用 AOF。 |
| Meilisearch | `getmeili/meilisearch:v1.6` | `7700`（dev）/`17700`（prod compose） | 需配置 `MEILI_MASTER_KEY` 并允许 Next/Directus 访问。 |
| Directus Uploads | Docker volume `directus_uploads` | —— | 储存产品图片、RFQ 附件。 |
| Prisma 附属表 | `product_images`、`email_settings` 等 | —— | 通过 `npx prisma migrate deploy` 管理 schema。 |

## 3. 目录结构与关键文件
- `src/app`：Next.js App Router 源码：
  - `(marketing)`：营销首页（`page.tsx`）、登录/注册、About、Contact 等。
  - `(shop)`：产品目录、分类页、`/my` 账号区域。
  - `(admin)`：后台仪表盘、Products/Inquiries/Users/Settings。
  - `api`：全部 HTTP API（公有与受保护）以及 `api-docs`。
  - `components`：通用 UI、RFQ 表单、布局、Admin 表单等。
  - `lib`：`directus.ts`、`meilisearch.ts`、`auth.ts`、`email-settings.ts`、`product-gallery.ts`、`security-context.ts` 等核心逻辑。
  - `middleware.ts`：拦截 `/admin` 路由，强制登录并限制非管理员访问。
- `scripts/`：操作工具（`apply-schema.ts`、`seed-directus.ts`、`reindex.ts`、`create-admin.ts`、`security-contract-check.mjs` 等）。
- `infra/`：部署模板（Docker Compose、`.env.example`、override 样例）。
- `schema/`：Directus schema 快照（`snapshot.full.json`、`snapshot.sanitized.json`）。
- `prisma/`：Prisma schema + migrations（`app_users`、`email_settings`、`product_images`）。
- 文档：`README.md`、`project.md`（仓库手册）、`docs/runbooks/*.md`、`DEPLOYMENT_MINIMAL.md`、`STARTUP.md` 等。

## 4. 环境变量与密钥
`infra/env.example` 列出完整清单：
- **应用/URL**：`APP_ENV`、`NEXT_PUBLIC_APP_ENV`、`APP_URL`、`NEXTAUTH_URL`、`NEXT_PUBLIC_DIRECTUS_URL`、`NEXT_PUBLIC_ASSET_BASE_URL`。
- **认证/数据库**：`NEXTAUTH_SECRET`、`AUTH_SECRET`（若遗留）、`DATABASE_URL`（Prisma）、`COOKIE_SECURE`。
- **Directus**：`POSTGRES_*`、`DIRECTUS_URL`、`DIRECTUS_KEY`、`DIRECTUS_SECRET`、`DIRECTUS_ADMIN_EMAIL/PASSWORD/TOKEN`、`DIRECTUS_WEBHOOK_SECRET`。
- **搜索**：`MEILISEARCH_HOST`、`MEILI_MASTER_KEY`（Next & scripts）、`MEILISEARCH_MASTER_KEY`（兼容字段）。
- **缓存/限流**：`UPSTASH_REDIS_REST_URL/TOKEN` 或 `REDIS_URL` 本地连接。
- **Admin 脚本**：`ADMIN_API_SECRET`（调用 `/api/reindex` 及其它 admin API 的 Bearer Token）、`ADMIN_BOOTSTRAP_*`、`TEST_BASE_URL`。
- **邮件**：`SMTP_HOST/PORT/USER/PASS`、`SMTP_FROM_*`、`SMTP_REPLY_TO`、`NOTIFY_EMAIL_TO`。
> 生产环境需将 `.env` 保存在受限位置并保证 TLS (`COOKIE_SECURE=true`)。

## 5. NPM Scripts / 运维命令
- `npm run dev` / `build` / `start`：Next.js 常规流程。
- `npm run lint`：ESLint + `npm run security:contract` 联合运行，后者确保所有敏感 API route 使用 `withSecurityContext`。
- `npm run typecheck`：TypeScript。
- 数据/Schema：
  - `npm run db:migrate`：`prisma migrate deploy`（创建 `app_users` 等表）。
  - `npm run schema:apply`：将 `schema/snapshot.full.json` merge 到 Directus，带 sanitize 与 diff/ apply 步骤。
  - `npm run seed:demo`：执行 `scripts/seed-directus.ts`，创建演示分类/属性/产品并触发 `reindex`。
  - `npm run reindex` / `search:reindex`：调用 `/api/reindex` 重建 Meilisearch。
  - `npm run setup:dev`：依次 `db:migrate`→`schema:apply`→`seed:demo`→`reindex`（适合本地初始化）。
- `npm run auth:admin`：`scripts/create-admin.ts` 根据 `ADMIN_BOOTSTRAP_*` 创建管理员账户。
- 其它脚本：`scripts/backfill-product-gallery.ts`、`sync-meilisearch.ts`、`test-admin-flow.ts` 等用于数据填充或回归。

## 6. 数据存储
### 6.1 Directus 集合（在 `schema/snapshot*.json` 中定义）
- `products`：字段包括 `sku`、`name`、`slug`、`description`、`status`、`category_id`、`image_id`、`price_text`、`moq`、`lead_time_days`、`material_summary`、`attribute_values`。
- `categories`：层级分类，`parent_id` 支持树形导航。
- `attributes`：定义属性 key/type/is_facet（决定搜索 facet）。
- `product_attribute_values`：产品属性取值。
- `inquiries` 与 `inquiry_items`：RFQ 主表与明细，保存 `customer_name`、`email`、`status`、`app_user_id` 等。
- `files`：Directus 上传（产品图片、图库）。

### 6.2 Prisma 管理表（`prisma/schema.prisma`）
- `AppUser`：登录账号，字段含 `email`、`passwordHash`、`role (ADMIN/USER)`、`vipTitle`（可选）。
- `EmailSettings`：后台可写入 SMTP/通知邮箱，优先级高于 `.env`。
- `ProductImage`：对 Directus `files` 的引用（`productId`、`fileId`、`sortOrder`），用于多图图库。

## 7. 前台体验（普通账户/游客）
- **营销模块**（`src/app/(marketing)/page.tsx`）：展示价值主张、案例品牌、核心品类，按钮链接产品与 RFQ。
- **Products 列表**（`(shop)/products/page.tsx`）：默认 20 条/页，通过 `searchProducts` (Meilisearch) 获取 `hits`、facets 与 `totalPages`，支持 `q`、`category`、`filters` JSON。提供 `SearchBar`、`FacetsSidebar`、分页导航、活跃筛选提示。若搜索失败会提示检查 Meilisearch。
- **Product Detail**（`(shop)/products/[slug]/page.tsx`）：从 Directus 获取产品 + 属性 + 分类 + 主图，结合 Prisma `product_images` 生成图库；页面含价格/MOQ/交期/材料信息、技术参数 tabs、FAQ、以及 RFQ 表单（`src/components/rfq-form.tsx`）用于提交 `/api/inquiries`。
- **Categories**（`(shop)/categories/[slug]/page.tsx`）：展示分类描述并调用搜索 API 过滤。
- **Contact**（`(marketing)/contact`）配合 `src/app/api/contact/route.ts` 给 `NOTIFY_EMAIL_TO` 发送邮件。
- **Account 区域**：
  - 登录（`(marketing)/login/page.tsx`）与注册（`/register`）均为 client component；登录成功根据角色跳转 `/admin/dashboard` 或 `/products`。
  - `/my/inquiries` & `/[id]`（`(shop)/my/inquiries`）：拉取当前用户在 Directus 中的 RFQ 记录（`getInquiries`），提供状态徽章及详情页；详情页验证 `app_user_id`，若不匹配则 `notFound()`。
- **导航差异**：`components/layout/marketing-header.tsx` 在服务器端读取 session，登录用户看到 `UserNav`（显示邮箱及 VIP 徽章、`My Inquiries`/`Admin` 链接、Logout）。游客看到 `Login`/`Register`。

## 8. 后台管理（管理员专属）
- **访问控制**：`src/middleware.ts` + `(admin)/layout.tsx` + `withSecurityContext` triple guard，确保 `/admin/*` 只能由 `role === 'ADMIN'` 的用户访问，否则重定向 `/login`。
- **Admin Header**（`components/layout/admin-header.tsx`）：导航包含 Dashboard / Inquiries / Products / Users / Settings，右侧提供 Logout 与“View Site”。
- **Dashboard**（`(admin)/admin/dashboard/page.tsx`）：展示 Meilisearch & Directus 健康状态、近 24h inquiry 数、产品索引总量；提供 Reindex 快捷按钮（`components/dashboard-reindex.tsx` 调 `/api/reindex`）。
- **Inquiries**：
  - 列表（`(admin)/admin/inquiries/page.tsx`）按状态 tab 过滤。
  - 详情（`/admin/inquiries/[id]`）显示客户信息、留言、明细、状态按钮（`status-buttons.tsx`→`updateInquiryStatusAction`→Directus `updateItem`）。
- **Products**：
  - 列表（`/admin/products`）调 Directus `readItems` 并结合 Prisma `product_images`，显示封面、SKU、状态。
  - 新增/编辑（`/admin/products/new`、`/admin/products/[id]/edit`）使用 `components/admin/product-form.tsx`，包含基本信息、价格/MOQ/Lead Time、材料摘要、发布状态、图库上传（通过 `/api/admin/upload` 代理到 Directus `/files`，随后 `replaceProductGallery` 写入 Prisma）。
  - API 层（`src/app/api/admin/products/...`）负责调用 Directus CRUD + `syncProduct`/`deleteProductIndex` 以更新 Meilisearch。
- **Users**：
  - 页面（`/admin/users`）加载 `listAdminUsers` 结果，前端 `user-management-shell.tsx` 实现查询/分页、注册时间过滤、导出/刷新。
  - 支持单个用户详情（含 RFQ 历史，`/api/admin/users/[id]`）、VIP 头衔维护（写入 `app_users.vipTitle`）、批量删除普通账号（`/api/admin/users/bulk-delete`，带 500 条上限与管理员排除）。
  - VIP 列缺失时 `vip-column.ts` 自动降级，界面提示需要迁移。
- **Settings / Email**（`/admin/settings/email`）：`EmailSettingsForm` 允许管理员在线配置 SMTP，字段存入 `email_settings` 表；支持“使用 `.env` 回退、提示是否已有密码、发送测试邮件”。

## 9. API 与服务端逻辑
### 9.1 公共 API（无需认证）
| 路径 | 描述 |
| --- | --- |
| `GET /api/health` | Ping Directus + Meilisearch，返回 `latency_ms`。 |
| `GET /api/search/products` | 搜索接口，支持 `q`、`category`、`filters`（JSON）、`page`、`pageSize`。 |
| `POST /api/inquiries` | RFQ 提交：校验邮箱/长度，`FormData` honeypot、IP+Email 双重限流（Burst + Daily + Email），写 Directus `inquiries`/`inquiry_items` 并异步发邮件。 |
| `POST /api/contact` | 联系表单发送邮件（依赖 `getResolvedEmailConfig`）。 |
| `GET /api/assets/[id]` | 代理 Directus `/assets/:id`，附带缓存头、剔除 CSP 头。 |

### 9.2 受保护 API
- **认证机制**：NextAuth JWT + `withSecurityContext` 包装。管理员 API 统一校验 `session.user.role === 'ADMIN'`；`/api/reindex` 额外支持 `Authorization: Bearer ${ADMIN_API_SECRET}`。
- **关键端点**：
  - `/api/admin/*`（products/users/email-settings/upload 等）负责后台 CRUD。
  - `/api/inquiries/[id]` 及 `/api/inquiries/[id]/status`（配合脚本/后台操作）。
  - `/api/reindex`：`rebuildIndex`（`meilisearch.ts`）拉取 Directus 全量产品→扁平化→批量推送→`waitForTaskCompletion`。
  - `/api/webhook/directus`：Directus Webhook 回调，只接受 `collection=products` 且 Header `x-webhook-secret` 匹配 `DIRECTUS_WEBHOOK_SECRET`；`items.create/update` 调 `syncProduct`（单条数据 + 动态属性），`items.delete` 调 `deleteProductIndex`。
  - `/api/admin/email-settings/test`：发送测试邮件，返回 messageId/envelope/`previewUrl`（若使用 Ethereal）。

## 10. 搜索与索引（`src/lib/meilisearch.ts`）
- `rebuildIndex()`：批量抓取 Directus `products` + `categories` + `attributes`，构造 `attr_${key}` 字段，设置 filterable attributes，推送到 `INDEX_NAME=products`。
- `syncProduct(id)`：读取单个产品、重建文档后 `index.addDocuments`。
- `deleteProductIndex(id)`：删除文档。
- `searchProducts`：优先调用 Meilisearch（若失败则 fallback 到 Directus `readItems` + 手动 facets）、支持 filters JSON（`parseFiltersPayload`）。返回 `hits`、`facets`、`totalPages`。
- 资源 URL：`ASSET_BASE = NEXT_PUBLIC_ASSET_BASE_URL or /api/assets`（供前后端渲染图片）。

## 11. 认证、安全与限流
- **NextAuth**（`src/lib/auth.ts`）：
  - Credentials Provider，验证 `app_users.passwordHash`（bcrypt）。
  - 三层速率限制（login burst / window / per-account）。
  - 根据 `NEXTAUTH_URL` 或 `COOKIE_SECURE` 决定 `secure` cookie。
  - `session`/`jwt` callback 把 `id`、`role`、`vipTitle` 注入。
- **注册保护**（`/api/auth/register`）：
  - Honeypot (`website` 字段) + 最小停留时间（3s）+ IP Burst/Daily limiter + 邮箱正则。
- **withSecurityContext**（`src/lib/security-context.ts`）统一处理：
  - `getServerSession` + `getToken` fallback。
  - 解析 IP + RequestId，注入 `context.actor`（admin/user/anonymous）。
  - `audit` + `rateLimit` stub + `logRequest` 结构化日志（`logger.ts`）。
- **中间件**：`src/middleware.ts` 拦截 `/admin`，未登录或非管理员直接重定向 `/`。
- **安全 headers**：`next.config.js` 设置 CSP（生产为严格版）、HSTS（满足 https 条件时开启）、Referrer-Policy、Permissions-Policy 等。

## 12. 邮件与通知
- RFQ 与 Contact 表单使用 `getResolvedEmailConfig` 加载配置：优先数据库 `email_settings`，否则回退 `.env`。
- `EmailSettings` 后台能够：
  - 保存 SMTP host/port/secure/user/pass、From/ReplyTo、`notifyTo` 列表。
  - 重置密码（`resetPassword`）或读取 `.env` 标记（`envHints`）。
  - 触发 `POST /api/admin/email-settings/test` 发送测试邮件，并返回 messageId/envelope 以及 `nodemailer.getTestMessageUrl`。
- `sendNotification`（`api/inquiries/route.ts`）会构建 HTML 表格并向 `notifyTo` 多个地址群发。

## 13. 容器与基础设施
- `docker-compose.yml`（根目录）与 `infra/docker-compose.yml` 均定义 Postgres/Redis/Meilisearch/Directus 服务；`infra` 版本还包含 AOF、healthcheck 与 admin token。
- `infra/docker-compose.override.example.yml` 提供把 Next.js 也放入容器的做法（Node 20 镜像 + 代码挂载）。
- `infra/env.example` 建议部署步骤：
  1. `cp infra/env.example .env` 并补齐变量。
  2. `docker compose -f infra/docker-compose.yml up -d`。
  3. `npm install && npm run build`，随后 `npm run db:migrate`、`npm run schema:apply`、`npm run seed:demo`、`npm run reindex`。
  4. 运行 `npm run start`（或将 Next.js 打包为容器运行）。
- `docs/runbooks/production-minimal.md`（中文）描述 VPS 环境、Nginx/Caddy 反代、TLS、监控与备份（Postgres dump、Directus uploads、Meilisearch dumps）。
- 备份策略在 `docs/runbooks/backup-restore.md`：列出 Postgres/Directus uploads/Meilisearch/配置文件的备份&恢复顺序。

## 14. 现有文档 / Runbook
- `README.md`：克隆 → `.env` → `npm install` → `docker compose` → `prisma migrate` → `schema:apply` → `seed:demo` → `reindex` → `npm run dev`。
- `project.md`：英文手册，描述架构、目录、模块职责。
- `STARTUP.md` / `START.md` / `START.md` 等：本地启动排错（Prisma EPERM、`.next` 缓存等）。
- `docs/runbooks/local-dev.md`：详尽中文指南。
- `docs/runbooks/verification.md`：上线前的命令与检查项。
- `DEPLOYMENT_MINIMAL.md`、`good.md`、`web.md`：部署缩略版、产品说明等。

## 15. 角色差异总结
- **游客**：可浏览营销页、产品目录、提交 RFQ/Contact 表单，不可访问 `/my` 或 `/admin`。
- **注册用户（USER）**：除游客能力外，可登录查看 `UserNav`、访问 `/my/inquiries`、RFQ 自动关联 `app_user_id`，若被标记 `vipTitle` 会显示 VIP 徽章。
- **管理员（ADMIN）**：拥有普通用户所有能力，并可访问 `/admin` 控制台（Dashboard、Inquiries、Products、Users、Email Settings）；RFQ/API/reindex 等敏感操作也可使用 `ADMIN_API_SECRET` Bearer Token。

---

该文档覆盖了项目代码、依赖栈、配置、数据模型、API、脚本及运维文档的全部关键信息，可直接作为 ChatGPT 制定上线/部署方案的知识输入。
