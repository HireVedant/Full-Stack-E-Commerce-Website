"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const connection_1 = require("../db/connection");
const product_model_1 = require("../models/product.model");
class ProductService {
    constructor(db) {
        this.db = db ?? (0, connection_1.getDb)();
    }
    // ─── List (search + filter + sort + paginate) ────────────────────────────
    list(query) {
        const { search, category, sort, page, limit } = query;
        const conditions = [];
        const params = {};
        if (search && search.trim()) {
            conditions.push("LOWER(name) LIKE LOWER(@search)");
            params.search = `%${search.trim()}%`;
        }
        if (category && category.trim()) {
            conditions.push("LOWER(category) = LOWER(@category)");
            params.category = category.trim();
        }
        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
        const orderMap = {
            price_asc: "price ASC, id ASC",
            price_desc: "price DESC, id ASC",
            name_asc: "LOWER(name) ASC",
            name_desc: "LOWER(name) DESC",
        };
        const orderBy = sort ? orderMap[sort] : "id ASC";
        const offset = (page - 1) * limit;
        const countRow = this.db
            .prepare(`SELECT COUNT(*) as total FROM products ${where}`)
            .get(params);
        const rows = this.db
            .prepare(`SELECT * FROM products ${where} ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`)
            .all({ ...params, limit, offset });
        return {
            products: rows.map(product_model_1.rowToProduct),
            total: countRow.total,
            page,
            limit,
            totalPages: Math.ceil(countRow.total / limit),
        };
    }
    // ─── Get all categories ───────────────────────────────────────────────────
    getCategories() {
        const rows = this.db
            .prepare("SELECT DISTINCT category FROM products ORDER BY category ASC")
            .all();
        return rows.map((r) => r.category);
    }
    // ─── Get single product ───────────────────────────────────────────────────
    getById(id) {
        const row = this.db
            .prepare("SELECT * FROM products WHERE id = ?")
            .get(id);
        return row ? (0, product_model_1.rowToProduct)(row) : null;
    }
    // ─── Create ───────────────────────────────────────────────────────────────
    create(input) {
        const result = this.db
            .prepare(`INSERT INTO products (name, description, price, category, image_url, stock)
         VALUES (@name, @description, @price, @category, @image_url, @stock)
         RETURNING *`)
            .get({
            name: input.name,
            description: input.description,
            price: input.price,
            category: input.category,
            image_url: input.imageUrl,
            stock: input.stock,
        });
        return (0, product_model_1.rowToProduct)(result);
    }
    // ─── Update ───────────────────────────────────────────────────────────────
    update(id, input) {
        const existing = this.getById(id);
        if (!existing)
            return null;
        const merged = {
            name: input.name ?? existing.name,
            description: input.description ?? existing.description,
            price: input.price ?? existing.price,
            category: input.category ?? existing.category,
            image_url: input.imageUrl ?? existing.imageUrl,
            stock: input.stock ?? existing.stock,
            id,
        };
        const updated = this.db
            .prepare(`UPDATE products
         SET name = @name,
             description = @description,
             price = @price,
             category = @category,
             image_url = @image_url,
             stock = @stock,
             updated_at = datetime('now')
         WHERE id = @id
         RETURNING *`)
            .get(merged);
        return (0, product_model_1.rowToProduct)(updated);
    }
    // ─── Delete ───────────────────────────────────────────────────────────────
    delete(id) {
        const result = this.db
            .prepare("DELETE FROM products WHERE id = ?")
            .run(id);
        return result.changes > 0;
    }
    // ─── Stock check (atomic) ─────────────────────────────────────────────────
    getStock(id) {
        const row = this.db
            .prepare("SELECT stock FROM products WHERE id = ?")
            .get(id);
        return row !== undefined ? row.stock : null;
    }
}
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map