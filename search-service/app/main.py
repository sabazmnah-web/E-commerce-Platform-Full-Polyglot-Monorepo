import os

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .catalog import PRODUCTS
from .recommender import Recommender
from .search import SearchIndex

ORDERS_URL = os.getenv("ORDERS_URL", "http://localhost:8080")

app = FastAPI(title="Search & Recommendations", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_index = SearchIndex(PRODUCTS)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "documents": len(PRODUCTS)}


@app.get("/search")
def search(q: str = "", limit: int = 10) -> dict:
    return {"query": q, "results": _index.query(q, max(1, min(limit, 50)))}


@app.get("/recommend/{product_id}")
async def recommend(product_id: int) -> dict:
    orders = await _fetch_orders()
    recs = Recommender(orders).for_product(product_id)
    if not recs:
        # cold start: fall back to same-category items
        target = next((p for p in PRODUCTS if p["id"] == product_id), None)
        if target is None:
            raise HTTPException(status_code=404, detail="unknown product")
        recs = [
            {"productId": p["id"], "score": 0.0}
            for p in PRODUCTS
            if p["category"] == target["category"] and p["id"] != product_id
        ][:5]
    return {"productId": product_id, "recommendations": recs}


async def _fetch_orders() -> list[dict]:
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(f"{ORDERS_URL}/api/orders")
            resp.raise_for_status()
            return resp.json()
    except Exception:
        # Degrade gracefully — recommendations are non-critical.
        return []
