import type { Order, Product, SearchHit } from './types';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function getProducts(): Promise<Product[]> {
  return json<Product[]>(await fetch('/api/products'));
}

export async function search(query: string): Promise<SearchHit[]> {
  const res = await fetch(`/search?q=${encodeURIComponent(query)}&limit=20`);
  const body = await json<{ results: SearchHit[] }>(res);
  return body.results;
}

export async function checkout(
  customer: string,
  items: Array<{ productId: number; quantity: number }>,
): Promise<Order> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customer, items }),
  });
  return json<Order>(res);
}
