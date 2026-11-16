"""TF-IDF relevance search over the product catalog."""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class SearchIndex:
    def __init__(self, products: list[dict]):
        self.products = products
        docs = [
            f"{p['name']} {p['category']} {p['description']}" for p in products
        ]
        self._vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self._matrix = self._vectorizer.fit_transform(docs)

    def query(self, text: str, limit: int = 10) -> list[dict]:
        text = (text or "").strip()
        if not text:
            return [dict(p, score=1.0) for p in self.products[:limit]]

        qv = self._vectorizer.transform([text])
        sims = cosine_similarity(qv, self._matrix)[0]
        ranked = sims.argsort()[::-1][:limit]

        results = []
        for i in ranked:
            if sims[i] <= 0:
                continue
            results.append({**self.products[int(i)], "score": round(float(sims[i]), 4)})
        return results
