# WAIMO 工业外贸项目说明

本文面向后续接手的开发 / 运维同学，概述项目结构、关键流程、部署要点以及常见操作。配合仓库中的 `START.md` 可以快速完成环境搭建与功能验证。

## 1. 项目概览

| 模块 | 说明 |
| --- | --- |
| 前端 | Next.js 14 App Router，支持营销站、商店、Admin 三套路由，Tailwind +自定义暗色主题。|
| 后端接口 | Next.js Route Handlers，统一通过 `withSecurityContext` 校验（Session 或 API Secret），负责 RFQ、邮件、Meilisearch 等业务。|
| 数据层 | Directus（产品、属性、RFQ 等主数据），Postgres 存储；Prisma 仅用于附加表（如产品图库）。|
| 搜索 | Meilisearch 作为主索引，`src/lib/meilisearch.ts` 提供增量同步、全量重建与 Directus 回退逻辑。|
| 其他服务 | Redis（会话/缓存，可选）、SMTP（客户联系 & RFQ 通知）。|

## 2. 目录结构速览

```
src/
 ├─ app/                  # Next.js 路由
 │   ├─ (marketing)       # 营销站：/、/about、/contact
 │   ├─ (shop)            # 商品检索与产品详情
 │   ├─ (admin)           # Dashboard / Products / Users / Settings
 │   └─ api/              # 后端接口，如 /api/inquiries、/api/contact
 ├─ components/           # 复用组件，含 admin/product-form、RFQ 表单等
 ├─ lib/                  # Directus/Mail/Meilisearch/安全上下文等核心库
 └─ types/                # DTO & 类型声明

infra/                    # 可选的 docker-compose、ops 脚本
START.md                  # 启动与排障指南（务必阅读）
```

## 3. 运行与部署要点

1. **基础服务**  
   按 `START.md` 执行 `docker-compose up -d` 拉起 Postgres / Directus / Meilisearch。默认端口：
   - Directus `http://localhost:8055`
   - Meilisearch `http://localhost:7700`
   - Postgres `localhost:15432`

2. **数据库迁移**  
   首次或 schema 变更后执行：
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Next.js 应用**  
   ```bash
   npm install
   npm run dev        # 开发
   npm run build && npm run start   # 生产
   ```

4. **环境变量**（重点）  
   - `DIRECTUS_URL` / `DIRECTUS_ADMIN_TOKEN`
   - `DATABASE_URL`
   - `MEILISEARCH_HOST` / `MEILI_MASTER_KEY`
   - `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM_EMAIL`
   - `DIRECTUS_WEBHOOK_SECRET`（若开启 webhook）

5. **部署**  
   线上建议使用 PM2 / systemd 托管 Next.js，并将 Docker 服务写入独立 compose stack。外部需提供反向代理（Nginx/Caddy）处理 HTTPS 与缓存策略。

## 4. 核心业务流程

### 4.1 产品管理
1. Admin → Products → 新增/编辑。表单提交后：
   - 通过 `/api/admin/products` 写入 Directus。
   - `replaceProductGallery` 更新 Prisma 的 `product_images`。
   - 调用 `syncProduct` 将对应产品同步至 Meilisearch。
2. 前台 `/products` 优先从 Meilisearch 读取；若索引未更新，会自动 fallback 到 Directus 并刷新 facets，保证客户能实时看到最新信息。

### 4.2 RFQ/Inquiry
1. 客户在产品页或 `/contact` 提交询盘 → `/api/inquiries` / `/api/contact`。
2. 服务器校验、写入 Directus，并通过 SMTP 发送通知至 Admin 设置的收件人。
3. Admin → Inquiries 可查看/更新状态；详情页展示完整留言与条目。

### 4.3 邮件
Admin → Settings → Email 维护 SMTP（支持 Gmail、企业邮等）。接口统一读取 `getResolvedEmailConfig`，若未配置或认证失败会给出提示。切换真实邮件服务时请在 Settings 中更新 Host/Port/User/Pass 并运行“Send test email”验证。

### 4.4 搜索索引
- `src/lib/meilisearch.ts` 提供 `syncProduct`（单条）、`rebuildIndex`（全量）、`deleteProductIndex`（删除）。
- Admin Dashboard -> “Search Index” 按钮会触发 `/api/reindex`。
- 当 Meilisearch 不可用或尚未收到 webhook 时，前台自动 fallback 到 Directus，避免数据不同步。

## 5. Admin 操作提示

| 页面 | 说明 |
| --- | --- |
| Dashboard | 显示产品数、24h 询盘数、健康检查、重建索引按钮。|
| Inquiries | 表格查看 + View 详情（可改状态），表头已适配暗色主题。|
| Products | 列表/编辑/图片管理，提交后自动刷新索引。|
| Users | 列表、搜索、批量删除、VIP 头衔管理。|
| Settings → Email | 填写 SMTP，支持测试邮件；未配置邮箱时前台会提示“邮件服务器未配置”。|

## 6. 常见问题

- **Meilisearch 数据不同步**：点击 Dashboard 的重建按钮或调用 `/api/reindex`。在 fallback 模式下客户依然能看到最新产品。
- **SMTP Timeout**：确保端口与 `secure` 设置匹配（465=SSL，587=STARTTLS）并使用应用专用密码。若在国内网络请使用VPN或本地可用的 SMTP 服务商。
- **横向滚动**：Admin 列表均已使用自适应宽度；如再添加列，记得在表格上应用 `overflow-x-auto` + `scrollbar-hidden`。
- **前后端同步需求**：所有管理端操作都直接写入 Directus/Prisma，同步驱动 Meilisearch，无额外的“中间数据层”，符合“前端操作映射后端容器”要求。

## 7. 下一步建议

- 若计划部署到云环境，可将 `infra/docker-compose.yml` 作为 baseline（包含 Postgres/Directus/Meili/Redis）。
- 接口安全：新建 Route Handler 时务必使用 `withSecurityContext`，避免未授权访问 Admin API。
- 监控：建议为 Docker 服务加上健康监控（Grafana/Loki），并在 SMTP、Meili 等关键服务上配置告警。

如需更详细的启动、排障说明，请阅读 `START.md`；若需要部署最小化方案，可参考 `DEPLOYMENT_MINIMAL.md`。欢迎持续补充本文档。***
