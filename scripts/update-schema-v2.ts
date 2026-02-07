
import { createDirectus, staticToken, rest, createField, createRelation } from '@directus/sdk';
import { config } from 'dotenv';

config({ path: '.env' });

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || '';

if (!DIRECTUS_TOKEN) {
  console.error('DIRECTUS_ADMIN_TOKEN is missing');
  process.exit(1);
}

const client = createDirectus(DIRECTUS_URL)
  .with(staticToken(DIRECTUS_TOKEN))
  .with(rest());

async function updateSchema() {
  console.log('Starting Schema Update V2...');

  try {
    // 1. Add image_id (Many-to-One to directus_files)
    console.log('Adding image_id field...');
    try {
      await client.request(createField('products', {
        field: 'image_id',
        type: 'uuid',
        schema: {
          is_nullable: true,
          foreign_key_table: 'directus_files',
          foreign_key_column: 'id',
          // @ts-ignore
          on_delete: 'SET NULL'
        },
        meta: {
          interface: 'file-image',
          special: ['file'],
          note: 'Main Product Image'
        }
      }));
      console.log('image_id field created.');
    } catch (e: any) {
      if (e?.errors?.[0]?.extensions?.code === 'FIELD_ALREADY_EXISTS') {
        console.log('image_id field already exists.');
      } else {
        console.error('Error creating image_id:', e);
      }
    }

    // 2. Add price_text
    console.log('Adding price_text field...');
    try {
      await client.request(createField('products', {
        field: 'price_text',
        type: 'string',
        schema: { is_nullable: true, max_length: 255 },
        meta: { interface: 'input', note: 'Price description (e.g. $10-20 / Piece)' }
      }));
      console.log('price_text field created.');
    } catch (e: any) {
        if (e?.errors?.[0]?.extensions?.code === 'FIELD_ALREADY_EXISTS') {
            console.log('price_text field already exists.');
        } else {
            console.error('Error creating price_text:', e);
        }
    }

    // 3. Add moq
    console.log('Adding moq field...');
    try {
      await client.request(createField('products', {
        field: 'moq',
        type: 'integer',
        schema: { is_nullable: true },
        meta: { interface: 'input', note: 'Minimum Order Quantity' }
      }));
      console.log('moq field created.');
    } catch (e: any) {
        if (e?.errors?.[0]?.extensions?.code === 'FIELD_ALREADY_EXISTS') {
            console.log('moq field already exists.');
        } else {
            console.error('Error creating moq:', e);
        }
    }

    // 4. Add lead_time_days
    console.log('Adding lead_time_days field...');
    try {
      await client.request(createField('products', {
        field: 'lead_time_days',
        type: 'integer',
        schema: { is_nullable: true },
        meta: { interface: 'input', note: 'Lead time in days' }
      }));
      console.log('lead_time_days field created.');
    } catch (e: any) {
        if (e?.errors?.[0]?.extensions?.code === 'FIELD_ALREADY_EXISTS') {
            console.log('lead_time_days field already exists.');
        } else {
            console.error('Error creating lead_time_days:', e);
        }
    }
    
    // 5. Add material_summary
    console.log('Adding material_summary field...');
    try {
      await client.request(createField('products', {
        field: 'material_summary',
        type: 'string',
        schema: { is_nullable: true, max_length: 255 },
        meta: { interface: 'input', note: 'Quick material summary' }
      }));
      console.log('material_summary field created.');
    } catch (e: any) {
        if (e?.errors?.[0]?.extensions?.code === 'FIELD_ALREADY_EXISTS') {
            console.log('material_summary field already exists.');
        } else {
            console.error('Error creating material_summary:', e);
        }
    }

    console.log('Schema Update V2 Complete.');
  } catch (error) {
    console.error('Schema Update Failed:', error);
  }
}

updateSchema();
