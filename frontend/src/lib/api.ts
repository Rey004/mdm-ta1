import { Product } from '@/types/inventory';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 1. Fetch products (with search or low-stock filter)
export async function getProducts(search = '', lowStock = false): Promise<Product[]> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (lowStock) params.set('lowStock', 'true');

  const res = await fetch(`${API_BASE}/products?${params.toString()}`, { cache: 'no-store' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error fetching products');
  return json.data || [];
}

// 2. Fetch low-stock alert items (quantity <= 5)
export async function getLowStockAlerts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products/alerts/low-stock`, { cache: 'no-store' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error fetching alerts');
  return json.data || [];
}

// 3. Add a new product
export async function addProduct(product: {
  productId: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
}): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error adding product');
  return json.data;
}

// 4. Update stock quantity (+/- delta)
export async function updateStock(id: string, delta: number): Promise<Product> {
  const cleanId = encodeURIComponent(String(id).trim());
  const res = await fetch(`${API_BASE}/products/${cleanId}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ delta }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error updating stock');
  return json.data;
}

// 5. Update product details (e.g. price/name)
export async function updateProduct(
  id: string,
  updatedFields: Partial<Product>
): Promise<Product> {
  const cleanId = encodeURIComponent(String(id).trim());
  const res = await fetch(`${API_BASE}/products/${cleanId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedFields),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error updating product');
  return json.data;
}

// 6. Delete product
export async function deleteProduct(id: string): Promise<any> {
  const cleanId = encodeURIComponent(String(id).trim());
  const res = await fetch(`${API_BASE}/products/${cleanId}`, {
    method: 'DELETE',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error deleting product');
  return json;
}

// 7. Reset sample demonstration data
export async function resetSampleData(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products/seed`, {
    method: 'POST',
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error resetting data');
  return json.data;
}
