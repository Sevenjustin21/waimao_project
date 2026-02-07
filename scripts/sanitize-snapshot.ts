import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SNAPSHOT_PATH = resolve(__dirname, '../schema/snapshot.json');
const SANITIZED_PATH = resolve(__dirname, '../schema/snapshot.sanitized.json');

/**
 * Sanitize snapshot to keep only strict schema definitions.
 * Removes all UI/Meta/Project-specific configurations.
 */
export function sanitizeSnapshot(snapshot: any) {
    const removedKeys: Set<string> = new Set();
    
    // Deep clone to avoid mutating original if needed
    const sanitized = JSON.parse(JSON.stringify(snapshot));

    // 1. Sanitize Collections
    if (Array.isArray(sanitized.collections)) {
        sanitized.collections = sanitized.collections.map((col: any) => {
            const newCol: any = {};
            // Whitelist allowed keys
            // 'schema' contains SQL-level definition (if present)
            // 'collection' is the name
            // 'meta' contains Directus specific settings (icon, note, etc.)
            // 'fields' (if nested)
            const allowed = ['collection', 'schema', 'fields', 'meta']; 
            
            for (const key of Object.keys(col)) {
                if (allowed.includes(key)) {
                    if (key === 'schema' && col.schema) {
                        const newSchema: any = {};
                        // Only allow 'name' in collection schema
                        if (col.schema.name) newSchema.name = col.schema.name;
                        newCol.schema = newSchema;
                    } else if (key === 'meta' && col.meta) {
                         // Whitelist meta fields
                         const allowedMeta = ['collection', 'icon', 'note', 'display_template', 'hidden', 'singleton', 'translations', 'archive_field', 'archive_app_filter', 'archive_value', 'unarchive_value', 'sort_field', 'accountability', 'color', 'item_duplication_fields', 'sort', 'group', 'collapse', 'preview_url', 'versioning'];
                         const newMeta: any = {};
                         for (const mKey of Object.keys(col.meta)) {
                             if (allowedMeta.includes(mKey)) {
                                 newMeta[mKey] = col.meta[mKey];
                             }
                         }
                         newCol.meta = newMeta;
                    } else {
                        newCol[key] = col[key];
                    }
                } else {
                    removedKeys.add(`collection.${key}`);
                }
            }
            return newCol;
        });
    }

    // 2. Sanitize Fields
    if (Array.isArray(sanitized.fields)) {
        sanitized.fields = sanitized.fields.map((field: any) => {
            const newField: any = {};
            const allowed = ['collection', 'field', 'type', 'schema', 'meta'];
            
            for (const key of Object.keys(field)) {
                if (allowed.includes(key)) {
                    if (key === 'meta' && field.meta) {
                        const newMeta: any = {};
                        // Only keep schema-relevant meta
                        // 'special': indicates UUID, M2O, etc. Important for casting.
                        // 'required': DB constraint
                        const allowedMeta = ['special', 'required']; 
                        
                        for (const metaKey of Object.keys(field.meta)) {
                            if (allowedMeta.includes(metaKey)) {
                                newMeta[metaKey] = field.meta[metaKey];
                            } else {
                                removedKeys.add(`field.meta.${metaKey}`);
                            }
                        }
                        
                        if (Object.keys(newMeta).length > 0) {
                            newField.meta = newMeta;
                        }
                    } else {
                        newField[key] = field[key];
                    }
                } else {
                    removedKeys.add(`field.${key}`);
                }
            }
            return newField;
        });
    }

    // 3. Sanitize Relations
    if (Array.isArray(sanitized.relations)) {
        sanitized.relations = sanitized.relations.map((rel: any) => {
            const newRel: any = {};
            // Strict Whitelist based on Directus API requirements
            // Removed 'related_field' as it causes 400 Invalid Payload
            const allowed = ['collection', 'field', 'related_collection', 'schema'];
            
            for (const key of Object.keys(rel)) {
                if (allowed.includes(key)) {
                    newRel[key] = rel[key];
                } else {
                    removedKeys.add(`relation.${key}`);
                }
            }
            return newRel;
        });
    }

    return { sanitized, removedKeys: Array.from(removedKeys) };
}

// Run as standalone script if called directly
if (process.argv[1] === __filename) {
    console.log('🧹 Starting snapshot sanitization...');
    
    if (!existsSync(SNAPSHOT_PATH)) {
        console.error(`❌ Snapshot file not found at: ${SNAPSHOT_PATH}`);
        process.exit(1);
    }

    try {
        const content = readFileSync(SNAPSHOT_PATH, 'utf8');
        const snapshot = JSON.parse(content);
        
        const { sanitized, removedKeys } = sanitizeSnapshot(snapshot);
        
        writeFileSync(SANITIZED_PATH, JSON.stringify(sanitized, null, 2));
        
        console.log(`✅ Sanitized snapshot written to: ${SANITIZED_PATH}`);
        console.log(`\n📋 Removed Keys Summary:`);
        
        // Group keys for cleaner output
        const groups: Record<string, number> = {};
        removedKeys.forEach(k => {
            const prefix = k.split('.').slice(0, 2).join('.');
            groups[prefix] = (groups[prefix] || 0) + 1;
        });
        
        Object.entries(groups).forEach(([key, count]) => {
            console.log(`   - ${key} (${count} occurrences)`);
        });

    } catch (error) {
        console.error('❌ Error during sanitization:', error);
        process.exit(1);
    }
}
