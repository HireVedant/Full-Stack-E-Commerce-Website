import { request } from "./productApi";

export const wishlistApi = {
  get: () => request<any[]>("/api/wishlist"),
  add: (productId: number) => request<any>("/api/wishlist", { method: "POST", body: JSON.stringify({ productId }) }),
  remove: (productId: number) => request<any>(`/api/wishlist/${productId}`, { method: "DELETE" }),
};
