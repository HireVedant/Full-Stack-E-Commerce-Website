import { z } from "zod";
import type { Product } from "./product.model";
export declare const AddToWishlistSchema: z.ZodObject<{
    productId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productId: number;
}, {
    productId: number;
}>;
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
export declare function rowToWishlistItem(row: WishlistItemRow): WishlistItem;
//# sourceMappingURL=wishlist.model.d.ts.map