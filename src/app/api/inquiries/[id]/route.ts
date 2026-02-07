import { NextResponse } from 'next/server';
import { directus } from '@/lib/directus';
import { readItem } from '@directus/sdk';
import { withSecurityContext } from '@/lib/security-context';

export const dynamic = 'force-dynamic';
const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || '';

export const GET = withSecurityContext(async ({ req, params }) => {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : authHeader?.trim();
    if (!ADMIN_API_SECRET || token !== ADMIN_API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params?.id;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid inquiry ID' },
        { status: 400 }
      );
    }

    const inquiry = await directus.request(
      readItem('inquiries', id, {
        fields: [
          'id',
          'status',
          'date_created',
          'customer_name',
          'email',
          'company',
          'country',
          'message',
          { items: ['*'] },
        ] as any,
      })
    );

    if (!inquiry) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(inquiry);
  } catch (error: any) {
    console.error('Get inquiry error:', error);
    
    // Check if it's a 404 from Directus
    if (error?.status === 404 || error?.errors?.[0]?.extensions?.code === 'RECORD_NOT_FOUND') {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
});
