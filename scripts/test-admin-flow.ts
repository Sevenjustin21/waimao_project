import { cookies } from "next/headers";

// Since we run this as a script, we can't use next/headers or next-auth client easily.
// We will use 'node-fetch' with cookie support.

const BASE_URL = process.env.TEST_BASE_URL || process.env.APP_URL || "http://localhost:3000";
const EMAIL = "admin@waimao.com";
const PASSWORD = "admin123";

async function runTest() {
  console.log("Starting Admin Flow Test...");

  // 1. Login
  console.log("Logging in...");
  // NextAuth credentials login is a bit complex to simulate via simple fetch because of CSRF.
  // However, we can use the REST API.
  // Actually, easiest way is to use 'csrf' token.
  
  // Fetch CSRF token
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  
  // Extract cookies from csrf response to send back
  const setCookie = csrfRes.headers.get('set-cookie');
  let cookieHeader = setCookie ? setCookie.split(';')[0] : '';

  // Login
  const params = new URLSearchParams();
  params.append("redirect", "false");
  params.append("email", EMAIL);
  params.append("password", PASSWORD);
  params.append("csrfToken", csrfToken);
  params.append("json", "true");

  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookieHeader,
    },
    body: params,
  });

  const loginCookies = loginRes.headers.get('set-cookie');
  // We need to merge cookies
  if (loginCookies) {
      // Simple merge for test
      const sessionToken = loginCookies.split(',').find(c => c.trim().startsWith('next-auth.session-token'));
      if (sessionToken) {
          cookieHeader += '; ' + sessionToken.split(';')[0];
      }
  }

  if (!loginRes.ok) {
    console.error("Login failed:", await loginRes.text());
    return;
  }
  
  console.log("Login successful.");

  // 2. List Products
  console.log("Listing products...");
  const listRes = await fetch(`${BASE_URL}/api/admin/products`, {
    headers: { "Cookie": cookieHeader },
  });
  
  if (!listRes.ok) {
      console.error("List products failed:", listRes.status, await listRes.text());
      return;
  }
  
  const products = await listRes.json();
  console.log(`Found ${products.length} products.`);

  // 3. Create Product
  console.log("Creating product...");
  const newProduct = {
    name: "Test Script Product",
    slug: "test-script-product-" + Date.now(),
    sku: "TSP-" + Date.now(),
    description: "Created by test script",
    status: "draft",
    price_text: "$100-200 / Set",
    moq: 10,
    lead_time_days: 15,
    material_summary: "Steel",
    // category_id: ... need a valid ID?
  };
  
  const createRes = await fetch(`${BASE_URL}/api/admin/products`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader
    },
    body: JSON.stringify(newProduct),
  });
  
  if (!createRes.ok) {
      console.error("Create product failed:", createRes.status, await createRes.text());
      return;
  }
  
  const created = await createRes.json();
  console.log("Product created:", created.id);

  // 4. Update Product
  console.log("Updating product...");
  const updateRes = await fetch(`${BASE_URL}/api/admin/products/${created.id}`, {
      method: "PUT",
      headers: {
          "Content-Type": "application/json",
          "Cookie": cookieHeader
      },
      body: JSON.stringify({ name: "Updated Name" }),
  });
  
  if (!updateRes.ok) {
      console.error("Update failed");
      return;
  }
  console.log("Product updated.");

  // 5. Delete Product
  console.log("Deleting product...");
  const deleteRes = await fetch(`${BASE_URL}/api/admin/products/${created.id}`, {
      method: "DELETE",
      headers: { "Cookie": cookieHeader },
  });
  
  if (!deleteRes.ok) {
      console.error("Delete failed");
      return;
  }
  console.log("Product deleted.");
}

runTest();
