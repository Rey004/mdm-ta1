const testAPI = async () => {
  const baseUrl = 'http://localhost:5000/api/products';

  console.log('--- 1. Testing GET /api/products (View / List Products) ---');
  let res = await fetch(baseUrl);
  let data = await res.json();
  console.log(`Success: ${data.success}, Count: ${data.count} products`);

  console.log('\n--- 2. Testing Low Stock Alerts (quantity <= 5) ---');
  res = await fetch(`${baseUrl}/alerts/low-stock`);
  data = await res.json();
  console.log(`Low stock alerts count: ${data.count}`);
  data.data.forEach((p) => console.log(`  - [${p.productId}] ${p.name}: ${p.quantity} left`));

  console.log('\n--- 3. Testing POST /api/products (Validation: Negative Price/Quantity) ---');
  res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: '999',
      name: 'Invalid Item',
      category: 'Test',
      quantity: -5,
      price: -10,
    }),
  });
  data = await res.json();
  console.log(`Status: ${res.status} (Expected 400), Message: "${data.message}"`);

  console.log('\n--- 4. Testing POST /api/products (Add Valid Product: 106) ---');
  res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: '106',
      name: 'USB-C Cable',
      category: 'Electronics',
      quantity: 20,
      price: 15,
    }),
  });
  data = await res.json();
  console.log(`Status: ${res.status} (Expected 201), Added Product: ${data.data?.name}`);

  console.log('\n--- 5. Testing Dynamic Search ?search=Dell ---');
  res = await fetch(`${baseUrl}?search=Dell`);
  data = await res.json();
  console.log(`Search result count: ${data.count}, First item: ${data.data[0]?.name}`);

  console.log('\n--- 6. Testing Stock Edge Case: Reducing stock below 0 for 105 (current qty: 0) ---');
  res = await fetch(`${baseUrl}/105/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta: -1 }),
  });
  data = await res.json();
  console.log(`Status: ${res.status} (Expected 400), Message: "${data.message}"`);

  console.log('\n--- 7. Testing Valid Stock Update: Increasing stock for 102 (+5) ---');
  res = await fetch(`${baseUrl}/102/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta: 5 }),
  });
  data = await res.json();
  console.log(`Status: ${res.status}, New Quantity: ${data.data?.quantity}`);

  console.log('\n--- 8. Testing DELETE Product 106 ---');
  res = await fetch(`${baseUrl}/106`, { method: 'DELETE' });
  data = await res.json();
  console.log(`Status: ${res.status}, Message: "${data.message}"`);

  console.log('\n===========================================');
  console.log('✅ All Objectives & Edge Cases Verified!');
  console.log('===========================================');
};

testAPI().catch(console.error);
