import 'server-only';
import { MeiliSearch, EnqueuedTask } from 'meilisearch';
import { directus } from './directus';
import { readItems } from '@directus/sdk';

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_KEY = process.env.MEILI_MASTER_KEY || process.env.MEILISEARCH_MASTER_KEY || '';
const INDEX_NAME = 'products';
const ASSET_BASE = (process.env.NEXT_PUBLIC_ASSET_BASE_URL || '/api/assets').replace(/\/$/, '');
const PRODUCT_FIELDS = [
  'id',
  'sku',
  'name',
  'slug',
  'status',
  'category_id',
  'image_id',
];

// 接口定义
interface DirectusAttribute {
  key: string;
  type: 'text' | 'number' | 'select';
  is_facet?: boolean;
}

interface DirectusProductAttributeValue {
  attribute_id: DirectusAttribute | string;
  value_text?: string | null;
  value_number?: number | null;
}

interface AttributeValueRecord {
  product_id: string;
  attribute_id?: string | null;
  value_text?: string | null;
  value_number?: number | null;
}

interface DirectusProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  status: string;
  category_id?: string | { id?: string; name?: string; slug?: string } | null;
  image_id?: string | { id?: string | null } | null;
  attribute_values?: DirectusProductAttributeValue[];
}

export interface ProductDocument {
  id: string;
  sku: string;
  name: string;
  slug: string;
  category_slug: string | null;
  category_name: string | null;
  image_url: string | null;
  [key: string]: string | number | null; // 用于 attr_<key> 动态字段
}

export const meilisearch = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_KEY,
});

/**
 * 辅助函数：等待 Meilisearch 任务完成并检查错误
 */
async function waitForTaskCompletion(task: EnqueuedTask): Promise<void> {
  const index = meilisearch.index(INDEX_NAME);
  try {
    const finalTask = await index.waitForTask(task.taskUid);
    if (finalTask.status !== 'succeeded') {
      console.error(`Meilisearch task failed: ${finalTask.error?.message}`, finalTask);
      throw new Error(`Meilisearch task failed: ${finalTask.error?.message}`);
    }
  } catch (error) {
    console.error(`Failed to wait for task ${task.taskUid}:`, error);
    throw error;
  }
}

/**
 * 辅助函数：动态生成 filterableAttributes
 */
async function getDynamicFilterableAttributes(): Promise<string[]> {
  const attributes = ['category_slug']; // 基础必选字段

  try {
    const facets = await directus.request(
      readItems('attributes', {
        filter: { is_facet: { _eq: true } },
        fields: ['key'],
        limit: -1, // 获取所有
      })
    );

    if (Array.isArray(facets)) {
      facets.forEach((f: any) => {
        if (f.key) {
          attributes.push(`attr_${f.key}`);
        }
      });
    }
  } catch (error) {
    console.error('Failed to fetch dynamic facets from Directus, using defaults:', error);
    // 即使失败，也返回基础字段，防止索引设置被清空
  }

  return attributes;
}

/**
 * 将 Directus 产品数据转换为 Meilisearch 扁平化文档
 */
interface TransformContext {
  categories: Map<string, { id: string; name?: string | null; slug?: string | null }>;
  attributes: Map<string, DirectusAttribute>;
  attributeValues: Map<string, AttributeValueRecord[]>;
}

function transformProductToDocument(
  product: DirectusProduct,
  context?: TransformContext
): ProductDocument {
  const imageId =
    typeof product.image_id === 'object' && product.image_id !== null
      ? product.image_id.id ?? null
      : (product.image_id as string);

  const resolvedCategory =
    typeof product.category_id === 'object' && product.category_id !== null
      ? product.category_id
      : (typeof product.category_id === 'string' && context?.categories.get(product.category_id)) || null;

  const doc: ProductDocument = {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    category_slug: (resolvedCategory as any)?.slug || null,
    category_name: (resolvedCategory as any)?.name || null,
    image_url: imageId ? `${ASSET_BASE}/${imageId}` : null,
  };

  const appendAttribute = (
    attr: DirectusAttribute | undefined | null,
    value: { value_text?: string | null; value_number?: number | null }
  ) => {
    if (!attr?.key) return;
    const finalKey = `attr_${attr.key}`;
    if (attr.type === 'number') {
      doc[finalKey] = value.value_number ?? null;
    } else {
      doc[finalKey] = value.value_text ?? null;
    }
  };

  if (Array.isArray(product.attribute_values)) {
    product.attribute_values.forEach((pav) => {
      if (!pav.attribute_id) return;
      if (typeof pav.attribute_id === 'object') {
        appendAttribute(pav.attribute_id, pav);
      } else if (context?.attributes) {
        appendAttribute(context.attributes.get(pav.attribute_id), pav);
      }
    });
  }

  const extraValues = context?.attributeValues.get(product.id) || [];
  extraValues.forEach((record) => {
    if (!record.attribute_id) return;
    appendAttribute(context?.attributes.get(record.attribute_id), record);
  });

  return doc;
}

