import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_ADMIN_TOKEN = process.env.DIRECTUS_ADMIN_TOKEN;

if (!DIRECTUS_ADMIN_TOKEN) {
  console.error('Error: DIRECTUS_ADMIN_TOKEN is missing in .env');
  process.exit(1);
}

const EXPORT_DIR = resolve(__dirname, '../schema/export');

// Ensure export directory exists
try {
    mkdirSync(EXPORT_DIR, { recursive: true });
} catch (e) {
    // Ignore if exists
}

// Helper to mask token in logs
const maskToken = (token: string) => token.substring(0, 4) + '...' + token.substring(token.length - 4);

async function fetchAndSave(endpoint: string, filename: string) {
    const url = `${DIRECTUS_URL}${endpoint}`;
    console.log(`fetching ${url}...`);
    
    try {
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${DIRECTUS_ADMIN_TOKEN}`
            }
        });
        
        if (!res.ok) {
            console.error(`?Failed to fetch ${endpoint}: ${res.status} ${res.statusText}`);
            return;
        }
        
        const json = await res.json();
        // Directus returns { data: ... }
        const data = json.data;
        
        const filePath = resolve(EXPORT_DIR, filename);
        writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`âœ?Saved to ${filename}`);
        return data;
    } catch (error) {
        console.error(`?Error fetching ${endpoint}:`, error);
    }
}

async function run() {
    console.log(`ðŸš€ Starting schema export from ${DIRECTUS_URL}...`);
    console.log(`   Using Admin Token: ${maskToken(DIRECTUS_ADMIN_TOKEN!)}`);
    
    // 1. Export Fields for specific collections
    const collections = [
        'categories',
        'products',
        'attributes',
        'product_attribute_values',
        'inquiries',
        'inquiry_items'
    ];
    
    for (const col of collections) {
        await fetchAndSave(`/fields/${col}`, `fields.${col}.json`);
    }
    
    // 2. Export Relations
    await fetchAndSave('/relations', 'relations.json');

    // 3. Export Collections
    await fetchAndSave('/collections', 'collections.json');
    
    console.log('\nâœ?Export completed!');
}

run();






