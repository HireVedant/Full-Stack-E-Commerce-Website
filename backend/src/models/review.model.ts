import { z } from "zod";
import type { User } from "./user.model";

export const CreateReviewSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(2).max(1000)
});
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user?: User; // joined for display
}

export interface ReviewRow {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at
  };
}