async function buildTransformContext(products: DirectusProduct[]): Promise<TransformContext> {
  const context: TransformContext = {
    categories: new Map(),
    attributes: new Map(),
    attributeValues: new Map(),
  };

  if (products.length === 0) {
    return context;
  }

  const productIds = products.map((product) => product.id);

  const categoryIdSet = new Set<string>();
  products.forEach((product) => {
    if (!product.category_id) return;
    if (typeof product.category_id === 'string') {
      categoryIdSet.add(product.category_id);
    } else if (product.category_id.id) {
      categoryIdSet.add(product.category_id.id);
    }
  });

  const [categoryRecords, attributeValueRecords] = await Promise.all([
    categoryIdSet.size
      ? directus.request(
          readItems('categories', {
            filter: { id: { _in: Array.from(categoryIdSet) } } as any,
            fields: ['id', 'name', 'slug'] as any,
            limit: -1,
          })
        )
      : Promise.resolve([]),
    directus.request(
      readItems('product_attribute_values', {
        filter: { product_id: { _in: productIds } } as any,
        fields: ['product_id', 'attribute_id', 'value_text', 'value_number'] as any,
        limit: -1,
      })
    ),
  ]);

  (categoryRecords as any[]).forEach((cat) => {
    if (cat?.id) {
      context.categories.set(cat.id, cat);
    }
  });

  const attributeValueList: AttributeValueRecord[] = Array.isArray(attributeValueRecords)
    ? attributeValueRecords.map((record: any) => ({
        product_id: record.product_id,
        attribute_id: record.attribute_id ?? null,
        value_text: record.value_text ?? null,
        value_number: record.value_number ?? null,
      }))
    : [];
  const attributeIdSet = new Set<string>();
  attributeValueList.forEach((record) => {
    if (record.attribute_id) {
      attributeIdSet.add(record.attribute_id);
    }
    if (record.product_id) {
      if (!context.attributeValues.has(record.product_id)) {
        context.attributeValues.set(record.product_id, []);
      }
      context.attributeValues.get(record.product_id)!.push(record);
    }
  });

  if (attributeIdSet.size) {
    const attributes = await directus.request(
      readItems('attributes', {
        filter: { id: { _in: Array.from(attributeIdSet) } } as any,
        fields: ['id', 'key', 'type'] as any,
        limit: -1,
      })
    );

    (attributes as any[]).forEach((attr) => {
      if (attr?.id) {
        context.attributes.set(attr.id, attr);
      }
    });
  }

  return context;
}

/**
 * 同步单个产品
 * - 如果产品不存在或非 published，则删除索引
 * - 否则添加/更新索引
 * - 必须等待任务完成
 */
export async function syncProduct(productId: string): Promise<void> {
  const index = meilisearch.index(INDEX_NAME);

  try {
    const items = await directus.request(
      readItems('products', {
        filter: { id: { _eq: productId } },
        fields: PRODUCT_FIELDS as any,
        limit: 1,
      })
    );

    const product = (items as unknown as DirectusProduct[])[0];

    // 判断是否需要删除
    if (!product || product.status !== 'published') {
      const task = await index.deleteDocument(productId);
      await waitForTaskCompletion(task);
      console.log(`Product ${productId} removed from index.`);
      return;
    }

    const context = await buildTransformContext([product]);
    // 转换并更新
    const doc = transformProductToDocument(product, context);
    const task = await index.addDocuments([doc]);
    await waitForTaskCompletion(task);
    console.log(`Product ${productId} synced successfully.`);

  } catch (error) {
    console.error(`Error syncing product ${productId}:`, error);
    throw error;
  }
}

/**
 * 全量重建索引
 * - 清空所有文档
 * - 动态更新 Settings (filterableAttributes)
 * - 批量拉取并重建
 * - 返回重建的总文档数
 */
export async function rebuildIndex(): Promise<number> {
  const index = meilisearch.index(INDEX_NAME);
  console.log('Starting full reindex...');

  try {
    // 0. 确保索引存在
    try {
      await meilisearch.getIndex(INDEX_NAME);
    } catch (e: any) {
      if (e.code === 'index_not_found') {
        console.log('Index not found, creating...');
        const task = await meilisearch.createIndex(INDEX_NAME, { primaryKey: 'id' });
        await waitForTaskCompletion(task);
      }
    }

    // 1. 清空旧索引
    console.log('Clearing existing documents...');
    const clearTask = await index.deleteAllDocuments();
    await waitForTaskCompletion(clearTask);

    // 2. 动态获取并更新 Settings
    console.log('Fetching dynamic filterable attributes...');
    const dynamicAttributes = await getDynamicFilterableAttributes();
    console.log('Updating index settings with:', dynamicAttributes);
    
    const settingsTask = await index.updateFilterableAttributes(dynamicAttributes);
    await waitForTaskCompletion(settingsTask);
    
    // 3. 批量同步
    const BATCH_SIZE = 100;
    let offset = 0;
    let totalSynced = 0;
    
    while (true) {
      const items = await directus.request(
        readItems('products', {
          filter: { status: { _eq: 'published' } },
          fields: PRODUCT_FIELDS as any,
          limit: BATCH_SIZE,
          offset: offset,
        })
      );

      const products = items as unknown as DirectusProduct[];

      if (products.length === 0) break;

      const context = await buildTransformContext(products);
      const documents = products.map((product) => transformProductToDocument(product, context));
      
      const batchTask = await index.addDocuments(documents);
      await waitForTaskCompletion(batchTask);
      
      totalSynced += documents.length;
      offset += BATCH_SIZE;
      console.log(`Synced batch: ${documents.length}, Total: ${totalSynced}`);
    }
    
    console.log(`Full reindex completed. Total documents: ${totalSynced}`);
    return totalSynced;

  } catch (error) {
    console.error('Full reindex failed:', error);
    throw error;
  }
}

