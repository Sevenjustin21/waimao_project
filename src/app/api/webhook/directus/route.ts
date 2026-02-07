// 废弃文件说明：
// 已删除旧的 src/app/api/sync-product/route.ts
// 权威入口：src/app/api/webhook/directus/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { syncProduct, deleteProductIndex } from '@/lib/meilisearch';

export const runtime = 'nodejs';

const WEBHOOK_SECRET = process.env.DIRECTUS_WEBHOOK_SECRET;

interface DirectusWebhookPayload {
  event: string;
  collection: string;
  keys: string[];
}

export async function POST(req: NextRequest) {
  // 1. 严格安全校验
  const requestSecret = req.headers.get('x-webhook-secret');
  
  // 环境变量未配置或密钥不匹配，均拒绝
  if (!WEBHOOK_SECRET || requestSecret !== WEBHOOK_SECRET) {
    console.warn('Webhook unauthorized access attempt (or DIRECTUS_WEBHOOK_SECRET not set)');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json() as DirectusWebhookPayload;
    const { event, collection, keys } = body;

    // 2. 仅处理 products 集合
    if (collection !== 'products') {
      return NextResponse.json({ message: 'Ignored: Not a product event' }, { status: 200 });
    }

    // 3. 参数校验
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: 'Invalid payload: keys must be a non-empty array' }, { status: 400 });
    }

    console.log(`Webhook received: ${event} for ${keys.length} products`);

    // 4. 并发处理
    const results = await Promise.allSettled(keys.map(async (id) => {
      if (event === 'items.delete') {
        await deleteProductIndex(id);
      } else if (event === 'items.create' || event === 'items.update') {
        await syncProduct(id);
      } else {
        // 其他事件暂不处理，但也视为“成功忽略”
        return { action: 'ignored', id };
      }
      return { action: event, id };
    }));

    // 5. 结果统计
    const successItems: string[] = [];
    const failedItems: any[] = [];

    results.forEach((r, index) => {
      if (r.status === 'fulfilled') {
        successItems.push(keys[index]);
      } else {
        failedItems.push({ id: keys[index], reason: r.reason?.message || 'Unknown error' });
      }
    });

    if (failedItems.length > 0) {
      console.error('Webhook partial failure:', failedItems);
      return NextResponse.json({ 
        success: false, 
        count: keys.length,
        failed: failedItems,
        processed_ids: successItems
      }, { status: 207 });
    }

    return NextResponse.json({ 
      success: true, 
      count: keys.length,
      processed_ids: successItems
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
