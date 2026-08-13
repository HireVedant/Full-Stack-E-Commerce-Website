import { z } from "zod";
import type { User } from "./user.model";
export declare const CreateReviewSchema: z.ZodObject<{
    productId: z.ZodNumber;
    rating: z.ZodNumber;
    comment: z.ZodString;
}, "strip", z.ZodTypeAny, {
    productId: number;
    rating: number;
    comment: string;
}, {
    productId: number;
    rating: number;
    comment: string;
}>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export interface Review {
    id: number;
    userId: number;
    productId: number;
    rating: number;
    comment: string;
    createdAt: string;
    user?: User;
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
export declare function rowToReview(row: ReviewRow): Review;
//# sourceMappingURL=review.model.d.ts.map