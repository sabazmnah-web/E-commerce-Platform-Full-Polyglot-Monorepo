export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  description: string;
  imageUrl: string;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customer: string;
  items: OrderItem[];
  total: number;
  status: string;
}

export interface SearchHit extends Product {
  score: number;
}
