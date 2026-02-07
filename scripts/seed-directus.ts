import { createDirectus, rest, staticToken, createItem, createItems, readItems, updateItem } from '@directus/sdk';
import dotenv from 'dotenv';

// Load unified .env for local development
dotenv.config({ path: '.env' });

// -----------------------------------------------------------------------------
// 配置
// -----------------------------------------------------------------------------
// 1) 禁止使用 NEXT_PUBLIC_* (仅后端使用)
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

// New optional env vars for reindexing
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET;

// 4) 若 DIRECTUS_ADMIN_TOKEN 缺失，退出码为 1
if (!DIRECTUS_TOKEN) {
  console.error('❌ Error: DIRECTUS_ADMIN_TOKEN environment variable is missing.');
  console.error('Please set it before running the script.');
  console.error('Example: set DIRECTUS_ADMIN_TOKEN=your-token && npm run seed:directus');
  process.exit(1);
}

// 3) 日志不得打印 token 明文
console.log(`🚀 Starting data seed...`);
console.log(`Target Directus URL: ${DIRECTUS_URL}`);
// Secure: Token is NOT logged

const client = createDirectus(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_TOKEN))
  .with(rest());

// -----------------------------------------------------------------------------
// 数据定义
// -----------------------------------------------------------------------------

const CATEGORIES = [
  { name: 'Industrial Fasteners', slug: 'industrial-fasteners', parent_slug: null },
  { name: 'Bolts', slug: 'bolts', parent_slug: 'industrial-fasteners' },
  { name: 'Screws', slug: 'screws', parent_slug: 'industrial-fasteners' },
  { name: 'Nuts', slug: 'nuts', parent_slug: 'industrial-fasteners' },
  { name: 'Washers', slug: 'washers', parent_slug: 'industrial-fasteners' },
];

const ATTRIBUTES = [
  { name: 'Material', key: 'material', type: 'text', is_facet: true },
  { name: 'Standard', key: 'standard', type: 'text', is_facet: true },
  { name: 'Diameter', key: 'diameter', type: 'text', is_facet: true },
  { name: 'Length', key: 'length', type: 'number', is_facet: true }, // mm
  { name: 'Grade', key: 'grade', type: 'text', is_facet: true },
  { name: 'Thread Type', key: 'thread_type', type: 'text', is_facet: true },
];

// 产品数据 (工业紧固件 10 个)
const PRODUCTS_DATA = [
  {
    name: 'Hex Head Bolt DIN 933 M8 x 40',
    slug: 'hex-head-bolt-din933-m8-40-ss304',
    sku: 'DIN933-M8-40-SS304',
    category_slug: 'bolts',
    attrs: {
      material: 'SS304',
      standard: 'DIN 933',
      diameter: 'M8',
      length: 40,
      grade: 'A2-70',
      thread_type: 'Metric'
    }
  },
  {
    name: 'Hex Head Bolt ISO 4017 M10 x 50',
    slug: 'hex-head-bolt-iso4017-m10-50-ss316',
    sku: 'ISO4017-M10-50-SS316',
    category_slug: 'bolts',
    attrs: {
      material: 'SS316',
      standard: 'ISO 4017',
      diameter: 'M10',
      length: 50,
      grade: 'A4-80',
      thread_type: 'Metric'
    }
  },
  {
    name: 'Hex Nut DIN 934 M8',
    slug: 'hex-nut-din934-m8-ss304',
    sku: 'DIN934-M8-SS304',
    category_slug: 'nuts',
    attrs: {
      material: 'SS304',
      standard: 'DIN 934',
      diameter: 'M8',
      grade: 'A2-70',
      thread_type: 'Metric'
    }
  },
  {
    name: 'Flat Washer DIN 125 M10',
    slug: 'flat-washer-din125-m10-ss316',
    sku: 'DIN125-M10-SS316',
    category_slug: 'washers',
    attrs: {
      material: 'SS316',
      standard: 'DIN 125',
      diameter: 'M10',
      grade: 'A4'
    }
  },
  {
    name: 'Socket Head Cap Screw DIN 912 M6 x 20',
    slug: 'socket-head-cap-screw-din912-m6-20-cs',
    sku: 'DIN912-M6-20-CS',
    category_slug: 'screws',
    attrs: {
      material: 'Carbon Steel',
      standard: 'DIN 912',
      diameter: 'M6',
      length: 20,
      grade: '12.9',
      thread_type: 'Metric'
    }
  },
  {
    name: 'Carriage Bolt DIN 603 M10 x 60',
    slug: 'carriage-bolt-din603-m10-60-cs',
    sku: 'DIN603-M10-60-CS',
    category_slug: 'bolts',
    attrs: {
      material: 'Carbon Steel',
      standard: 'DIN 603',
      diameter: 'M10',
      length: 60,
      grade: '8.8'
    }
  },
  {
    name: 'Nylon Lock Nut DIN 985 M8',
    slug: 'nylon-lock-nut-din985-m8-ss304',
    sku: 'DIN985-M8-SS304',
    category_slug: 'nuts',
    attrs: {
      material: 'SS304',
      standard: 'DIN 985',
      diameter: 'M8',
      grade: 'A2-70'
    }
  },
  {
    name: 'Threaded Rod DIN 975 M12 x 1000',
    slug: 'threaded-rod-din975-m12-1000-ss304',
    sku: 'DIN975-M12-1000-SS304',
    category_slug: 'bolts',
    attrs: {
      material: 'SS304',
      standard: 'DIN 975',
      diameter: 'M12',
      length: 1000
    }
  },
  {
    name: 'Spring Washer DIN 127 M12',
    slug: 'spring-washer-din127-m12-cs',
    sku: 'DIN127-M12-CS',
    category_slug: 'washers',
    attrs: {
      material: 'Carbon Steel',
      standard: 'DIN 127',
      diameter: 'M12',
      grade: 'Spring Steel'
    }
  },
  {
    name: 'Machine Screw DIN 7985 M4 x 10',
    slug: 'machine-screw-din7985-m4-10-ss304',
    sku: 'DIN7985-M4-10-SS304',
    category_slug: 'screws',
    attrs: {
      material: 'SS304',
      standard: 'DIN 7985',
      diameter: 'M4',
      length: 10,
      grade: 'A2-70'
    }
  }
];

