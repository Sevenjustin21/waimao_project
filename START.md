# 本地启动指南（开发 + 准生产双模式）
当前仓库已经拆分出基础 Compose + dev/staging overlay，可在 Windows 主机上完成开发和本机准生产验证。以下步骤默认在仓库根目录执行。

---

## 0. 先决条件

- Windows 10/11 + Docker Desktop（Compose v2 已开启）、Node.js ≥ 18、npm ≥ 9。
- `.env` 由 `infra/env.example`（或 `.env.example`）复制，并填好 `POSTGRES_*`、`DIRECTUS_*`、`MEILI_MASTER_KEY`、`REDIS_PASSWORD` 等关键变量。
  - 若仓库根目录存在 `.env.local`，它会覆盖 `.env`。本机准生产模式建议删除或清空其中的冲突项，避免旧的 Directus / Meilisearch / NextAuth 配置继续生效。
  - 本机准生产建议统一使用 `localhost` 作为应用访问域名：`APP_URL`、`NEXTAUTH_URL`、`DIRECTUS_URL`、`NEXT_PUBLIC_DIRECTUS_URL`、`MEILISEARCH_HOST` 都写成 `http://localhost:...`，避免 `localhost` / `127.0.0.1` 混用导致 cookie、session、跳转 origin 分裂。
  - `DIRECTUS_ADMIN_TOKEN` **必须**来自 Directus 后台 **Settings → Access Tokens** 所创建的 Static Token。不要粘贴登录接口返回的短期 JWT（约 15 分钟过期，会触发 401 与页面白屏）。
  - 需要在宿主机使用 `redis-cli` 时，可追加 `REDIS_URL=redis://:<password>@localhost:16379`。
  - 但若后台 `Settings -> Email` 已配置真实 SMTP，则系统默认优先使用后台配置；只有显式设置 `SMTP_FORCE_ENV=true` 时，才强制使用 `.env` 中的 SMTP。

---

## 1. 安装依赖

```powershell
npm install
```

---

## 2. 选择运行模式

### 2.1 开发模式（继承原始端口）

```powershell
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

- 暴露端口：`15432`(Postgres) / `16379`(Redis) / `17700`(Meilisearch) / `8055`(Directus)
- 适合需要外部设备或 GUI 工具连接数据库、缓存与搜索服务的场景。

### 2.2 本机准生产模式（仅绑定 127.0.0.1）

```powershell
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

- 所有端口仅绑定到 `127.0.0.1`，本机可访问、局域网阻断，便于预发布验证。
- 仍可通过 `curl http://127.0.0.1:8055/server/ping`、`redis-cli -h 127.0.0.1 -p 16379 -a <pwd>` 等命令检测服务状态。

> 在两个模式之间切换前，建议执行 `docker compose -f docker-compose.yml -f <overlay>.yml down` 释放端口资源。

---

## 3. 初始化数据

首次或重建环境时，请按照顺序执行：

```powershell
npm run db:migrate          # Prisma / NextAuth 表结构
npm run schema:apply        # Directus schema merge
npm run seed:demo           # Demo 分类 / 产品 / 属性
npm run reindex             # 将产品写入 Meilisearch
```

> 若 token 配置错误会出现 401（尤其是 `DIRECTUS_ADMIN_TOKEN`），请在 Directus 后台重新生成 Static Token，更新 `.env` 后再执行上述命令。

---

## 4. 启动 Next.js

### 开发模式

```powershell
npm run dev
```

默认访问 `http://localhost:3000`。即使容器端口在准生产 overlay 中绑定到 `127.0.0.1`，浏览器入口与应用基准 URL 也建议统一使用 `localhost`。

### 准生产验证

```powershell
npm run build
npm run start
```

适用于本机模拟正式运行流程。

---

## 5. 验证清单

1. `docker compose ... ps` 四个服务均为 `healthy`。
2. `curl http://localhost:8055/server/ping` 返回 `pong`。
3. `redis-cli -h localhost -p 16379 -a <REDIS_PASSWORD> ping` 返回 `PONG`。
4. `curl http://localhost:17700/health` 返回 200。
5. `curl -H "Authorization: Bearer $env:DIRECTUS_ADMIN_TOKEN" http://localhost:8055/items/products?limit=1` 返回 200，确认 Static Token 有效。
6. 浏览器统一从 `http://localhost:3000` 进入，并在清理 `localhost` 与 `127.0.0.1` 的旧 cookie 后验证 `/products`、`/admin/dashboard`、登录/退出流程；如产品数量为 0，可重新执行 `npm run reindex`。

---

## 6. 常用维护命令

```powershell
# 查看日志
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f directus

# 停止并移除容器
docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# 清理卷（慎用：会删除数据）
docker volume rm postgres_data redis_data meili_data directus_uploads directus_extensions
```

更多关于持久化目录、Redis 认证、端口策略的说明，请参考 `DEPLOYMENT_LOCAL_STAGING.md`。
