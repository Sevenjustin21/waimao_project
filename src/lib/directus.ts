import 'server-only';
import { createDirectus, staticToken, rest } from '@directus/sdk';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || '';

// 定义 Directus Schema 类型（部分核心字段）
interface Schema {
  products: Product[];
  categories: Category[];
  attributes: Attribute[];
  product_attribute_values: ProductAttributeValue[];
  inquiries: Inquiry[];
  inquiry_items: InquiryItem[];
}

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category_id: string | Category; // 关联后是对象
  image_id?: string | DirectusFile; // New Field
  price_text?: string; // New Field
  moq?: number; // New Field
  lead_time_days?: number; // New Field
  material_summary?: string; // New Field
  attribute_values: number[] | ProductAttributeValue[]; // 关联后是对象数组
  status: string;
  date_created?: string;
  date_updated?: string;
  description?: string;
}

interface DirectusFile {
  id: string;
  filename_disk?: string;
  title?: string;
  type?: string;
  width?: number;
  height?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | Category;
  status?: string;
  date_created?: string;
  date_updated?: string;
}

interface Attribute {
  id: string;
  key: string;
  type: 'text' | 'number' | 'select';
  is_facet?: boolean;
}

interface ProductAttributeValue {
  id: number;
  product_id: string;
  attribute_id: string | Attribute;
  value_text?: string;
  value_number?: number;
}

interface Inquiry {
  id: string;
  customer_name: string;
  email: string;
  company?: string;
  country?: string;
  message?: string;
  items?: InquiryItem[];
  date_created?: string;
}

interface InquiryItem {
  id: string;
  inquiry_id: string;
  product_id?: string;
  quantity: number;
  remark?: string;
  target_price?: string;
}

// 初始化 Directus 客户端（使用 Admin Token 以便读取所有数据）
export const directus = createDirectus<Schema>(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_TOKEN))
  .with(rest());