// ---------------------------------------------------------------------------
// 数据安全校验：防止无意识引入真实邮箱/手机号/人名
// ---------------------------------------------------------------------------
const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_REGEX = /\+?\d[\d\s\-()]{6,}\d/;

function ensureNoPii(value: unknown, path: string) {
  if (typeof value !== 'string') return;

  if (EMAIL_REGEX.test(value)) {
    throw new Error(`Seed data contains email-like value at ${path}: ${value}`);
  }
  if (PHONE_REGEX.test(value)) {
    throw new Error(`Seed data contains phone-like value at ${path}: ${value}`);
  }
}

function walkSeedPayload(payload: unknown, path: string) {
  if (payload === null || payload === undefined) {
    return;
  }

  if (Array.isArray(payload)) {
    payload.forEach((item, index) => walkSeedPayload(item, `${path}[${index}]`));
    return;
  }

  if (typeof payload === 'object') {
    Object.entries(payload as Record<string, unknown>).forEach(([key, val]) => {
      walkSeedPayload(val, `${path}.${key}`);
    });
    return;
  }

  ensureNoPii(payload, path);
}

function validateSeedDataset() {
  walkSeedPayload(CATEGORIES, 'CATEGORIES');
  walkSeedPayload(ATTRIBUTES, 'ATTRIBUTES');
  walkSeedPayload(PRODUCTS_DATA, 'PRODUCTS_DATA');
}

validateSeedDataset();

// -----------------------------------------------------------------------------
// 辅助函数
// -----------------------------------------------------------------------------

