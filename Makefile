.PHONY: up down orders search image storefront admin clean

up:        ; docker compose up --build
down:      ; docker compose down -v

orders:    ; cd orders-service && mvn spring-boot:run
search:    ; cd search-service && uvicorn app.main:app --reload --port 8000
image:     ; cd image-service && cmake -B build && cmake --build build -j && ./build/image_service
storefront:; cd storefront && npm install && npm run dev
admin:     ; cd admin-panel && npm install && npm start

clean:
	rm -rf storefront/node_modules storefront/dist admin-panel/node_modules \
	       orders-service/target image-service/build
	find search-service -name __pycache__ -type d -exec rm -rf {} +
