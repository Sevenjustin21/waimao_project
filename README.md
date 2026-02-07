# WAIMAO 平台

独立站 B2B 外贸平台，基于 Next.js App Router + Directus + PostgreSQL + Redis + Meilisearch。

## 快速上手（概览）

1. `git clone https://github.com/Sevenjustin21/waimao_project.git && cd waimao_project`
2. `cp infra/.env.example .env` 并按注释补齐 Directus、数据库、SMTP、搜索等变量
3. `npm install` 安装依赖
4. `docker compose -f infra/docker-compose.yml up -d` 拉起数据库、Directus、Redis、Meilisearch 等服务
5. `npx prisma migrate deploy` 同步数据库
6. 运行脚本应用 Directus schema、写入演示数据并重建搜索索引
7. `npm run dev`（或 `npm run build && npm run start`）启动前端

详细版请参考 `docs/runbooks/local-dev.md`。
验证流程请参考 `docs/runbooks/verification.md`。

## 仓库结构速览

- `src/`：Next.js 应用（App Router）
- `schema/`：Directus schema 快照
- `scripts/`：数据库、Directus、Meilisearch 运维脚本
- `infra/`：docker compose、环境变量模板（稍后提交）
- `docs/`：发布记录、运行手册、备份策略等

## 安全提示

- 仓库不包含任何真实密钥、token 或生产数据，务必自行创建 `.env` 并妥善保管
- 不要将 `.env*`、token、真实客户信息加入版本控制
- 线上部署时请确保仅暴露必须的端口，并通过反向代理 / HTTPS 终止 TLS
