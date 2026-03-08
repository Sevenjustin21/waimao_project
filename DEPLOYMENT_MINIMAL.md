# 最小化部署指南（单节点）

适用于单台云主机（>=2C4G）通过 Docker Compose + Next.js Production 架构上线，供体验环境或小规模投产使用。若需高可用/CI/CD，请在此基础上扩展。

## 1. 环境准备

1. 安装依赖
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose git
   sudo usermod -aG docker $USER   # 加入 docker 组，重新登录生效
   ```
2. 拉取代码
   ```bash
   git clone https://github.com/<org>/waimao.git
   cd waimao
   ```
3. 配置 `.env`
   - 复制 `.env.example` → `.env`
   - 填写数据库、Directus、Meilisearch、SMTP、`ADMIN_API_SECRET` 等真实值
   - `infra/.env.example` 对应 Compose 环境变量，可同步调整

## 2. 启动依赖容器

```bash
docker-compose -f infra/docker-compose.yml up -d
```

默认端口：
| 服务 | 端口 |
| --- | --- |
| Postgres | 15432 |
| Directus | 8055 |
| Meilisearch | 7700 |
| Redis | 6379 |

生产环境建议通过 Nginx/Caddy 暴露，并仅允许内网访问 Directus/Meili。

## 3. 同步数据库与索引

```bash
docker exec -it waimao-app-1 npx prisma migrate deploy
docker exec -it waimao-app-1 npx prisma generate
curl -X POST http://localhost:3000/api/reindex -H "Authorization: Bearer <ADMIN_API_SECRET>"
```

若在宿主机直接运行 Next.js，可使用本地 `npx prisma migrate deploy`。

## 4. 构建 & 启动 Next.js

```bash
npm install
npm run build
NODE_ENV=production npm run start
```

推荐由 `pm2` / systemd 托管：
```bash
pm2 start npm --name waimao-web -- run start
```

### Nginx 反向代理示例
```nginx
server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## 5. 运维日常

| 操作 | 命令 |
| --- | --- |
| 查看容器日志 | `docker-compose -f infra/docker-compose.yml logs -f` |
| 重启某服务 | `docker-compose -f infra/docker-compose.yml restart <service>` |
| 重建索引 | `curl -X POST http://localhost:3000/api/reindex -H "Authorization: Bearer <ADMIN_API_SECRET>"` |
| Prisma 迁移 | `npx prisma migrate deploy` |
| 清理 Redis | `docker-compose exec redis redis-cli FLUSHALL` |

## 6. 安全与备份

1. **HTTPS**：务必在代理层配置 TLS（Caddy/Traefik 自动证书）。  
2. **访问控制**：Directus、Meilisearch 建议仅开放内网并刷新 Token。  
3. **备份**：周期性导出 Postgres 数据 + Directus 上传目录 + Meilisearch dump。  
4. **监控**：至少部署 Uptime Kuma / Grafana 监控核心接口和容器。

## 7. 升级 & 回滚

1. `git pull` 获取最新代码，检查 `package-lock.json` 是否变化。  
2. 重新 `npm install && npm run build`，重启 PM2/systemd。  
3. 若需回滚：`git checkout <tag>` → `npm run build` → 重启服务。

## 8. FAQ

- **SMTP 超时**：确认网络能访问 `SMTP_HOST`，端口与 `secure` 匹配（465=SSL，587=STARTTLS）；使用应用专用密码。  
- **Meili 无数据**：执行 `/api/reindex`，检查 `docker logs meilisearch`；Admin Dashboard 的“Search Index”按钮也可手动触发。  
- **RFQ 未写入**：Directus 未启动或 `DIRECTUS_ADMIN_TOKEN` 不正确；查看 `docker logs directus`。  
- **前台看不到新产品**：前端已自动 fallback Directus，仍建议调查 Meili 同步，确保 webhook/手动操作能触发 `syncProduct`。

如需多节点或托管数据库，可在此方案上扩展。祝部署顺利。
