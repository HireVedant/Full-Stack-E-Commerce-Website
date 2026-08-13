import type {
  Product,
  ProductListResult,
  ApiResponse,
  ProductQuery,
  CreateProductInput,
  UpdateProductInput,
} from "../types";

const BASE = "/api";

export async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const headers: HeadersInit = { "Content-Type": "application/json", ...options?.headers };
  const token = localStorage.getItem("ecommerce_token");
  if (token) {
    (headers as any).Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => ({
    success: false,
    message: "Invalid server response",
  }));

  if (!res.ok && body.success === undefined) {
    return { success: false, message: `HTTP ${res.status}: ${res.statusText}` };
  }

  return body as ApiResponse<T>;
}

// ─── Products ─────────────────────────────────────────────────────────────────
export const productApi = {
  list(query: ProductQuery = {}): Promise<ApiResponse<ProductListResult>> {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.category) params.set("category", query.category);
    if (query.sort) params.set("sort", query.sort);
    if (query.page !== undefined) params.set("page", String(query.page));
    if (query.limit !== undefined) params.set("limit", String(query.limit));
    const qs = params.toString();
    return request<ProductListResult>(`/products${qs ? `?${qs}` : ""}`);
  },

  get(id: number): Promise<ApiResponse<Product>> {
    return request<Product>(`/products/${id}`);
  },

  getCategories(): Promise<ApiResponse<string[]>> {
    return request<string[]>("/products/categories");
  },

  getStock(id: number): Promise<ApiResponse<{ stock: number }>> {
    return request<{ stock: number }>(`/products/${id}/stock`);
  },

  create(input: CreateProductInput): Promise<ApiResponse<Product>> {
    return request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: UpdateProductInput): Promise<ApiResponse<Product>> {
    return request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  delete(id: number): Promise<ApiResponse<void>> {
    return request<void>(`/products/${id}`, { method: "DELETE" });
  },
};
