# WAIMO Project

B2B Industrial Foreign Trade Site built with Next.js 14 (App Router), Directus, and Meilisearch.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 新机部署

1. `git clone <YOUR_REPO_URL> waimao && cd waimao`
2. `cp .env.example .env` 并填入 Directus、Postgres、Meilisearch、SMTP、NextAuth 等必填变量
3. `npm install` 安装依赖
4. `docker compose up -d` 启动 `postgres`, `directus`, `meilisearch` 等本地服务容器
5. `npx prisma generate && npx prisma db push` 同步 Prisma Client 与数据库结构
6. `npm run db:apply` 将 `schema/` 里的 Directus schema 应用到实例
7. `npm run db:seed` 导入初始分类、产品、属性
8. `npm run search:reindex` 根据最新 Directus 数据重建 Meilisearch 索引
9. `npm run dev` (或 `npm run build && npm run start`) 启动 Next.js

## Core Commands

| Command | Description |
| copy | copy |
| `npm run dev` | Start development server (localhost:3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm run db:apply` | Apply schema changes to Directus |
| `npm run db:seed` | Seed initial data (categories/products) |
| `npm run search:reindex` | Rebuild Meilisearch index |

## Project Structure

- `src/app`: Application routes and pages (App Router)
- `src/components`: Reusable UI components
- `src/lib`: Core logic (Directus SDK, Meilisearch client, Inquiry handling)
- `schema`: Directus schema snapshots
- `scripts`: Maintenance and setup scripts

## 最近更新 / Latest Upgrades

- 统一环境变量入口：所有脚本、Next.js、docker-compose 仅读取根目录 `.env`，并提供 `.env.example` 作为模板，确保密钥读取口径一致。
- 静态资源代理：新增 `/api/assets/[id]` 代理并引入 `NEXT_PUBLIC_ASSET_BASE_URL`，产品列表/详情/Request Quote 轮播全部经由代理加载 Directus 图片，前端已针对各种尺寸图片做了等比裁切与自动轮播。
- 搜索与后台联动：产品的新增/修改/删除会即时触发 Meilisearch `syncProduct`/`deleteProductIndex`，管理员上传图片即可在客户端同步。
- 邮件流水线强化：`/api/inquiries` 现会优先读取数据库里的 SMTP 配置并带有多收件人、Reply-To 支持，同时后台新增“邮件服务器配置”页面与 `/api/admin/email-settings/test`，方便随时验证通知通道是否正常。
- 产品筛选与图片：重建索引时会自动回填 Directus 分类与属性，`/products` 左侧 Filters 与网格缩略图始终与后台数据一致，图片全部经代理路径 `/api/assets/*` 读取（Next Image 使用 `unoptimized` 以兼容各种私有资源）。
- 管理端分类下拉：`/admin/products` 的新增/编辑页会按名称排序加载所有已发布分类、属性，确保后台勾选分类后前端与 Meilisearch 可立即查询到，无需手动同步。
- 多图图库支持：新增 Prisma 表 `product_images` 记录 Directus 文件 ID，后台表单允许上传/排序多张图，封面图自动写入 `products.image_id`，营销端产品页会将多图传给 `ImageGallery` 自动轮播。可运行 `npx tsx scripts/backfill-product-gallery.ts` 以把旧的 `image_id` 批量迁移到图库。
- 管理端“用户管理”升级：支持按邮箱/角色/注册日期组合筛选并一键批量删除普通用户，可为任意账户设置/清除 VIP 头衔（登录后用户会在导航看到“VIP xxx”标识），所有调整实时写入 Prisma；若数据库尚未迁移 `vipTitle` 列，系统会自动降级并提醒执行 `npx prisma migrate deploy`。

- RFQ 询盘提交成功页现在仅显示 “Back to Home” 按钮，杜绝将后台入口暴露给客户端访客。
- 2026.02 ���������� `withSecurityContext` ��Ϊȫ������Ŀ�İ�ȫ Kernel���������б����� `/api/admin/**`��`/api/reindex` �� `/api/inquiries/[id]` handler �Զ���� requestId��NextAuth session��IP �� audit/rate limit stub��������Ӧ��һ���̶�ӵ�� `X-Request-Id` ��ͷ�����м�ʱ����ڲ���־���Լ����� audit/������չ��ͬʱͨ�� `npm run security:contract` ��`next lint` ����һ������ CI ǿ���֤ handler ���ܺ�ܵ��
- 产品筛选构建逻辑会自动转义特殊字符并根据值类型拼接查询，直径 (Diameter) 等规格过滤结果与 Directus 数据完全同步，并通过 `startTransition` 降低 Filters 面板在滚动时的卡顿感。

- 2026.01 注册/登录接口加固：`/api/auth/register` 引入 honeypot、最小停留时长与 IP 限流，NextAuth Credentials Provider 加入 IP/时间窗口/账号维度限流，抵御刷号与撞库。
- 2026.01 RFQ API (`/api/inquiries`) 设置 IP 爆发/24 小时配额与邮箱配额，并对用户内容 HTML 转义与记录 requestId，避免恶意脚本与日志泄露 PII。
- 2026.01 Prisma Client 仅在开发环境输出 SQL 查询日志，生产默认关闭以降低 I/O 压力并保护敏感数据。

## Environment Variables

1. Copy the sample config: `cp .env.example .env`
2. Fill the grouped settings as needed:
   - **Directus & Postgres**: `POSTGRES_*`, `DIRECTUS_*`, `DIRECTUS_ADMIN_TOKEN` (for scripts / API calls), `DIRECTUS_WEBHOOK_SECRET` (Directus -> Next.js webhook verification)
   - **Meilisearch**: `MEILISEARCH_HOST`, `MEILI_MASTER_KEY`, `MEILISEARCH_MASTER_KEY` (keep app and container in sync)
   - **App / Auth**: `APP_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AUTH_SECRET`, `DATABASE_URL`, `COOKIE_SECURE` (optional override to force secure cookies)
   - **Admin helpers**: `ADMIN_API_SECRET` (trigger reindex), `ADMIN_BOOTSTRAP_EMAIL/PASSWORD` (seeded admin user)
   - **Email / RFQ alerts**: `SMTP_HOST/PORT/USER/PASS`, `SMTP_FROM_NAME`, `SMTP_FROM_EMAIL`, `NOTIFY_EMAIL_TO`, `SMTP_REPLY_TO` (optional)
   - **Rate limiting (optional)**: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (enables distributed limiter; memory fallback otherwise)
   - **Asset proxy (optional)**: `NEXT_PUBLIC_ASSET_BASE_URL` (defaults to `/api/assets`; point to CDN if needed)
3. Next.js, docker-compose, and helper scripts all read from `.env`, so `.env.local` / `.env.docker` are no longer needed.
4. 默认 `DATABASE_URL` 指向 `localhost:15432`，与 `docker-compose` 暴露的 Postgres 端口一致；如果你在容器内部运行 Next.js，可将主机端口改回 5432。

## 邮件通知配置（管理员前端入口）

1. **同步数据库结构**：运行 `npx prisma db push` 创建 `email_settings` 表（如在容器内运行请进入 Next.js 容器执行）。
2. **后台入口**：以管理员身份登录 `/login`，进入 `/admin/settings/email` 页面即可查看、填写或覆盖 SMTP 服务器信息；留空的字段会继续读取 `.env` 里的值。
3. **敏感信息**：SMTP 密码会存储在数据库中，但后台只显示“已保存”状态，若需要替换或清空，可通过“清除已保存密码”按钮操作。
4. **多收件人**：`通知收件人` 支持逗号/分号/换行分隔，保存后 `/api/inquiries` 和测试接口都会按列表逐个发送。
5. **一键测试**：在该页面底部可指定测试邮箱，调用 `/api/admin/email-settings/test` 实时发送验证邮件（Ethereal 等测试账号同样适用），响应里会返回 Message ID 及预览链接。
6. **运行期行为**：当数据库未提供配置时，`/api/inquiries` 会自动回退到 `.env`；若两者都缺失则会记录日志并跳过邮件，不影响用户提交。
