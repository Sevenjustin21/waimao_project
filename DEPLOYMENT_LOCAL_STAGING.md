## Local Dev vs. Local Staging

| 模式 | Compose 命令 | 端口策略 | Redis 认证 | 备注 |
| --- | --- | --- | --- | --- |
| 开发模式 | `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d` | 对应暴露 `15432/16379/17700/8055` 到 `0.0.0.0`，方便多端联调 | 使用 `.env` 中的 `REDIS_PASSWORD` | 保留原生调试体验 |
| 本机准生产模式 | `docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d` | 容器端口绑定 `127.0.0.1`，但应用入口统一使用 `localhost` | 同一份 `REDIS_PASSWORD`，但只对本机开放 | 用于准生产/预发布验证 |

> `docker-compose.yml` 只描述基础服务定义，运行任一模式都需要再附加对应 overlay。

---

## 持久化规划

| 服务 | Volume | 容器路径 | 内容说明 |
| --- | --- | --- | --- |
| PostgreSQL | `postgres_data` | `/var/lib/postgresql/data` | Directus + NextAuth 共用数据库 |
| Redis | `redis_data` | `/data` | AOF/快照，保留缓存与限流状态 |
| Meilisearch | `meili_data` | `/meili_data` | 全量搜索索引与快照 |
| Directus | `directus_uploads` | `/directus/uploads` | 媒体文件（RFQ 附件、产品图片） |
| Directus | `directus_extensions` | `/directus/extensions` | 可选自定义扩展/Hook 运行目录 |

Schema 快照、配置文件、种子脚本继续通过 Git 维护（`schema/`、`scripts/`），无需额外挂载。

---

## Redis 认证

* 两种 Compose 模式都通过 `redis-server --requirepass ${REDIS_PASSWORD}` 启动。
* Directus 通过 `REDIS=redis://:${REDIS_PASSWORD}@redis:6379/0` 连接。
* 如果需要在宿主机直接访问，建议统一使用 `localhost`，例如 `.env` 中设置 `REDIS_URL=redis://:<password>@localhost:16379`。

---

## Directus API Token

* `DIRECTUS_ADMIN_TOKEN` 必须为 Directus 后台 **Settings → Access Tokens** 创建的 Static Token。
* 登录接口 (`/auth/login`) 返回的 JWT 仅 15 分钟有效，放到 `.env` 里会导致 Next.js 在数分钟后全部 401 / 白屏 / 搜索失败。
* 更换 token 后请重启 Next.js（`npm run dev` 或 `npm run build && npm run start`），并通过 `curl -H "Authorization: Bearer $env:DIRECTUS_ADMIN_TOKEN" http://127.0.0.1:8055/items/products?limit=1` 做健康检查。

---

## 端口策略

* **开发模式**：保留原端口映射（`15432/16379/17700/8055`），方便从其他设备或 GUI 工具直接连接。
* **准生产模式**：所有容器端口绑定 `127.0.0.1`，对外完全隔离；但浏览器与应用基准 URL 建议统一为 `localhost`，避免 cookie / session / 回调 origin 分裂。
* 网络名称固定为 `waimao-net`，后续若希望把 Next.js 也容器化，可直接加入该网络。

---

## 启动 / 停止示例

```powershell
# 启动开发模式
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 启动本机准生产模式
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d

# 查看状态
docker compose -f docker-compose.yml -f docker-compose.staging.yml ps

# 停止并清理
docker compose -f docker-compose.yml -f docker-compose.staging.yml down
```

---

## 验证步骤

1. `docker compose ... ps` 查看四个服务均为 `healthy`。
2. `curl http://localhost:8055/server/ping` 返回 `pong`。
3. `redis-cli -h localhost -p 16379 -a <REDIS_PASSWORD> ping` 返回 `PONG`。
4. `curl http://localhost:17700/health` 确认 Meilisearch 正常。
5. `npm run db:migrate && npm run schema:apply && npm run seed:demo && npm run reindex` 全部成功。
6. 浏览器访问 `/products`、`/admin/dashboard`，确认搜索、健康卡片、管理员仪表盘数据正常。

---

## 其他提示

* 准生产模式下如需让额外容器访问数据库，可让它们加入 `waimao-net` 内部网络。
* Volume 物理路径可通过 `docker volume inspect <name>` 查询，用于离线备份。
* 切换 dev/staging 模式前，建议 `docker compose -f docker-compose.yml -f <overlay> down` 以免端口未释放。
