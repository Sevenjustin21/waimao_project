import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/meilisearch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // 1. 解析参数
    const q = searchParams.get('q') || undefined;
    const pageStr = searchParams.get('page');
    const pageSizeStr = searchParams.get('pageSize');
    const category = searchParams.get('category') || undefined;
    const filters = searchParams.get('filters') || undefined;
    const sort = searchParams.get('sort') || undefined;

    const page = pageStr ? parseInt(pageStr, 10) : undefined;
    const pageSize = pageSizeStr ? parseInt(pageSizeStr, 10) : undefined;

    // 2. 调用核心搜索逻辑
    const result = await searchProducts({
      q,
      page,
      pageSize,
      category,
      filters,
      sort
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });

  } catch (error: any) {
    console.error('Search API error:', error);
    
    if (error.message === 'INVALID_FILTERS_JSON' || error.message === 'INVALID_FILTERS_FORMAT') {
      return NextResponse.json({ 
        error: 'Bad Request',
        message: error.message
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
