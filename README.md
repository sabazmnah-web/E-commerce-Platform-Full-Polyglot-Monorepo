# Polyglot E-Commerce Platform

Five services, five languages, one demo shop.

## Run everything

    docker compose up --build

- Storefront  → http://localhost:5173
- Admin panel → http://localhost:4000
- Orders API  → http://localhost:8080/api/products
- Search API  → http://localhost:8000/docs
- Image API   → http://localhost:9000/health

## Run services manually (no Docker)

    # Java (needs JDK 17 + Maven)
    cd orders-service && mvn spring-boot:run

    # Python (needs Python 3.11+)
    cd search-service && pip install -r requirements.txt && uvicorn app.main:app --port 8000

    # C++ (needs CMake 3.20+, a C++17 compiler, git)
    cd image-service && cmake -B build && cmake --build build -j && ./build/image_service

    # TypeScript
    cd storefront && npm install && npm run dev

    # JavaScript
    cd admin-panel && npm install && npm start

## Contracts

- Orders API: `GET /api/products`, `GET /api/orders`, `POST /api/orders`,
  `PATCH /api/products/{id}/stock`
- Search API: `GET /search?q=`, `GET /recommend/{productId}`
- Image API: `GET /placeholder?w=&h=`, `POST /resize?w=&h=` (raw image bytes in body)

## Design notes

- Java owns stock so concurrent checkouts can never oversell (`synchronized` decrement).
- Python never writes to the catalog; it reads orders from Java to build co-purchase edges.
- C++ is stateless and CPU-bound — the only place doing pixel work.
- TypeScript holds the typed `Product` / `Order` contracts consumed by both UIs.
