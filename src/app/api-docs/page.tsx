'use client';

import { useEffect, useState } from 'react';

export default function ApiDocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">WAIMO API 文档</h1>
        <p className="text-gray-600 mb-8">B2B 工业品外贸平台 API 接口文档</p>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">📚 API 端点列表</h2>

          {/* Search API */}
          <div className="mb-8 pb-8 border-b">
            <div className="flex items-center mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-mono font-bold mr-3">
                GET
              </span>
              <code className="font-mono text-lg">/api/search/products</code>
            </div>
            <p className="text-gray-700 mb-3">
              搜索产品库，支持全文搜索、Faceted Navigation 多维筛选
            </p>
            <div className="bg-gray-50 p-4 rounded mb-3">
              <p className="font-semibold mb-2">查询参数:</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <code className="bg-gray-200 px-2 py-1">q</code> - 搜索关键词
                  (必填)
                </li>
                <li>
                  <code className="bg-gray-200 px-2 py-1">category</code> -
                  分类筛选
                </li>
                <li>
                  <code className="bg-gray-200 px-2 py-1">material</code> -
                  材质筛选
                </li>
                <li>
                  <code className="bg-gray-200 px-2 py-1">page</code> - 分页
                  (默认: 1)
                </li>
                <li>
                  <code className="bg-gray-200 px-2 py-1">limit</code> -
                  每页数量 (默认: 20)
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              示例:{' '}
              <code className="bg-gray-200 px-2 py-1">
                /api/search/products?q=bolt&category=fasteners
              </code>
            </p>
          </div>

          {/* Inquiries API */}
          <div className="mb-8 pb-8 border-b">
            <div className="flex items-center mb-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-mono font-bold mr-3">
                GET/POST
              </span>
              <code className="font-mono text-lg">/api/inquiries</code>
            </div>
            <p className="text-gray-700 mb-3">
              管理客户询价 (RFQ)，支持 CRUD 操作和邮件通知
            </p>

            <div className="bg-blue-50 p-4 rounded mb-3">
              <p className="font-semibold mb-2">GET - 获取所有询价</p>
              <p className="text-sm text-gray-700">返回分页的询价列表</p>
            </div>

            <div className="bg-green-50 p-4 rounded mb-3">
              <p className="font-semibold mb-2">POST - 提交新询价</p>
              <p className="text-sm text-gray-700 mb-2">
                创建新的客户询价，自动发送确认邮件
              </p>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                {`{`}
                <br />
                {`  "company_name": "ACME Corp",`}
                <br />
                {`  "contact_email": "buyer@acme.com",`}
                <br />
                {`  "product_id": "123",`}
                <br />
                {`  "quantity": 1000,`}
                <br />
                {`  "special_requests": "需要加急"`}
                <br />
                {`}`}
              </p>
            </div>
          </div>

          {/* Inquiry Detail API */}
          <div className="mb-8 pb-8 border-b">
            <div className="flex items-center mb-4">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono font-bold mr-3">
                GET/PATCH/DELETE
              </span>
              <code className="font-mono text-lg">/api/inquiries/[id]</code>
            </div>
            <p className="text-gray-700 mb-3">
              管理单个询价，更新状态、添加报价、删除记录
            </p>
            <div className="bg-gray-50 p-4 rounded text-sm">
              <p>
                <strong>GET</strong> - 获取询价详情
              </p>
              <p>
                <strong>PATCH</strong> - 更新询价状态或报价
              </p>
              <p>
                <strong>DELETE</strong> - 删除询价记录
              </p>
            </div>
          </div>

          {/* Inquiry Status API */}
          <div className="mb-8 pb-8 border-b">
            <div className="flex items-center mb-4">
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded font-mono font-bold mr-3">
                PATCH
              </span>
              <code className="font-mono text-lg">
                /api/inquiries/[id]/status
              </code>
            </div>
            <p className="text-gray-700 mb-3">
              更新询价状态 (new, processing, quoted, closed)
            </p>
            <div className="bg-gray-50 p-4 rounded text-sm font-mono">
              {`{`}
              <br />
              {`  "status": "quoted",`}
              <br />
              {`  "unit_price": 2.50,`}
              <br />
              {`  "currency": "USD",`}
              <br />
              {`  "delivery_date": "2026-02-15"`}
              <br />
              {`}`}
            </div>
          </div>

          {/* Health Check API */}
          <div className="mb-8 pb-8 border-b">
            <div className="flex items-center mb-4">
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded font-mono font-bold mr-3">
                GET
              </span>
              <code className="font-mono text-lg">/api/health</code>
            </div>
            <p className="text-gray-700 mb-3">
              系统健康检查，检查数据库、Redis、Meilisearch 等服务状态
            </p>
            <div className="bg-green-50 p-4 rounded text-sm">
              <p className="font-semibold mb-2">返回示例:</p>
              <div className="font-mono text-xs">
                {`{`}
                <br />
                {`  "status": "healthy",`}
                <br />
                {`  "services": {`}
                <br />
                {`    "database": "ok",`}
                <br />
                {`    "redis": "ok",`}
                <br />
                {`    "meilisearch": "ok"`}
                <br />
                {`  }`}
                <br />
                {`}`}
              </div>
            </div>
          </div>

          {/* Reindex API */}
          <div className="mb-8 pb-8 border-b">
            <div className="flex items-center mb-4">
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded font-mono font-bold mr-3">
                POST
              </span>
              <code className="font-mono text-lg">/api/reindex</code>
            </div>
            <p className="text-gray-700 mb-3">
              手动触发 Meilisearch 索引重建（管理员专用）
            </p>
            <p className="text-sm text-gray-600">
              当产品数据大量变化时使用，重建搜索索引通常需要 2-5 分钟
            </p>
          </div>

          {/* Webhook API */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded font-mono font-bold mr-3">
                POST
              </span>
              <code className="font-mono text-lg">
                /api/webhook/directus
              </code>
            </div>
            <p className="text-gray-700 mb-3">
              Directus CMS Webhook 接收端点，接收产品变更事件自动更新搜索索引
            </p>
            <p className="text-sm text-gray-600">
              由 Directus 自动调用，手动调用无效果
            </p>
          </div>
        </div>

        {/* Auth & Headers */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">🔐 认证与请求头</h2>

          <div className="mb-6">
            <h3 className="font-bold mb-2">公开端点（无需认证）</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>/api/search/products - 搜索产品</li>
              <li>/api/inquiries (POST) - 提交新询价</li>
              <li>/api/health - 系统健康检查</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="font-bold mb-2">需要认证的端点</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>/api/inquiries (GET) - 获取所有询价</li>
              <li>/api/inquiries/[id] - 管理单个询价</li>
              <li>/api/reindex - 手动重建索引</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              使用 Directus 管理员账户通过 Authorization Bearer token 认证
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <p className="font-semibold mb-2">请求头示例:</p>
            <div className="font-mono text-sm space-y-1">
              <div>Content-Type: application/json</div>
              <div>Authorization: Bearer [DIRECTUS_TOKEN]</div>
            </div>
          </div>
        </div>

        {/* Error Handling */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">⚠️ 错误处理</h2>

          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded">
              <p className="font-mono font-bold mb-2">400 Bad Request</p>
              <p className="text-sm">
                请求参数无效，检查必填字段和数据格式
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded">
              <p className="font-mono font-bold mb-2">401 Unauthorized</p>
              <p className="text-sm">缺少或无效的认证令牌</p>
            </div>

            <div className="bg-red-50 p-4 rounded">
              <p className="font-mono font-bold mb-2">404 Not Found</p>
              <p className="text-sm">资源不存在或端点不存在</p>
            </div>

            <div className="bg-red-50 p-4 rounded">
              <p className="font-mono font-bold mb-2">500 Internal Server Error</p>
              <p className="text-sm">
                服务器错误，查看 CloudWatch 日志获取详细信息
              </p>
            </div>
          </div>
        </div>

        {/* Test Tools */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">🧪 测试工具</h2>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
              <p className="font-bold mb-1">cURL</p>
              <code className="block text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {`curl -X GET "http://localhost:3000/api/search/products?q=bolt"`}
              </code>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4">
              <p className="font-bold mb-1">Postman / Insomnia</p>
              <p className="text-sm">
                使用 REST 客户端工具导入 OpenAPI 规范文件（待实现）
              </p>
            </div>

            <div className="border-l-4 border-purple-500 bg-purple-50 p-4">
              <p className="font-bold mb-1">JavaScript Fetch</p>
              <code className="block text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {`fetch('/api/search/products?q=bolt')
  .then(r => r.json())
  .then(data => console.log(data))`}
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>WAIMO API 文档 v1.0</p>
          <p className="mt-2">
            详细文档请参考项目 README 和{' '}
            <a
              href="/docs"
              className="text-blue-600 hover:underline"
            >
              完整文档
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