async function preflight() {
  console.log('📡 Running preflight checks...');

  // 1. Directus Check
  const pingUrl = `${DIRECTUS_URL}/server/ping`;
  try {
    const res = await fetch(pingUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const text = await res.text();
    // /server/ping returns "pong"
    if (!text.includes('pong')) {
       console.warn(`   ⚠️ Directus reachable but returned: ${text.substring(0, 50)}`);
    } else {
       console.log(`   ✅ Directus is reachable at ${DIRECTUS_URL}`);
    }
  } catch (err) {
    console.error(`   ❌ Directus is NOT reachable at ${DIRECTUS_URL}`);
    console.error(`   Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  // 2. Meilisearch Check (Optional)
  const meiliHost = process.env.MEILISEARCH_HOST;
  if (meiliHost) {
    try {
      const res = await fetch(`${meiliHost}/health`);
      if (res.ok) {
        console.log(`   ✅ Meilisearch is reachable at ${meiliHost}`);
      } else {
        console.warn(`   ⚠️ Meilisearch reachable but returned ${res.status}`);
      }
    } catch (err) {
      console.warn(`   ⚠️ Meilisearch NOT reachable at ${meiliHost} (skipping check)`);
    }
  } else {
    console.log('   ℹ️ MEILISEARCH_HOST not set, skipping search check.');
  }
}

async function triggerReindex() {
  if (!ADMIN_API_SECRET) {
    console.log('   ℹ️ Skip reindex (ADMIN_API_SECRET not set)');
    return;
  }

  const reindexUrl = `${APP_URL}/api/reindex`;
  console.log(`🔄 Triggering Meilisearch reindex at ${reindexUrl}...`);

  try {
    const res = await fetch(reindexUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_API_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`   ⚠️ Reindex failed with status: ${res.status} ${res.statusText}`);
      // Log response body safely
      try {
        const body = await res.text();
        console.warn(`   Response: ${body.substring(0, 200)}...`);
      } catch(e) {}
    } else {
      const json = await res.json();
      console.log(`   ✅ Reindex triggered successfully! Total documents: ${json.total}`);
    }
  } catch (error) {
    console.error('   ⚠️ Failed to reach reindex API:', error instanceof Error ? error.message : String(error));
  }
}

// -----------------------------------------------------------------------------
// 主逻辑
// -----------------------------------------------------------------------------

async function seed() {
  await preflight();

  try {
    // 1. Categories
    console.log('📦 Seeding Categories...');
    const catMap = new Map<string, string>(); // slug -> id
    
    // 查询现有 categories
    const existingCats = await client.request(readItems('categories', { limit: -1 }));
    for (const cat of existingCats) {
      if (cat.slug) {
        catMap.set(cat.slug, cat.id);
      }
    }

    // 1.1 Create all categories (ignoring parent_id first)
    for (const catData of CATEGORIES) {
      if (!catMap.has(catData.slug)) {
        const payload = {
            name: catData.name,
            slug: catData.slug,
            status: 'published'
        };
        const newCat = await client.request(createItem('categories', payload));
        catMap.set(newCat.slug, newCat.id);
        console.log(`   + Created category: ${catData.slug}`);
      } else {
        console.log(`   = Category exists: ${catData.slug}`);
      }
    }

    // 1.2 Update hierarchy
    console.log('   🔗 Linking Category Hierarchy...');
    for (const catData of CATEGORIES) {
      if (catData.parent_slug) {
        const childId = catMap.get(catData.slug);
        const parentId = catMap.get(catData.parent_slug);
        
        if (childId && parentId) {
             // 检查是否需要更新 parent_id
             const existing = existingCats.find((c: any) => c.slug === catData.slug);
             // 如果是新创建的或者 parent_id 不对，则更新 (注意：existingCats 是旧数据，如果是新创建的 category，existing 为 undefined)
             if (!existing || existing.parent_id !== parentId) {
                 await client.request(updateItem('categories', childId, { parent_id: parentId }));
                 console.log(`     > Linked ${catData.slug} -> ${catData.parent_slug}`);
             }
        }
      }
    }

    // 2. Attributes
    console.log('🏷️ Seeding Attributes...');
    const attrMap = new Map<string, any>(); // key -> { id, type }

    const existingAttrs = await client.request(readItems('attributes', { limit: -1 }));
    for (const attr of existingAttrs) {
      if (attr.key) {
        attrMap.set(attr.key, { id: attr.id, type: attr.type });
      }
    }

    const newAttrs = ATTRIBUTES.filter(a => !attrMap.has(a.key));
    if (newAttrs.length > 0) {
      const createdAttrs = await client.request(createItems('attributes', newAttrs));
      createdAttrs.forEach((a: any) => attrMap.set(a.key, { id: a.id, type: a.type }));
      console.log(`   + Created ${newAttrs.length} attributes`);
    } else {
      console.log('   = All attributes already exist');
    }

    // 3. Products & PAVs
    console.log('🔩 Seeding Products & Values...');
    
    // 查询所有 SKU 去重
    const existingProducts = await client.request(readItems('products', { 
      fields: ['sku'], 
      limit: -1 
    }));
    const existingSkus = new Set(existingProducts.map((p: any) => p.sku));

    let createdCount = 0;
    let skippedCount = 0;

    for (const pData of PRODUCTS_DATA) {
      if (existingSkus.has(pData.sku)) {
        console.log(`   - Skipped existing product: ${pData.sku}`);
        skippedCount++;
        continue;
      }

      // Create Product
      const catId = catMap.get(pData.category_slug);
      if (!catId) {
        console.warn(`   ! Category not found for ${pData.sku}: ${pData.category_slug}`);
        continue;
      }

      const productPayload = {
        status: 'published',
        name: pData.name,
        slug: pData.slug,
        sku: pData.sku,
        category_id: catId
      };

      // createItem 返回单个对象
      const product = await client.request(createItem('products', productPayload));
      const productId = product.id; 

      // Create PAVs
      const pavs = [];
      for (const [key, val] of Object.entries(pData.attrs)) {
        const attrInfo = attrMap.get(key);
        if (!attrInfo) {
          console.warn(`   ! Attribute not found: ${key}`);
          continue;
        }

        const pav: any = {
          product_id: productId,
          attribute_id: attrInfo.id
        };

        if (attrInfo.type === 'number') {
          pav.value_number = val;
        } else {
          pav.value_text = String(val);
        }
        pavs.push(pav);
      }

      if (pavs.length > 0) {
        await client.request(createItems('product_attribute_values', pavs));
      }
      
      console.log(`   + Created product: ${pData.sku}`);
      createdCount++;
    }

    console.log('------------------------------------------------');
    console.log(`✅ Seed completed! Created: ${createdCount}, Skipped: ${skippedCount}`);
    console.log('------------------------------------------------');
    
    // Auto-trigger reindex
    await triggerReindex();

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
