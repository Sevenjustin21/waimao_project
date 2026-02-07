# 项目启动 / 停止指引

本文说明如何在本地启动或停止 WAIMO 项目，以及常见问题的排查步骤。

## 前置要求

- Node.js ≥ 18（建议安装 LTS 版本）
- Docker & Docker Compose（用于拉起 Postgres / Directus / Meilisearch / Redis）
- 正确配置的 `.env`（可基于 `.env.example` 复制）

## 启动步骤

启动分两部分：先启动基础服务，再启动 Next.js 应用。

### 1. 启动基础服务

在仓库根目录执行：

```powershell
docker-compose up -d
```

默认暴露端口：

- Directus: http://localhost:8055
- Meilisearch: http://localhost:7700
- Postgres: 本机 15432（供 Prisma / Directus 使用）

确认这些服务 Healthy 后再进行下一步。

### 2. 同步数据库（首次或 schema 变化时必做）

直接运行：

```powershell
npx prisma migrate deploy
npx prisma generate
```

这一步会将 `prisma/migrations`（包含 `20260202_add_vip_title`）全部应用到 `app_users` 等表，否则用户管理的 VIP 功能会被自动降级。

### 3. 启动 Next.js 应用

```powershell
npm run dev
```

访问 http://localhost:3000 即可使用前后台。若需生产模式，可改为 `npm run build && npm run start`。

### 4. ��ȫ����У��
- �κ����������������� `npm run lint` (�Ѿ�ͨ�� `npm run security:contract` ���κθ߷� API û�г� security context)��
- �����Ե��Զ�������ѯ�������Բ��� `npm run security:contract` ���������ط� handler �Ὣ��Ӧ��Ҫ����ǰ����

## 停止步骤

1. **停止应用**：在运行 `npm run dev` 的终端按 `Ctrl + C`，选择 `Y` 结束。
2. **停止基础服务**：
   - 暂停：`docker-compose stop`
   - 停止并移除容器：`docker-compose down`（数据仍保留在 volume 中）

## 常见问题

### 端口占用（3000/15432 等）

1. 使用 `netstat -ano | findstr :3000` 查出占用进程，并 `taskkill /PID <PID> /F` 结束。
2. 若 Docker 端口被占用，可在 `docker-compose.yml` 中调整映射端口再启动。

### Prisma 或 Next.js 报错 “列不存在”

症状：启动用户管理页时报错 `app_users.vipTitle does not exist`。

解决：

1. 确保 `.env` 中 `DATABASE_URL` 指向本机 `localhost:15432`。
2. 运行 `npx prisma migrate deploy`。系统内置降级机制会给出友好提示，但若要启用 VIP 头衔、批量删除等增强功能，必须完成迁移。

### `.next` 缓存损坏

1. 停止应用。
2. 删除 `.next` 目录。
3. 重新执行 `npm run dev`。

### Docker 容器无法启动

- 使用 `docker-compose logs <service>` 查看详细日志。
- 确认本机未占用对应端口（例如 15432、7700、8055）。
- 如需重置，可 `docker-compose down -v` 清理 volume（注意：会删除数据库数据）。

---

如仍遇到未覆盖的问题，可提供日志 / 终端输出给团队以便进一步排查。祝开发顺利！***
