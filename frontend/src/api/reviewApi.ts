import { request } from "./productApi";

export const reviewApi = {
  getByProduct: (productId: number) => request<any>(`/api/reviews/product/${productId}`),
  create: (productId: number, rating: number, comment: string) => 
    request<any>("/api/reviews", { method: "POST", body: JSON.stringify({ productId, rating, comment }) }),
};
