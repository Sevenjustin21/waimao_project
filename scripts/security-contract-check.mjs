#!/usr/bin/env node
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const REPO_ROOT = process.cwd();
const ADMIN_API_DIR = path.join(REPO_ROOT, 'src', 'app', 'api', 'admin');
const REQUIRED_FILES = [
  path.join(REPO_ROOT, 'src', 'app', 'api', 'inquiries', '[id]', 'route.ts'),
  path.join(REPO_ROOT, 'src', 'app', 'api', 'reindex', 'route.ts'),
];

async function collectRouteFiles(dir) {
  const items = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...(await collectRouteFiles(fullPath)));
    } else if (item.isFile() && item.name === 'route.ts') {
      files.push(fullPath);
    }
  }
  return files;
}

async function fileContainsWrapper(filePath) {
  const content = await readFile(filePath, 'utf-8');
  return content.includes('withSecurityContext');
}

async function ensureFileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const adminRoutes = (await collectRouteFiles(ADMIN_API_DIR)) || [];
  const required = [...adminRoutes, ...REQUIRED_FILES];
  const failures = [];

  for (const filePath of required) {
    const exists = await ensureFileExists(filePath);
    if (!exists) {
      failures.push({ filePath, reason: 'missing_file' });
      continue;
    }

    const usesWrapper = await fileContainsWrapper(filePath);
    if (!usesWrapper) {
      failures.push({ filePath, reason: 'missing_wrapper' });
    }
  }

  if (failures.length > 0) {
    console.error('[security-contract] The following files must wrap handlers with withSecurityContext:');
    for (const failure of failures) {
      const relPath = path.relative(REPO_ROOT, failure.filePath);
      console.error(`  - ${relPath} (${failure.reason})`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('[security-contract] All checked routes use withSecurityContext.');
}

main().catch((error) => {
  console.error('[security-contract] Failed to run check:', error);
  process.exitCode = 1;
});
