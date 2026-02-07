import { config } from 'dotenv';
import path from 'path';
import { createDirectus, staticToken, rest, readItems } from '@directus/sdk';
import { MeiliSearch } from 'meilisearch';

// Load .env
config({ path: path.resolve(__dirname, '../.env') });

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || '';
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_KEY = process.env.MEILI_MASTER_KEY || process.env.MEILISEARCH_MASTER_KEY || '';
const INDEX_NAME = 'products';

if (!DIRECTUS_TOKEN) {
  console.error('DIRECTUS_ADMIN_TOKEN is missing');
  process.exit(1);
}

const directus = createDirectus(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_TOKEN))
  .with(rest());

const meilisearch = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_KEY,
});

async function waitForTaskCompletion(task: any) {
  const index = meilisearch.index(INDEX_NAME);
  try {
    const finalTask = await index.waitForTask(task.taskUid);
    if (finalTask.status !== 'succeeded') {
      throw new Error(`Meilisearch task failed: ${finalTask.error?.message}`);
    }
  } catch (error) {
    throw error;
  }
}

async function getDynamicFilterableAttributes() {
  const attributes = ['category_slug']; 
  try {
    const facets = await directus.request(
      readItems('attributes', {
        filter: { is_facet: { _eq: true } },
        fields: ['key'],
        limit: -1,
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
  }
  return attributes;
}

function transformProductToDocument(product: any) {
  const imageId = typeof product.image_id === 'object' && product.image_id !== null 
    ? product.image_id.id 
    : (product.image_id as string);

  const doc: any = {
    id: product.id,
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    category_slug: product.category_id?.slug || null,
    category_name: product.category_id?.name || null,
    image_url: imageId 
      ? `${DIRECTUS_URL}/assets/${imageId}` 
      : null,
  };

  if (product.attribute_values && Array.isArray(product.attribute_values)) {
    product.attribute_values.forEach((pav: any) => {
      if (pav.attribute_id && typeof pav.attribute_id === 'object') {
        const attrKey = pav.attribute_id.key;
        const attrType = pav.attribute_id.type;
        const finalKey = `attr_${attrKey}`;

        if (attrType === 'number') {
          doc[finalKey] = pav.value_number ?? null;
        } else {
          doc[finalKey] = pav.value_text ?? null;
        }
      }
    });
  }

  return doc;
}

async function run() {
  console.log('Starting full reindex (Script Mode)...');
  console.log(`Directus: ${DIRECTUS_URL}`);
  console.log(`Meilisearch: ${MEILISEARCH_HOST}`);

  try {
    // 0. Ensure Index
    try {
      await meilisearch.getIndex(INDEX_NAME);
    } catch (e: any) {
      if (e.code === 'index_not_found') {
        console.log('Index not found, creating...');
        const task = await meilisearch.createIndex(INDEX_NAME, { primaryKey: 'id' });
        await waitForTaskCompletion(task);
      }
    }

    // 1. Clear documents
    console.log('Clearing existing documents...');
    const index = meilisearch.index(INDEX_NAME);
    const clearTask = await index.deleteAllDocuments();
    await waitForTaskCompletion(clearTask);

    // 2. Settings
    console.log('Fetching dynamic filterable attributes...');
    const dynamicAttributes = await getDynamicFilterableAttributes();
    console.log('Updating index settings with:', dynamicAttributes);
    
    const settingsTask = await index.updateFilterableAttributes(dynamicAttributes);
    await waitForTaskCompletion(settingsTask);

    // 3. Batch Sync
    const BATCH_SIZE = 100;
    let offset = 0;
    let totalSynced = 0;

    while (true) {
      const items = await directus.request(
        readItems('products', {
          filter: { status: { _eq: 'published' } },
          fields: [
            'id', 'sku', 'name', 'slug', 'status',
            { category_id: ['name', 'slug'] },
            { image_id: ['id'] },
            { 
              attribute_values: [
                'value_text', 
                'value_number',
                { attribute_id: ['key', 'type'] }
              ] 
            }
          ] as any,
          limit: BATCH_SIZE,
          offset: offset
        })
      );

      const products = items as unknown as any[];
      if (products.length === 0) break;

      const documents = products.map(transformProductToDocument);
      const batchTask = await index.addDocuments(documents);
      await waitForTaskCompletion(batchTask);
      
      totalSynced += documents.length;
      offset += BATCH_SIZE;
      console.log(`Synced batch: ${documents.length}, Total: ${totalSynced}`);
    }

    console.log(`Full reindex completed. Total documents: ${totalSynced}`);
    process.exit(0);
  } catch (error) {
    console.error('Reindex failed:', error);
    process.exit(1);
  }
}

run();