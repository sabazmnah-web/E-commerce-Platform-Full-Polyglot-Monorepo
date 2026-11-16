import { useEffect, useMemo, useState } from 'react';
import { checkout, getProducts, search } from './api';
import type { Product, SearchHit } from './types';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Record<number, number>>({});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getProducts().then(setProducts).catch((e) => setMessage(String(e)));
  }, []);

  const visible = useMemo(() => {
    if (hits.length === 0) return products;
    const rank = new Map(hits.map((h, i) => [h.id, i]));
    return products
      .filter((p) => rank.has(p.id))
      .sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
  }, [products, hits]);

  const total = useMemo(
    () =>
      Object.entries(cart).reduce((sum, [id, qty]) => {
        const product = products.find((p) => p.id === Number(id));
        return sum + (product ? product.price * qty : 0);
      }, 0),
    [cart, products],
  );

  async function onSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) {
      setHits([]);
      return;
    }
    try {
      setHits(await search(query));
    } catch (e) {
      setMessage(String(e));
    }
  }

  function addToCart(id: number) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  }

  async function onCheckout() {
    const items = Object.entries(cart).map(([id, quantity]) => ({
      productId: Number(id),
      quantity,
    }));
    if (items.length === 0) return;

    try {
      const order = await checkout('demo@example.com', items);
      setMessage(`Order #${order.id} confirmed — $${order.total.toFixed(2)}`);
      setCart({});
      setProducts(await getProducts());
    } catch (e) {
      setMessage(String(e));
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Aurora Shop</h1>
        <form onSubmit={onSearch} className="search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
          />
          <button type="submit">Search</button>
          {hits.length > 0 && (
            <button type="button" onClick={() => { setQuery(''); setHits([]); }}>
              Clear
            </button>
          )}
        </form>
      </header>

      {message && <p className="banner">{message}</p>}

      <main className="grid">
        {visible.map((p) => (
          <article key={p.id} className="card">
            <img src={p.imageUrl} alt={p.name} width={320} height={240} />
            <h2>{p.name}</h2>
            <p className="muted">{p.description}</p>
            <p className="price">${p.price.toFixed(2)}</p>
            <p className="muted">{p.stock} in stock</p>
            <button disabled={p.stock === 0} onClick={() => addToCart(p.id)}>
              Add to cart
            </button>
          </article>
        ))}
      </main>

      <aside className="cart">
        <h2>Cart</h2>
        {Object.keys(cart).length === 0 ? (
          <p className="muted">Empty</p>
        ) : (
          <ul>
            {Object.entries(cart).map(([id, qty]) => {
              const p = products.find((x) => x.id === Number(id));
              return (
                <li key={id}>
                  {p?.name ?? `#${id}`} × {qty}
                </li>
              );
            })}
          </ul>
        )}
        <p className="total">Total: ${total.toFixed(2)}</p>
        <button onClick={onCheckout} disabled={total === 0}>
          Checkout
        </button>
      </aside>
    </div>
  );
}
