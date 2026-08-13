// API Types — shared between frontend and service layer

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
  availability: "in_stock" | "low_stock" | "out_of_stock";
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export type SortOption = "price_asc" | "price_desc" | "name_asc" | "name_desc";

export interface ProductQuery {
  search?: string;
  category?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}

export type UpdateProductInput = Partial<CreateProductInput>;

// ─── Cart types ───────────────────────────────────────────────────────────────
export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  imageUrl: string;
  category: string;
}

export interface Cart {
  items: CartItem[];
}

// ─── User types ───────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

// ─── Order types ──────────────────────────────────────────────────────────────
export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  discountAmount: number;
  couponCode: string | null;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: "Pending" | "Paid" | "Failed";
  razorpayOrderId: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}
