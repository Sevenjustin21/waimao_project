import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { sanitizeSnapshot } from './sanitize-snapshot';

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

// Helper to mask token in logs
const maskToken = (token: string) => token.substring(0, 4) + '...' + token.substring(token.length - 4);

async function applySchema() {
  console.log(`🚀 Starting schema application (MERGE STRATEGY) to ${DIRECTUS_URL}...`);
  console.log(`   Using Admin Token: ${maskToken(DIRECTUS_ADMIN_TOKEN!)}`);

  try {
    // 1. Fetch Server Snapshot
    console.log(`\n📥 Fetching current server snapshot from ${DIRECTUS_URL}/schema/snapshot...`);
    const serverSnapshotRes = await fetch(`${DIRECTUS_URL}/schema/snapshot`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${DIRECTUS_ADMIN_TOKEN}`
        }
    });

    if (!serverSnapshotRes.ok) {
        throw new Error(`Failed to fetch server snapshot: ${serverSnapshotRes.status} ${serverSnapshotRes.statusText}`);
    }

    const serverSnapshot = await serverSnapshotRes.json();
    const serverCollections = new Set(serverSnapshot.data.collections.map((c: any) => c.collection));
    console.log(`   Server has ${serverCollections.size} collections: ${Array.from(serverCollections).join(', ')}`);

    // 2. Read Local Desired Snapshot
    const jsonPath = resolve(__dirname, '../schema/snapshot.full.json');
    console.log(`\n📖 Reading local desired snapshot from ${jsonPath}...`);
    
    let localSnapshot: any;
    try {
        const content = readFileSync(jsonPath, 'utf8');
        localSnapshot = JSON.parse(content);
    } catch (e) {
        console.error(`?Could not find or parse ${jsonPath}`);
        process.exit(1);
    }

    // 3. Merge Logic: Append missing items to Server Snapshot structure
    console.log(`\n🧩 Merging local schema into server snapshot...`);
    
    const mergedSnapshot = JSON.parse(JSON.stringify(serverSnapshot.data)); // Start with server state
    const addedCollections: string[] = [];

    // 3.1 Merge Collections
    if (Array.isArray(localSnapshot.collections)) {
        for (const localCol of localSnapshot.collections) {
            if (!serverCollections.has(localCol.collection)) {
                mergedSnapshot.collections.push(localCol);
                addedCollections.push(localCol.collection);
            }
        }
    }

    // 3.2 Merge Fields
    const serverFields = new Set(mergedSnapshot.fields.map((f: any) => `${f.collection}.${f.field}`));
    let addedFieldsCount = 0;

    if (Array.isArray(localSnapshot.fields)) {
        for (const localField of localSnapshot.fields) {
            const key = `${localField.collection}.${localField.field}`;
            if (!serverFields.has(key)) {
                mergedSnapshot.fields.push(localField);
                addedFieldsCount++;
            }
        }
    }

    // 3.3 Merge Relations
    // Server relations structure: { collection, field, related_collection, ... }
    // We use a simple composite key to detect existence
    const serverRelations = new Set(mergedSnapshot.relations.map((r: any) => `${r.collection}.${r.field}`));
    let addedRelationsCount = 0;

    if (Array.isArray(localSnapshot.relations)) {
        for (const localRel of localSnapshot.relations) {
            const key = `${localRel.collection}.${localRel.field}`;
            if (!serverRelations.has(key)) {
                mergedSnapshot.relations.push(localRel);
                addedRelationsCount++;
            }
        }
    }

    console.log(`   Merge Result:`);
    console.log(`   - Added Collections: ${addedCollections.length > 0 ? addedCollections.join(', ') : 'None'}`);
    console.log(`   - Added Fields: ${addedFieldsCount}`);
    console.log(`   - Added Relations: ${addedRelationsCount}`);

    // 4. Sanitize Merged Snapshot
    console.log(`\n🧹 Sanitizing merged snapshot...`);
    const { sanitized, removedKeys } = sanitizeSnapshot(mergedSnapshot);

    // 4.1 Post-Sanitize Clean for Relations (Remove related_field to fix 400 error)
    if (Array.isArray(sanitized.relations)) {
        sanitized.relations = sanitized.relations.map((r: any) => {
             const copy = { ...r };
             if ('related_field' in copy) {
                 delete copy.related_field;
             }
             return copy;
        });
    }
    
    // Save sanitized for debugging
    const sanitizedPath = resolve(__dirname, '../schema/snapshot.sanitized.json');
    writeFileSync(sanitizedPath, JSON.stringify(sanitized, null, 2));
    console.log(`   Sanitized snapshot saved to ${sanitizedPath}`);

    // 5. Calculate Diff
    const force = true;
    const diffUrl = `${DIRECTUS_URL}/schema/diff?force=${force}`;
    console.log(`\n🔄 Calculating schema diff via ${diffUrl}...`);
    
    const diffRes = await fetch(diffUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${DIRECTUS_ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sanitized)
    });

    if (!diffRes.ok) {
        const text = await diffRes.text();
        console.error(`?Schema diff failed: ${diffRes.status} ${diffRes.statusText}`);
        console.error(`   Response: ${text}`);
        process.exit(1);
    }

    const responseBody = await diffRes.json();
    console.log('🔎 Diff Response:', JSON.stringify(responseBody, null, 2));
    
    const diffData = responseBody.data || responseBody; // Handle potential wrapped/unwrapped response
    
    // 6. Apply Schema
    const diff = diffData.diff;
    if (!diff) {
        console.log('�?Schema is already up to date!');
        return;
    }

    // Check if diff is empty (Array or Object)
    let isEmpty = false;
    let changeCount = 0;

    if (Array.isArray(diff)) {
        isEmpty = diff.length === 0;
        changeCount = diff.length;
    } else if (typeof diff === 'object') {
        // Directus 10.10+ returns object with collections/fields/relations arrays
        const cols = diff.collections?.length || 0;
        const flds = diff.fields?.length || 0;
        const rels = diff.relations?.length || 0;
        changeCount = cols + flds + rels;
        isEmpty = changeCount === 0;
    }

    if (isEmpty) {
        console.log('�?Schema is already up to date!');
        return;
    }

    console.log(`\n⚠️  Found ${changeCount} changes to apply.`);
    
    const applyUrl = `${DIRECTUS_URL}/schema/apply?force=${force}`;
    console.log(`\n🚀 Applying changes via ${applyUrl}...`);
    const applyRes = await fetch(applyUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${DIRECTUS_ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            hash: diffData.hash,
            diff: diff
        })
    });

    if (!applyRes.ok) {
        const text = await applyRes.text();
        console.error(`?Schema apply failed: ${applyRes.status} ${applyRes.statusText}`);
        console.error(`   Response: ${text}`);
        process.exit(1);
    }

    console.log('�?Schema applied successfully!');

  } catch (error) {
    console.error('\n?Unexpected error:', error);
    process.exit(1);
  }
}

applySchema();





