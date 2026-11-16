"""Item-to-item recommendations from co-purchase history."""

from collections import Counter, defaultdict


class Recommender:
    def __init__(self, orders: list[dict]):
        self._pairs: dict[int, Counter] = defaultdict(Counter)

        for order in orders:
            ids = [item["productId"] for item in order.get("items", [])]
            for a in ids:
                for b in ids:
                    if a != b:
                        self._pairs[a][b] += 1

    def for_product(self, product_id: int, limit: int = 5) -> list[dict]:
        return [
            {"productId": pid, "score": score}
            for pid, score in self._pairs[product_id].most_common(limit)
        ]
