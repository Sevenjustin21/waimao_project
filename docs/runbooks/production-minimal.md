# 最小化生产部署（单 VPS）

## 拓扑概览
- 一台 VPS (4C/8G 起步)，Ubuntu 22.04 LTS
- Docker Compose 运行：postgres、redis、meilisearch、directus、nextjs app
- Nginx / Caddy 作为反向代理，监听 80/443，转发到应用容器
- 按需开放 `22` (SSH)、`80`、`443`，其余端口走内部网络

## 部署步骤
1. **系统准备**
   - 更新系统：`sudo apt update && sudo apt upgrade`
   - 安装 Docker / Compose：参考官方脚本或 apt 仓库
   - 创建 `deploy` 用户并加入 `docker` 组
2. **拉取代码**
   ```bash
   git clone https://github.com/Sevenjustin21/waimao_project.git /opt/waimao
   cd /opt/waimao
   cp infra/.env.example .env
   # 写入生产环境变量（真实域名、数据库密码、SMTP、NextAuth、ADMIN_API_SECRET等）
   ```
3. **持久化卷规划**
   - Postgres：`postgres_data`
   - Directus 上传：`directus_uploads`
   - Meilisearch：`meili_data`
   - Redis（如需磁盘持久化）：`redis_data`
   - 如使用外部块存储，请在 compose 中绑定对应路径
4. **拉起容器**
   ```bash
   docker compose -f infra/docker-compose.yml up -d
   docker compose ps
   ```
5. **数据库 + Schema + 索引**
   ```bash
   npx prisma migrate deploy
   npm run schema:apply
   npm run seed:demo   # 生产若有真实数据请替换为安全导入流程
   npm run reindex
   ```
6. **反向代理 + TLS**
   - 使用 Nginx：
     - `server_name example.com`，`location /` 代理到 `http://nextjs:3000`
     - `location /admin` 根据需要缓存/鉴权
     - `location /directus` 可转发到 Directus 容器 8055 端口
   - 使用 Caddy/Traefik 亦可，务必启用 HTTPS (Let’s Encrypt)
   - 为 API、Next.js、Directus 设置合适的 CSP/HSTS（生产为严格模式）
7. **监控与日志**
   - `docker compose logs -f <service>` 观察
   - 推荐额外安装 fail2ban / UFW，限制 SSH 来源

## 备份建议
- 每日自动 `pg_dump`（结构+数据）到安全位置
- Directus 上传文件同步至对象存储（S3/OSS）
- Meilisearch 可导出 dump 或定期重建（结合数据库数据）
- `.env`、反向代理配置需安全备份但不可上传到 git

## 故障排查
- 应用 502：查看 Next.js/Directus 容器是否健康
- 登录失败：确认 NextAuth URL/COOKIE_SECURE 变量
- 搜索为空：重新执行 `npm run reindex`
- 邮件失败：检查 SMTP 端点、凭证、防火墙是否放行 587/465