/**
 * 仅删除索引 (供 Webhook 删除事件使用)
 */
export async function deleteProductIndex(productId: string): Promise<void> {
  const index = meilisearch.index(INDEX_NAME);
  try {
    const task = await index.deleteDocument(productId);
    await waitForTaskCompletion(task);
    console.log(`Product ${productId} delete task completed.`);
  } catch (error) {
    console.error(`Failed to delete product ${productId}:`, error);
    throw error;
  }
}

const NUMERIC_FILTER_REGEX = /^-?\d+(\.\d+)?$/;

function formatFilterValue(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw.toString();
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (NUMERIC_FILTER_REGEX.test(trimmed)) {
      return trimmed;
    }
    const escaped = trimmed.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${escaped}"`;
  }
  return null;
}

/**
 * 搜索产品
 * - 封装了 filter 构建逻辑
 * - 返回统一的搜索结果结构
 */
export interface SearchProductsParams {
  q?: string;
  page?: number;
  pageSize?: number;
  category?: string;
  filters?: string; // JSON string
  sort?: string;
}

export interface SearchProductsResult {
  hits: ProductDocument[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  facets: Record<string, Record<string, number>>;
}

export async function searchProducts(params: SearchProductsParams): Promise<SearchProductsResult> {
  const index = meilisearch.index(INDEX_NAME);
  
  // 1. 参数默认值与校验
  const q = params.q || '';
  const page = (params.page && params.page > 0) ? params.page : 1;
  const pageSize = (params.pageSize && params.pageSize > 0) ? 
    (params.pageSize > 50 ? 50 : params.pageSize) : 20;

  // 2. 构建 Filter 语句
  const filterConditions: string[] = [];

  // 2.1 Category 过滤
  if (params.category) {
    const categoryValue = formatFilterValue(params.category);
    if (categoryValue) {
      filterConditions.push(`category_slug = ${categoryValue}`);
    }
  }

  // 2.2 动态 Filters 解析与校验
  if (params.filters) {
    let filtersObj: any;
    try {
      filtersObj = JSON.parse(params.filters);
    } catch (e) {
      throw new Error('INVALID_FILTERS_JSON');
    }
      
    if (typeof filtersObj !== 'object' || filtersObj === null || Array.isArray(filtersObj)) {
      throw new Error('INVALID_FILTERS_FORMAT');
    }

    for (const [key, values] of Object.entries(filtersObj)) {
      // 安全校验：只允许 category_slug 或 attr_ 开头的字段
      if (key === 'category_slug' || key.startsWith('attr_')) {
        if (Array.isArray(values) && values.length > 0) {
          const sanitizedValues = values
            .map((v: string | number) => formatFilterValue(v))
            .filter((v): v is string => Boolean(v));

          if (sanitizedValues.length === 0) {
            continue;
          }

          const orConditions = sanitizedValues
            .map((v) => `${key} = ${v}`)
            .join(' OR ');
          filterConditions.push(`(${orConditions})`);
        }
      } else {
         console.warn(`Ignored invalid filter key: ${key}`);
      }
    }
  }

  const filterString = filterConditions.join(' AND ');

  // 3. 执行搜索
  try {
    const searchResult = await index.search(q, {
      filter: filterString || undefined,
      sort: params.sort ? [params.sort] : undefined,
      hitsPerPage: pageSize,
      page: page,
      facets: ['*'], // Meilisearch v1.x / JS v0.40.0+ uses 'facets' to request distribution
    });

    // 4. 返回结果
    return {
      hits: searchResult.hits as ProductDocument[],
      page: searchResult.page || 1,
      pageSize: searchResult.hitsPerPage,
      total: searchResult.totalHits || 0,
      totalPages: searchResult.totalPages || 0,
      facets: searchResult.facetDistribution || {}, // Response is 'facetDistribution'
    };
  } catch (error) {
    console.error('Meilisearch search failed:', error);
    throw error;
  }
}
