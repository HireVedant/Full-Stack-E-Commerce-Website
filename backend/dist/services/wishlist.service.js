"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistService = void 0;
const connection_1 = require("../db/connection");
const product_service_1 = require("./product.service");
const wishlist_model_1 = require("../models/wishlist.model");
class WishlistService {
    constructor(db) {
        this.db = db ?? (0, connection_1.getDb)();
        this.productService = new product_service_1.ProductService(this.db);
    }
    add(userId, productId) {
        const product = this.productService.getById(productId);
        if (!product)
            throw new Error("Product not found");
        const existing = this.db.prepare("SELECT * FROM wishlists WHERE user_id = ? AND product_id = ?").get(userId, productId);
        if (existing)
            throw new Error("Product already in wishlist");
        const row = this.db.prepare("INSERT INTO wishlists (user_id, product_id) VALUES (?, ?) RETURNING *").get(userId, productId);
        return (0, wishlist_model_1.rowToWishlistItem)(row);
    }
    remove(userId, productId) {
        const res = this.db.prepare("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?").run(userId, productId);
        return res.changes > 0;
    }
    getUserWishlist(userId) {
        const rows = this.db.prepare("SELECT * FROM wishlists WHERE user_id = ? ORDER BY created_at DESC").all(userId);
        return rows.map(row => {
            const item = (0, wishlist_model_1.rowToWishlistItem)(row);
            item.product = this.productService.getById(item.productId) || undefined;
            return item;
        });
    }
}
exports.WishlistService = WishlistService;
//# sourceMappingURL=wishlist.service.js.map