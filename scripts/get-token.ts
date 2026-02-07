import { createDirectus, staticToken, rest, readMe } from '@directus/sdk';

const DIRECTUS_URL = 'http://localhost:8055';
// Read from file or env
const fs = require('fs');
const token = fs.readFileSync('token.txt', 'utf8').trim();
console.log('Testing token:', token);

async function checkToken() {
  const client = createDirectus(DIRECTUS_URL)
    .with(staticToken(token))
    .with(rest());

  try {
    const user = await client.request(readMe({ fields: ['id', 'email', 'role'] }));
    console.log('Token is VALID. User:', user);
  } catch (error) {
    console.error('Token is INVALID:', error);
  }
}

checkToken();
