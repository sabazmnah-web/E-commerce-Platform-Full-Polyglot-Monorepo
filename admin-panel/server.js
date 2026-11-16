import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ORDERS_URL = process.env.ORDERS_URL ?? 'http://localhost:8080';
const SEARCH_URL = process.env.SEARCH_URL ?? 'http://localhost:8000';
const PORT = Number(process.env.PORT ?? 4000);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/** Forward an upstream response verbatim (status, content-type, body). */
async function forward(res, url, init = {}) {
  try {
    const upstream = await fetch(url, init);
    const body = Buffer.from(await upstream.arrayBuffer());
    res
      .status(upstream.status)
      .type(upstream.headers.get('content-type') ?? 'application/json')
      .send(body);
  } catch (err) {
    res.status(502).json({ error: 'upstream unreachable', detail: String(err) });
  }
}

app.get('/admin/api/products', (_req, res) =>
  forward(res, `${ORDERS_URL}/api/products`),
);

app.get('/admin/api/orders', (_req, res) =>
  forward(res, `${ORDERS_URL}/api/orders`),
);

app.patch('/admin/api/products/:id/stock', (req, res) =>
  forward(res, `${ORDERS_URL}/api/products/${req.params.id}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body),
  }),
);

app.get('/admin/api/search', (req, res) => {
  const params = new URLSearchParams({ q: req.query.q ?? '', limit: '20' });
  return forward(res, `${SEARCH_URL}/search?${params}`);
});

app.get('/admin/api/recommend/:id', (req, res) =>
  forward(res, `${SEARCH_URL}/recommend/${req.params.id}`),
);

app.listen(PORT, () => {
  console.log(`admin-panel listening on http://localhost:${PORT}`);
});
