import { NextResponse } from 'next/server';
import { directus } from '@/lib/directus';
import { meilisearch } from '@/lib/meilisearch';
import { readItems } from '@directus/sdk';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  
  // Check Directus
  let directusOk = false;
  let directusLatency = -1;
  try {
    const dStart = Date.now();
    await directus.request(readItems('inquiries', { limit: 1, fields: ['id'] }));
    directusLatency = Date.now() - dStart;
    directusOk = true;
  } catch (e) {
    console.error('Directus Health Check Failed:', e);
  }

  // Check Meilisearch
  let meiliOk = false;
  let meiliLatency = -1;
  try {
    const mStart = Date.now();
    await meilisearch.health();
    meiliLatency = Date.now() - mStart;
    meiliOk = true;
  } catch (e) {
    console.error('Meilisearch Health Check Failed:', e);
  }

  return NextResponse.json({
    directus: { ok: directusOk, latency_ms: directusLatency },
    meilisearch: { ok: meiliOk, latency_ms: meiliLatency },
    timestamp: new Date().toISOString(),
  });
}
