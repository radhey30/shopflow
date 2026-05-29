export interface User {
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  ratings: {
    average: number;
    count: number;
  };
  isActive: boolean;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalPrice: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  isPaid: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
  limit: number;
}
