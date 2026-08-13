import type Database from "better-sqlite3";
import { type WishlistItem } from "../models/wishlist.model";
export declare class WishlistService {
    private db;
    private productService;
    constructor(db?: Database.Database);
    add(userId: number, productId: number): WishlistItem;
    remove(userId: number, productId: number): boolean;
    getUserWishlist(userId: number): WishlistItem[];
}
//# sourceMappingURL=wishlist.service.d.ts.map