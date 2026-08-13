import type Database from "better-sqlite3";
import { getDb } from "../db/connection";
import { ProductService } from "./product.service";
import { rowToWishlistItem, type WishlistItem, type WishlistItemRow } from "../models/wishlist.model";

export class WishlistService {
  private db: Database.Database;
  private productService: ProductService;

  constructor(db?: Database.Database) {
    this.db = db ?? getDb();
    this.productService = new ProductService(this.db);
  }

  add(userId: number, productId: number): WishlistItem {
    const product = this.productService.getById(productId);
    if (!product) throw new Error("Product not found");

    const existing = this.db.prepare(
      "SELECT * FROM wishlists WHERE user_id = ? AND product_id = ?"
    ).get(userId, productId);
    
    if (existing) throw new Error("Product already in wishlist");

    const row = this.db.prepare(
      "INSERT INTO wishlists (user_id, product_id) VALUES (?, ?) RETURNING *"
    ).get(userId, productId) as WishlistItemRow;

    return rowToWishlistItem(row);
  }

  remove(userId: number, productId: number): boolean {
    const res = this.db.prepare(
      "DELETE FROM wishlists WHERE user_id = ? AND product_id = ?"
    ).run(userId, productId);
    return res.changes > 0;
  }

  getUserWishlist(userId: number): WishlistItem[] {
    const rows = this.db.prepare(
      "SELECT * FROM wishlists WHERE user_id = ? ORDER BY created_at DESC"
    ).all(userId) as WishlistItemRow[];

    return rows.map(row => {
      const item = rowToWishlistItem(row);
      item.product = this.productService.getById(item.productId) || undefined;
      return item;
    });
  }
}
