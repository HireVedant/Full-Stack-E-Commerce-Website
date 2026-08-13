"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductQuerySchema = exports.UpdateProductSchema = exports.CreateProductSchema = void 0;
exports.rowToProduct = rowToProduct;
exports.getAvailability = getAvailability;
const zod_1 = require("zod");
// ─── Zod schemas for validation ───────────────────────────────────────────────
exports.CreateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Product name is required").max(200),
    description: zod_1.z.string().min(1, "Description is required").max(2000),
    price: zod_1.z
        .number({ invalid_type_error: "Price must be a number" })
        .nonnegative("Price must be 0 or greater")
        .finite(),
    category: zod_1.z.string().min(1, "Category is required").max(100),
    imageUrl: zod_1.z.string().min(1, "Image URL is required").max(500),
    stock: zod_1.z
        .number({ invalid_type_error: "Stock must be a number" })
        .int("Stock must be an integer")
        .nonnegative("Stock must be 0 or greater"),
});
exports.UpdateProductSchema = exports.CreateProductSchema.partial();
// ─── List-query parameters ────────────────────────────────────────────────────
exports.ProductQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    sort: zod_1.z
        .enum(["price_asc", "price_desc", "name_asc", "name_desc"])
        .optional(),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(20),
});
// ─── Helper ───────────────────────────────────────────────────────────────────
function rowToProduct(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        category: row.category,
        imageUrl: row.image_url,
        stock: row.stock,
        availability: getAvailability(row.stock),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
function getAvailability(stock) {
    if (stock <= 0)
        return "out_of_stock";
    if (stock <= 5)
        return "low_stock";
    return "in_stock";
}
//# sourceMappingURL=product.model.js.map