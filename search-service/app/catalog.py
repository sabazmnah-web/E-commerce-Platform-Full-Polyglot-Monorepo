"""Local mirror of the catalog used for indexing.

In production this file is replaced by a sync job that pulls
GET {ORDERS_URL}/api/products on a schedule.
"""

PRODUCTS = [
    {"id": 1, "name": "Aurora Headphones",  "category": "audio",    "price": 129.99,
     "description": "Wireless over-ear noise cancelling headphones"},
    {"id": 2, "name": "Pulse Earbuds",      "category": "audio",    "price": 59.50,
     "description": "True wireless earbuds with charging case"},
    {"id": 3, "name": "Nimbus Keyboard",    "category": "input",    "price": 89.00,
     "description": "Mechanical keyboard with hot-swappable switches"},
    {"id": 4, "name": "Vector Mouse",       "category": "input",    "price": 45.00,
     "description": "Lightweight ergonomic wireless mouse"},
    {"id": 5, "name": "Lumen Monitor 27",   "category": "display",  "price": 329.00,
     "description": "27 inch 4K IPS monitor with USB-C power delivery"},
    {"id": 6, "name": "Halo Desk Lamp",     "category": "lighting", "price": 39.99,
     "description": "Adjustable LED desk lamp with warm and cool modes"},
    {"id": 7, "name": "Orbit Webcam",       "category": "camera",   "price": 74.99,
     "description": "1080p webcam with auto framing and dual microphones"},
    {"id": 8, "name": "Cascade Speaker",    "category": "audio",    "price": 149.00,
     "description": "Portable bluetooth speaker with 20 hour battery"},
]
