#!/usr/bin/env node
/**
 * Simple dependency gate:
 * - Ensures React/ReactDOM stay on major version 18.x.
 * - Fails install if any package named react-server-dom-* is present.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const lockPath = join(process.cwd(), 'package-lock.json');

function fail(message) {
  console.error(`\n[dep:guard] ${message}\n`);
  process.exit(1);
}

function checkReactVersions(packages) {
  const reactPkg = packages['node_modules/react'];
  const reactDomPkg = packages['node_modules/react-dom'];
  if (!reactPkg || !reactDomPkg) {
    fail('React or ReactDOM not found in lockfile. Ensure dependencies are installed before running the guard.');
  }
  const reactVersion = reactPkg.version || '';
  const reactDomVersion = reactDomPkg.version || '';
  if (!reactVersion.startsWith('18.') || !reactDomVersion.startsWith('18.')) {
    fail(`React/ReactDOM must stay on 18.x. Detected react=${reactVersion}, react-dom=${reactDomVersion}.`);
  }
}

function checkReactServerDom(packages) {
  const offenders = Object.keys(packages).filter((name) =>
    name.includes('react-server-dom')
  );
  if (offenders.length > 0) {
    fail(
      `Detected forbidden react-server-dom packages in lockfile: ${offenders.join(
        ', '
      )}. React2Shell guardrail triggered.`
    );
  }
}

function main() {
  let lock;
  try {
    const raw = readFileSync(lockPath, 'utf-8');
    lock = JSON.parse(raw);
  } catch (error) {
    fail(`Unable to read ${lockPath}: ${error.message}`);
  }

  const packages = lock.packages;
  if (!packages) {
    fail('Lockfile missing "packages" entry. npm v7+ lockfile is required.');
  }

  checkReactVersions(packages);
  checkReactServerDom(packages);

  console.log('[dep:guard] React/Next dependency constraints satisfied.');
}

main();
