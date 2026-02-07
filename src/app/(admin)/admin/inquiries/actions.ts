'use server';

import { updateInquiryStatus } from '@/lib/inquiries';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function updateInquiryStatusAction(id: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  await updateInquiryStatus(id, status);
  revalidatePath('/admin/inquiries');
  revalidatePath(`/admin/inquiries/${id}`);
}
