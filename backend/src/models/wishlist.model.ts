import { z } from "zod";
import type { Product } from "./product.model";

export const AddToWishlistSchema = z.object({
  productId: z.number().int().positive()
});
export type AddToWishlistInput = z.infer<typeof AddToWishlistSchema>;

export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product?: Product;
}

export interface WishlistItemRow {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
}

export function rowToWishlistItem(row: WishlistItemRow): WishlistItem {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    createdAt: row.created_at
  };
}
