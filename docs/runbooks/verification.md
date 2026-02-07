# 验证清单

## 命令序列
按顺序执行以下命令，确保本地/CI 环境输出成功状态：

```bash
npm ci
npm run lint
npm run build
cp infra/.env.example .env   # 或确保已有完整 .env
docker compose -f infra/docker-compose.yml up -d
npm run db:migrate
npm run schema:apply
npm run seed:demo
npm run reindex
npm run setup:dev            # 可选：串联上方步骤（仍需 Docker 已运行）
```

> `npm run setup:dev` 会依次执行 migrate -> schema:apply -> seed:demo -> reindex，可用于二次确认

## 基础可用性检查
1. 浏览器访问 `http://localhost:3000/`，确认首页渲染正常、交互按钮可点击
2. `curl http://localhost:3000/api/health` 应返回 HTTP 200 + JSON `{ status: 'ok' }`
3. 登录 `/admin`：使用管理账号验证 Dashboard、Products/Users 列表可加载
4. 进入 `/admin/products`，确认 demo 产品列表存在，并可进行检索筛选
5. 前台产品页（如 `/products/hex-head-bolt-din933-m8-40-ss304`）应展示属性、RFQ 表单、相关产品
6. DevTools Network/Console 无关键 CSP/网络报错
```bash
curl -I http://localhost:3000/api/health    # 可选：快速检查响应头
```

> 若检查失败，请参考 `docs/runbooks/local-dev.md` 和 `docs/runbooks/production-minimal.md` 进行排障。
