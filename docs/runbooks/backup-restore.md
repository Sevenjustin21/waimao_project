# 备份 / 恢复 指南

## 需要备份的内容
- **PostgreSQL 数据**：使用 `pg_dump --format=custom`，每天定时导出
- **Directus 上传文件**：`directus_uploads` 卷或外部对象存储
- **Meilisearch 索引**：`meili_data` 卷或 `meilisearch dump` 输出（亦可由数据库重新索引）
- **配置文件**：`infra/docker-compose.yml`、反向代理配置、`.env`（仅存放在安全的密钥仓库，不要进 git）
- **自定义 schema/脚本**：`schema/`、`scripts/` 已在仓库中，仍建议额外镜像备份

## 明确禁止提交/备份到 Git 的内容
- 任何 `.env*`、密钥、Token、证书私钥
- 真实客户数据（RFQ、用户、邮件记录等 PII）
- 生产库导出的完整数据快照
- Cookies、Session、浏览器导出的私密信息

## 备份流程示例
1. 停止写操作或进入维护模式
2. 执行：
   ```bash
   # PostgreSQL
   pg_dump -U postgres -h localhost -Fc directus > backups/postgres/$(date +%F).dump
   # Directus uploads
   rsync -av /var/lib/docker/volumes/directus_uploads/_data s3://bucket/directus-uploads/
   # Meilisearch
   docker exec meilisearch meilisearch --dump /dumps/dump-$(date +%F).dump
   ```
3. 校验备份文件大小与校验和
4. 上传至安全的对象存储 / 离线介质

## 恢复流程概要
1. 新环境完成基础设施部署与 `.env` 配置
2. 恢复 PostgreSQL：`pg_restore -U postgres -d directus backups/<file>.dump`
3. 恢复 Directus 上传：将备份文件同步回 `directus_uploads` 卷
4. 恢复 Meilisearch：重新导入 dump 或运行 `npm run reindex`
5. 重新启动相关容器并验证管理员登录、产品、RFQ 功能

## 注意事项
- 在测试/预生产环境中仅使用匿名或演示数据
- 使用加密存储备份，定期演练恢复流程
- 每个备份批次都记录时间、环境、执行人以及校验结果
