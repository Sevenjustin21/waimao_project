import { NextResponse } from 'next/server';
import { rebuildIndex } from '@/lib/meilisearch';
import { withSecurityContext } from '@/lib/security-context';

export const runtime = 'nodejs';

export const POST = withSecurityContext(async ({ req, context }) => {
  // 1. 安全校验 (Session Check OR Secret Key)
  const session = context.session;
  const authHeader = req.headers.get('authorization');
  const secret = process.env.ADMIN_API_SECRET;
  
  const isSessionAdmin = session?.user?.role === 'ADMIN';
  const isSecretValid = secret && authHeader === `Bearer ${secret}`;

  if (!isSessionAdmin && !isSecretValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. 调用重建逻辑，获取总数
    const total = await rebuildIndex();

    return NextResponse.json({ 
      success: true, 
      total: total
    });

  } catch (error: any) {
    console.error('Reindex API failed:', error);
    // 返回通用错误信息，避免泄露内部细节
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error?.message || 'Unknown error occurred during reindexing'
    }, { status: 500 });
  }
});
