
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function triggerReindex() {
  const url = `${process.env.APP_URL}/api/reindex`;
  const token = process.env.ADMIN_API_SECRET;

  console.log(`Triggering reindex at ${url}...`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      console.log('Response:', JSON.stringify(data, null, 2));
      
      if (!res.ok) {
        process.exit(1);
      }
    } else {
      console.log(`Response Status: ${res.status} ${res.statusText}`);
      console.log('Response Body:', await res.text());
      if (!res.ok) process.exit(1);
    }

  } catch (error: any) {
    console.error('Failed to trigger reindex:', error.message);
    process.exit(1);
  }
}

triggerReindex();
