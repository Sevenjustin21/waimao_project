import { directus } from '@/lib/directus';
import { readItems, readItem, updateItem } from '@directus/sdk';

export interface Inquiry {
  id: string;
  date_created: string;
  customer_name: string;
  email: string;
  company?: string;
  country?: string;
  status: 'new' | 'processing' | 'closed' | 'archived';
  app_user_id?: string;
  message?: string;
  items?: InquiryItem[];
}

export interface InquiryItem {
  id: string;
  product_id: string;
  quantity: number;
  remark?: string;
}

export async function getInquiries(limit = 50, status?: string, userId?: string) {
  const filter: Record<string, any> = {};
  if (status && status !== 'all') {
    filter.status = { _eq: status };
  }
  if (userId) {
    filter.app_user_id = { _eq: userId };
  }

  return directus.request(
    readItems('inquiries', {
      sort: ['-date_created'],
      limit,
      filter,
      fields: ['id', 'date_created', 'customer_name', 'email', 'company', 'country', 'status', 'message', 'app_user_id'],
    }),
  );
}

export async function getInquiry(id: string): Promise<Inquiry | null> {
  const inquiry = await directus.request(
    readItem('inquiries', id, {
      fields: ['*'],
    }),
  );

  if (!inquiry) return null;

  try {
    const items = await directus.request(
      readItems('inquiry_items', {
        filter: { inquiry_id: { _eq: id } },
        fields: ['*'],
      }),
    );
    return { ...inquiry, items } as Inquiry;
  } catch (error) {
    console.error('Failed to fetch inquiry items:', error);
    return { ...inquiry, items: [] } as Inquiry;
  }
}

export async function updateInquiryStatus(id: string, status: string) {
  return directus.request(
    updateItem('inquiries', id, {
      status,
    }),
  );
}
