'use client';

import { useEffect, useState } from 'react';

export default function ApiDocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">WAIMO API Reference</h1>
        <p className="mb-8 text-gray-600">
          API endpoints that power the WAIMO B2B industrial fastener platform.
        </p>

        <div className="mb-8 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">📚 API Endpoint Catalog</h2>

          {/* Search API */}
          <div className="mb-8 border-b pb-8">
            <div className="mb-4 flex items-center">
              <span className="mr-3 rounded bg-blue-100 px-3 py-1 font-mono font-bold text-blue-800">
                GET
              </span>
              <code className="font-mono text-lg">/api/search/products</code>
            </div>
            <p className="mb-3 text-gray-700">
              Search the product catalog with full text queries and faceted filters.
            </p>
            <div className="mb-3 rounded bg-gray-50 p-4">
              <p className="mb-2 font-semibold">Query parameters</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <code className="bg-gray-200 px-2 py-1">q</code> – Search keywords (required)
                </li>
                <li>
                  <code className="bg-gray-200 px-2 py-1">category</code> – Category filter
                </li>
                <li>
                  <code className="bg-gray-200 px-2 py-1">material</code> – Material filter
                </li>
                <li>
                  <code className="bg-gray-200 px-2 py-1">page</code> – Page index (default: 1)
                </li>
                <li>
                  <code className="bg-gray-200 px-2 py-1">limit</code> – Page size (default: 20)
                </li>
              </ul>
            </div>
            <p className="text-sm text-gray-600">
              Example:{' '}
              <code className="bg-gray-200 px-2 py-1">/api/search/products?q=bolt&category=fasteners</code>
            </p>
          </div>

          {/* Inquiries API */}
          <div className="mb-8 border-b pb-8">
            <div className="mb-4 flex items-center">
              <span className="mr-3 rounded bg-green-100 px-3 py-1 font-mono font-bold text-green-800">
                GET/POST
              </span>
              <code className="font-mono text-lg">/api/inquiries</code>
            </div>
            <p className="mb-3 text-gray-700">
              Manage customer RFQs with list + create operations and automatic email notifications.
            </p>

            <div className="mb-3 rounded bg-blue-50 p-4">
              <p className="mb-2 font-semibold">GET – Fetch all inquiries</p>
              <p className="text-sm text-gray-700">Returns a paginated list including status, contact, and items.</p>
            </div>

            <div className="rounded bg-green-50 p-4">
              <p className="mb-2 font-semibold">POST – Submit a new inquiry</p>
              <p className="mb-2 text-sm text-gray-700">
                Creates a customer RFQ and sends confirmation to both customer and internal reviewers.
              </p>
              <p className="rounded bg-gray-100 p-2 font-mono text-sm">
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
                {`  "special_requests": "Need PPAP L3 + black oxide"`}
                <br />
                {`}`}
              </p>
            </div>
          </div>

          {/* Inquiry Detail API */}
          <div className="mb-8 border-b pb-8">
            <div className="mb-4 flex items-center">
              <span className="mr-3 rounded bg-purple-100 px-3 py-1 font-mono font-bold text-purple-800">
                GET/PATCH/DELETE
              </span>
              <code className="font-mono text-lg">/api/inquiries/[id]</code>
            </div>
            <p className="mb-3 text-gray-700">
              Manage a single inquiry: update status, upload pricing, or remove obsolete entries.
            </p>
            <div className="rounded bg-gray-50 p-4 text-sm">
              <p>
                <strong>GET</strong> – Retrieve inquiry details
              </p>
              <p>
                <strong>PATCH</strong> – Update status, add quote references, or attach files
              </p>
              <p>
                <strong>DELETE</strong> – Remove an inquiry record
              </p>
            </div>
          </div>

          {/* Health API */}
          <div className="mb-8 border-b pb-8">
            <div className="mb-4 flex items-center">
              <span className="mr-3 rounded bg-amber-100 px-3 py-1 font-mono font-bold text-amber-800">GET</span>
              <code className="font-mono text-lg">/api/health</code>
            </div>
            <p className="text-gray-700">
              Lightweight readiness probe used by uptime monitors and container orchestration.
            </p>
          </div>

          {/* Reindex API */}
          <div className="mb-8 border-b pb-8">
            <div className="mb-4 flex items-center">
              <span className="mr-3 rounded bg-red-100 px-3 py-1 font-mono font-bold text-red-800">POST</span>
              <code className="font-mono text-lg">/api/reindex</code>
            </div>
            <p className="mb-3 text-gray-700">
              Rebuilds the Meilisearch index from Directus data. Requires admin authentication.
            </p>
            <p className="text-sm text-gray-600">
              Typical runs finish in 2–5 minutes depending on catalog size and queue load.
            </p>
          </div>

          {/* Directus Webhook */}
          <div>
            <div className="mb-4 flex items-center">
              <span className="mr-3 rounded bg-indigo-100 px-3 py-1 font-mono font-bold text-indigo-800">POST</span>
              <code className="font-mono text-lg">/api/webhook/directus</code>
            </div>
            <p className="mb-3 text-gray-700">
              Endpoint that receives Directus CMS webhooks to sync product changes back into search indices.
            </p>
            <p className="text-sm text-gray-600">Triggered automatically by Directus—manual calls are ignored.</p>
          </div>
        </div>

        {/* Auth & Headers */}
        <div className="mb-8 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">🔐 Authentication & Headers</h2>

          <div className="mb-6">
            <h3 className="mb-2 font-bold">Public endpoints (no auth)</h3>
            <ul className="list-inside list-disc space-y-1 text-gray-700">
              <li>/api/search/products – Product search</li>
              <li>/api/inquiries (POST) – Submit new RFQ</li>
              <li>/api/health – Health probe</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 font-bold">Protected endpoints</h3>
            <ul className="list-inside list-disc space-y-1 text-gray-700">
              <li>/api/inquiries (GET) – List inquiries</li>
              <li>/api/inquiries/[id] – Manage a single inquiry</li>
              <li>/api/reindex – Rebuild search index</li>
            </ul>
            <p className="mt-3 text-sm text-gray-600">
              Authenticate with a Directus admin account and provide an Authorization Bearer token.
            </p>
          </div>

          <div className="rounded bg-gray-50 p-4">
            <p className="mb-2 font-semibold">Sample headers</p>
            <div className="space-y-1 font-mono text-sm">
              <div>Content-Type: application/json</div>
              <div>Authorization: Bearer [DIRECTUS_TOKEN]</div>
            </div>
          </div>
        </div>

        {/* Error Handling */}
        <div className="mb-8 rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">⚠️ Error Handling</h2>

          <div className="space-y-4">
            <div className="rounded bg-red-50 p-4">
              <p className="mb-2 font-mono font-bold">400 Bad Request</p>
              <p className="text-sm">Invalid parameters—check required fields and data formats.</p>
            </div>
            <div className="rounded bg-red-50 p-4">
              <p className="mb-2 font-mono font-bold">401 Unauthorized</p>
              <p className="text-sm">Missing or invalid authentication token.</p>
            </div>
            <div className="rounded bg-red-50 p-4">
              <p className="mb-2 font-mono font-bold">404 Not Found</p>
              <p className="text-sm">The resource or endpoint does not exist.</p>
            </div>
            <div className="rounded bg-red-50 p-4">
              <p className="mb-2 font-mono font-bold">500 Internal Server Error</p>
              <p className="text-sm">Server-side failure—inspect logs (CloudWatch / Next.js) for detail.</p>
            </div>
          </div>
        </div>

        {/* Test Tools */}
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">🧪 Test Tools</h2>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
              <p className="mb-1 font-bold">cURL</p>
              <code className="block overflow-x-auto rounded bg-gray-100 p-2 text-xs">
                {`curl -X GET "http://localhost:3000/api/search/products?q=bolt"`}
              </code>
            </div>
            <div className="border-l-4 border-green-500 bg-green-50 p-4">
              <p className="mb-1 font-bold">Postman / Insomnia</p>
              <p className="text-sm">
                Import the REST endpoints above or hook up the forthcoming OpenAPI spec to share collections.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 bg-purple-50 p-4">
              <p className="mb-1 font-bold">JavaScript Fetch</p>
              <code className="block overflow-x-auto rounded bg-gray-100 p-2 text-xs">
                {`fetch('/api/search/products?q=bolt')\n  .then(r => r.json())\n  .then(data => console.log(data))`}
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>WAIMO API Reference v1.0</p>
          <p className="mt-2">
            For deeper integration guides please review the project README and{' '}
            <a href="/docs" className="text-blue-600 hover:underline">
              companion documentation
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

