import { NextRequest, NextResponse } from 'next/server';
import { directus } from '@/lib/directus';
import { updateItem } from '@directus/sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Check Authorization (Session)
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!['new', 'processing', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await directus.request(updateItem('inquiries', id, { status }));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
